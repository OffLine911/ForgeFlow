// TriggerService - handles workflow trigger registration
import type { FlowNode } from '../types/flow';

// Lazy-load TriggerManager to avoid build issues
let TriggerManagerModule: any = null;

async function getTriggerManager() {
  if (!TriggerManagerModule) {
    try {
      // Check if we're in a Wails environment
      if (typeof window !== 'undefined' && !(window as any).go) {
        // Not in Wails environment, skip
        return null;
      }
      
      // Use dynamic import to avoid TypeScript compile-time checks
      TriggerManagerModule = await import('../../wailsjs/go/main/TriggerManager');
    } catch (error) {
      // Silently fail - TriggerManager is optional in dev mode
      return null;
    }
  }
  return TriggerManagerModule;
}

export class TriggerService {
  // Register all triggers in a workflow
  static async registerWorkflowTriggers(flowId: string, nodes: FlowNode[]): Promise<void> {
    const TM = await getTriggerManager();
    if (!TM) return;

    // Find all trigger nodes
    const triggerNodes = nodes.filter(node => node.data.category === 'trigger');

    for (const node of triggerNodes) {
      const config = node.data.config || {};
      const enabled = config.enabled !== false;

      if (!enabled) {
        continue;
      }

      try {
        switch (node.data.nodeType) {
          case 'trigger_schedule':
            if (config.cron) {
              await TM.RegisterScheduleTrigger(flowId, config.cron as string);
              console.log(`✓ Registered schedule trigger: ${config.cron}`);
            }
            break;

          case 'trigger_webhook':
            if (config.path) {
              await TM.RegisterWebhookTrigger(
                flowId,
                config.path as string,
                (config.method as string) || 'POST'
              );
              console.log(`✓ Registered webhook: ${config.method} ${config.path}`);
            }
            break;

          case 'trigger_file_watch':
            if (config.path) {
              await TM.RegisterFileWatcher(
                flowId,
                config.path as string,
                (config.events as string) || 'all'
              );
              console.log(`✓ Registered file watcher: ${config.path}`);
            }
            break;

          case 'trigger_hotkey':
            if (config.hotkey) {
              await TM.RegisterHotkey(flowId, config.hotkey as string);
              console.log(`✓ Registered hotkey: ${config.hotkey}`);
            }
            break;

          case 'trigger_clipboard':
            await TM.RegisterClipboardMonitor(
              flowId,
              (config.textOnly as boolean) !== false
            );
            console.log(`✓ Registered clipboard monitor`);
            break;

          // trigger_manual and trigger_startup don't need registration
        }
      } catch (error) {
        console.error(`Failed to register trigger for node ${node.id}:`, error);
      }
    }
  }

  // Unregister all triggers for a workflow
  static async unregisterWorkflowTriggers(flowId: string, nodes: FlowNode[]): Promise<void> {
    const TM = await getTriggerManager();
    if (!TM) return;

    const triggerNodes = nodes.filter(node => node.data.category === 'trigger');

    for (const node of triggerNodes) {
      try {
        switch (node.data.nodeType) {
          case 'trigger_schedule':
            await TM.UnregisterScheduleTrigger(flowId);
            break;

          case 'trigger_webhook':
            const config = node.data.config || {};
            await TM.UnregisterWebhookTrigger(
              flowId,
              (config.path as string) || '/webhook',
              (config.method as string) || 'POST'
            );
            break;

          case 'trigger_file_watch':
            await TM.UnregisterFileWatcher(flowId);
            break;

          case 'trigger_hotkey':
            const hotkeyConfig = node.data.config || {};
            if (hotkeyConfig.hotkey) {
              await TM.UnregisterHotkey(hotkeyConfig.hotkey as string);
            }
            break;

          case 'trigger_clipboard':
            await TM.UnregisterClipboardMonitor();
            break;
        }
      } catch (error) {
        // Ignore errors when unregistering (trigger might not exist)
        console.log(`Trigger already unregistered for node ${node.id}`);
      }
    }
  }

  // Get all active triggers
  static async getActiveTriggers(): Promise<any> {
    const TM = await getTriggerManager();
    if (!TM) {
      return {
        schedules: [],
        webhooks: [],
        fileWatchers: [],
        hotkeys: [],
        clipboard: false,
      };
    }

    try {
      return await TM.GetActiveTriggers();
    } catch (error) {
      console.error('Failed to get active triggers:', error);
      return {
        schedules: [],
        webhooks: [],
        fileWatchers: [],
        hotkeys: [],
        clipboard: false,
      };
    }
  }
}
