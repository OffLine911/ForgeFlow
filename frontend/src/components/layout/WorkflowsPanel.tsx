import { useState } from 'react';
import {
  X,
  Plus,
  Folder,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  FileText,
  Search,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowStore } from '@/stores/flowStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useContextMenu, useDialog } from '@/hooks';
import type { Flow } from '@/types/flow';

export default function WorkflowsPanel() {
  const { workflowPanelOpen, setWorkflowPanelOpen, setTemplateModalOpen } = useWorkflowStore();
  const { flows, activeFlowId, loadFlow, deleteFlow, clearCanvas, saveFlow } = useFlowStore();
  const { confirm } = useDialogStore();
  const { showContextMenu } = useContextMenu();
  const { showDialog } = useDialog();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFlowId, setHoveredFlowId] = useState<string | null>(null);

  if (!workflowPanelOpen) return null;

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (flow.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleNewWorkflow = () => {
    clearCanvas();
    setWorkflowPanelOpen(false);
  };

  const handleNewFromTemplate = () => {
    setTemplateModalOpen(true);
  };

  const handleLoadFlow = async (flowId: string) => {
    try {
      await loadFlow(flowId);
      setWorkflowPanelOpen(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load flow';
      showDialog({
        title: 'Error Loading Workflow',
        content: <p className="text-sm text-muted-foreground">{errorMsg}</p>,
        size: 'sm',
      });
    }
  };

  const handleDeleteFlow = async (flow: Flow) => {
    const confirmed = await confirm({
      title: 'Delete Workflow',
      message: `Are you sure you want to delete "${flow.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await deleteFlow(flow.id);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to delete flow';
        showDialog({
          title: 'Error Deleting Workflow',
          content: <p className="text-sm text-muted-foreground">{errorMsg}</p>,
          size: 'sm',
        });
      }
    }
  };

  const handleDuplicateFlow = async (flow: Flow) => {
    try {
      await loadFlow(flow.id);
      await saveFlow(`${flow.name} (Copy)`, flow.description);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to duplicate flow';
      showDialog({
        title: 'Error Duplicating Workflow',
        content: <p className="text-sm text-muted-foreground">{errorMsg}</p>,
        size: 'sm',
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, flow: Flow) => {
    showContextMenu(e, [
      {
        id: 'open',
        label: 'Open',
        icon: <Folder className="w-4 h-4" />,
        onClick: () => handleLoadFlow(flow.id),
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => handleDuplicateFlow(flow),
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => {
          showDialog({
            title: 'Rename Workflow',
            content: (
              <div className="space-y-4">
                <input
                  id="rename-input"
                  type="text"
                  defaultValue={flow.name}
                  placeholder="Workflow name"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const newName = (e.target as HTMLInputElement).value.trim();
                      if (newName && newName !== flow.name) {
                        try {
                          await loadFlow(flow.id);
                          await saveFlow(newName, flow.description);
                        } catch (error) {
                          const errorMsg = error instanceof Error ? error.message : 'Failed to rename flow';
                          showDialog({
                            title: 'Error Renaming Workflow',
                            content: <p className="text-sm text-muted-foreground">{errorMsg}</p>,
                            size: 'sm',
                          });
                        }
                      }
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Press Enter to save</p>
              </div>
            ),
            size: 'sm',
          });
        },
      },
      { id: 'sep1', label: '', separator: true },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        danger: true,
        onClick: () => handleDeleteFlow(flow),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => setWorkflowPanelOpen(false)}
      />
      
      {/* Panel */}
      <div className="relative w-80 h-full bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Workflows</h2>
          </div>
          <button
            onClick={() => setWorkflowPanelOpen(false)}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-3 border-b border-border space-y-2">
          <button
            onClick={handleNewWorkflow}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Workflow</span>
          </button>
          <button
            onClick={handleNewFromTemplate}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span className="text-sm font-medium">From Template</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Workflows List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No workflows found' : 'No workflows yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search' : 'Create your first workflow'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFlows.map((flow) => (
                <div
                  key={flow.id}
                  onMouseEnter={() => setHoveredFlowId(flow.id)}
                  onMouseLeave={() => setHoveredFlowId(null)}
                  onContextMenu={(e) => handleContextMenu(e, flow)}
                  onClick={() => handleLoadFlow(flow.id)}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                    activeFlowId === flow.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    activeFlowId === flow.id ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <FileText className={cn(
                      'w-4 h-4',
                      activeFlowId === flow.id ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{flow.name}</span>
                      {activeFlowId === flow.id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{flow.nodeCount ?? flow.nodes.length} nodes</span>
                      <span>•</span>
                      <span>{new Date(flow.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {(hoveredFlowId === flow.id || activeFlowId === flow.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, flow);
                      }}
                      className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {flows.length} workflow{flows.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
