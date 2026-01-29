import { useState, useMemo } from "react";
import {
  FileText, Clock, Webhook, Play, Monitor, FileIcon, Globe, Terminal, Bell,
  Download, Brain, Sparkles, Tag, Search as SearchIcon, PenTool, Wand2,
  MessageSquare, GitBranch, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flowStore";
import type { NodeData, NodeCategory } from "@/types/flow";
import { nodeDefinitions, getNodesByCategory } from "@/nodes";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  file: FileText, time: Clock, http: Webhook, play: Play, manual: Play, system: Monitor,
  fileOps: FileIcon, api: Globe, shell: Terminal, notify: Bell, export: Download,
  ai: Brain, summarize: Sparkles, classify: Tag, extract: SearchIcon, rewrite: PenTool,
  generate: Wand2, custom: MessageSquare, condition: GitBranch, loop: GitBranch,
};

const categoryColors: Record<NodeCategory, string> = {
  trigger: "text-emerald-500", condition: "text-amber-500", action: "text-blue-500",
  ai: "text-purple-500", loop: "text-violet-500", utility: "text-slate-400",
  apps: "text-teal-500",
};

const categoryBg: Record<NodeCategory, string> = {
  trigger: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
  condition: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
  action: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  ai: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  loop: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
  utility: "bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/20",
  apps: "bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/20",
};

// Highlight search match
const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ?
      <mark key={i} className="bg-yellow-300/50 rounded">{part}</mark> : part
  );
};

function DraggableNode({ node, searchQuery }: { node: typeof nodeDefinitions[0], searchQuery: string }) {
  const IconComponent = iconMap[node.icon] || Brain;
  const { addNodeAtCenter } = useFlowStore();

  const onDragStart = (e: React.DragEvent) => {
    const data: NodeData = { 
      label: node.name,
      category: node.category,
      icon: node.icon,
      description: node.description,
      status: "idle", 
      nodeType: node.type, 
      config: node.defaultData 
    };
    e.dataTransfer.setData("application/forgeflow-node", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
  };

  const onClick = () => addNodeAtCenter({ 
    label: node.name,
    category: node.category,
    icon: node.icon,
    description: node.description,
    status: "idle", 
    nodeType: node.type, 
    config: node.defaultData 
  });

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={node.description}
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-lg border border-transparent cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-[1.02] hover:border-border/50 hover:bg-background/30 shadow-sm",
        categoryBg[node.category]
      )}
    >
      <div className={cn("w-6 h-6 flex items-center justify-center rounded-md", categoryColors[node.category])}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 overflow-hidden">
        <span className="block text-[12px] font-medium truncate">{highlightMatch(node.name, searchQuery)}</span>
        <span className="block text-[9px] text-muted-foreground truncate">{highlightMatch(node.description, searchQuery)}</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed } = useFlowStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Triggers']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const categories = useMemo(() => {
    const cats = [
      { name: 'Triggers', category: 'trigger' as NodeCategory },
      { name: 'Actions', category: 'action' as NodeCategory },
      { name: 'Conditions', category: 'condition' as NodeCategory },
      { name: 'AI', category: 'ai' as NodeCategory },
      { name: 'Loops', category: 'loop' as NodeCategory },
      { name: 'Utilities', category: 'utility' as NodeCategory },
      { name: 'Apps', category: 'apps' as NodeCategory },
    ];
    return cats.map(cat => ({ ...cat, nodes: getNodesByCategory(cat.category) }));
  }, []);

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
        <h2 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Node Library</h2>
      </div>

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
          <div className="space-y-1">
            {filteredNodes.length === 0 ? (
              <div className="px-2 py-4 text-center text-[11px] text-muted-foreground">No nodes found</div>
            ) : filteredNodes.map(node => <DraggableNode key={node.type} node={node} searchQuery={searchQuery} />)}
          </div>
        ) : (
          categories.map(category => (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-muted/50 transition-colors group"
                aria-expanded={expandedCategories.has(category.name)}
              >
                <span className={cn("transition-transform", expandedCategories.has(category.name) ? "rotate-90" : "rotate-0")}>
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                </span>
                <span className={cn("text-[11px] font-semibold flex-1 text-left", categoryColors[category.category])}>
                  {category.name}
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded-full bg-muted/20 text-muted-foreground font-medium">
                  {category.nodes.length}
                </span>
              </button>
              <div className={cn(
                "ml-1.5 mt-1 space-y-1 overflow-hidden transition-[max-height] duration-300",
                expandedCategories.has(category.name) ? "max-h-[1000px]" : "max-h-0"
              )}>
                {category.nodes.map(node => <DraggableNode key={node.type} node={node} searchQuery={searchQuery} />)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-2.5 py-1.5 border-t border-border/50 text-[9px] text-muted-foreground text-center">
        Drag or click to add
      </div>
    </aside>
  );
}
