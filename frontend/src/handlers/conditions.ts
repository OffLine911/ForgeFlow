import type { HandlerContext } from './types';

export const conditionHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  condition_if: async ({ data, variables, onLog }) => {
    onLog('info', '🔍 Evaluating condition...');
    onLog('info', `   Expression: ${data.condition}`);
    
    try {
      // Simple condition evaluation
      // In production, use a safe expression evaluator
      const condition = data.condition || '';
      
      // Replace {{variables}} with actual values
      let evaluatedCondition = condition;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        evaluatedCondition = evaluatedCondition.replace(regex, JSON.stringify(value));
      }
      
      // Simple evaluation (UNSAFE - use proper evaluator in production)
      const result = eval(evaluatedCondition);
      const boolResult = Boolean(result);
      
      onLog('success', `${boolResult ? '✓' : '✗'} Condition: ${boolResult ? 'TRUE' : 'FALSE'}`);
      
      return boolResult;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Condition evaluation failed: ${errorMsg}`);
      return false;
    }
  },

  condition_switch: async ({ data, onLog }) => {
    onLog('info', '🔀 Evaluating switch...');
    
    const value = data.value || '';
    onLog('info', `   Value: ${value}`);
    
    // Determine which case matches
    // Return the case name (case1, case2, case3, or default)
    const result = value || 'default';
    
    onLog('success', `✓ Taking branch: ${result}`);
    return result;
  },
};
