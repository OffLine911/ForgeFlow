package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

type ActionService struct {
	ctx     *App
	storage *Storage
}

func NewActionService(app *App, storage *Storage) *ActionService {
	return &ActionService{
		ctx:     app,
		storage: storage,
	}
}

// File Operations
func (as *ActionService) ReadFile(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	return string(data), nil
}

func (as *ActionService) WriteFile(path, content string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}
	return nil
}

func (as *ActionService) AppendFile(path, content string) error {
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	if _, err := f.WriteString(content); err != nil {
		return fmt.Errorf("failed to append to file: %w", err)
	}
	return nil
}

func (as *ActionService) CopyFile(source, destination string) error {
	sourceData, err := os.ReadFile(source)
	if err != nil {
		return fmt.Errorf("failed to read source: %w", err)
	}

	destDir := filepath.Dir(destination)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	if err := os.WriteFile(destination, sourceData, 0644); err != nil {
		return fmt.Errorf("failed to write destination: %w", err)
	}
	return nil
}

func (as *ActionService) MoveFile(source, destination string) error {
	if err := as.CopyFile(source, destination); err != nil {
		return err
	}
	return os.Remove(source)
}

func (as *ActionService) DeleteFile(path string) error {
	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

func (as *ActionService) FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func (as *ActionService) FileInfo(path string) (map[string]interface{}, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"name":  info.Name(),
		"size":  info.Size(),
		"mode":  info.Mode().String(),
		"mod":   info.ModTime().Format(time.RFC3339),
		"isDir": info.IsDir(),
	}, nil
}

func (as *ActionService) ListDirectory(path string, pattern string, recursive bool) ([]map[string]interface{}, error) {
	var result []map[string]interface{}

	if pattern == "" {
		pattern = "*"
	}

	walker := func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}

		if p == path {
			return nil // Skip root dir
		}

		// Match pattern
		match, _ := filepath.Match(pattern, info.Name())
		if !match && pattern != "*" {
			return nil
		}

		result = append(result, map[string]interface{}{
			"name":  info.Name(),
			"path":  p,
			"isDir": info.IsDir(),
			"size":  info.Size(),
			"mod":   info.ModTime().Format(time.RFC3339),
		})

		if !recursive && info.IsDir() && p != path {
			return filepath.SkipDir
		}

		return nil
	}

	if recursive {
		err := filepath.Walk(path, walker)
		return result, err
	} else {
		entries, err := os.ReadDir(path)
		if err != nil {
			return nil, err
		}

		for _, entry := range entries {
			info, err := entry.Info()
			if err != nil {
				continue
			}

			// Match pattern
			match, _ := filepath.Match(pattern, info.Name())
			if !match && pattern != "*" {
				continue
			}

			result = append(result, map[string]interface{}{
				"name":  info.Name(),
				"path":  filepath.Join(path, info.Name()),
				"isDir": info.IsDir(),
				"size":  info.Size(),
				"mod":   info.ModTime().Format(time.RFC3339),
			})
		}
		return result, nil
	}
}

func (as *ActionService) Compress(sourcePaths []string, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	for _, src := range sourcePaths {
		filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			header, err := zip.FileInfoHeader(info)
			if err != nil {
				return err
			}

			header.Name, _ = filepath.Rel(filepath.Dir(src), path)

			if info.IsDir() {
				header.Name += "/"
			} else {
				header.Method = zip.Deflate
			}

			writer, err := archive.CreateHeader(header)
			if err != nil {
				return err
			}

			if info.IsDir() {
				return nil
			}

			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()
			_, err = io.Copy(writer, file)
			return err
		})
	}
	return nil
}

func (as *ActionService) Extract(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	os.MkdirAll(dest, 0755)

	for _, f := range r.File {
		path := filepath.Join(dest, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(path, f.Mode())
			continue
		}

		os.MkdirAll(filepath.Dir(path), 0755)
		fOr, err := f.Open()
		if err != nil {
			return err
		}
		defer fOr.Close()

		fDest, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}
		defer fDest.Close()

		_, err = io.Copy(fDest, fOr)
		if err != nil {
			return err
		}
	}
	return nil
}

// HTTP Operations
func (as *ActionService) HTTPRequest(method, url string, headers map[string]string, body string) (map[string]interface{}, error) {
	var reqBody io.Reader
	if body != "" && method != "GET" {
		reqBody = bytes.NewBufferString(body)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	result := map[string]interface{}{
		"status":     resp.StatusCode,
		"statusText": resp.Status,
		"headers":    resp.Header,
		"body":       string(respBody),
	}

	// Try to parse as JSON
	var jsonBody interface{}
	if err := json.Unmarshal(respBody, &jsonBody); err == nil {
		result["json"] = jsonBody
	}

	return result, nil
}

// Shell Operations
func (as *ActionService) RunCommand(command string, args []string, workDir string) (map[string]interface{}, error) {
	cmd := exec.Command(command, args...)

	if workDir != "" {
		cmd.Dir = workDir
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return nil, fmt.Errorf("failed to run command: %w", err)
		}
	}

	return map[string]interface{}{
		"stdout":   stdout.String(),
		"stderr":   stderr.String(),
		"exitCode": exitCode,
		"success":  exitCode == 0,
	}, nil
}

// System Operations
// Platform-specific implementations are in actions_windows.go, actions_darwin.go, actions_linux.go

// Date/Time Operations
func (as *ActionService) GetCurrentTime(format string) string {
	now := time.Now()

	if format == "" {
		return now.Format(time.RFC3339)
	}

	// Simple format mapping
	format = replaceFormat(format)
	return now.Format(format)
}

func replaceFormat(format string) string {
	// Convert common format strings to Go format
	replacements := map[string]string{
		"YYYY": "2006",
		"MM":   "01",
		"DD":   "02",
		"HH":   "15",
		"mm":   "04",
		"ss":   "05",
	}

	for old, new := range replacements {
		format = replaceAll(format, old, new)
	}

	return format
}

func replaceAll(s, old, new string) string {
	result := ""
	for i := 0; i < len(s); {
		if i+len(old) <= len(s) && s[i:i+len(old)] == old {
			result += new
			i += len(old)
		} else {
			result += string(s[i])
			i++
		}
	}
	return result
}

// Utility Operations
func (as *ActionService) GenerateUUID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), time.Now().Unix())
}

func (as *ActionService) Sleep(milliseconds int) {
	time.Sleep(time.Duration(milliseconds) * time.Millisecond)
}

// Secrets & Settings
func (as *ActionService) GetSecret(key string) (string, error) {
	return as.storage.GetSecret(key)
}

func (as *ActionService) SaveSecret(key, value string) error {
	return as.storage.SaveSecret(key, value)
}

func (as *ActionService) GetSetting(key string) (string, error) {
	// For app settings, we might want to parse the settings.json
	settingsJSON, err := as.storage.LoadSettings()
	if err != nil {
		return "", err
	}

	var settings map[string]interface{}
	if err := json.Unmarshal([]byte(settingsJSON), &settings); err != nil {
		return "", err
	}

	val, ok := settings[key]
	if !ok {
		return "", fmt.Errorf("setting %s not found", key)
	}

	return fmt.Sprintf("%v", val), nil
}

func (as *ActionService) SaveSetting(key, value string) error {
	settingsJSON, _ := as.storage.LoadSettings()
	var settings map[string]interface{}
	json.Unmarshal([]byte(settingsJSON), &settings)

	if settings == nil {
		settings = make(map[string]interface{})
	}

	settings[key] = value
	newData, _ := json.MarshalIndent(settings, "", "  ")
	return as.storage.SaveSettings(string(newData))
}
