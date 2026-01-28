import {
  Play,
  Save,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  FolderOpen,
  Plus,
  Square,
  Loader2,
  Minus,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFlowStore } from "@/stores/flowStore";
import { WindowMinimise, WindowToggleMaximise, Quit } from "../../../wailsjs/runtime/runtime";

export default function Header() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    saveFlow,
    clearCanvas,
    nodes,
    activeFlowId,
    flows,
    isRunning,
    runFlow,
    stopFlow,
    setSettingsOpen,
  } = useFlowStore();

  const activeFlow = flows.find((f) => f.id === activeFlowId);

  const handleSave = () => {
    const name = activeFlow?.name || prompt("Enter flow name:", "New Flow");
    if (name) saveFlow(name);
  };

  const handleRun = async () => {
    if (isRunning) {
      await stopFlow();
    } else {
      await runFlow();
    }
  };

  const handleMinimize = () => {
    WindowMinimise();
  };

  const handleMaximize = () => {
    WindowToggleMaximise();
  };

  const handleClose = () => {
    Quit();
  };

  return (
    <header 
      className="h-9 bg-background/95 backdrop-blur border-b border-border/50 flex items-center justify-between px-3 select-none"
      style={{ "--wails-draggable": "drag" } as React.CSSProperties}
      data-wails-drag
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 flex-1" style={{ "--wails-draggable": "no-drag" } as React.CSSProperties} data-wails-no-drag>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {sidebarCollapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </Button>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[9px]">FF</span>
          </div>
          <span className="text-xs font-semibold">ForgeFlow</span>
        </div>
      </div>

      {/* Center - Flow Title */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="text-xs font-medium text-muted-foreground">
          {activeFlow ? activeFlow.name : "Untitled Flow"}
        </span>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-0.5 flex-1 justify-end" style={{ "--wails-draggable": "no-drag" } as React.CSSProperties} data-wails-no-drag>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearCanvas} title="New flow">
          <Plus className="w-3.5 h-3.5" />
        </Button>

        <Button variant="ghost" size="sm" className="h-7 px-2" title="Open flow">
          <FolderOpen className="w-3.5 h-3.5" />
        </Button>

        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleSave} disabled={nodes.length === 0} title="Save flow">
          <Save className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          variant={isRunning ? "destructive" : "default"}
          size="sm"
          className="h-7 px-2"
          onClick={handleRun}
          disabled={nodes.length === 0}
          title={isRunning ? "Stop flow" : "Run flow"}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <Square className="w-2.5 h-2.5 ml-1" />
            </>
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearCanvas} disabled={nodes.length === 0} title="Clear canvas">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSettingsOpen(true)} title="Settings">
          <Settings className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Window Controls */}
        <button
          onClick={handleMinimize}
          className="h-7 w-7 flex items-center justify-center hover:bg-muted/50 rounded transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-7 w-7 flex items-center justify-center hover:bg-muted/50 rounded transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="h-7 w-7 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
