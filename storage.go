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

	// Parse as generic map to avoid struct issues
	var flowData map[string]interface{}
	if err := json.Unmarshal([]byte(flowJSON), &flowData); err != nil {
		return "", fmt.Errorf("invalid flow JSON: %w", err)
	}

	// Get or generate ID
	flowID, ok := flowData["id"].(string)
	if !ok || flowID == "" {
		flowID = fmt.Sprintf("flow-%d", time.Now().UnixNano())
		flowData["id"] = flowID
		flowData["createdAt"] = time.Now().Format(time.RFC3339)
	}
	flowData["updatedAt"] = time.Now().Format(time.RFC3339)

	// Save as-is without re-marshaling through structs
	data, err := json.MarshalIndent(flowData, "", "  ")
	if err != nil {
		return "", err
	}

	filePath := filepath.Join(s.getFlowsDir(), flowID+".json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return "", err
	}

	return flowID, nil
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

		// Parse as generic map
		var flowData map[string]interface{}
		if err := json.Unmarshal(data, &flowData); err != nil {
			continue
		}

		// Count nodes
		nodeCount := 0
		if nodes, ok := flowData["nodes"].([]interface{}); ok {
			nodeCount = len(nodes)
		}

		flows = append(flows, map[string]interface{}{
			"id":          flowData["id"],
			"name":        flowData["name"],
			"description": flowData["description"],
			"enabled":     flowData["enabled"],
			"createdAt":   flowData["createdAt"],
			"updatedAt":   flowData["updatedAt"],
			"nodeCount":   nodeCount,
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

		// Calculate summary stats from results before removing them
		if results, ok := execution["results"].([]interface{}); ok {
			nodeCount := len(results)
			successCount := 0
			errorCount := 0
			
			for _, r := range results {
				if result, ok := r.(map[string]interface{}); ok {
					if status, ok := result["status"].(string); ok {
						if status == "success" {
							successCount++
						} else if status == "error" {
							errorCount++
						}
					}
				}
			}
			
			execution["nodeCount"] = nodeCount
			execution["successCount"] = successCount
			execution["errorCount"] = errorCount
			
			// Remove full results to reduce payload size
			delete(execution, "results")
		}

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

func (s *Storage) getSecretsDir() string {
	secretsDir := filepath.Join(s.dataDir, "secrets")
	os.MkdirAll(secretsDir, 0700)
	return secretsDir
}

func (s *Storage) SaveSecret(key, value string) error {
	s.Init()
	filePath := filepath.Join(s.getSecretsDir(), key)
	return os.WriteFile(filePath, []byte(value), 0600)
}

func (s *Storage) GetSecret(key string) (string, error) {
	s.Init()
	filePath := filepath.Join(s.getSecretsDir(), key)
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	return string(data), nil
}
