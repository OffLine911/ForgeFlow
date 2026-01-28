import { useState, useMemo } from "react";
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
  Search as SearchIcon,
  PenTool,
  Wand2,
  MessageSquare,
  GitBranch,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flowStore";
import type { NodeData, NodeCategory } from "@/types/flow";
import { nodeDefinitions, getNodesByCategory } from "@/nodes";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  file: FileText,
  time: Clock,
  http: Webhook,
  play: Play,
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
  extract: SearchIcon,
  rewrite: PenTool,
  generate: Wand2,
  custom: MessageSquare,
  condition: GitBranch,
  loop: GitBranch,
};

const categoryColors: Record<NodeCategory, string> = {
  trigger: "text-emerald-400",
  condition: "text-amber-400",
  action: "text-blue-400",
  ai: "text-purple-400",
  output: "text-rose-400",
  loop: "text-violet-400",
  utility: "text-slate-400",
};

const categoryBg: Record<NodeCategory, string> = {
  trigger: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
  condition: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
  action: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  ai: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  output: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20",
  loop: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
  utility: "bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/20",
};

function DraggableNode({ node }: { node: typeof nodeDefinitions[0] }) {
  const IconComponent = iconMap[node.icon] || Brain;
  const { addNodeAtCenter } = useFlowStore();

  const onDragStart = (event: React.DragEvent) => {
    const data: NodeData = {
      label: node.name,
      category: node.category,
      icon: node.icon,
      description: node.description,
      status: "idle",
      nodeType: node.type, // Store the node type for later use
      config: node.defaultData,
    };
    event.dataTransfer.setData("application/forgeflow-node", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };

  const onClick = () => {
    const data: NodeData = {
      label: node.name,
      category: node.category,
      icon: node.icon,
      description: node.description,
      status: "idle",
      nodeType: node.type,
      config: node.defaultData,
    };
    addNodeAtCenter(data);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={node.description}
      className={cn(
        "group flex items-center gap-1.5 px-1.5 py-1 rounded-md border cursor-grab active:cursor-grabbing transition-colors",
        categoryBg[node.category]
      )}
    >
      <div className={cn("w-5 h-5 rounded flex items-center justify-center bg-background/50", categoryColors[node.category])}>
        <IconComponent className="w-3 h-3" />
      </div>
      <span className="text-[11px] font-medium truncate flex-1">{node.name}</span>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed } = useFlowStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['trigger']) // Start with triggers expanded
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Group nodes by category
  const categories = useMemo(() => {
    const cats = [
      { name: 'Triggers', category: 'trigger' as NodeCategory },
      { name: 'Actions', category: 'action' as NodeCategory },
      { name: 'Conditions', category: 'condition' as NodeCategory },
      { name: 'AI', category: 'ai' as NodeCategory },
      { name: 'Outputs', category: 'output' as NodeCategory },
    ];

    return cats.map(cat => ({
      ...cat,
      nodes: getNodesByCategory(cat.category)
    }));
  }, []);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return nodeDefinitions.filter(node => 
      node.name.toLowerCase().includes(query) || 
      node.description.toLowerCase().includes(query) ||
      node.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (sidebarCollapsed) return null;

  return (
    <aside className="w-44 h-full bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col">
      <div className="px-2.5 py-2 border-b border-border/50">
        <h2 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          Node Library
        </h2>
      </div>

      {/* Search box */}
      <div className="px-2 py-1.5 border-b border-border/50">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-7 pr-2 py-1 text-[11px] bg-background/50 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {filteredNodes ? (
          // Show search results
          <div className="space-y-0.5">
            {filteredNodes.length === 0 ? (
              <div className="px-2 py-4 text-center text-[11px] text-muted-foreground">
                No nodes found
              </div>
            ) : (
              filteredNodes.map((node) => (
                <DraggableNode key={node.type} node={node} />
              ))
            )}
          </div>
        ) : (
          // Show categories
          categories.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-muted/50 transition-colors group"
              >
                {expandedCategories.has(category.name) ? (
                  <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                )}
                <span className={cn("text-[11px] font-semibold flex-1 text-left", categoryColors[category.category])}>
                  {category.name}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {category.nodes.length}
                </span>
              </button>
              {expandedCategories.has(category.name) && (
                <div className="ml-1.5 mt-0.5 space-y-0.5">
                  {category.nodes.map((node) => (
                    <DraggableNode key={node.type} node={node} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="px-2.5 py-1.5 border-t border-border/50">
        <div className="text-[9px] text-muted-foreground text-center">
          Drag or click to add
        </div>
      </div>
    </aside>
  );
}
