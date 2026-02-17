import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NodeDefinition } from '@/nodes/types';

export type CustomNodeActionType = 'shell' | 'http' | 'script';

export interface CustomNodeDefinition extends NodeDefinition {
  isCustom: true;
  actionType: CustomNodeActionType;
  actionConfig: {
    // For shell commands
    command?: string;
    args?: string;
    workDir?: string;
    // For HTTP requests
    method?: string;
    url?: string;
    headers?: string;
    body?: string;
    // For scripts (JavaScript)
    script?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CustomNodeState {
  customNodes: CustomNodeDefinition[];
  builderOpen: boolean;
  editingNode: CustomNodeDefinition | null;
  
  setBuilderOpen: (open: boolean) => void;
  setEditingNode: (node: CustomNodeDefinition | null) => void;
  addCustomNode: (node: Omit<CustomNodeDefinition, 'createdAt' | 'updatedAt' | 'isCustom'>) => void;
  updateCustomNode: (type: string, updates: Partial<CustomNodeDefinition>) => void;
  deleteCustomNode: (type: string) => void;
  duplicateCustomNode: (type: string) => void;
}

export const useCustomNodeStore = create<CustomNodeState>()(
  persist(
    (set, get) => ({
      customNodes: [],
      builderOpen: false,
      editingNode: null,

      setBuilderOpen: (open) => set({ builderOpen: open, editingNode: open ? get().editingNode : null }),
      
      setEditingNode: (node) => set({ editingNode: node, builderOpen: !!node }),

      addCustomNode: (node) => {
        const now = new Date().toISOString();
        const customNode: CustomNodeDefinition = {
          ...node,
          isCustom: true,
          createdAt: now,
          updatedAt: now,
        };
        set({ customNodes: [...get().customNodes, customNode] });
      },

      updateCustomNode: (type, updates) => {
        const { customNodes } = get();
        const nodeExists = customNodes.some((n) => n.type === type);
        
        if (!nodeExists) {
          console.warn(`Custom node ${type} not found, cannot update`);
          return;
        }
        
        set({
          customNodes: customNodes.map((n) =>
            n.type === type
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        });
      },

      deleteCustomNode: (type) => {
        const { customNodes } = get();
        const nodeExists = customNodes.some((n) => n.type === type);
        
        if (!nodeExists) {
          console.warn(`Custom node ${type} not found, cannot delete`);
          return;
        }
        
        set({ customNodes: customNodes.filter((n) => n.type !== type) });
      },

      duplicateCustomNode: (type) => {
        const node = get().customNodes.find((n) => n.type === type);
        
        if (!node) {
          console.warn(`Custom node ${type} not found, cannot duplicate`);
          return;
        }
        
        const now = new Date().toISOString();
        const newNode: CustomNodeDefinition = {
          ...node,
          type: `${node.type}_copy_${Date.now()}`,
          name: `${node.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };
        set({ customNodes: [...get().customNodes, newNode] });
      },
    }),
    {
      name: 'forgeflow-custom-nodes',
    }
  )
);

// Helper to get all nodes including custom ones
export function getAllNodeDefinitions(
  baseNodes: NodeDefinition[],
  customNodes: CustomNodeDefinition[]
): NodeDefinition[] {
  return [...baseNodes, ...customNodes];
}
