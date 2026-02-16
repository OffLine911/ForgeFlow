//go:build darwin
// +build darwin

package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func (as *ActionService) ShowNotification(title, message string) error {
	// Try terminal-notifier first (more reliable if installed)
	if _, err := exec.LookPath("terminal-notifier"); err == nil {
		cmd := exec.Command("terminal-notifier", "-title", title, "-message", message, "-sound", "default")
		if err := cmd.Run(); err == nil {
			return nil
		}
	}

	// Fallback to osascript with better error handling
	script := fmt.Sprintf(`display notification "%s" with title "%s" sound name "default"`, message, title)
	cmd := exec.Command("osascript", "-e", script)
	
	// Run and capture any errors
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("notification failed: %v (output: %s)", err, string(output))
	}
	
	return nil
}

func (as *ActionService) OpenURL(url string) error {
	cmd := exec.Command("open", url)
	return cmd.Start()
}

func (as *ActionService) SetClipboard(content string) error {
	cmd := exec.Command("pbcopy")
	cmd.Stdin = bytes.NewBufferString(content)
	return cmd.Run()
}

func (as *ActionService) GetClipboard() (string, error) {
	cmd := exec.Command("pbpaste")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}
