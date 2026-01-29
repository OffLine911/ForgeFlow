import type { Node, Edge } from "@xyflow/react";

export type NodeCategory = "trigger" | "condition" | "action" | "ai" | "loop" | "utility" | "apps";
export type NodeStatus = "idle" | "running" | "success" | "error";

export interface NodeData extends Record<string, unknown> {
  label: string;
  category: NodeCategory;
  icon?: string;
  description?: string;
  nodeType?: string;  // The actual node type (e.g., 'trigger_manual', 'action_http')
  config?: Record<string, unknown>;
  status?: NodeStatus;
}

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge;

export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  nodeCount?: number; // For list view
}

export interface ExecutionResult {
  nodeId: string;
  nodeLabel?: string;
  nodeType?: string;
  status: "idle" | "running" | "success" | "error";
  output?: unknown;
  error?: string;
  duration: number;
  timestamp: string;
}

export interface FlowExecution {
  id: string;
  flowId: string;
  flowName?: string;
  status: "idle" | "running" | "success" | "error";
  results: ExecutionResult[];
  startedAt: string;
  endedAt?: string;
  nodeCount?: number;
  successCount?: number;
  errorCount?: number;
}

export interface Trigger {
  id: string;
  type: "file" | "time" | "http" | "manual" | "system";
  name: string;
  config: Record<string, unknown>;
}

export interface Action {
  id: string;
  type: "file" | "http" | "shell" | "notify" | "export" | "ai";
  name: string;
  config: Record<string, unknown>;
}

export interface AINode {
  id: string;
  type: "summarize" | "classify" | "extract" | "rewrite" | "generate" | "custom";
  name: string;
  prompt?: string;
  model?: string;
  config: Record<string, unknown>;
}
