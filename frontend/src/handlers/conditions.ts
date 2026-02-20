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
      
      // Sandboxed evaluation via Function constructor (no access to local scope)
      const varKeys = Object.keys(variables);
      const varValues = varKeys.map(k => variables[k]);
      const fn = new Function(...varKeys, `"use strict"; return (${evaluatedCondition});`);
      const result = fn(...varValues);
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

  condition_try_catch: async ({ data, onLog }) => {
    onLog('info', '🛡️ Try/Catch block - executing try branch');
    // This node is special - it's handled by the WorkflowExecutor
    // The executor wraps downstream execution in try/catch
    // If error occurs, it routes to 'catch' output instead of 'try'
    return { branch: 'try', continueOnError: data.continueOnError !== false };
  },

  condition_filter: async ({ data, variables, onLog }) => {
    onLog('info', '🔎 Filtering array...');
    
    let arr: any[];
    const arrayInput = data.array || variables['output'];
    
    try {
      arr = typeof arrayInput === 'string' ? JSON.parse(arrayInput) : arrayInput;
    } catch {
      arr = [];
    }
    
    if (!Array.isArray(arr)) {
      onLog('warn', '⚠️ Input is not an array');
      return { matched: [], notMatched: [] };
    }

    const getFieldValue = (obj: any, field: string) => {
      if (!field) return obj;
      const parts = field.split('.');
      let value = obj;
      for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
          value = value[arrayMatch[1]];
          if (Array.isArray(value)) value = value[parseInt(arrayMatch[2])];
          else return undefined;
        } else {
          value = value[part];
        }
      }
      return value;
    };

    const compare = (itemValue: any, operator: string, compareValue: string): boolean => {
      const strValue = String(itemValue || '');
      const numValue = parseFloat(itemValue);
      const numCompare = parseFloat(compareValue);
      
      switch (operator) {
        case 'equals':
          return itemValue == compareValue || strValue === compareValue;
        case 'not_equals':
          return itemValue != compareValue && strValue !== compareValue;
        case 'contains':
          return strValue.toLowerCase().includes(compareValue.toLowerCase());
        case 'starts_with':
          return strValue.toLowerCase().startsWith(compareValue.toLowerCase());
        case 'ends_with':
          return strValue.toLowerCase().endsWith(compareValue.toLowerCase());
        case 'greater':
          return !isNaN(numValue) && numValue > numCompare;
        case 'less':
          return !isNaN(numValue) && numValue < numCompare;
        case 'greater_eq':
          return !isNaN(numValue) && numValue >= numCompare;
        case 'less_eq':
          return !isNaN(numValue) && numValue <= numCompare;
        case 'is_empty':
          return itemValue === null || itemValue === undefined || strValue === '' || 
                 (Array.isArray(itemValue) && itemValue.length === 0);
        case 'is_not_empty':
          return itemValue !== null && itemValue !== undefined && strValue !== '' && 
                 !(Array.isArray(itemValue) && itemValue.length === 0);
        case 'regex':
          try {
            return new RegExp(compareValue).test(strValue);
          } catch {
            return false;
          }
        default:
          return false;
      }
    };

    const matched: any[] = [];
    const notMatched: any[] = [];
    
    for (const item of arr) {
      const fieldValue = getFieldValue(item, data.field);
      if (compare(fieldValue, data.operator, data.value)) {
        matched.push(item);
      } else {
        notMatched.push(item);
      }
    }
    
    onLog('success', `✓ Matched: ${matched.length}, Not matched: ${notMatched.length}`);
    return { matched, notMatched };
  },

  condition_type_check: async ({ data, variables, onLog }) => {
    onLog('info', '🔢 Checking type...');
    
    let value = data.value;
    if (value === '' || value === '{{output}}') {
      value = variables['output'];
    }
    
    const expectedType = data.type || 'string';
    let actualType: string;
    
    if (value === null) actualType = 'null';
    else if (value === undefined) actualType = 'undefined';
    else if (Array.isArray(value)) actualType = 'array';
    else actualType = typeof value;
    
    const matches = actualType === expectedType;
    
    onLog('success', `✓ Type: ${actualType} ${matches ? '==' : '!='} ${expectedType}`);
    return matches;
  },

  condition_is_empty: async ({ data, variables, onLog }) => {
    onLog('info', '❓ Checking if empty...');
    
    let value = data.value;
    if (value === '' || value === '{{output}}') {
      value = variables['output'];
    }
    
    const isEmpty = 
      value === null || 
      value === undefined || 
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
    
    onLog('success', `✓ Value is ${isEmpty ? 'empty' : 'not empty'}`);
    return isEmpty;
  },
};
