import { create } from "zustand";
import type { OnNodesChange, OnEdgesChange, OnConnect } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import type { NodeData, FlowNode, FlowEdge, Flow } from "@/types/flow";
import { RunFlow, StopExecution } from "../../wailsjs/go/main/Engine";
import { SaveFlow, LoadFlow, ListFlows, DeleteFlow, SaveExecution } from "../../wailsjs/go/main/Storage";
import { WorkflowExecutor } from "@/executor/WorkflowExecutor";
import type { NodeResult } from "@/executor/WorkflowExecutor";
import type { LogLevel } from "@/handlers/types";
import { toast } from "@/stores/dialogStore";

interface HistoryEntry {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  flows: Flow[];
  activeFlowId: string | null;
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  isRunning: boolean;
  executionId: string | null;
  executor: WorkflowExecutor | null;
  selectedNodeId: string | null;
  settingsOpen: boolean;
  theme: string;
  logs: string[];
  history: HistoryEntry[];
  historyIndex: number;
  clipboard: FlowNode | null;
  maxHistorySize: number;
  isLoadingFlows: boolean;
  saveDialogOpen: boolean;
  setSaveDialogOpen: (open: boolean) => void;

  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: OnConnect;
  addNode: (node: FlowNode) => void;
  addNodeAtCenter: (data: NodeData) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  saveFlow: (name: string, description?: string) => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
  loadFlows: () => Promise<void>;
  deleteFlow: (flowId: string) => Promise<void>;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  clearCanvas: () => void;
  runFlow: () => Promise<void>;
  stopFlow: () => Promise<void>;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSettingsOpen: (open: boolean) => void;
  setTheme: (theme: string) => void;
  addLog: (message: string) => void;
  clearLogs: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  copyNode: (nodeId: string) => void;
  pasteNode: () => void;
  duplicateNode: (nodeId: string) => void;
}

