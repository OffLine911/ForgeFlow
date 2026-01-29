import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Copy, Trash2, Network } from "lucide-react";

import { useFlowStore } from "@/stores/flowStore";
import FlowNode from "./FlowNode";
import type { NodeData, FlowNode as FlowNodeType } from "@/types/flow";

/* ------------------------------------------------------------------ */
/* Node Types */
/* ------------------------------------------------------------------ */
const nodeTypes = {
  custom: FlowNode,
};

/* ------------------------------------------------------------------ */
/* Edge Defaults */
/* ------------------------------------------------------------------ */
const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
  style: {
    stroke: "oklch(0.5 0.15 250)",
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: "oklch(0.5 0.15 250)",
  },
};

/* ------------------------------------------------------------------ */
/* Auto Layout (Trigger-aware, scalable) */
/* ------------------------------------------------------------------ */
function autoLayout(nodes: FlowNodeType[], edges: any[]) {
  if (!nodes.length) return nodes;

  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const levels = new Map<string, number>();

  nodes.forEach((n) => {
    adjacency.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  // Triggers are ALWAYS level 0
  const queue: Array<{ id: string; level: number }> = [];

  nodes.forEach((n) => {
    if (n.data.category === "trigger") {
      levels.set(n.id, 0);
      queue.push({ id: n.id, level: 0 });
    }
  });

  // Other roots
  nodes.forEach((n) => {
    if (!levels.has(n.id) && inDegree.get(n.id) === 0) {
      levels.set(n.id, 1);
      queue.push({ id: n.id, level: 1 });
    }
  });

  // BFS
  while (queue.length) {
    const { id, level } = queue.shift()!;
    adjacency.get(id)?.forEach((target) => {
      const next = level + 1;
      if (!levels.has(target) || next > (levels.get(target) ?? 0)) {
        levels.set(target, next);
        queue.push({ id: target, level: next });
      }
    });
  }

  // Group by level
  const byLevel = new Map<number, FlowNodeType[]>();
  nodes.forEach((n) => {
    const l = levels.get(n.id) ?? 0;
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l)!.push(n);
  });

  const H_SPACING = 260;
  const V_SPACING = 120;
  const START_X = 100;
  const START_Y = 100;

  return nodes.map((node) => {
    const level = levels.get(node.id) ?? 0;
    const siblings = byLevel.get(level)!;
    const index = siblings.findIndex((n) => n.id === node.id);

    return {
      ...node,
      position: {
        x: START_X + level * H_SPACING,
        y: START_Y + (index - (siblings.length - 1) / 2) * V_SPACING,
      },
    };
  });
}

/* ------------------------------------------------------------------ */
/* Flow Canvas */
/* ------------------------------------------------------------------ */
export default function FlowCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    logs,
    isRunning,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
    setSelectedNodeId,
    clearLogs,
  } = useFlowStore();

  /* -------------------- Auto Layout -------------------- */
  const handleAutoLayout = useCallback(() => {
    setNodes(autoLayout(nodes, edges));
  }, [nodes, edges, setNodes]);

  /* -------------------- Drag & Drop -------------------- */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/forgeflow-node");
      if (!raw) return;

      const data = JSON.parse(raw) as NodeData;
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode({
        id: `${data.category}-${Date.now()}`,
        type: "custom",
        position,
        data,
      });
    },
    [addNode, screenToFlowPosition]
  );

  /* -------------------- Selection -------------------- */
  const onNodeClick = useCallback(
    (_: any, node: FlowNodeType) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  /* -------------------- Render -------------------- */
  return (
    <div ref={wrapperRef} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          stroke: "oklch(0.5 0.15 250)",
          strokeWidth: 2,
        }}
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={!isRunning}
        deleteKeyCode={["Backspace", "Delete"]}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        style={{ background: "#0d0d0d" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color="#2d2d2d"
        />

        <Controls 
          showInteractive={false}
          className="!bg-card !border-border !rounded-md !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        >
          <button
            onClick={handleAutoLayout}
            title="Auto layout"
            className="react-flow__controls-button !bg-card !border-border !text-foreground hover:!bg-muted"
          >
            <Network className="w-4 h-4" />
          </button>
        </Controls>

        <MiniMap
          pannable
          zoomable
          maskColor="#0d0d0d"
          className="!bg-card/95 !border-2 !border-border !rounded-lg !shadow-xl"
          nodeColor={(n) =>
            ({
              trigger: "#10b981",
              action: "#3b82f6",
              condition: "#f59e0b",
              loop: "#8b5cf6",
              ai: "#a855f7",
              apps: "#14b8a6",
              utility: "#94a3b8",
            }[(n.data as NodeData)?.category] ?? "#64748b")
          }
        />
      </ReactFlow>

      {/* -------------------- Logs -------------------- */}
      <div className="absolute bottom-4 left-[72px] right-[224px] h-[150px] bg-[#0d0d0d]/95 border border-border rounded-lg shadow-xl flex flex-col">
        <div className="px-3 py-2 border-b border-border flex justify-between">
          <span className="text-xs font-semibold">Execution Log</span>
          <div className="flex gap-1">
            <button onClick={() => navigator.clipboard.writeText(logs.join("\n"))}>
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={clearLogs}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-center py-6">
              No logs yet
            </div>
          ) : (
            logs.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
