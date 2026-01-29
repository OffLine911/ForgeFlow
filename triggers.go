package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/robfig/cron/v3"
)

type TriggerManager struct {
	ctx          context.Context
	cancel       context.CancelFunc
	mu           sync.RWMutex
	engine       *Engine
	storage      *Storage
	cron         *cron.Cron
	cronJobs     map[string]cron.EntryID
	webhooks     map[string]*WebhookTrigger
	fileWatchers map[string]*FileWatcher
	clipboardMon *ClipboardMonitor
	hotkeyMon    *HotkeyMonitor
	httpServer   *http.Server
}

type WebhookTrigger struct {
	FlowID string
	Path   string
	Method string
}

type FileWatcher struct {
	FlowID  string
	Path    string
	Events  string
	Watcher *fsnotify.Watcher
	Cancel  context.CancelFunc
}

type ClipboardMonitor struct {
	FlowID      string
	LastContent string
	TextOnly    bool
	Cancel      context.CancelFunc
}

type HotkeyMonitor struct {
	Hotkeys map[string]string // hotkey -> flowID
	Cancel  context.CancelFunc
}

func NewTriggerManager(engine *Engine, storage *Storage) *TriggerManager {
	ctx, cancel := context.WithCancel(context.Background())

	tm := &TriggerManager{
		ctx:          ctx,
		cancel:       cancel,
		engine:       engine,
		storage:      storage,
		cron:         cron.New(),
		cronJobs:     make(map[string]cron.EntryID),
		webhooks:     make(map[string]*WebhookTrigger),
		fileWatchers: make(map[string]*FileWatcher),
		hotkeyMon:    &HotkeyMonitor{Hotkeys: make(map[string]string)},
	}

	return tm
}

// RegisterScheduleTrigger registers a cron-based schedule trigger
func (tm *TriggerManager) RegisterScheduleTrigger(flowID, cronExpr string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	// Remove existing job if any
	if entryID, exists := tm.cronJobs[flowID]; exists {
		tm.cron.Remove(entryID)
	}

	// Add new cron job
	entryID, err := tm.cron.AddFunc(cronExpr, func() {
		// Load flow and execute
		flowJSON, err := tm.storage.GetFlow(flowID)
		if err != nil {
			fmt.Printf("Failed to load flow %s: %v\n", flowID, err)
			return
		}

		_, err = tm.engine.RunFlow(flowJSON)
		if err != nil {
			fmt.Printf("Failed to execute flow %s: %v\n", flowID, err)
		}
	})

	if err != nil {
		return fmt.Errorf("invalid cron expression: %w", err)
	}

	tm.cronJobs[flowID] = entryID
	return nil
}

// UnregisterScheduleTrigger removes a schedule trigger
func (tm *TriggerManager) UnregisterScheduleTrigger(flowID string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if entryID, exists := tm.cronJobs[flowID]; exists {
		tm.cron.Remove(entryID)
		delete(tm.cronJobs, flowID)
		return nil
	}

	return fmt.Errorf("schedule trigger not found for flow: %s", flowID)
}

// RegisterWebhookTrigger registers an HTTP webhook trigger
func (tm *TriggerManager) RegisterWebhookTrigger(flowID, path, method string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	webhookID := fmt.Sprintf("%s:%s", method, path)
	tm.webhooks[webhookID] = &WebhookTrigger{
		FlowID: flowID,
		Path:   path,
		Method: method,
	}

	// Start HTTP server if not already running
	if tm.httpServer == nil {
		go tm.startWebhookServer()
	}

	return nil
}

// UnregisterWebhookTrigger removes a webhook trigger
func (tm *TriggerManager) UnregisterWebhookTrigger(flowID, path, method string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	webhookID := fmt.Sprintf("%s:%s", method, path)
	if _, exists := tm.webhooks[webhookID]; exists {
		delete(tm.webhooks, webhookID)
		return nil
	}

	return fmt.Errorf("webhook trigger not found")
}

// RegisterFileWatcher registers a file system watcher trigger
func (tm *TriggerManager) RegisterFileWatcher(flowID, path, events string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	// Remove existing watcher if any
	if fw, exists := tm.fileWatchers[flowID]; exists {
		fw.Cancel()
		fw.Watcher.Close()
	}

	// Create new watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return fmt.Errorf("failed to create watcher: %w", err)
	}

	// Add path to watch
	if err := watcher.Add(path); err != nil {
		watcher.Close()
		return fmt.Errorf("failed to watch path: %w", err)
	}

	ctx, cancel := context.WithCancel(tm.ctx)
	fw := &FileWatcher{
		FlowID:  flowID,
		Path:    path,
		Events:  events,
		Watcher: watcher,
		Cancel:  cancel,
	}

	tm.fileWatchers[flowID] = fw

	// Start watching in goroutine
	go tm.watchFiles(ctx, fw)

	return nil
}

