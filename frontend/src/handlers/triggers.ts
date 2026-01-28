import type { HandlerContext } from './types';

export const triggerHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  trigger_manual: async ({ onLog }) => {
    onLog('info', '▶️  Manual trigger activated');
    return { triggered: true, timestamp: Date.now() };
  },

  trigger_file_watch: async ({ data, onLog }) => {
    onLog('info', `👁️  Watching: ${data.path}`);
    onLog('info', `   Events: ${data.events}`);
    onLog('success', '✓ File change detected');
    return { 
      triggered: true, 
      path: data.path, 
      event: data.events,
      timestamp: Date.now() 
    };
  },

  trigger_schedule: async ({ data, onLog }) => {
    onLog('info', `⏰ Schedule: ${data.cron}`);
    onLog('success', '✓ Trigger condition met');
    return { 
      triggered: true, 
      cron: data.cron,
      timestamp: Date.now() 
    };
  },

  trigger_webhook: async ({ data, onLog }) => {
    onLog('info', `🌐 Webhook: ${data.method} ${data.path}`);
    onLog('info', '   📨 Request received');
    return { 
      triggered: true, 
      method: data.method,
      path: data.path,
      timestamp: Date.now() 
    };
  },
};
