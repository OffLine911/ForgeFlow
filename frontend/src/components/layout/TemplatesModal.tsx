import { useState, useMemo, useEffect } from 'react';
import { X, Search, LayoutTemplate, ChevronRight, Globe, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowStore } from '@/stores/flowStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { workflowTemplates } from '@/data/templates';
import type { WorkflowTemplate } from '@/types/template';
import type { FlowNode, FlowEdge, NodeData } from '@/types/flow';
import { nodeDefinitions } from '@/nodes';
import { toast } from '@/stores/dialogStore';

type TabType = 'local' | 'community';

export default function TemplatesModal() {
  const { 
    templateModalOpen, setTemplateModalOpen, setWorkflowPanelOpen,
    communityTemplates, communityLoading, communityError, 
    fetchCommunityTemplates, clearCommunityTemplates
  } = useWorkflowStore();
  const { setNodes, setEdges, saveFlow, pushHistory } = useFlowStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('local');

  // Fetch community templates when switching to community tab
  useEffect(() => {
    if (activeTab === 'community' && communityTemplates.length === 0 && !communityLoading && !communityError) {
      fetchCommunityTemplates();
    }
  }, [activeTab, communityTemplates.length, communityLoading, communityError, fetchCommunityTemplates]);

  const filteredTemplates = useMemo(() => {
    const sourceTemplates = activeTab === 'local' ? workflowTemplates : communityTemplates;
    
    let templates = selectedCategory 
      ? sourceTemplates.filter(t => t.category === selectedCategory)
      : sourceTemplates;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [selectedCategory, searchQuery, activeTab, communityTemplates]);

  const currentCategories = useMemo(() => {
    const sourceTemplates = activeTab === 'local' ? workflowTemplates : communityTemplates;
    const cats: Record<string, WorkflowTemplate[]> = {};
    sourceTemplates.forEach(t => {
      if (!cats[t.category]) cats[t.category] = [];
      cats[t.category].push(t);
    });
    return cats;
  }, [activeTab, communityTemplates]);

  if (!templateModalOpen) return null;

  const handleClose = () => {
    setTemplateModalOpen(false);
    setSelectedTemplate(null);
    setSearchQuery('');
    setSelectedCategory(null);
    setActiveTab('local'); // Reset to local tab
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    console.log('Loading template:', selectedTemplate.name);
    console.log('Template data:', JSON.stringify(selectedTemplate, null, 2));

    // Helper to check if node is configured
    const isNodeConfigured = (nodeType: string, config: Record<string, any>): boolean => {
      const nodeDef = nodeDefinitions.find(n => n.type === nodeType);
      if (!nodeDef?.fields) return true; // No fields = always configured
      
      const requiredFields = nodeDef.fields.filter(f => f.required);
      if (requiredFields.length === 0) return true; // No required fields = always configured
      
      // Check if all required fields have values
      return requiredFields.every(f => {
        const value = config[f.key];
        return value !== undefined && value !== null && value !== '';
      });
    };

    // Convert template nodes to FlowNodes
    const nodes: FlowNode[] = selectedTemplate.nodes.map((templateNode, index) => {
      // Find matching node definition
      const nodeDef = nodeDefinitions.find(n => n.type === templateNode.type);
      const category = nodeDef?.category || 'action';
      const label = nodeDef?.name || templateNode.type;
      const icon = nodeDef?.icon || 'play';
      
      const config = { ...nodeDef?.defaultData, ...templateNode.data };

      const nodeData: NodeData = {
        label,
        category,
        icon,
        description: nodeDef?.description || '',
        status: 'idle',
        nodeType: templateNode.type,
        config,
        isConfigured: isNodeConfigured(templateNode.type, config),
      };

      return {
        id: `node-${index}-${Date.now()}`,
        type: 'custom',
        position: templateNode.position,
        data: nodeData,
      };
    });

    // Convert template connections to FlowEdges
    const edges: FlowEdge[] = selectedTemplate.connections
      .filter((conn, index) => {
        const sourceNode = nodes[conn.sourceIndex];
        const targetNode = nodes[conn.targetIndex];
        
        // Validate that both nodes exist
        if (!sourceNode || !targetNode) {
          console.warn(`Invalid connection at index ${index}:`, {
            sourceIndex: conn.sourceIndex,
            targetIndex: conn.targetIndex,
            sourceNode: sourceNode?.id,
            targetNode: targetNode?.id,
            totalNodes: nodes.length
          });
          return false;
        }
        
        return true;
      })
      .map((conn, index) => {
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
        } as FlowEdge;
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
        <div className="w-55 bg-muted/30 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Templates</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => { setActiveTab('local'); setSelectedCategory(null); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                  activeTab === 'local' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                Built-in
              </button>
              <button
                onClick={() => { setActiveTab('community'); setSelectedCategory(null); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                  activeTab === 'community' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                Community
              </button>
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
            
            {Object.keys(currentCategories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedCategory === category ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                <span>{category}</span>
                <span className="text-xs text-muted-foreground">{currentCategories[category].length}</span>
              </button>
            ))}

            {activeTab === 'community' && !communityLoading && (
              <button
                onClick={() => {
                  clearCommunityTemplates();
                  fetchCommunityTemplates();
                }}
                disabled={communityLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
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
            {activeTab === 'community' && communityLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading community templates...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {communityTemplates.length > 0 && `Loaded ${communityTemplates.length} so far...`}
                </p>
              </div>
            ) : activeTab === 'community' && communityError ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <Globe className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-2 font-medium">Failed to load community templates</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-md">{communityError}</p>
                {communityError.includes('not found') || communityError.includes('Invalid JSON') ? (
                  <div className="text-xs text-muted-foreground/70 mb-4 max-w-md">
                    <p className="mb-2">The ForgeFlow-Community repository may not be set up yet.</p>
                    <p>Check: <code className="bg-muted px-1 py-0.5 rounded text-xs">github.com/OffLine911/ForgeFlow-community</code></p>
                  </div>
                ) : null}
                <button
                  onClick={() => {
                    clearCommunityTemplates();
                    fetchCommunityTemplates();
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <LayoutTemplate className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'community' 
                    ? 'No community templates available yet' 
                    : searchQuery || selectedCategory 
                      ? 'No templates match your search'
                      : 'No templates found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={`${activeTab}-${template.id}`}
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
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.nodes.length} nodes</span>
                      {activeTab === 'community' && 'author' in template && template.author ? (
                        <span className="truncate ml-2">by {String(template.author)}</span>
                      ) : null}
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
