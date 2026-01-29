import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeCategory, NodeStatus } from "@/types/flow";

/* ------------------------------------------------ */
/* Layout constants (CRITICAL)                      */
/* ------------------------------------------------ */

const FLOW_ROW_HEIGHT = 56;

const ACTION_NODE_WIDTH = 180;
const ACTION_NODE_HEIGHT = 48;

const TRIGGER_NODE_SIZE = 44;
const ICON_SIZE = 28;

/* ------------------------------------------------ */
/* Category colors                                  */
/* ------------------------------------------------ */

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  trigger: "#10b981",
  condition: "#f59e0b",
  action: "#3b82f6",
  loop: "#8b5cf6",
  utility: "#64748b",
  ai: "#a855f7",
  apps: "#14b8a6",
};

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */

interface FlowNodeProps {
  data: {
    label: string;
    category: NodeCategory;
    icon?: string;
    status?: NodeStatus;
    isConfigured?: boolean;
  };
  selected?: boolean;
}

/* ================================================= */
/* ACTION / STANDARD NODE                            */
/* ================================================= */

function ActionNode({ data, selected }: FlowNodeProps) {
  const color = CATEGORY_COLORS[data.category];
  const isRunning = data.status === "running";

  return (
    <div
      className="flex items-center"
      style={{ height: FLOW_ROW_HEIGHT }}
    >
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-xl border px-3",
          "bg-background/90 backdrop-blur transition-all duration-200",
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          isRunning && "animate-pulse shadow-lg"
        )}
        style={{
          width: ACTION_NODE_WIDTH,
          height: ACTION_NODE_HEIGHT,
          borderColor: `${color}55`,
        }}
      >
        {/* INPUT */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-muted !border !border-foreground/30"
        />

        {/* ICON */}
        <div
          className="flex items-center justify-center rounded-md text-white"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            backgroundColor: color,
          }}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-sm">{data.icon || "●"}</span>
          )}
        </div>

        {/* LABEL */}
        <span className="text-xs font-medium truncate flex-1">
          {data.label}
        </span>

        {/* CONFIG WARNING */}
        {!data.isConfigured && (
          <span
            title="Not configured"
            className="text-[10px] text-amber-400"
          >
            ⚠
          </span>
        )}

        {/* OUTPUT */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-muted !border !border-foreground/30"
        />
      </div>
    </div>
  );
}

/* ================================================= */
/* TRIGGER NODE (CORRECT & COMPACT)                  */
/* ================================================= */

function TriggerNode({ data, selected }: FlowNodeProps) {
  const color = CATEGORY_COLORS.trigger;
  const isRunning = data.status === "running";

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: FLOW_ROW_HEIGHT }}
    >
      {/* LABEL (does NOT affect geometry) */}
      <span className="text-[10px] text-muted-foreground mb-1 select-none">
        {data.label}
      </span>

      {/* ACTUAL NODE */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border",
          "bg-emerald-950/40 backdrop-blur transition-all duration-200",
          selected &&
            "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background",
          isRunning && "animate-pulse shadow-lg shadow-emerald-500/40"
        )}
        style={{
          width: TRIGGER_NODE_SIZE,
          height: TRIGGER_NODE_SIZE,
          borderColor: `${color}AA`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg text-white"
          style={{
            width: 24,
            height: 24,
            backgroundColor: color,
          }}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-sm">{data.icon || "▶"}</span>
          )}
        </div>

        {/* OUTPUT ONLY */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-emerald-400 !border !border-emerald-600"
        />
      </div>
    </div>
  );
}

/* ================================================= */
/* MAIN NODE SWITCH                                  */
/* ================================================= */

function FlowNode(props: FlowNodeProps) {
  if (props.data.category === "trigger") {
    return <TriggerNode {...props} />;
  }
  return <ActionNode {...props} />;
}

export default memo(FlowNode);
