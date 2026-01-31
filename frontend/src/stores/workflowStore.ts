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
  clearCommunityTemplates: () => void;
}

const COMMUNITY_BASE_URL = 'https://raw.githubusercontent.com/OffLine911/ForgeFlow-community/refs/heads/master';
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
  
  clearCommunityTemplates: () => set({ 
    communityTemplates: [], 
    communityError: null,
    communityLoading: false 
  }),
  
  fetchCommunityTemplates: async () => {
    const state = get();
    if (state.communityLoading) return;
    
    // Don't refetch if we already have templates
    if (state.communityTemplates.length > 0) return;
    
    set({ communityLoading: true, communityError: null });
    
    // Add timeout wrapper
    const fetchWithTimeout = async (url: string, timeout = 10000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await HTTPRequest('GET', url, {}, '');
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    try {
      // Fetch the index file with timeout
      const indexResponse = await fetchWithTimeout(COMMUNITY_INDEX_URL, 8000);
      
      if (indexResponse.error) {
        throw new Error(indexResponse.error);
      }
      
      // Parse response safely
      let index: TemplateIndex;
      try {
        if (indexResponse.json) {
          index = indexResponse.json as TemplateIndex;
        } else if (indexResponse.body) {
          // Check if response looks like HTML (404 page)
          const body = indexResponse.body.trim();
          if (body.startsWith('<') || body.startsWith('<!')) {
            throw new Error('Repository not found or files not available yet');
          }
          index = JSON.parse(body);
        } else {
          throw new Error('Empty response from server');
        }
      } catch (parseError) {
        console.error('Failed to parse index:', parseError);
        throw new Error('Invalid JSON format in index.json. Please check the repository setup.');
      }
      
      if (!index.templates || !Array.isArray(index.templates)) {
        throw new Error('Invalid index format - missing templates array');
      }
      
      if (index.templates.length === 0) {
        set({ communityTemplates: [], communityLoading: false });
        return;
      }
      
      // Limit concurrent requests to avoid freezing
      const batchSize = 5;
      const templates: CommunityTemplate[] = [];
      
      for (let i = 0; i < index.templates.length; i += batchSize) {
        const batch = index.templates.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (item) => {
          try {
            const templateUrl = `${COMMUNITY_BASE_URL}/templates/${item.file}`;
            const response = await fetchWithTimeout(templateUrl, 5000);
            
            if (response.error) {
              console.warn(`Failed to load template ${item.id}:`, response.error);
              return null;
            }
            
            // Parse template safely
            let template;
            try {
              if (response.json) {
                template = response.json;
              } else if (response.body) {
                const body = response.body.trim();
                if (body.startsWith('<') || body.startsWith('<!')) {
                  console.warn(`Template ${item.id} not found (got HTML response)`);
                  return null;
                }
                template = JSON.parse(body);
              } else {
                console.warn(`Empty response for template ${item.id}`);
                return null;
              }
            } catch (parseError) {
              console.warn(`Failed to parse template ${item.id}:`, parseError);
              return null;
            }
            
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
        
        const batchResults = await Promise.all(batchPromises);
        templates.push(...batchResults.filter((t): t is CommunityTemplate => t !== null));
        
        // Update UI progressively
        set({ communityTemplates: [...templates] });
      }
      
      set({ communityLoading: false });
    } catch (error) {
      console.error('Failed to fetch community templates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load';
      set({ 
        communityError: errorMessage.includes('abort') ? 'Request timed out' : errorMessage,
        communityLoading: false 
      });
    }
  },
}));
