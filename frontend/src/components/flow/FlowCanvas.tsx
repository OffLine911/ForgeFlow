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

const nodeTypes = {
  custom: FlowNode,
};

const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
  style: { stroke: "oklch(0.5 0.15 250)", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "oklch(0.5 0.15 250)" },
};

// Simple auto-layout algorithm (hierarchical)
function autoLayout(nodes: FlowNodeType[], edges: any[]) {
  if (nodes.length === 0) return nodes;

  // Build adjacency map
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  nodes.forEach(node => {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find root nodes (no incoming edges)
  const roots = nodes.filter(node => inDegree.get(node.id) === 0);
  
  // BFS to assign levels
  const levels = new Map<string, number>();
  const queue: Array<{ id: string; level: number }> = roots.map(n => ({ id: n.id, level: 0 }));
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    levels.set(id, level);
    
    adjacency.get(id)?.forEach(targetId => {
      const currentLevel = levels.get(targetId) || 0;
      if (level + 1 > currentLevel) {
        levels.set(targetId, level + 1);
        queue.push({ id: targetId, level: level + 1 });
      }
    });
  }

  // Group nodes by level
  const nodesByLevel = new Map<number, FlowNodeType[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  // Position nodes
  const horizontalSpacing = 300;
  const verticalSpacing = 150;
  const startX = 100;
  const startY = 100;

  return nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const nodesInLevel = nodesByLevel.get(level) || [];
    const indexInLevel = nodesInLevel.indexOf(node);
    const totalInLevel = nodesInLevel.length;
    
    // Center nodes vertically within their level
    const offsetY = (indexInLevel - (totalInLevel - 1) / 2) * verticalSpacing;
    
    return {
      ...node,
      position: {
        x: startX + level * horizontalSpacing,
        y: startY + offsetY,
      },
    };
  });
}

export default function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, isRunning, setSelectedNodeId, logs, clearLogs, setNodes } = useFlowStore();
  const { fitView } = useReactFlow();

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = autoLayout(nodes, edges);
    setNodes(layoutedNodes);
    
    // Fit view after layout with animation
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [nodes, edges, setNodes, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/forgeflow-node");
      if (!type || !reactFlowWrapper.current) return;

      const nodeData = JSON.parse(type) as NodeData;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();

      const position = {
        x: event.clientX - bounds.left - 60,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: FlowNodeType = {
        id: `${nodeData.category}-${Date.now()}`,
        type: "custom",
        position,
        data: nodeData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: FlowNodeType) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Drag or click nodes from the sidebar</p>
            <p className="text-xs mt-1">to start building your automation</p>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        style={{ backgroundColor: '#0d0d0d' }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "oklch(0.5 0.15 250)", strokeWidth: 2 }}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={!isRunning}
        connectionRadius={50}
        snapToGrid={true}
        snapGrid={[15, 15]}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={30} 
          size={1.5} 
          color="#2d2d2d" 
        />
        <Controls 
          showInteractive={false}
          className="!bg-card !border-border !rounded-md !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button]:!w-7 [&>button]:!h-7" 
        >
          <button
            onClick={handleAutoLayout}
            disabled={nodes.length === 0}
            className="react-flow__controls-button !bg-card !border-border !text-foreground hover:!bg-muted disabled:!opacity-30 disabled:!cursor-not-allowed"
            title="Auto-layout workflow"
          >
            <Network className="w-4 h-4" />
          </button>
        </Controls>
        <MiniMap
          className="!bg-[#0d0d0d]/95 !border-2 !border-border !rounded-lg !shadow-xl"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: "oklch(0.6 0.18 145)",
              condition: "oklch(0.65 0.18 80)",
              action: "oklch(0.6 0.2 250)",
              ai: "oklch(0.6 0.2 300)",
              output: "oklch(0.6 0.2 25)",
            };
            return colors[(node.data as NodeData)?.category] || "oklch(0.5 0.15 250)";
          }}
          maskColor="#0d0d0d"
          pannable
          zoomable
        />
      </ReactFlow>
      
      {/* Log Panel - Outside ReactFlow */}
      <div 
        className="absolute bottom-4 left-[72px] right-[224px] h-[150px] bg-[#0d0d0d]/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-xl overflow-hidden flex flex-col z-10"
      >
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Execution Log</span>
          <div className="flex items-center gap-1">
            <button 
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              title="Copy logs"
              onClick={() => navigator.clipboard.writeText(logs.join('\n'))}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              title="Clear logs"
              onClick={clearLogs}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No logs yet. Run a flow to see execution details.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-foreground/90 hover:bg-muted/30 px-1 py-0.5 rounded">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
