import type { NodeDefinition } from './types';

export const triggerNodes: NodeDefinition[] = [
  {
    type: 'trigger_manual',
    category: 'trigger',
    name: 'Manual Trigger',
    icon: 'play',
    color: '#22c55e',
    description: 'Start workflow manually with Run button',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Start' }],
    defaultData: {},
    fields: [],
  },
  {
    type: 'trigger_file_watch',
    category: 'trigger',
    name: 'File Watcher',
    icon: 'file',
    color: '#22c55e',
    description: 'Trigger when file changes',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Changed' }],
    defaultData: { path: '', events: 'all' },
    fields: [
      { 
        key: 'path', 
        label: 'File/Folder Path', 
        type: 'file', 
        placeholder: '/path/to/watch', 
        required: true 
      },
      { 
        key: 'events', 
        label: 'Watch Events', 
        type: 'select', 
        options: [
          { value: 'all', label: 'All Changes' },
          { value: 'create', label: 'Created' },
          { value: 'modify', label: 'Modified' },
          { value: 'delete', label: 'Deleted' },
        ]
      },
    ],
  },
  {
    type: 'trigger_schedule',
    category: 'trigger',
    name: 'Schedule',
    icon: 'time',
    color: '#22c55e',
    description: 'Run on a schedule (cron)',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Trigger' }],
    defaultData: { cron: '0 * * * *', enabled: true },
    fields: [
      { 
        key: 'cron', 
        label: 'Cron Expression', 
        type: 'cron', 
        placeholder: '0 * * * * (every hour)', 
        required: true 
      },
      { 
        key: 'enabled', 
        label: 'Enabled', 
        type: 'boolean', 
        defaultValue: true 
      },
    ],
  },
  {
    type: 'trigger_webhook',
    category: 'trigger',
    name: 'Webhook',
    icon: 'http',
    color: '#22c55e',
    description: 'Trigger via HTTP webhook',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Request' }],
    defaultData: { method: 'POST', path: '/webhook' },
    fields: [
      { 
        key: 'method', 
        label: 'Method', 
        type: 'select', 
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
        ]
      },
      { 
        key: 'path', 
        label: 'Path', 
        type: 'text', 
        placeholder: '/my-webhook' 
      },
    ],
  },
];
