package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type Storage struct {
	mu      sync.RWMutex
	dataDir string
}

func NewStorage() *Storage {
	return &Storage{}
}

func (s *Storage) Init() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.dataDir != "" {
		return nil
	}

	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}
	s.dataDir = filepath.Join(configDir, "ForgeFlow")
	return os.MkdirAll(s.dataDir, 0755)
}

func (s *Storage) getFlowsDir() string {
	flowsDir := filepath.Join(s.dataDir, "flows")
	os.MkdirAll(flowsDir, 0755)
	return flowsDir
}

func (s *Storage) SaveFlow(flowJSON string) (string, error) {
	s.Init()

	var flow Flow
	if err := json.Unmarshal([]byte(flowJSON), &flow); err != nil {
		return "", fmt.Errorf("invalid flow JSON: %w", err)
	}

	if flow.ID == "" {
		flow.ID = fmt.Sprintf("flow-%d", time.Now().UnixNano())
		flow.CreatedAt = time.Now().Format(time.RFC3339)
	}
	flow.UpdatedAt = time.Now().Format(time.RFC3339)

	data, err := json.MarshalIndent(flow, "", "  ")
	if err != nil {
		return "", err
	}

	filePath := filepath.Join(s.getFlowsDir(), flow.ID+".json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", err
	}

	return flow.ID, nil
}

func (s *Storage) LoadFlow(flowID string) (string, error) {
	s.Init()

	filePath := filepath.Join(s.getFlowsDir(), flowID+".json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("flow not found: %s", flowID)
	}
	return string(data), nil
}

func (s *Storage) GetFlow(flowID string) (string, error) {
	return s.LoadFlow(flowID)
}

type FlowMetadata struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Enabled     bool          `json:"enabled"`
	CreatedAt   string        `json:"createdAt"`
	UpdatedAt   string        `json:"updatedAt"`
	Nodes       []interface{} `json:"nodes"`
}

func (s *Storage) ListFlows() ([]map[string]interface{}, error) {
	s.Init()

	flowsDir := s.getFlowsDir()
	entries, err := os.ReadDir(flowsDir)
	if err != nil {
		return []map[string]interface{}{}, nil
	}

	var flows []map[string]interface{}
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filePath := filepath.Join(flowsDir, entry.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var flow FlowMetadata
		if err := json.Unmarshal(data, &flow); err != nil {
			continue
		}

		flows = append(flows, map[string]interface{}{
			"id":          flow.ID,
			"name":        flow.Name,
			"description": flow.Description,
			"enabled":     flow.Enabled,
			"createdAt":   flow.CreatedAt,
			"updatedAt":   flow.UpdatedAt,
			"nodeCount":   len(flow.Nodes),
		})
	}

	sort.Slice(flows, func(i, j int) bool {
		t1, _ := flows[i]["updatedAt"].(string)
		t2, _ := flows[j]["updatedAt"].(string)
		return t1 > t2
	})

	return flows, nil
}

func (s *Storage) DeleteFlow(flowID string) error {
	s.Init()
	filePath := filepath.Join(s.getFlowsDir(), flowID+".json")
	return os.Remove(filePath)
}

func (s *Storage) SaveSettings(settingsJSON string) error {
	s.Init()
	filePath := filepath.Join(s.dataDir, "settings.json")
	return os.WriteFile(filePath, []byte(settingsJSON), 0644)
}

func (s *Storage) LoadSettings() (string, error) {
	s.Init()
	filePath := filepath.Join(s.dataDir, "settings.json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "{}", nil
	}
	return string(data), nil
}

func (s *Storage) getExecutionsDir() string {
	execDir := filepath.Join(s.dataDir, "executions")
	os.MkdirAll(execDir, 0755)
	return execDir
}

func (s *Storage) SaveExecution(executionJSON string) error {
	s.Init()

	var execution map[string]interface{}
	if err := json.Unmarshal([]byte(executionJSON), &execution); err != nil {
		return fmt.Errorf("invalid execution JSON: %w", err)
	}

	execID, ok := execution["id"].(string)
	if !ok || execID == "" {
		return fmt.Errorf("execution ID is required")
	}

	data, err := json.Marshal(execution)
	if err != nil {
		return err
	}

	filePath := filepath.Join(s.getExecutionsDir(), execID+".json")
	return os.WriteFile(filePath, data, 0644)
}

func (s *Storage) ListExecutions(limit int) ([]map[string]interface{}, error) {
	s.Init()

	execDir := s.getExecutionsDir()
	entries, err := os.ReadDir(execDir)
	if err != nil {
		return []map[string]interface{}{}, nil
	}

	var executions []map[string]interface{}
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filePath := filepath.Join(execDir, entry.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var execution map[string]interface{}
		if err := json.Unmarshal(data, &execution); err != nil {
			continue
		}

		// Don't need full results in list
		delete(execution, "results")

		executions = append(executions, execution)
	}

	sort.Slice(executions, func(i, j int) bool {
		t1, _ := executions[i]["startedAt"].(string)
		t2, _ := executions[j]["startedAt"].(string)
		return t1 > t2
	})

	if limit > 0 && len(executions) > limit {
		executions = executions[:limit]
	}

	return executions, nil
}

func (s *Storage) DeleteExecution(execID string) error {
	s.Init()
	filePath := filepath.Join(s.getExecutionsDir(), execID+".json")
	return os.Remove(filePath)
}

func (s *Storage) ExportFlow(flowID string) (string, error) {
	return s.LoadFlow(flowID)
}

func (s *Storage) ImportFlow(flowJSON string) (string, error) {
	var flow Flow
	if err := json.Unmarshal([]byte(flowJSON), &flow); err != nil {
		return "", fmt.Errorf("invalid flow JSON: %w", err)
	}

	flow.ID = fmt.Sprintf("flow-%d", time.Now().UnixNano())
	flow.CreatedAt = time.Now().Format(time.RFC3339)
	flow.UpdatedAt = time.Now().Format(time.RFC3339)

	data, err := json.MarshalIndent(flow, "", "  ")
	if err != nil {
		return "", err
	}

	filePath := filepath.Join(s.getFlowsDir(), flow.ID+".json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", err
	}

	return flow.ID, nil
}
