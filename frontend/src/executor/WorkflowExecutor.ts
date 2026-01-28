// Workflow execution engine with variable interpolation
import type { FlowNode, FlowEdge } from '@/types/flow';
import { getHandler } from '@/handlers';
import type { LogCallback, HandlerContext } from '@/handlers/types';

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
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return null;

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

      for (const edge of outgoing) {
        // Handle conditional branching
        if (node.data.nodeType === 'condition_if') {
          // For if/else, check which output port was used
          const shouldExecute =
            (edge.sourceHandle === 'true' && output === true) ||
            (edge.sourceHandle === 'false' && output === false);
          
          if (shouldExecute) {
            this.onLog('info', `🔀 Taking ${edge.sourceHandle} branch`, nodeId);
            await this.executeNode(edge.target);
          }
        } else if (node.data.nodeType === 'condition_switch') {
          // For switch, check if output matches the case
          if (edge.sourceHandle === output || edge.sourceHandle === 'default') {
            this.onLog('info', `🔀 Taking ${edge.sourceHandle} branch`, nodeId);
            await this.executeNode(edge.target);
          }
        } else {
          // Normal execution
          await this.executeNode(edge.target);
        }
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
    }
  }

  private async runNode(node: FlowNode): Promise<any> {
    // Interpolate variables in node data
    const data = this.interpolateData(node.data.config || {});

    // Get handler
    const nodeType = node.data.nodeType as string;
    const handler = getHandler(nodeType);
    
    if (!handler) {
      this.onLog('warn', `⚠️  Unknown node type: ${nodeType}`, node.id);
      return null;
    }

    // Build context
    const ctx: HandlerContext = {
      data,
      variables: this.variables,
      onLog: this.onLog,
      nodeId: node.id,
    };

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
