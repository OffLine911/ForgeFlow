import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CronField, HotkeyField, FilePickerField } from "@/components/ui/fields";
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
  const config = (data.config || {}) as Record<string, any>;
  const hasSettings = ["trigger", "action", "ai", "condition"].includes(data.category);

  return (
    <aside className="w-64 h-full bg-card border-l border-border flex flex-col text-xs">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold">Settings</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Node Info */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Type
          </label>
          <div className={cn("mt-1 px-2 py-1.5 rounded border bg-background/50 text-xs", categoryColors[data.category])}>
            <span className="font-medium">{categoryLabels[data.category]}</span>
          </div>
        </div>

        {/* Node Label */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            rows={2}
            className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Optional..."
          />
        </div>

        {/* Category-specific settings */}
        {hasSettings && (
          <>
            <div className="pt-2 border-t border-border">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Configuration
              </h3>

              {/* Trigger Settings */}
              {data.category === "trigger" && (
                <div className="space-y-2.5">
                  {data.icon === "file" && (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Watch Path</label>
                        <div className="mt-1">
                          <FilePickerField
                            value={String(config.watchPath || "")}
                            onChange={(value) => updateNodeData(selectedNode.id, { config: { ...config, watchPath: value } })}
                            placeholder="/path/to/watch"
                            mode="open"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">File Pattern</label>
                        <input
                          type="text"
                          value={String(config.filePattern || "")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, filePattern: e.target.value } })}
                          placeholder="*.txt"
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </>
                  )}
                  {data.icon === "time" && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Cron Expression</label>
                      <div className="mt-1">
                        <CronField
                          value={String(config.cron || "")}
                          onChange={(value) => updateNodeData(selectedNode.id, { config: { ...config, cron: value } })}
                          placeholder="0 */5 * * * *"
                        />
                      </div>
                    </div>
                  )}
                  {data.icon === "http" && (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Endpoint Path</label>
                        <input
                          type="text"
                          value={String(config.endpoint || "")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, endpoint: e.target.value } })}
                          placeholder="/webhook"
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Method</label>
                        <select 
                          value={String(config.method || "POST")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, method: e.target.value } })}
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option>POST</option>
                          <option>GET</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                    </>
                  )}
                  {data.icon === "keyboard" && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Hotkey</label>
                      <div className="mt-1">
                        <HotkeyField
                          value={String(config.hotkey || "")}
                          onChange={(value) => updateNodeData(selectedNode.id, { config: { ...config, hotkey: value } })}
                          placeholder="Click to record..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Settings */}
              {data.category === "action" && (
                <div className="space-y-2.5">
                  {data.icon === "api" && (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">URL</label>
                        <input
                          type="text"
                          value={String(config.url || "")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, url: e.target.value } })}
                          placeholder="https://api.example.com"
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Method</label>
                        <select 
                          value={String(config.method || "GET")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, method: e.target.value } })}
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Headers (JSON)</label>
                        <textarea
                          value={String(config.headers || "{}")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, headers: e.target.value } })}
                          rows={2}
                          placeholder='{"Content-Type": "application/json"}'
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
                        />
                      </div>
                    </>
                  )}
                  {data.icon === "shell" && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Command</label>
                      <textarea
                        value={String(config.command || "")}
                        onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, command: e.target.value } })}
                        rows={2}
                        placeholder="echo 'Hello World'"
                        className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
                      />
                    </div>
                  )}
                  {data.icon === "fileOps" && (
                    <>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Operation</label>
                        <select 
                          value={String(config.operation || "move")}
                          onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, operation: e.target.value } })}
                          className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="move">Move</option>
                          <option value="copy">Copy</option>
                          <option value="delete">Delete</option>
                          <option value="rename">Rename</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Target Path</label>
                        <div className="mt-1">
                          <FilePickerField
                            value={String(config.targetPath || "")}
                            onChange={(value) => updateNodeData(selectedNode.id, { config: { ...config, targetPath: value } })}
                            placeholder="/path/to/target"
                            mode="save"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* AI Settings */}
              {data.category === "ai" && (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Model</label>
                    <select 
                      value={String(config.model || "gpt-4")}
                      onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, model: e.target.value } })}
                      className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                      <option value="local">Local LLM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Prompt</label>
                    <textarea
                      value={String(config.prompt || "")}
                      onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, prompt: e.target.value } })}
                      rows={3}
                      placeholder="Enter your prompt..."
                      className="mt-1 w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Temperature: {Number(config.temperature || 0.7).toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={Number(config.temperature || 0.7)}
                      onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, temperature: parseFloat(e.target.value) } })}
                      className="mt-1 w-full h-1"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
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
                    <select 
                      value={String(config.conditionType || "equals")}
                      onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, conditionType: e.target.value } })}
                      className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater">Greater Than</option>
                      <option value="less">Less Than</option>
                      <option value="regex">Regex Match</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Value</label>
                    <input
                      type="text"
                      value={String(config.value || "")}
                      onChange={(e) => updateNodeData(selectedNode.id, { config: { ...config, value: e.target.value } })}
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
            <p className="text-[10px] text-muted-foreground text-center py-3">
              No additional settings
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
