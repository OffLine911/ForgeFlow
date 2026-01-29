import { useState, useMemo } from 'react';
import { X, Search, LayoutTemplate, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowStore } from '@/stores/flowStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { workflowTemplates, getTemplatesByCategory } from '@/data/templates';
import type { WorkflowTemplate } from '@/types/template';
import type { FlowNode, FlowEdge, NodeData } from '@/types/flow';
import { nodeDefinitions } from '@/nodes';
import { toast } from '@/stores/dialogStore';

export default function TemplatesModal() {
  const { templateModalOpen, setTemplateModalOpen, setWorkflowPanelOpen } = useWorkflowStore();
  const { setNodes, setEdges, saveFlow, pushHistory } = useFlowStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const categories = useMemo(() => getTemplatesByCategory(), []);
  const categoryNames = Object.keys(categories);

  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory 
      ? categories[selectedCategory] || []
      : workflowTemplates;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [selectedCategory, searchQuery, categories]);

  if (!templateModalOpen) return null;

  const handleClose = () => {
    setTemplateModalOpen(false);
    setSelectedTemplate(null);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    // Convert template nodes to FlowNodes
    const nodes: FlowNode[] = selectedTemplate.nodes.map((templateNode, index) => {
      // Find matching node definition
      const nodeDef = nodeDefinitions.find(n => n.type === templateNode.type);
      const category = nodeDef?.category || 'action';
      const label = nodeDef?.name || templateNode.type;
      const icon = nodeDef?.icon || 'play';

      const nodeData: NodeData = {
        label,
        category,
        icon,
        description: nodeDef?.description || '',
        status: 'idle',
        nodeType: templateNode.type,
        config: { ...nodeDef?.defaultData, ...templateNode.data },
      };

      return {
        id: `node-${index}-${Date.now()}`,
        type: 'custom',
        position: templateNode.position,
        data: nodeData,
      };
    });

    // Convert template connections to FlowEdges
    const edges: FlowEdge[] = selectedTemplate.connections.map((conn, index) => {
      const sourceNode = nodes[conn.sourceIndex];
      const targetNode = nodes[conn.targetIndex];
      
      return {
        id: `edge-${index}-${Date.now()}`,
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: conn.sourcePort || null,
        targetHandle: conn.targetPort || null,
        type: 'smoothstep',
        animated: true,
      };
    });

    console.log('Template nodes:', nodes);
    console.log('Template edges:', edges);

    pushHistory();
    setNodes(nodes);
    setEdges(edges);
    
    // Save after a brief delay to ensure state is updated
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await saveFlow(selectedTemplate.name, selectedTemplate.description);
      toast.success('Template loaded', `"${selectedTemplate.name}" created successfully`);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to create from template', error instanceof Error ? error.message : 'Unknown error');
    }

    handleClose();
    setWorkflowPanelOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sidebar - Categories */}
        <div className="w-48 bg-muted/30 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Templates</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
            >
              All Templates
            </button>
            
            <div className="my-2 h-px bg-border" />
            
            {categoryNames.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedCategory === category ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                <span>{category}</span>
                <span className="text-xs text-muted-foreground">{categories[category].length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <LayoutTemplate className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      'group relative flex flex-col p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{template.category}</p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {template.nodes.length} nodes
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {selectedTemplate 
                ? `Selected: ${selectedTemplate.name}` 
                : `${filteredTemplates.length} templates available`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseTemplate}
                disabled={!selectedTemplate}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedTemplate
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                Use Template
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
