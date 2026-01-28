import { useFlowStore } from "@/stores/flowStore";
import { Circle, Activity, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatusBar() {
  const { nodes, edges, activeFlowId, flows, isRunning } = useFlowStore();
  const activeFlow = flows.find((f) => f.id === activeFlowId);

  const runningNodes = nodes.filter((n) => n.data.status === "running").length;
  const successNodes = nodes.filter((n) => n.data.status === "success").length;
  const errorNodes = nodes.filter((n) => n.data.status === "error").length;

  return (
    <footer className="h-6 bg-card border-t border-border flex items-center justify-between px-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {isRunning ? (
            <>
              <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-400" />
              <span className="text-blue-400">Running</span>
            </>
          ) : errorNodes > 0 ? (
            <>
              <XCircle className="w-2.5 h-2.5 text-red-400" />
              <span className="text-red-400">Error</span>
            </>
          ) : successNodes > 0 ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-emerald-400">Complete</span>
            </>
          ) : (
            <>
              <Circle className="w-2 h-2 fill-muted-foreground" />
              <span>Ready</span>
            </>
          )}
        </div>

        <div className="h-3 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5" />
          <span>{nodes.length}N · {edges.length}E</span>
        </div>

        {isRunning && runningNodes > 0 && (
          <>
            <div className="h-3 w-px bg-border" />
            <span className="text-blue-400">{runningNodes} executing</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {activeFlow && (
          <span className={cn("truncate max-w-32", activeFlow.name && "text-foreground")}>
            {activeFlow.name}
          </span>
        )}
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
