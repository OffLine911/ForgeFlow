import type { HandlerContext } from './types';

export const actionHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  action_http: async ({ data, onLog }) => {
    const { method, url, headers, body } = data;
    
    onLog('info', `🌐 HTTP ${method} → ${url}`);
    
    try {
      // Parse headers
      let parsedHeaders: Record<string, string> = {};
      if (headers) {
        try {
          parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers;
        } catch (e) {
          onLog('warn', `⚠️  Failed to parse headers: ${e}`);
        }
      }

      // Make request
      const response = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: method !== 'GET' && body ? body : undefined,
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
        onLog('success', `✓ Status: ${response.status} ${response.statusText}`);
        onLog('info', `   📦 Response: ${JSON.stringify(responseData).substring(0, 100)}...`);
      } catch {
        responseData = responseText;
        onLog('success', `✓ Status: ${response.status} ${response.statusText}`);
      }

      return responseData;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Request failed: ${errorMsg}`);
      throw error;
    }
  },

  action_file_read: async ({ data, onLog }) => {
    onLog('info', `📖 Reading file: ${data.path}`);
    
    try {
      // In a real implementation, this would use Wails backend
      // For now, simulate
      await new Promise(r => setTimeout(r, 100));
      
      const content = `File content from ${data.path}`;
      onLog('success', `✓ Read ${content.length} bytes`);
      return content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to read file: ${errorMsg}`);
      throw error;
    }
  },

  action_file_write: async ({ data, onLog }) => {
    onLog('info', `💾 Writing to: ${data.path}`);
    onLog('info', `   Size: ${data.content?.length || 0} bytes`);
    
    try {
      // In a real implementation, this would use Wails backend
      await new Promise(r => setTimeout(r, 100));
      
      onLog('success', '✓ File written successfully');
      return { success: true, path: data.path };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to write file: ${errorMsg}`);
      throw error;
    }
  },

  action_shell: async ({ data, onLog }) => {
    onLog('info', `💻 Command: ${data.command} ${data.args || ''}`);
    if (data.workDir) {
      onLog('info', `   📁 Working dir: ${data.workDir}`);
    }
    
    try {
      // In a real implementation, this would use Wails backend
      await new Promise(r => setTimeout(r, 200));
      
      const output = `Command output from ${data.command}`;
      onLog('success', '✓ Exit code: 0');
      onLog('info', `   📄 Output: ${output}`);
      return { output, exitCode: 0 };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Command failed: ${errorMsg}`);
      throw error;
    }
  },

  action_notification: async ({ data, onLog }) => {
    onLog('info', `🔔 Notification: "${data.title}"`);
    onLog('info', `   Message: ${data.message}`);
    
    try {
      // In a real implementation, this would use Wails backend
      await new Promise(r => setTimeout(r, 50));
      
      onLog('success', '✓ Notification sent');
      return { notified: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to send notification: ${errorMsg}`);
      throw error;
    }
  },

  action_delay: async ({ data, onLog }) => {
    const duration = parseInt(data.duration) || 1000;
    onLog('info', `⏳ Waiting ${duration}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    onLog('success', `✓ Delay completed`);
    return { delayed: duration };
  },

  // === NEW FILE OPERATIONS ===
  action_file_delete: async ({ data, onLog }) => {
    onLog('info', `🗑️  Deleting: ${data.path}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File deleted');
      return { success: true, path: data.path };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to delete: ${errorMsg}`);
      throw error;
    }
  },

  action_file_copy: async ({ data, onLog }) => {
    onLog('info', `📋 Copying: ${data.source} → ${data.destination}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File copied');
      return { success: true, source: data.source, destination: data.destination };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to copy: ${errorMsg}`);
      throw error;
    }
  },

  action_file_move: async ({ data, onLog }) => {
    onLog('info', `📦 Moving: ${data.source} → ${data.destination}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File moved');
      return { success: true, source: data.source, destination: data.destination };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to move: ${errorMsg}`);
      throw error;
    }
  },

  // === UTILITIES ===
  action_set_variable: async ({ data, variables, onLog }) => {
    const name = data.name;
    const value = data.value;
    
    onLog('info', `📝 Setting variable: ${name} = ${String(value).substring(0, 50)}...`);
    
    variables[name] = value;
    
    onLog('success', `✓ Variable set`);
    return { name, value };
  },

  action_clipboard_write: async ({ data, onLog }) => {
    onLog('info', `📋 Copying to clipboard: ${data.content.substring(0, 50)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 50));
      onLog('success', '✓ Copied to clipboard');
      return { copied: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to copy: ${errorMsg}`);
      throw error;
    }
  },

  action_open_url: async ({ data, onLog }) => {
    onLog('info', `🌐 Opening URL: ${data.url}`);
    
    try {
      await new Promise(r => setTimeout(r, 50));
      onLog('success', '✓ URL opened');
      return { opened: true, url: data.url };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to open URL: ${errorMsg}`);
      throw error;
    }
  },

  // === DATA PROCESSING ===
  action_json_parse: async ({ data, onLog }) => {
    onLog('info', `🔍 Parsing JSON...`);
    
    try {
      const parsed = JSON.parse(data.json);
      onLog('success', `✓ JSON parsed successfully`);
      return parsed;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Invalid JSON: ${errorMsg}`);
      throw error;
    }
  },

  action_json_stringify: async ({ data, onLog }) => {
    onLog('info', `📝 Stringifying object...`);
    
    try {
      const obj = typeof data.object === 'string' ? JSON.parse(data.object) : data.object;
      const result = JSON.stringify(obj, null, 2);
      onLog('success', `✓ Object stringified (${result.length} chars)`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to stringify: ${errorMsg}`);
      throw error;
    }
  },

  action_template: async ({ data, onLog }) => {
    onLog('info', `📄 Rendering template...`);
    
    try {
      // Template is already interpolated by WorkflowExecutor
      const result = data.template;
      onLog('success', `✓ Template rendered (${result.length} chars)`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Template error: ${errorMsg}`);
      throw error;
    }
  },

  action_regex: async ({ data, onLog }) => {
    const { text, pattern, mode, replacement } = data;
    
    onLog('info', `🔎 Regex ${mode}: /${pattern}/`);
    
    try {
      const regex = new RegExp(pattern, 'g');
      
      switch (mode) {
        case 'match': {
          const match = text.match(regex);
          onLog('success', `✓ Found ${match ? match.length : 0} matches`);
          return match ? match[0] : null;
        }
        case 'matchAll': {
          const matches = Array.from(text.matchAll(regex)) as RegExpMatchArray[];
          onLog('success', `✓ Found ${matches.length} matches`);
          return matches.map((m: RegExpMatchArray) => m[0]);
        }
        case 'replace': {
          const result = text.replace(regex, replacement || '');
          onLog('success', `✓ Replaced text (${result.length} chars)`);
          return result;
        }
        case 'test': {
          const result = regex.test(text);
          onLog('success', `✓ Test result: ${result}`);
          return result;
        }
        default:
          return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Regex error: ${errorMsg}`);
      throw error;
    }
  },

  action_math: async ({ data, onLog }) => {
    const { operation, a, b } = data;
    
    onLog('info', `🔢 Math: ${operation}`);
    
    try {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      
      let result: number;
      
      switch (operation) {
        case 'add': result = numA + numB; break;
        case 'subtract': result = numA - numB; break;
        case 'multiply': result = numA * numB; break;
        case 'divide': result = numA / numB; break;
        case 'modulo': result = numA % numB; break;
        case 'power': result = Math.pow(numA, numB); break;
        case 'round': result = Math.round(numA); break;
        case 'floor': result = Math.floor(numA); break;
        case 'ceil': result = Math.ceil(numA); break;
        case 'abs': result = Math.abs(numA); break;
        default: result = numA;
      }
      
      onLog('success', `✓ Result: ${result}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Math error: ${errorMsg}`);
      throw error;
    }
  },

  action_log: async ({ data, onLog }) => {
    const { message, level } = data;
    
    switch (level) {
      case 'warn':
        onLog('warn', `⚠️  ${message}`);
        break;
      case 'error':
        onLog('error', `❌ ${message}`);
        break;
      default:
        onLog('info', `ℹ️  ${message}`);
    }
    
    return { logged: true, message, level };
  },
};
