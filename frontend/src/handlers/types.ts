// Handler context and types
export type LogLevel = 'info' | 'success' | 'error' | 'warn';
export type LogCallback = (level: LogLevel, message: string, nodeId?: string, data?: any) => void;

export interface HandlerContext {
  data: Record<string, any>;           // Node config (already interpolated)
  variables: Record<string, any>;      // Workflow variables
  onLog: LogCallback;                  // Logging function
  nodeId: string;                      // Current node ID
}

export type NodeHandler = (ctx: HandlerContext) => Promise<any>;
