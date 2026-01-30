import { create } from 'zustand';
import type { WorkflowTemplate } from '@/types/template';
import { HTTPRequest } from '../../wailsjs/go/main/ActionService';

interface CommunityTemplate extends WorkflowTemplate {
  author?: string;
  downloads?: number;
  source?: string;
}

interface WorkflowPanelState {
  workflowPanelOpen: boolean;
  templateModalOpen: boolean;
  shortcutsModalOpen: boolean;
  executionHistoryOpen: boolean;
  importExportOpen: boolean;
  
  // Community templates
  communityTemplates: CommunityTemplate[];
  communityLoading: boolean;
  communityError: string | null;
  
  setWorkflowPanelOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setExecutionHistoryOpen: (open: boolean) => void;
  setImportExportOpen: (open: boolean) => void;
  toggleWorkflowPanel: () => void;
  fetchCommunityTemplates: () => Promise<void>;
}

const COMMUNITY_BASE_URL = 'https://raw.githubusercontent.com/OffLine911/ForgeFlow-Community/main';
const COMMUNITY_INDEX_URL = `${COMMUNITY_BASE_URL}/index.json`;

interface TemplateIndex {
  templates: Array<{
    id: string;
    file: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    author: string;
    downloads?: number;
  }>;
}

export const useWorkflowStore = create<WorkflowPanelState>()((set, get) => ({
  workflowPanelOpen: false,
  templateModalOpen: false,
  shortcutsModalOpen: false,
  executionHistoryOpen: false,
  importExportOpen: false,
  communityTemplates: [],
  communityLoading: false,
  communityError: null,

  setWorkflowPanelOpen: (open) => set({ workflowPanelOpen: open }),
  setTemplateModalOpen: (open) => set({ templateModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setExecutionHistoryOpen: (open) => set({ executionHistoryOpen: open }),
  setImportExportOpen: (open) => set({ importExportOpen: open }),
  toggleWorkflowPanel: () => set({ workflowPanelOpen: !get().workflowPanelOpen }),
  
  fetchCommunityTemplates: async () => {
    if (get().communityLoading) return;
    
    set({ communityLoading: true, communityError: null });
    
    try {
      // Fetch the index file
      const indexResponse = await HTTPRequest('GET', COMMUNITY_INDEX_URL, {}, '');
      
      if (indexResponse.error) {
        throw new Error(indexResponse.error);
      }
      
      const index: TemplateIndex = indexResponse.json || JSON.parse(indexResponse.body);
      
      if (!index.templates || !Array.isArray(index.templates)) {
        throw new Error('Invalid index format');
      }
      
      // Fetch all template files in parallel
      const templatePromises = index.templates.map(async (item) => {
        try {
          const templateUrl = `${COMMUNITY_BASE_URL}/templates/${item.file}`;
          const response = await HTTPRequest('GET', templateUrl, {}, '');
          
          if (response.error) {
            console.warn(`Failed to load template ${item.id}:`, response.error);
            return null;
          }
          
          const template = response.json || JSON.parse(response.body);
          
          // Merge index metadata with template data
          return {
            ...template,
            author: item.author,
            downloads: item.downloads,
            source: templateUrl,
          } as CommunityTemplate;
        } catch (error) {
          console.warn(`Failed to load template ${item.id}:`, error);
          return null;
        }
      });
      
      const templates = (await Promise.all(templatePromises)).filter(
        (t): t is CommunityTemplate => t !== null
      );
      
      set({ communityTemplates: templates, communityLoading: false });
    } catch (error) {
      console.error('Failed to fetch community templates:', error);
      set({ 
        communityError: error instanceof Error ? error.message : 'Failed to load',
        communityLoading: false 
      });
    }
  },
}));