func (tm *TriggerManager) watchFiles(ctx context.Context, fw *FileWatcher) {
	for {
		select {
		case <-ctx.Done():
			return
		case event, ok := <-fw.Watcher.Events:
			if !ok {
				return
			}

			// Check if event matches filter
			shouldTrigger := false
			switch fw.Events {
			case "all":
				shouldTrigger = true
			case "create":
				shouldTrigger = event.Op&fsnotify.Create == fsnotify.Create
			case "modify":
				shouldTrigger = event.Op&fsnotify.Write == fsnotify.Write
			case "delete":
				shouldTrigger = event.Op&fsnotify.Remove == fsnotify.Remove
			}

			if shouldTrigger {
				// Load and execute flow
				flowJSON, err := tm.storage.GetFlow(fw.FlowID)
				if err != nil {
					fmt.Printf("Failed to load flow %s: %v\n", fw.FlowID, err)
					continue
				}

				_, err = tm.engine.RunFlow(flowJSON)
				if err != nil {
					fmt.Printf("Failed to execute flow %s: %v\n", fw.FlowID, err)
				}
			}

		case err, ok := <-fw.Watcher.Errors:
			if !ok {
				return
			}
			fmt.Printf("File watcher error: %v\n", err)
		}
	}
}

// UnregisterFileWatcher removes a file watcher trigger
func (tm *TriggerManager) UnregisterFileWatcher(flowID string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if fw, exists := tm.fileWatchers[flowID]; exists {
		fw.Cancel()
		fw.Watcher.Close()
		delete(tm.fileWatchers, flowID)
		return nil
	}

	return fmt.Errorf("file watcher not found for flow: %s", flowID)
}

// RegisterClipboardMonitor registers a clipboard monitor trigger
func (tm *TriggerManager) RegisterClipboardMonitor(flowID string, textOnly bool) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	// Stop existing monitor if any
	if tm.clipboardMon != nil {
		tm.clipboardMon.Cancel()
	}

	ctx, cancel := context.WithCancel(tm.ctx)
	tm.clipboardMon = &ClipboardMonitor{
		FlowID:   flowID,
		TextOnly: textOnly,
		Cancel:   cancel,
	}

	// Start monitoring in goroutine
	go tm.monitorClipboard(ctx)

	return nil
}

func (tm *TriggerManager) monitorClipboard(ctx context.Context) {
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Get clipboard content (simplified - would use Windows API)
			// For now, this is a placeholder
			// In production, use: github.com/atotto/clipboard or Windows API

			// Placeholder: would check clipboard and trigger if changed
			// content := getClipboardContent()
			// if content != tm.clipboardMon.LastContent {
			//     tm.clipboardMon.LastContent = content
			//     // Trigger flow
			// }
		}
	}
}

// UnregisterClipboardMonitor removes clipboard monitor
func (tm *TriggerManager) UnregisterClipboardMonitor() error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if tm.clipboardMon != nil {
		tm.clipboardMon.Cancel()
		tm.clipboardMon = nil
		return nil
	}

	return fmt.Errorf("no clipboard monitor active")
}

// RegisterHotkey registers a global hotkey trigger
func (tm *TriggerManager) RegisterHotkey(flowID, hotkey string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	tm.hotkeyMon.Hotkeys[hotkey] = flowID

	// Note: Global hotkey registration would require Windows API
	// For production, use: github.com/robotn/gohook or Windows RegisterHotKey API
	// This is a placeholder implementation

	return nil
}

// UnregisterHotkey removes a hotkey trigger
func (tm *TriggerManager) UnregisterHotkey(hotkey string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if _, exists := tm.hotkeyMon.Hotkeys[hotkey]; exists {
		delete(tm.hotkeyMon.Hotkeys, hotkey)
		return nil
	}

	return fmt.Errorf("hotkey not found: %s", hotkey)
}

// startWebhookServer starts the HTTP server for webhooks
func (tm *TriggerManager) startWebhookServer() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tm.mu.RLock()
		webhookID := fmt.Sprintf("%s:%s", r.Method, r.URL.Path)
		webhook, exists := tm.webhooks[webhookID]
		tm.mu.RUnlock()

		if !exists {
			http.NotFound(w, r)
			return
		}

		// Load and execute flow
		flowJSON, err := tm.storage.GetFlow(webhook.FlowID)
		if err != nil {
			http.Error(w, "Flow not found", http.StatusInternalServerError)
			return
		}

		_, err = tm.engine.RunFlow(flowJSON)
		if err != nil {
			http.Error(w, "Execution failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "success",
			"message": "Workflow triggered",
			"flowId":  webhook.FlowID,
		})
	})

	tm.httpServer = &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	fmt.Println("Webhook server started on :8080")
	if err := tm.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Printf("Webhook server error: %v\n", err)
	}
}

