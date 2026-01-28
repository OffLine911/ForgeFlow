import type { HandlerContext } from './types';

export const utilityHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  util_string: async ({ data, variables, onLog }) => {
    const text = String(data.text || variables['output'] || '');
    const mode = data.mode || 'lower';
    
    onLog('info', `📝 String: ${mode}`);
    
    let result: string | string[];
    
    switch (mode) {
      case 'lower': result = text.toLowerCase(); break;
      case 'upper': result = text.toUpperCase(); break;
      case 'title': result = text.replace(/\b\w/g, c => c.toUpperCase()); break;
      case 'camel': 
        result = text.toLowerCase()
          .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
          .replace(/^./, c => c.toLowerCase());
        break;
      case 'snake': 
        result = text.replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/[-\s]+/g, '_')
          .replace(/^_/, '')
          .replace(/_+/g, '_');
        break;
      case 'kebab': 
        result = text.replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/[_\s]+/g, '-')
          .replace(/^-/, '')
          .replace(/-+/g, '-');
        break;
      case 'trim': result = text.trim(); break;
      case 'padStart': 
        result = text.padStart(parseInt(data.length) || 10, (data.char || ' ').charAt(0));
        break;
      case 'padEnd': 
        result = text.padEnd(parseInt(data.length) || 10, (data.char || ' ').charAt(0));
        break;
      case 'split': {
        const delimiter = (data.delimiter || ',').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        result = text.split(delimiter);
        break;
      }
      case 'replace': 
        result = text.replace(new RegExp(data.delimiter || '', 'g'), data.replacement || '');
        break;
      case 'substring': {
        const start = parseInt(data.start) || 0;
        const end = data.length ? start + parseInt(data.length) : undefined;
        result = text.substring(start, end);
        break;
      }
      default: result = text;
    }
    
    onLog('success', `✓ Result: ${Array.isArray(result) ? `[${result.length} items]` : result.substring(0, 50)}`);
    return result;
  },

  util_array: async ({ data, variables, onLog }) => {
    let arr: any[];
    const arrayInput = data.array || variables['output'];
    
    try {
      arr = typeof arrayInput === 'string' ? JSON.parse(arrayInput) : arrayInput;
    } catch {
      arr = [];
    }
    
    if (!Array.isArray(arr)) arr = [];
    
    const mode = data.mode || 'length';
    onLog('info', `📚 Array: ${mode} (${arr.length} items)`);
    
    const getFieldValue = (obj: any, field: string) => {
      if (!field) return obj;
      const parts = field.split('.');
      let value = obj;
      for (const part of parts) {
        if (value === null || value === undefined) return null;
        value = value[part];
      }
      return value;
    };
    
    let result: any;
    
    switch (mode) {
      case 'length': result = arr.length; break;
      case 'push': {
        let item = data.item;
        try { item = JSON.parse(data.item); } catch { /* keep as string */ }
        result = [...arr, item];
        break;
      }
      case 'slice': {
        const start = parseInt(data.start) || 0;
        const end = data.end !== '' && data.end !== undefined ? parseInt(data.end) : undefined;
        result = arr.slice(start, end);
        break;
      }
      case 'join': {
        const separator = (data.separator || ', ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        result = arr.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(separator);
        break;
      }
      case 'map': 
        result = arr.map(item => getFieldValue(item, data.field));
        break;
      case 'sort': {
        const sorted = [...arr].sort((a, b) => {
          let valA = getFieldValue(a, data.field);
          let valB = getFieldValue(b, data.field);
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        });
        result = data.order === 'desc' ? sorted.reverse() : sorted;
        break;
      }
      case 'reverse': result = [...arr].reverse(); break;
      case 'unique': {
        if (data.field) {
          const seen = new Set();
          result = arr.filter(item => {
            const val = getFieldValue(item, data.field);
            const key = typeof val === 'object' ? JSON.stringify(val) : val;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        } else {
          const seen = new Set();
          result = arr.filter(item => {
            const key = typeof item === 'object' ? JSON.stringify(item) : item;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
        break;
      }
      case 'flatten': result = arr.flat(Infinity); break;
      case 'first': result = arr[0] ?? null; break;
      case 'last': result = arr[arr.length - 1] ?? null; break;
      default: result = arr;
    }
    
    onLog('success', `✓ Result: ${typeof result === 'object' ? JSON.stringify(result).substring(0, 50) : result}`);
    return result;
  },

  util_field: async ({ data, variables, onLog }) => {
    const mode = data.mode || 'get';
    
    onLog('info', `📍 Field: ${mode} ${data.path}`);
    
    if (mode === 'get') {
      let obj = variables['output'];
      if (!obj || typeof obj !== 'object') {
        onLog('warn', '⚠️  No object in output');
        return null;
      }
      
      const parts = (data.path || '').split('.');
      let value: any = obj;
      
      for (const part of parts) {
        if (value === null || value === undefined) return null;
        const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
          value = value[arrayMatch[1]];
          if (Array.isArray(value)) value = value[parseInt(arrayMatch[2])];
          else return null;
        } else {
          value = value[part];
        }
      }
      
      onLog('success', `✓ Value: ${typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : value}`);
      return value;
    } else {
      let obj: any;
      try {
        obj = JSON.parse(JSON.stringify(variables['output'] || {}));
      } catch {
        obj = {};
      }
      
      if (typeof obj !== 'object' || obj === null) obj = {};
      
      const parts = (data.path || '').split('.');
      let current: any = obj;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') current[part] = {};
        current = current[part];
      }
      
      const lastPart = parts[parts.length - 1];
      let valueToSet = data.value;
      try { valueToSet = JSON.parse(data.value); } catch { /* keep as string */ }
      current[lastPart] = valueToSet;
      
      onLog('success', `✓ Field set`);
      return obj;
    }
  },

  util_merge: async ({ data, onLog }) => {
    onLog('info', `🔗 Merge: ${data.mode}`);
    
    // Note: Actual merging of multiple inputs would be handled by WorkflowExecutor
    // For now, return a placeholder
    
    onLog('success', `✓ Merge prepared`);
    return { mode: data.mode };
  },

  util_generate: async ({ data, onLog }) => {
    const mode = data.mode || 'uuid';
    
    onLog('info', `🎲 Generate: ${mode}`);
    
    let result: any;
    
    switch (mode) {
      case 'uuid':
        result = crypto.randomUUID();
        break;
      case 'number': {
        const min = parseInt(data.min) || 0;
        const max = parseInt(data.max) || 100;
        result = Math.floor(Math.random() * (max - min + 1)) + min;
        break;
      }
      case 'string': {
        const length = parseInt(data.length) || 8;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        break;
      }
      default:
        result = crypto.randomUUID();
    }
    
    onLog('success', `✓ Generated: ${result}`);
    return result;
  },
};
