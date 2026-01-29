import { useEffect } from "react";
import { X, Clock, CheckCircle2, XCircle, Trash2, Download } from "lucide-react";
import { useExecutionStore } from "@/stores/executionStore";
import { useConfirm } from "@/hooks";
import type { FlowExecution } from "@/types/flow";

interface ExecutionHistoryProps {
  onClose: () => void;
}

export default function ExecutionHistory({ onClose }: ExecutionHistoryProps) {
  const { executions, selectedExecution, isLoading, loadExecutions, deleteExecution, clearExecutions, setSelectedExecution } = useExecutionStore();
  const { confirm } = useConfirm();

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  const formatDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    const duration = end - start;
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const exportExecution = (execution: FlowExecution) => {
    const data = JSON.stringify(execution, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-${execution.id.slice(0, 8)}-${new Date(execution.startedAt).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] bg-[#252526] rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e3e42]">
          <div>
            <h2 className="text-lg font-semibold text-[#d4d4d4]">Execution History</h2>
            <p className="text-sm text-[#858585]">{executions.length} executions</p>
          </div>
          <div className="flex items-center gap-2">
            {executions.length > 0 && (
              <button
                onClick={async () => {
                  const confirmed = await confirm({
                    title: "Clear All History",
                    message: "Are you sure you want to clear all execution history? This cannot be undone.",
                    confirmText: "Clear All",
                    cancelText: "Cancel",
                    variant: "danger",
                  });
                  if (confirmed) {
                    clearExecutions();
                  }
                }}
                className="px-3 py-1.5 text-sm text-[#d4d4d4] hover:bg-[#2d2d30] rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2d2d30] rounded transition-colors"
            >
              <X className="w-5 h-5 text-[#d4d4d4]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Execution List */}
          <div className="w-1/2 border-r border-[#3e3e42] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-[#858585]">
                Loading...
              </div>
            ) : executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#858585] px-6 text-center">
                <Clock className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No execution history yet</p>
                <p className="text-xs mt-1">Run a flow to see execution details here</p>
              </div>
            ) : (
              <div className="divide-y divide-[#3e3e42]">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    onClick={() => setSelectedExecution(execution)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedExecution?.id === execution.id
                        ? "bg-[#2d2d30]"
                        : "hover:bg-[#2a2a2d]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="text-sm font-medium text-[#d4d4d4]">
                          {execution.flowName || "Unnamed Flow"}
                        </span>
                      </div>
                      <span className="text-xs text-[#858585]">
                        {formatDate(execution.startedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-[#858585]">
                      <span>{execution.nodeCount || 0} nodes</span>
                      {execution.successCount !== undefined && (
                        <span className="text-green-500">{execution.successCount} ✓</span>
                      )}
                      {execution.errorCount !== undefined && execution.errorCount > 0 && (
                        <span className="text-red-500">{execution.errorCount} ✗</span>
                      )}
                      <span>{formatDuration(execution.startedAt, execution.endedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedExecution ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-[#d4d4d4] mb-1">
                      {selectedExecution.flowName || "Unnamed Flow"}
                    </h3>
                    <p className="text-xs text-[#858585] font-mono">
                      ID: {selectedExecution.id.slice(0, 16)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportExecution(selectedExecution)}
                      className="p-2 hover:bg-[#2d2d30] rounded transition-colors"
                      title="Export execution"
                    >
                      <Download className="w-4 h-4 text-[#d4d4d4]" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: "Delete Execution",
                          message: "Are you sure you want to delete this execution?",
                          confirmText: "Delete",
                          cancelText: "Cancel",
                          variant: "danger",
                        });
                        if (confirmed) {
                          deleteExecution(selectedExecution.id);
                          setSelectedExecution(null);
                        }
                      }}
                      className="p-2 hover:bg-[#2d2d30] rounded transition-colors"
                      title="Delete execution"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1e1e1e] rounded p-3">
                    <div className="text-xs text-[#858585] mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedExecution.status)}
                      <span className="text-sm text-[#d4d4d4] capitalize">
                        {selectedExecution.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#1e1e1e] rounded p-3">
                    <div className="text-xs text-[#858585] mb-1">Duration</div>
                    <div className="text-sm text-[#d4d4d4]">
                      {formatDuration(selectedExecution.startedAt, selectedExecution.endedAt)}
                    </div>
                  </div>
                  <div className="bg-[#1e1e1e] rounded p-3">
                    <div className="text-xs text-[#858585] mb-1">Started</div>
                    <div className="text-sm text-[#d4d4d4]">
                      {new Date(selectedExecution.startedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#1e1e1e] rounded p-3">
                    <div className="text-xs text-[#858585] mb-1">Ended</div>
                    <div className="text-sm text-[#d4d4d4]">
                      {selectedExecution.endedAt
                        ? new Date(selectedExecution.endedAt).toLocaleString()
                        : "In progress"}
                    </div>
                  </div>
                </div>

                {/* Node Results */}
                <div>
                  <h4 className="text-sm font-semibold text-[#d4d4d4] mb-3">
                    Node Results ({selectedExecution.results?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedExecution.results?.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1e1e1e] rounded p-3 border border-[#3e3e42]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm text-[#d4d4d4] font-mono">
                              {result.nodeId.slice(0, 8)}
                            </span>
                          </div>
                          <span className="text-xs text-[#858585]">
                            {result.duration}ms
                          </span>
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-400 mt-2 font-mono">
                            {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#858585] text-sm">
                Select an execution to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