export const useFlowStore = create<FlowState>()((set, get) => ({
  nodes: [],
  edges: [],
  flows: [],
  activeFlowId: null,
  isDarkMode: true,
  sidebarCollapsed: false,
  isRunning: false,
  executionId: null,
  executor: null,
  selectedNodeId: null,
  settingsOpen: false,
  theme: "vscode",
  logs: [],
  history: [],
  historyIndex: -1,
  clipboard: null,
  maxHistorySize: 50,
  isLoadingFlows: false,
  saveDialogOpen: false,
  
  setSaveDialogOpen: (open) => set({ saveDialogOpen: open }),

      pushHistory: () => {
        const { nodes, edges, history, historyIndex, maxHistorySize } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        });
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const prevIndex = historyIndex - 1;
          const entry = history[prevIndex];
          set({
            nodes: JSON.parse(JSON.stringify(entry.nodes)),
            edges: JSON.parse(JSON.stringify(entry.edges)),
            historyIndex: prevIndex,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const nextIndex = historyIndex + 1;
          const entry = history[nextIndex];
          set({
            nodes: JSON.parse(JSON.stringify(entry.nodes)),
            edges: JSON.parse(JSON.stringify(entry.edges)),
            historyIndex: nextIndex,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      copyNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) {
          set({ clipboard: JSON.parse(JSON.stringify(node)) });
        }
      },

      pasteNode: () => {
        const { clipboard, pushHistory } = get();
        if (clipboard) {
          pushHistory();
          const newNode: FlowNode = {
            ...JSON.parse(JSON.stringify(clipboard)),
            id: crypto.randomUUID(),
            position: {
              x: clipboard.position.x + 50,
              y: clipboard.position.y + 50,
            },
          };
          set({ nodes: [...get().nodes, newNode] });
        }
      },

      duplicateNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) {
          get().pushHistory();
          const newNode: FlowNode = {
            ...JSON.parse(JSON.stringify(node)),
            id: crypto.randomUUID(),
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
          };
          set({ nodes: [...get().nodes, newNode] });
        }
      },

      onNodesChange: (changes) => {
        const hasStructuralChange = changes.some(
          (c) => c.type === 'remove' || c.type === 'add'
        );
        if (hasStructuralChange) {
          get().pushHistory();
        }
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        const hasStructuralChange = changes.some(
          (c) => c.type === 'remove' || c.type === 'add'
        );
        if (hasStructuralChange) {
          get().pushHistory();
        }
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        get().pushHistory();
        set({ edges: addEdge(connection, get().edges) });
      },

      addNode: (node) => {
        get().pushHistory();
        set({ nodes: [...get().nodes, node] });
      },

      addNodeAtCenter: (data) => {
        get().pushHistory();
        const nodes = get().nodes;
        const newNode: FlowNode = {
          id: crypto.randomUUID(),
          type: "custom",
          position: { x: 250, y: 200 + nodes.length * 100 },
          data,
        };
        set({ nodes: [...nodes, newNode] });
      },

      removeNode: (nodeId) => {
        get().pushHistory();
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        });
      },

      updateNodeData: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
          ),
        });
      },

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      loadFlows: async () => {
        set({ isLoadingFlows: true });
        try {
          const flowsData = await ListFlows();
          
          // Handle null or undefined response
          if (!flowsData || !Array.isArray(flowsData)) {
            set({ flows: [] });
            return;
          }
          
          const flows: Flow[] = flowsData.map((f: any) => ({
            id: f.id,
            name: f.name,
            description: f.description || '',
            nodes: [], // Empty for list view
            edges: [],
            enabled: f.enabled || false,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            nodeCount: f.nodeCount || 0, // Add nodeCount from backend
          }));
          set({ flows });
        } catch (error) {
          console.error('Failed to load flows:', error);
          toast.error('Failed to load flows', error instanceof Error ? error.message : 'Unknown error');
          set({ flows: [] });
        } finally {
          set({ isLoadingFlows: false });
        }
      },

      saveFlow: async (name, description) => {
        const { nodes, edges, flows, activeFlowId, addLog } = get();
        const now = new Date().toISOString();

        if (!name || name.trim() === '') {
          addLog('❌ Flow name is required');
          throw new Error('Flow name is required');
        }

        console.log('Saving nodes:', nodes); // DEBUG

        // Properly serialize nodes with all data - React Flow nodes have data property
        const serializedNodes: FlowNode[] = nodes.map(n => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: {
            label: n.data.label,
            category: n.data.category,
            icon: n.data.icon,
            description: n.data.description,
            nodeType: n.data.nodeType,
            config: n.data.config,
            status: n.data.status || 'idle',
          },
        }));

        console.log('Serialized nodes:', serializedNodes); // DEBUG

        // Ensure edges are properly serialized
        const serializedEdges = edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          type: e.type || 'smoothstep',
          animated: e.animated !== undefined ? e.animated : true,
        }));

        const flowData: Flow = {
          id: activeFlowId || '',
          name: name.trim(),
          description: description?.trim() || '',
          nodes: serializedNodes,
          edges: serializedEdges,
          createdAt: activeFlowId ? (flows.find(f => f.id === activeFlowId)?.createdAt || now) : now,
          updatedAt: now,
          enabled: false,
        };

        console.log('Flow data to save:', JSON.stringify(flowData, null, 2)); // DEBUG

        try {
          addLog(`💾 Saving flow: ${name}`);
          
          // Save to backend
          const flowId = await SaveFlow(JSON.stringify(flowData));
          
          addLog(`✅ Flow saved successfully`);
          
          // Update local state with full node data
          if (activeFlowId) {
            set({
              flows: flows.map((f) =>
                f.id === activeFlowId
                  ? { ...f, id: flowId, name: flowData.name, description: flowData.description, updatedAt: now, nodes: serializedNodes, edges: serializedEdges }
                  : f
              ),
              activeFlowId: flowId,
            });
          } else {
            set({ 
              flows: [...flows, { ...flowData, id: flowId, nodes: serializedNodes, edges: serializedEdges }], 
              activeFlowId: flowId 
            });
          }

          // Register triggers with backend
          try {
            const { TriggerService } = await import('@/services/triggerService');
            await TriggerService.registerWorkflowTriggers(flowId, nodes);
          } catch (error) {
            console.error('Failed to register triggers:', error);
            toast.warning('Trigger registration failed', 'Some triggers may not work');
            addLog('⚠️  Warning: Failed to register triggers');
          }
          
          toast.success('Flow saved', `"${name}" saved successfully`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addLog(`❌ Failed to save flow: ${errorMsg}`);
          toast.error('Failed to save flow', errorMsg);
          console.error('Failed to save flow:', error);
          throw error;
        }
      },

      loadFlow: async (flowId) => {
        const { addLog } = get();
        try {
          addLog(`📂 Loading flow...`);
          const flowJSON = await LoadFlow(flowId);
          const flow: Flow = JSON.parse(flowJSON);
          
          if (!flow.nodes || !flow.edges) {
            throw new Error('Invalid flow data');
          }
          
          addLog(`✅ Flow loaded: ${flow.name}`);
          
          set({
            nodes: flow.nodes,
            edges: flow.edges,
            activeFlowId: flowId,
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addLog(`❌ Failed to load flow: ${errorMsg}`);
          toast.error('Failed to load flow', errorMsg);
          console.error('Failed to load flow:', error);
          throw error;
        }
      },

      deleteFlow: async (flowId) => {
        const { flows, activeFlowId, addLog } = get();
        
        const flow = flows.find(f => f.id === flowId);
        const flowName = flow?.name || 'Unknown';
        
        // Unregister triggers before deleting
        if (flow && flow.nodes && flow.nodes.length > 0) {
          try {
            const { TriggerService } = await import('@/services/triggerService');
            await TriggerService.unregisterWorkflowTriggers(flowId, flow.nodes);
          } catch (error) {
            console.error('Failed to unregister triggers:', error);
          }
        }
        
        try {
          addLog(`🗑️  Deleting flow: ${flowName}`);
          await DeleteFlow(flowId);
          addLog(`✅ Flow deleted successfully`);
          toast.success('Flow deleted', `"${flowName}" has been removed`);
          
          set({
            flows: flows.filter((f) => f.id !== flowId),
            ...(activeFlowId === flowId && { nodes: [], edges: [], activeFlowId: null }),
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          addLog(`❌ Failed to delete flow: ${errorMsg}`);
          toast.error('Failed to delete flow', errorMsg);
          console.error('Failed to delete flow:', error);
          throw error;
        }
      },

      toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      clearCanvas: () => {
        get().pushHistory();
        set({ nodes: [], edges: [], activeFlowId: null });
      },

      runFlow: async () => {
        const { nodes, edges, updateNodeData, addLog, activeFlowId, flows } = get();
        const executionId = crypto.randomUUID();
        set({ isRunning: true, executionId });

        const activeFlow = flows.find(f => f.id === activeFlowId);
        const flowName = activeFlow?.name || "Untitled Flow";

        addLog(`🚀 Starting flow execution (ID: ${executionId.slice(0, 8)})`);
        addLog(`📊 Flow contains ${nodes.length} nodes and ${edges.length} connections`);

        // Reset all node statuses
        nodes.forEach((node) => updateNodeData(node.id, { status: "idle" }));

        // Track execution results
        const executionResults: Array<{
          nodeId: string;
          status: "idle" | "running" | "success" | "error";
          output?: unknown;
          error?: string;
          duration: number;
          timestamp: string;
        }> = [];

        // Create executor with progress callback
        const onProgress = (results: NodeResult[]) => {
          results.forEach((result) => {
            const statusMap = {
              pending: "idle",
              running: "running",
              success: "success",
              error: "error",
              skipped: "idle",
            } as const;
            updateNodeData(result.nodeId, { status: statusMap[result.status] });
            
            // Track result
            const existingIdx = executionResults.findIndex(r => r.nodeId === result.nodeId);
            const duration = result.endedAt && result.startedAt 
              ? result.endedAt - result.startedAt 
              : 0;
            
            const execResult = {
              nodeId: result.nodeId,
              status: statusMap[result.status],
              output: result.output,
              error: result.error,
              duration,
              timestamp: new Date().toISOString(),
            };
            
            if (existingIdx >= 0) {
              executionResults[existingIdx] = execResult;
            } else {
              executionResults.push(execResult);
            }
          });
        };

        // Create log callback
        const onLog = (level: LogLevel, message: string) => {
          const emoji = {
            info: '',
            success: '',
            error: '',
            warn: '⚠️',
          };
          addLog(`${emoji[level] || ''} ${message}`);
        };

        const executor = new WorkflowExecutor(nodes, edges, onProgress, onLog);
        set({ isRunning: true, executionId, executor });
        const startedAt = new Date().toISOString();
        let finalStatus: "success" | "error" = "success";

        try {
          await executor.execute();
          
          if (get().isRunning) {
            addLog(`🎉 Flow execution completed successfully`);
          }

          // Call backend for persistence/tracking
          const flowData = {
            id: executionId,
            nodes: nodes.map((n) => ({
              id: n.id,
              type: n.type,
              category: n.data.category,
              label: n.data.label,
              position: n.position,
            })),
            edges: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          };
          await RunFlow(JSON.stringify(flowData));
        } catch (error) {
          finalStatus = "error";
          addLog(`💥 Flow execution failed: ${error}`);
          console.error("Flow execution failed:", error);
        } finally {
          const endedAt = new Date().toISOString();
          
          // Save execution history
          try {
            const execution = {
              id: executionId,
              flowId: activeFlowId || "unsaved",
              flowName,
              status: finalStatus,
              results: executionResults,
              startedAt,
              endedAt,
            };
            await SaveExecution(JSON.stringify(execution));
          } catch (error) {
            console.error("Failed to save execution history:", error);
          }
          
          set({ isRunning: false, executionId: null, executor: null });
        }
      },

      stopFlow: async () => {
        const { executionId, executor } = get();
        if (executor) {
          executor.abort();
        }
        if (executionId) {
          try {
            await StopExecution(executionId);
          } catch (error) {
            console.error("Failed to stop execution:", error);
          }
        }
        set({ isRunning: false, executionId: null, executor: null });
      },

      setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme === 'vscode' ? '' : theme);
      },

      addLog: (message) => {
        const timestamp = new Date().toLocaleTimeString();
        set((state) => ({ logs: [...state.logs, `[${timestamp}] ${message}`] }));
      },

      clearLogs: () => set({ logs: [] }),
    })
);
