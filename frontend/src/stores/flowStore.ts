import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnNodesChange, OnEdgesChange, OnConnect } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import type { NodeData, FlowNode, FlowEdge, Flow } from "@/types/flow";
import { RunFlow, StopExecution } from "../../wailsjs/go/main/Engine";
import { WorkflowExecutor } from "@/executor/WorkflowExecutor";
import type { NodeResult } from "@/executor/WorkflowExecutor";
import type { LogLevel } from "@/handlers/types";

interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  flows: Flow[];
  activeFlowId: string | null;
  isDarkMode: boolean;
  sidebarCollapsed: boolean;
  isRunning: boolean;
  executionId: string | null;
  selectedNodeId: string | null;
  settingsOpen: boolean;
  theme: string;
  logs: string[];

  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: OnConnect;
  addNode: (node: FlowNode) => void;
  addNodeAtCenter: (data: NodeData) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  saveFlow: (name: string, description?: string) => void;
  loadFlow: (flowId: string) => void;
  deleteFlow: (flowId: string) => void;
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
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      flows: [],
      activeFlowId: null,
      isDarkMode: true,
      sidebarCollapsed: false,
      isRunning: false,
      executionId: null,
      selectedNodeId: null,
      settingsOpen: false,
      theme: "vscode",
      logs: [],

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        set({ edges: addEdge(connection, get().edges) });
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      addNodeAtCenter: (data) => {
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

      saveFlow: (name, description) => {
        const { nodes, edges, flows, activeFlowId } = get();
        const now = new Date().toISOString();

        if (activeFlowId) {
          set({
            flows: flows.map((f) =>
              f.id === activeFlowId
                ? { ...f, name, description, nodes, edges, updatedAt: now }
                : f
            ),
          });
        } else {
          const newFlow: Flow = {
            id: crypto.randomUUID(),
            name,
            description,
            nodes,
            edges,
            createdAt: now,
            updatedAt: now,
            enabled: false,
          };
          set({ flows: [...flows, newFlow], activeFlowId: newFlow.id });
        }
      },

      loadFlow: (flowId) => {
        const flow = get().flows.find((f) => f.id === flowId);
        if (flow) {
          set({
            nodes: flow.nodes,
            edges: flow.edges,
            activeFlowId: flowId,
          });
        }
      },

      deleteFlow: (flowId) => {
        const { flows, activeFlowId } = get();
        set({
          flows: flows.filter((f) => f.id !== flowId),
          ...(activeFlowId === flowId && { nodes: [], edges: [], activeFlowId: null }),
        });
      },

      toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      clearCanvas: () => set({ nodes: [], edges: [], activeFlowId: null }),

      runFlow: async () => {
        const { nodes, edges, updateNodeData, addLog } = get();
        const executionId = crypto.randomUUID();
        set({ isRunning: true, executionId });

        addLog(`🚀 Starting flow execution (ID: ${executionId.slice(0, 8)})`);
        addLog(`📊 Flow contains ${nodes.length} nodes and ${edges.length} connections`);

        // Reset all node statuses
        nodes.forEach((node) => updateNodeData(node.id, { status: "idle" }));

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
          addLog(`💥 Flow execution failed: ${error}`);
          console.error("Flow execution failed:", error);
        } finally {
          set({ isRunning: false, executionId: null });
        }
      },

      stopFlow: async () => {
        const { executionId } = get();
        if (executionId) {
          try {
            await StopExecution(executionId);
          } catch (error) {
            console.error("Failed to stop execution:", error);
          }
        }
        set({ isRunning: false, executionId: null });
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
    }),
    {
      name: "forgeflow-storage",
      partialize: (state) => ({
        flows: state.flows,
        isDarkMode: state.isDarkMode,
        theme: state.theme,
      }),
    }
  )
);