// StartAllTriggers loads all flows and registers their enabled triggers
func (tm *TriggerManager) StartAllTriggers() error {
	tm.cron.Start()
	flows, err := tm.storage.ListFlows()
	if err != nil {
		return fmt.Errorf("failed to list flows for trigger startup: %w", err)
	}

	fmt.Printf("🔍 Starting triggers for %d flows...\n", len(flows))

	for _, f := range flows {
		flowID, _ := f["id"].(string)
		if flowID == "" {
			continue
		}

		flowJSON, err := tm.storage.GetFlow(flowID)
		if err != nil {
			fmt.Printf("⚠️ Failed to load flow %s: %v\n", flowID, err)
			continue
		}

		var flow map[string]interface{}
		if err := json.Unmarshal([]byte(flowJSON), &flow); err != nil {
			continue
		}

		nodes, ok := flow["nodes"].([]interface{})
		if !ok {
			continue
		}

		for _, n := range nodes {
			node, ok := n.(map[string]interface{})
			if !ok {
				continue
			}

			data, ok := node["data"].(map[string]interface{})
			if !ok {
				continue
			}

			category, _ := data["category"].(string)
			if category != "trigger" {
				continue
			}

			nodeType, _ := data["nodeType"].(string)
			config, _ := data["config"].(map[string]interface{})
			if config == nil {
				config = make(map[string]interface{})
			}

			// Skip if explicitly disabled
			if enabled, exists := config["enabled"].(bool); exists && !enabled {
				continue
			}

			// Register based on type
			switch nodeType {
			case "trigger_schedule":
				if cron, ok := config["cron"].(string); ok && cron != "" {
					tm.RegisterScheduleTrigger(flowID, cron)
				}
			case "trigger_webhook":
				path, _ := config["path"].(string)
				method, _ := config["method"].(string)
				if path != "" {
					if method == "" {
						method = "POST"
					}
					tm.RegisterWebhookTrigger(flowID, path, method)
				}
			case "trigger_file_watch":
				path, _ := config["path"].(string)
				events, _ := config["events"].(string)
				if path != "" {
					if events == "" {
						events = "all"
					}
					tm.RegisterFileWatcher(flowID, path, events)
				}
			case "trigger_clipboard":
				tm.RegisterClipboardMonitor(flowID, true)
			}
		}
	}

	return nil
}

// GetActiveTriggers returns information about active triggers
func (tm *TriggerManager) GetActiveTriggers() map[string]interface{} {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	schedules := make([]map[string]interface{}, 0)
	for flowID := range tm.cronJobs {
		schedules = append(schedules, map[string]interface{}{
			"flowId": flowID,
			"type":   "schedule",
		})
	}

	webhooks := make([]map[string]interface{}, 0)
	for _, webhook := range tm.webhooks {
		webhooks = append(webhooks, map[string]interface{}{
			"flowId": webhook.FlowID,
			"path":   webhook.Path,
			"method": webhook.Method,
			"type":   "webhook",
		})
	}

	fileWatchers := make([]map[string]interface{}, 0)
	for _, fw := range tm.fileWatchers {
		fileWatchers = append(fileWatchers, map[string]interface{}{
			"flowId": fw.FlowID,
			"path":   fw.Path,
			"events": fw.Events,
			"type":   "fileWatcher",
		})
	}

	hotkeys := make([]map[string]interface{}, 0)
	for hotkey, flowID := range tm.hotkeyMon.Hotkeys {
		hotkeys = append(hotkeys, map[string]interface{}{
			"flowId": flowID,
			"hotkey": hotkey,
			"type":   "hotkey",
		})
	}

	return map[string]interface{}{
		"schedules":    schedules,
		"webhooks":     webhooks,
		"fileWatchers": fileWatchers,
		"hotkeys":      hotkeys,
		"clipboard":    tm.clipboardMon != nil,
	}
}

// Shutdown stops all triggers and cleans up
func (tm *TriggerManager) Shutdown() {
	tm.cancel()

	if tm.cron != nil {
		ctx := tm.cron.Stop()
		<-ctx.Done()
	}

	// Stop all file watchers
	tm.mu.Lock()
	for _, fw := range tm.fileWatchers {
		fw.Cancel()
		fw.Watcher.Close()
	}
	tm.mu.Unlock()

	// Stop clipboard monitor
	if tm.clipboardMon != nil {
		tm.clipboardMon.Cancel()
	}

	if tm.httpServer != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		tm.httpServer.Shutdown(ctx)
	}
}
