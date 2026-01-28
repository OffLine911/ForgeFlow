import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFlowStore } from "@/stores/flowStore";
import { cn } from "@/lib/utils";
import type { NodeCategory } from "@/types/flow";

const categoryLabels: Record<NodeCategory, string> = {
  trigger: "Trigger",
  condition: "Condition",
  action: "Action",
  ai: "AI Action",
  output: "Output",
  loop: "Loop",
  utility: "Utility",
};

const categoryColors: Record<NodeCategory, string> = {
  trigger: "text-emerald-400 border-emerald-500/30",
  condition: "text-amber-400 border-amber-500/30",
  action: "text-blue-400 border-blue-500/30",
  ai: "text-purple-400 border-purple-500/30",
  output: "text-rose-400 border-rose-500/30",
  loop: "text-violet-400 border-violet-500/30",
  utility: "text-slate-400 border-slate-500/30",
};

interface NodeSettingsProps {
  selectedNodeId: string | null;
  onClose: () => void;
}

export default function NodeSettings({ selectedNodeId, onClose }: NodeSettingsProps) {
  const { nodes, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const hasSettings = ["trigger", "action", "ai", "condition"].includes(data.category);

  return (
    <aside className="w-80 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Node Settings</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Info */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Node Type
          </label>
          <div className={cn("mt-1.5 px-3 py-2 rounded-md border bg-background/50", categoryColors[data.category])}>
            <span className="text-sm font-medium">{categoryLabels[data.category]}</span>
          </div>
        </div>

        {/* Node Label */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="mt-1.5 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            rows={3}
            className="mt-1.5 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Optional description..."
          />
        </div>

        {/* Category-specific settings */}
        {hasSettings && (
          <>
            <div className="pt-2 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Configuration
              </h3>

              {/* Trigger Settings */}
              {data.category === "trigger" && (
                <div className="space-y-3">
                  {data.icon === "file" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Watch Path</label>
                        <input
                          type="text"
                          placeholder="/path/to/watch"
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">File Pattern</label>
                        <input
                          type="text"
                          placeholder="*.txt"
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </>
                  )}
                  {data.icon === "time" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Cron Expression</label>
                      <input
                        type="text"
                        placeholder="0 */5 * * * *"
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                  {data.icon === "http" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Endpoint Path</label>
                        <input
                          type="text"
                          placeholder="/webhook"
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Method</label>
                        <select className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>POST</option>
                          <option>GET</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Settings */}
              {data.category === "action" && (
                <div className="space-y-3">
                  {data.icon === "api" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">URL</label>
                        <input
                          type="text"
                          placeholder="https://api.example.com"
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Method</label>
                        <select className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                    </>
                  )}
                  {data.icon === "shell" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Command</label>
                      <textarea
                        rows={3}
                        placeholder="echo 'Hello World'"
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                      />
                    </div>
                  )}
                  {data.icon === "fileOps" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Operation</label>
                        <select className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option>Move</option>
                          <option>Copy</option>
                          <option>Delete</option>
                          <option>Rename</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Target Path</label>
                        <input
                          type="text"
                          placeholder="/path/to/target"
                          className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* AI Settings */}
              {data.category === "ai" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Model</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>GPT-4</option>
                      <option>GPT-3.5 Turbo</option>
                      <option>Claude 3</option>
                      <option>Local LLM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Prompt</label>
                    <textarea
                      rows={4}
                      placeholder="Enter your prompt..."
                      className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Temperature</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.7"
                      className="mt-1 w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Settings */}
              {data.category === "condition" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Condition Type</label>
                    <select className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Equals</option>
                      <option>Contains</option>
                      <option>Greater Than</option>
                      <option>Less Than</option>
                      <option>Regex Match</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Value</label>
                    <input
                      type="text"
                      placeholder="Comparison value"
                      className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* No settings message */}
        {!hasSettings && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center py-4">
              This node type has no additional settings.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
