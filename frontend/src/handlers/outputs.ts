import type { HandlerContext } from './types';

export const outputHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  output_file: async ({ data, onLog }) => {
    onLog('info', `💾 Saving to: ${data.path}`);
    onLog('info', `   Size: ${data.content?.length || 0} bytes`);
    
    try {
      // In a real implementation, this would use Wails backend
      await new Promise(r => setTimeout(r, 100));
      
      onLog('success', '✓ File saved successfully');
      return { success: true, path: data.path };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to save file: ${errorMsg}`);
      throw error;
    }
  },

  output_http: async ({ data, onLog }) => {
    onLog('info', `📤 HTTP Response: ${data.status}`);
    onLog('info', `   Body: ${data.body?.substring(0, 100)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 50));
      
      onLog('success', '✓ Response sent');
      return { 
        status: data.status, 
        body: data.body,
        sent: true 
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to send response: ${errorMsg}`);
      throw error;
    }
  },

  output_notification: async ({ data, onLog }) => {
    onLog('info', `🔔 Final Notification: "${data.title}"`);
    onLog('info', `   Message: ${data.message}`);
    
    try {
      await new Promise(r => setTimeout(r, 50));
      
      onLog('success', '✓ Notification sent');
      return { notified: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to send notification: ${errorMsg}`);
      throw error;
    }
  },
};
