import { create } from "zustand";
import type { FlowExecution } from "@/types/flow";
import { ListExecutions, DeleteExecution, SaveExecution } from "../../wailsjs/go/main/Storage";
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
    try {
      await DeleteExecution(execId);
      set({ executions: get().executions.filter(e => e.id !== execId) });
      toast.success("Execution deleted");
    } catch (error) {
      console.error("Failed to delete execution:", error);
      toast.error("Failed to delete execution");
    }
  },

  clearExecutions: async () => {
    const { executions } = get();
    try {
      await Promise.all(executions.map(e => DeleteExecution(e.id)));
      set({ executions: [] });
      toast.success("All executions cleared");
    } catch (error) {
      console.error("Failed to clear executions:", error);
      toast.error("Failed to clear executions");
    }
  },

  setSelectedExecution: (execution) => set({ selectedExecution: execution }),
}));
