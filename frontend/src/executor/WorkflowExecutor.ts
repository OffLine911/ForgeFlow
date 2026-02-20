// Workflow execution engine with variable interpolation
import type { FlowNode, FlowEdge } from '@/types/flow';
import { getHandler } from '@/handlers';
import type { LogCallback, HandlerContext } from '@/handlers/types';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useCustomNodeStore } from '@/stores/customNodeStore';
import { executeCustomNode } from '@/handlers/custom';

export interface NodeResult {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startedAt?: number;
  endedAt?: number;
  output?: any;
  error?: string;
}

export class WorkflowExecutor {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private variables: Record<string, any> = {};
  private nodeResults: Map<string, NodeResult> = new Map();
  private onProgress: (results: NodeResult[]) => void;
  private onLog: LogCallback;
  private isAborted: boolean = false;
  private executingStack: Set<string> = new Set();

  constructor(
    nodes: FlowNode[],
    edges: FlowEdge[],
    onProgress: (results: NodeResult[]) => void,
    onLog: LogCallback = () => {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.onProgress = onProgress;
    this.onLog = onLog;

    // Load global environment variables from settings
    const settings = useSettingsStore.getState().settings;
    if (settings.environmentVariables) {
      settings.environmentVariables.forEach(v => {
        if (v.key) {
          this.variables[v.key] = v.value;
          // Also provide under env namespace
          if (!this.variables.env) this.variables.env = {};
          this.variables.env[v.key] = v.value;
        }
      });
    }
  }

  abort(): void {
    this.isAborted = true;
    this.onLog('warn', '🛑 Execution aborted by user');
  }

  async execute(): Promise<void> {
    try {
      // Find trigger nodes (nodes with no incoming edges)
      const targetIds = new Set(this.edges.map(e => e.target));
      const triggerNodes = this.nodes.filter(n => !targetIds.has(n.id));

      if (triggerNodes.length === 0) {
        throw new Error('No trigger node found');
      }

      this.onLog('info', `🎯 Found ${triggerNodes.length} trigger node(s)`);

      // Execute all triggers
      for (const trigger of triggerNodes) {
        await this.executeNode(trigger.id);
      }

      this.onLog('success', '🎉 Workflow execution completed');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.onLog('error', `💥 Workflow execution failed: ${errorMsg}`);
      throw error;
    }
  }

  private async executeNode(nodeId: string): Promise<any> {
    if (this.isAborted) return null;

    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Cycle detection: skip if this node is already on the call stack
    if (this.executingStack.has(nodeId)) {
      this.onLog('warn', `⚠️ Cycle detected at: ${node.data.label}, skipping`, nodeId);
      return null;
    }

    // Check if disabled (using config.disabled instead of status)
    if (node.data.config?.disabled === true) {
      this.updateNodeResult(nodeId, {
        status: 'skipped',
        startedAt: Date.now(),
        endedAt: Date.now(),
      });
      this.onLog('warn', `⏭️  Skipped (disabled): ${node.data.label}`, nodeId);
      
      // Continue to next nodes
      const outgoing = this.edges.filter(e => e.source === nodeId);
      for (const edge of outgoing) {
        await this.executeNode(edge.target);
      }
      return null;
    }

    // Execute node
    this.onLog('info', `▶️  Executing: ${node.data.label}`, nodeId);
    this.updateNodeResult(nodeId, { status: 'running', startedAt: Date.now() });
    this.executingStack.add(nodeId);

    try {
      const output = await this.runNode(node);

      // Store output in multiple variable names for convenience
      this.variables[`node_${nodeId}`] = output;
      this.variables['lastOutput'] = output;
      this.variables['result'] = output;
      this.variables['response'] = output;
      this.variables['output'] = output;

      this.updateNodeResult(nodeId, {
        status: 'success',
        endedAt: Date.now(),
        output,
      });

      this.onLog('success', `✅ Completed: ${node.data.label}`, nodeId);

      // Execute connected nodes
      const outgoing = this.edges.filter(e => e.source === nodeId);
      const nodeType = node.data.nodeType;

      // === 1. Handle Loops ===
      if (nodeType === 'loop_foreach') {
        const { items, itemVar, indexVar } = output;
        const loopEdges = outgoing.filter(e => e.sourceHandle === 'loop');
        const doneEdges = outgoing.filter(e => e.sourceHandle === 'done');

        if (Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            if (this.isAborted) break;
            this.variables[itemVar || 'item'] = items[i];
            this.variables[indexVar || 'index'] = i;
            this.onLog('info', `🔄 [Loop] Iteration ${i + 1}/${items.length}`, nodeId);
            
            for (const edge of loopEdges) {
              await this.executeNode(edge.target);
            }
          }
        }
        
        for (const edge of doneEdges) {
          await this.executeNode(edge.target);
        }
        return output;
      }

      if (nodeType === 'loop_repeat') {
        const { count, indexVar } = output;
        const loopEdges = outgoing.filter(e => e.sourceHandle === 'loop');
        const doneEdges = outgoing.filter(e => e.sourceHandle === 'done');
        const iterations = parseInt(count) || 0;

        for (let i = 0; i < iterations; i++) {
          if (this.isAborted) break;
          this.variables[indexVar || 'i'] = i;
          this.onLog('info', `🔢 [Repeat] Iteration ${i + 1}/${iterations}`, nodeId);
          
          for (const edge of loopEdges) {
            await this.executeNode(edge.target);
          }
        }
        
        for (const edge of doneEdges) {
          await this.executeNode(edge.target);
        }
        return output;
      }

      if (nodeType === 'loop_while') {
        const { maxIterations } = output;
        const loopEdges = outgoing.filter(e => e.sourceHandle === 'loop');
        const doneEdges = outgoing.filter(e => e.sourceHandle === 'done');
        const max = parseInt(maxIterations) || 100;

        let iter = 0;
        while (iter < max) {
          if (this.isAborted) break;
          // Re-evaluate condition
          const rawCondition = (node.data.config as any)?.condition || '';
          const currentCondition = this.interpolateString(rawCondition);
          
          let result = false;
          try {
            const varKeys = Object.keys(this.variables);
            const varValues = varKeys.map(k => this.variables[k]);
            const fn = new Function(...varKeys, `"use strict"; return (${currentCondition});`);
            result = !!fn(...varValues);
          } catch (e) {
            this.onLog('error', `❌ Loop condition error: ${e}`, nodeId);
            break;
          }

          if (!result) {
            this.onLog('info', `⏹️ Loop condition met (false)`, nodeId);
            break;
          }

          this.onLog('info', `🔁 [While] Iteration ${iter + 1}`, nodeId);
          for (const edge of loopEdges) {
            await this.executeNode(edge.target);
          }
          iter++;
        }
        
        for (const edge of doneEdges) {
          await this.executeNode(edge.target);
        }
        return output;
      }

      if (nodeType === 'loop_parallel_foreach') {
        const { items, itemVar, concurrency } = output;
        const loopEdges = outgoing.filter(e => e.sourceHandle === 'loop');
        const doneEdges = outgoing.filter(e => e.sourceHandle === 'done');
        const limit = parseInt(concurrency) || 5;

        if (Array.isArray(items)) {
          this.onLog('info', `⚡ [Parallel] Processing ${items.length} items (concurrency: ${limit})`, nodeId);
          
          // Split items into chunks
          for (let i = 0; i < items.length; i += limit) {
            if (this.isAborted) break;
            const chunk = items.slice(i, i + limit);
            
            await Promise.all(chunk.map(async (item, chunkIdx) => {
              const idx = i + chunkIdx;
              // Note: Variables might need isolation for parallel execution
              // For now, we'll try a simple shared variable approach (warning: race conditions likely)
              // In a robust implementation, each parallel branch should have local variables
              this.variables[itemVar || 'item'] = item;
              
              const nodeLog = `⚡ [Parallel] Item ${idx + 1}/${items.length}`;
              this.onLog('info', nodeLog, nodeId);

              for (const edge of loopEdges) {
                await this.executeNode(edge.target);
              }
            }));
          }
        }

        for (const edge of doneEdges) {
          await this.executeNode(edge.target);
        }
        return output;
      }

      // === 2. Handle Branching & Error Handling ===
      if (nodeType === 'condition_try_catch') {
        const tryEdges = outgoing.filter(e => e.sourceHandle === 'try');
        const catchEdges = outgoing.filter(e => e.sourceHandle === 'catch');
        
        try {
          for (const edge of tryEdges) {
            await this.executeNode(edge.target);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.variables['error'] = errorMsg;
          this.onLog('warn', `🛡️ Caught error: ${errorMsg}. Routing to catch branch.`, nodeId);
          
          for (const edge of catchEdges) {
            await this.executeNode(edge.target);
          }
          
          if (output?.continueOnError === false) {
            throw error;
          }
        }
        return output;
      }

      if (nodeType === 'condition_filter') {
        const { matched, notMatched } = output;
        
        // Process match branch
        if (matched && matched.length > 0) {
          const matchEdges = outgoing.filter(e => e.sourceHandle === 'match');
          // Temporarily set output to matched array for the downstream nodes
          const originalOutput = this.variables['output'];
          this.variables['output'] = matched;
          
          for (const edge of matchEdges) {
            await this.executeNode(edge.target);
          }
          // Restore (optional, depends on desired flow behavior)
          this.variables['output'] = originalOutput;
        }
        
        // Process no-match branch
        if (notMatched && notMatched.length > 0) {
          const noMatchEdges = outgoing.filter(e => e.sourceHandle === 'nomatch');
          const originalOutput = this.variables['output'];
          this.variables['output'] = notMatched;
          
          for (const edge of noMatchEdges) {
            await this.executeNode(edge.target);
          }
          this.variables['output'] = originalOutput;
        }
        return output;
      }

      if (nodeType === 'condition_manual_approval') {
        const { title, message } = output;
        this.onLog('info', `⏳ Waiting for manual approval: ${title}`, nodeId);
        this.updateNodeResult(nodeId, { status: 'pending' });

        try {
          // Open confirm dialog and wait for response
          const approved = await useDialogStore.getState().confirm({
            title: title || 'Approval Required',
            message: message || 'Please approve to continue execution.',
            confirmText: 'Approve',
            cancelText: 'Deny',
            variant: 'default',
          });

          this.updateNodeResult(nodeId, { status: 'running' });
          
          if (approved) {
            this.onLog('success', '✅ Approved by user', nodeId);
          } else {
            this.onLog('warn', '🛑 Denied by user', nodeId);
          }

          const branch = approved ? 'true' : 'false';
          const branchEdges = outgoing.filter(e => e.sourceHandle === branch);
          for (const edge of branchEdges) {
            await this.executeNode(edge.target);
          }
          return approved;
        } catch (error) {
          this.onLog('error', `❌ Approval failed: ${error}`, nodeId);
          return false;
        }
      }

      // === 2. Handle Conditional Branching ===
      if (
        nodeType === 'condition_if' || 
        nodeType === 'condition_type_check' || 
        nodeType === 'condition_is_empty' ||
        nodeType === 'condition_date_compare' ||
        nodeType === 'condition_array_contains'
      ) {
        const branch = output === true ? 'true' : 'false';
        const branchEdges = outgoing.filter(e => e.sourceHandle === branch);
        
        this.onLog('info', `🔀 Taking ${branch} branch`, nodeId);
        for (const edge of branchEdges) {
          await this.executeNode(edge.target);
        }
        return output;
      }

      if (nodeType === 'condition_switch') {
        const matchingEdges = outgoing.filter(e => e.sourceHandle === String(output));
        
        if (matchingEdges.length > 0) {
          this.onLog('info', `🔀 Taking branch: ${output}`, nodeId);
          for (const edge of matchingEdges) {
            await this.executeNode(edge.target);
          }
        } else {
          const defaultEdges = outgoing.filter(e => e.sourceHandle === 'default');
          if (defaultEdges.length > 0) {
            this.onLog('info', `🔀 Taking default branch`, nodeId);
            for (const edge of defaultEdges) {
              await this.executeNode(edge.target);
            }
          }
        }
        return output;
      }

      // === 3. Normal Sequential Execution ===
      for (const edge of outgoing) {
        await this.executeNode(edge.target);
      }

      return output;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.updateNodeResult(nodeId, {
        status: 'error',
        endedAt: Date.now(),
        error: errorMsg,
      });
      this.onLog('error', `❌ Failed: ${node.data.label} - ${errorMsg}`, nodeId);
      throw error;
    } finally {
      this.executingStack.delete(nodeId);
    }
  }

  private async runNode(node: FlowNode): Promise<any> {
    // Interpolate variables in node data
    const data = this.interpolateData(node.data.config || {});

    // Get handler
    const nodeType = node.data.nodeType as string;
    
    // Build context
    const ctx: HandlerContext = {
      data,
      variables: this.variables,
      onLog: this.onLog,
      nodeId: node.id,
      settings: useSettingsStore.getState().settings,
      api: {
        http: {
          get: async (url: string, headers: Record<string, string> = {}) => {
            const { HTTPRequest } = await import('../../wailsjs/go/main/ActionService');
            return HTTPRequest('GET', url, headers, '');
          },
          post: async (url: string, body: any, headers: Record<string, string> = {}) => {
            const { HTTPRequest } = await import('../../wailsjs/go/main/ActionService');
            return HTTPRequest('POST', url, headers, typeof body === 'string' ? body : JSON.stringify(body));
          },
        }
      }
    };

    // Check for custom node first
    const customNodes = useCustomNodeStore.getState().customNodes;
    const customNode = customNodes.find(n => n.type === nodeType);
    
    if (customNode) {
      return executeCustomNode(customNode, ctx);
    }

    // Get built-in handler
    const handler = getHandler(nodeType);
    
    if (!handler) {
      this.onLog('warn', `⚠️  Unknown node type: ${nodeType}`, node.id);
      return null;
    }

    // Execute handler
    return handler(ctx);
  }

  // Variable interpolation with nested object support
  private interpolateData(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check if entire value is a single variable
        const singleVarMatch = value.match(/^\{\{([^}]+)\}\}$/);
        if (singleVarMatch) {
          const varValue = this.getNestedValue(singleVarMatch[1].trim());
          result[key] = varValue !== undefined ? varValue : value;
        } else {
          // Interpolate multiple variables in string
          result[key] = this.interpolateString(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateData(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private interpolateString(str: string): string {
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(path.trim());
      if (value === undefined) return match;
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      return String(value);
    });
  }

  // Support nested paths: output.user.name, items[0].id
  private getNestedValue(path: string): any {
    const parts = path.split('.');
    let value: any = this.variables;

    for (const part of parts) {
      if (value === null || value === undefined) return undefined;

      // Handle array access: items[0]
      const arrayMatch = part.match(/^(\w+)((?:\[\d+\])+)$/);
      if (arrayMatch) {
        const propName = arrayMatch[1];
        const indices = arrayMatch[2].match(/\[(\d+)\]/g) || [];

        value = value[propName];

        for (const indexMatch of indices) {
          const index = parseInt(indexMatch.slice(1, -1));
          if (Array.isArray(value) && index < value.length) {
            value = value[index];
          } else {
            return undefined;
          }
        }
      } else {
        value = value[part];
      }
    }

    return value;
  }

  private updateNodeResult(nodeId: string, updates: Partial<NodeResult>) {
    const existing = this.nodeResults.get(nodeId) || {
      nodeId,
      status: 'pending' as const,
    };
    this.nodeResults.set(nodeId, { ...existing, ...updates } as NodeResult);
    this.onProgress(Array.from(this.nodeResults.values()));
  }
}
