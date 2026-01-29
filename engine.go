package main

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

type NodeStatus string

const (
	StatusIdle    NodeStatus = "idle"
	StatusRunning NodeStatus = "running"
	StatusSuccess NodeStatus = "success"
	StatusError   NodeStatus = "error"
)

type FlowNode struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Position struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"position"`
	Data struct {
		Label       string                 `json:"label"`
		Category    string                 `json:"category"`
		Icon        string                 `json:"icon,omitempty"`
		Description string                 `json:"description,omitempty"`
		NodeType    string                 `json:"nodeType,omitempty"`
		Config      map[string]interface{} `json:"config,omitempty"`
		Status      string                 `json:"status,omitempty"`
	} `json:"data"`
}

type FlowEdge struct {
	ID           string `json:"id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"sourceHandle,omitempty"`
	TargetHandle string `json:"targetHandle,omitempty"`
}

type Flow struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description,omitempty"`
	Nodes       []FlowNode `json:"nodes"`
	Edges       []FlowEdge `json:"edges"`
	Enabled     bool       `json:"enabled"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
}

type ExecutionResult struct {
	NodeID    string      `json:"nodeId"`
	Status    NodeStatus  `json:"status"`
	Output    interface{} `json:"output,omitempty"`
	Error     string      `json:"error,omitempty"`
	Duration  int64       `json:"duration"`
	Timestamp string      `json:"timestamp"`
}

type FlowExecution struct {
	ID        string            `json:"id"`
	FlowID    string            `json:"flowId"`
	Status    NodeStatus        `json:"status"`
	Results   []ExecutionResult `json:"results"`
	StartedAt string            `json:"startedAt"`
	EndedAt   string            `json:"endedAt,omitempty"`
}

type Engine struct {
	ctx        context.Context
	mu         sync.RWMutex
	executions map[string]*FlowExecution
	cancel     map[string]context.CancelFunc
	storage    *Storage
}

func NewEngine(storage *Storage) *Engine {
	return &Engine{
		executions: make(map[string]*FlowExecution),
		cancel:     make(map[string]context.CancelFunc),
		storage:    storage,
	}
}

func (e *Engine) RunFlow(flowJSON string) (*FlowExecution, error) {
	var flow Flow
	if err := json.Unmarshal([]byte(flowJSON), &flow); err != nil {
		return nil, fmt.Errorf("invalid flow: %w", err)
	}

	execID := fmt.Sprintf("exec-%d", time.Now().UnixNano())
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)

	execution := &FlowExecution{
		ID:        execID,
		FlowID:    flow.ID,
		Status:    StatusRunning,
		Results:   []ExecutionResult{},
		StartedAt: time.Now().Format(time.RFC3339),
	}

	e.mu.Lock()
	e.executions[execID] = execution
	e.cancel[execID] = cancel
	e.mu.Unlock()

	go e.executeFlow(ctx, &flow, execution)

	return execution, nil
}

func (e *Engine) executeFlow(ctx context.Context, flow *Flow, execution *FlowExecution) {
	defer func() {
		e.mu.Lock()
		delete(e.cancel, execution.ID)
		execution.EndedAt = time.Now().Format(time.RFC3339)
		if execution.Status == StatusRunning {
			execution.Status = StatusSuccess
		}
		e.mu.Unlock()
		// NOTE: Execution history is saved by the frontend which has more complete data
	}()

	nodeMap := make(map[string]*FlowNode)
	for i := range flow.Nodes {
		nodeMap[flow.Nodes[i].ID] = &flow.Nodes[i]
	}

	adjacency := make(map[string][]string)
	inDegree := make(map[string]int)
	for _, node := range flow.Nodes {
		adjacency[node.ID] = []string{}
		inDegree[node.ID] = 0
	}
	for _, edge := range flow.Edges {
		adjacency[edge.Source] = append(adjacency[edge.Source], edge.Target)
		inDegree[edge.Target]++
	}

	var startNodes []string
	for nodeID, degree := range inDegree {
		if degree == 0 {
			startNodes = append(startNodes, nodeID)
		}
	}

	for _, nodeID := range startNodes {
		if ctx.Err() != nil {
			return
		}
		e.executeNode(ctx, nodeMap[nodeID], execution, nodeMap, adjacency)
	}
}

func (e *Engine) executeNode(ctx context.Context, node *FlowNode, execution *FlowExecution, nodeMap map[string]*FlowNode, adjacency map[string][]string) {
	if ctx.Err() != nil {
		return
	}

	start := time.Now()
	result := ExecutionResult{
		NodeID:    node.ID,
		Status:    StatusRunning,
		Timestamp: start.Format(time.RFC3339),
	}

	time.Sleep(100 * time.Millisecond)

	result.Status = StatusSuccess
	result.Duration = time.Since(start).Milliseconds()
	result.Output = map[string]interface{}{
		"nodeId":   node.ID,
		"category": node.Data.Category,
		"executed": true,
	}

	e.mu.Lock()
	execution.Results = append(execution.Results, result)
	e.mu.Unlock()

	for _, nextID := range adjacency[node.ID] {
		if nextNode, ok := nodeMap[nextID]; ok {
			e.executeNode(ctx, nextNode, execution, nodeMap, adjacency)
		}
	}
}

func (e *Engine) StopExecution(execID string) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if cancel, ok := e.cancel[execID]; ok {
		cancel()
		if exec, ok := e.executions[execID]; ok {
			exec.Status = StatusError
			exec.EndedAt = time.Now().Format(time.RFC3339)
		}
		return nil
	}
	return fmt.Errorf("execution not found: %s", execID)
}

func (e *Engine) GetExecution(execID string) (*FlowExecution, error) {
	e.mu.RLock()
	defer e.mu.RUnlock()

	if exec, ok := e.executions[execID]; ok {
		return exec, nil
	}
	return nil, fmt.Errorf("execution not found: %s", execID)
}

func (e *Engine) GetExecutions() []*FlowExecution {
	e.mu.RLock()
	defer e.mu.RUnlock()

	executions := make([]*FlowExecution, 0, len(e.executions))
	for _, exec := range e.executions {
		executions = append(executions, exec)
	}
	return executions
}
