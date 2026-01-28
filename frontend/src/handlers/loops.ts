import type { HandlerContext } from './types';

export const loopHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  loop_foreach: async ({ data, onLog }) => {
    let items: any[];
    
    try {
      items = typeof data.array === 'string' ? JSON.parse(data.array) : data.array;
    } catch {
      items = [];
    }
    
    if (!Array.isArray(items)) items = [];
    
    const itemVar = data.itemVar || 'item';
    const indexVar = data.indexVar || 'index';
    
    onLog('info', `🔄 For Each: ${items.length} items`);
    onLog('info', `   Variables: ${itemVar}, ${indexVar}`);
    
    // Note: Actual loop execution will be handled by WorkflowExecutor
    // This handler just validates and prepares the data
    
    onLog('success', `✓ Loop prepared`);
    return { items, itemVar, indexVar, count: items.length };
  },

  loop_repeat: async ({ data, onLog }) => {
    const count = parseInt(data.count) || 1;
    const indexVar = data.indexVar || 'i';
    
    onLog('info', `🔢 Repeat: ${count} times`);
    onLog('info', `   Variable: ${indexVar}`);
    
    onLog('success', `✓ Loop prepared`);
    return { count, indexVar };
  },

  loop_while: async ({ data, onLog }) => {
    const maxIterations = parseInt(data.maxIterations) || 100;
    
    onLog('info', `🔁 While: ${data.condition}`);
    onLog('info', `   Max iterations: ${maxIterations}`);
    
    onLog('success', `✓ Loop prepared`);
    return { condition: data.condition, maxIterations };
  },
};
