import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeCategory, NodeStatus } from "@/types/flow";

/* ------------------------------------------------ */
/* Layout constants (CRITICAL)                      */
/* ------------------------------------------------ */

const FLOW_ROW_HEIGHT = 56;

const MIN_NODE_WIDTH = 120;
const MAX_NODE_WIDTH = 220;
const NODE_HEIGHT = 48;

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
/* UNIFIED NODE COMPONENT                            */
/* ================================================= */

function UnifiedNode({ data, selected }: FlowNodeProps) {
  const color = CATEGORY_COLORS[data.category];
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isError = data.status === "error";

  // Calculate width based on label length
  const labelLength = data.label.length;
  const calculatedWidth = Math.min(
    MAX_NODE_WIDTH,
    Math.max(MIN_NODE_WIDTH, labelLength * 9 + 80)
  );

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
          isRunning && "animate-pulse",
          isSuccess && "shadow-lg shadow-emerald-500/50",
          isError && "shadow-lg shadow-rose-500/50"
        )}
        style={{
          width: calculatedWidth,
          height: NODE_HEIGHT,
          borderColor: isSuccess ? "#10b981" : isError ? "#ef4444" : `${color}55`,
          backgroundColor: isSuccess ? "rgba(16, 185, 129, 0.1)" : isError ? "rgba(239, 68, 68, 0.1)" : undefined,
        }}
      >
        {/* INPUT (all nodes except triggers) */}
        {data.category !== "trigger" && (
          <Handle
            type="target"
            position={Position.Left}
            id="in"
            className="!w-2 !h-2 !bg-muted !border !border-foreground/30"
          />
        )}

        {/* ICON */}
        <div
          className="flex items-center justify-center rounded-md text-white flex-shrink-0"
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
            className="text-[10px] text-amber-400 flex-shrink-0"
          >
            ⚠
          </span>
        )}

        {/* OUTPUT */}
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="!w-2 !h-2 !bg-muted !border !border-foreground/30"
        />
      </div>
    </div>
  );
}

/* ================================================= */
/* MAIN EXPORT                                       */
/* ================================================= */

function FlowNode(props: FlowNodeProps) {
  return <UnifiedNode {...props} />;
}

export default memo(FlowNode);
