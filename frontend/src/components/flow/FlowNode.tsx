import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  FileText,
  Clock,
  Webhook,
  Play,
  Monitor,
  FileIcon,
  Globe,
  Terminal,
  Bell,
  Download,
  Brain,
  Sparkles,
  Tag,
  Search,
  PenTool,
  Wand2,
  MessageSquare,
  GitBranch,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeStatus, NodeCategory } from "@/types/flow";

interface FlowNodeProps {
  data: {
    label: string;
    category: NodeCategory;
    icon?: string;
    description?: string;
    status?: NodeStatus;
  };
  selected?: boolean;
}

const categoryStyles: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  trigger: { bg: "bg-emerald-950/30", border: "border-emerald-500/30", icon: "text-emerald-400", glow: "shadow-emerald-500/40" },
  condition: { bg: "bg-amber-950/30", border: "border-amber-500/30", icon: "text-amber-400", glow: "shadow-amber-500/40" },
  action: { bg: "bg-blue-950/30", border: "border-blue-500/30", icon: "text-blue-400", glow: "shadow-blue-500/40" },
  ai: { bg: "bg-purple-950/30", border: "border-purple-500/30", icon: "text-purple-400", glow: "shadow-purple-500/40" },
  output: { bg: "bg-rose-950/30", border: "border-rose-500/30", icon: "text-rose-400", glow: "shadow-rose-500/40" },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  file: FileText,
  time: Clock,
  http: Webhook,
  manual: Play,
  system: Monitor,
  fileOps: FileIcon,
  api: Globe,
  shell: Terminal,
  notify: Bell,
  export: Download,
  ai: Brain,
  summarize: Sparkles,
  classify: Tag,
  extract: Search,
  rewrite: PenTool,
  generate: Wand2,
  custom: MessageSquare,
  condition: GitBranch,
};

const statusIcons: Record<NodeStatus, React.ReactNode> = {
  running: <Loader2 className="w-3 h-3 animate-spin text-blue-400" />,
  success: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  error: <XCircle className="w-3 h-3 text-red-400" />,
  idle: null,
};

function FlowNode({ data, selected }: FlowNodeProps) {
  const styles = categoryStyles[data.category] || categoryStyles.action;
  const IconComponent = iconMap[data.icon || data.category] || Brain;
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isError = data.status === "error";

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg border min-w-[120px] transition-all duration-200",
        styles.bg,
        styles.border,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isRunning && `animate-pulse shadow-lg ${styles.glow}`,
        isSuccess && "shadow-lg shadow-emerald-500/40",
        isError && "shadow-lg shadow-red-500/40"
      )}
    >
      {data.category !== "trigger" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-muted !border !border-foreground/20"
        />
      )}

      <div className="flex items-center gap-1.5">
        <div className={cn("p-1 rounded bg-background/20", styles.icon)}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-medium truncate flex-1">{data.label}</span>
        {data.status && data.status !== "idle" && statusIcons[data.status]}
      </div>

      {data.category !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-muted !border !border-foreground/20"
        />
      )}
    </div>
  );
}

export default memo(FlowNode);
