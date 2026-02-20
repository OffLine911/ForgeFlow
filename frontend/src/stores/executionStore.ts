import { create } from "zustand";
import type { FlowExecution } from "@/types/flow";
import { ListExecutions, DeleteExecution, SaveExecution, LoadExecution } from "../../wailsjs/go/main/Storage";
import { toast } from "@/stores/dialogStore";

interface ExecutionState {
  executions: FlowExecution[];
  selectedExecution: FlowExecution | null;
  isLoading: boolean;
  
  loadExecutions: () => Promise<void>;
  addExecution: (execution: FlowExecution) => Promise<void>;
  deleteExecution: (execId: string) => Promise<void>;
  clearExecutions: () => Promise<void>;
  setSelectedExecution: (execution: FlowExecution | null) => void;
}

export const useExecutionStore = create<ExecutionState>()((set, get) => ({
  executions: [],
  selectedExecution: null,
  isLoading: false,

  loadExecutions: async () => {
    set({ isLoading: true });
    try {
      const executions = await ListExecutions(100);
      
      // Handle null or undefined response
      if (!executions || !Array.isArray(executions)) {
        set({ executions: [], isLoading: false });
        return;
      }
      
      // Backend now provides nodeCount, successCount, errorCount
      const processedExecutions = executions.map((exec: any) => ({
        ...exec,
        nodeCount: exec.nodeCount || 0,
        successCount: exec.successCount || 0,
        errorCount: exec.errorCount || 0,
      } as FlowExecution));
      
      set({ executions: processedExecutions, isLoading: false });
    } catch (error) {
      console.error("Failed to load executions:", error);
      set({ executions: [], isLoading: false });
    }
  },

  addExecution: async (execution: FlowExecution) => {
    try {
      await SaveExecution(JSON.stringify(execution));
      await get().loadExecutions();
    } catch (error) {
      console.error("Failed to save execution:", error);
      toast.error("Failed to save execution");
    }
  },

  deleteExecution: async (execId: string) => {
    if (!execId || execId.trim() === '') {
      console.warn('Invalid execution ID provided for deletion');
      return;
    }
    
    const { executions, selectedExecution } = get();
    const execution = executions.find(e => e.id === execId);
    
    if (!execution) {
      console.warn(`Execution ${execId} not found, may have already been deleted`);
      toast.warning('Execution not found', 'It may have already been deleted');
      return;
    }
    
    try {
      await DeleteExecution(execId);
      set({ 
        executions: executions.filter(e => e.id !== execId),
        selectedExecution: selectedExecution?.id === execId ? null : selectedExecution,
      });
      toast.success("Execution deleted");
    } catch (error) {
      console.error("Failed to delete execution:", error);
      toast.error("Failed to delete execution", error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  clearExecutions: async () => {
    const { executions } = get();
    
    if (executions.length === 0) {
      console.log('No executions to clear');
      return;
    }
    
    try {
      const deletePromises = executions.map(e => 
        DeleteExecution(e.id).catch(err => {
          console.error(`Failed to delete execution ${e.id}:`, err);
          return null;
        })
      );
      
      await Promise.all(deletePromises);
      set({ executions: [], selectedExecution: null });
      toast.success("All executions cleared");
    } catch (error) {
      console.error("Failed to clear executions:", error);
      toast.error("Failed to clear executions", error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  setSelectedExecution: async (execution) => {
    if (!execution) {
      set({ selectedExecution: null });
      return;
    }
    // Load full execution data (with results) from storage
    try {
      const fullJSON = await LoadExecution(execution.id);
      const full = JSON.parse(fullJSON) as FlowExecution;
      set({ selectedExecution: full });
    } catch {
      set({ selectedExecution: execution });
    }
  },
}));
