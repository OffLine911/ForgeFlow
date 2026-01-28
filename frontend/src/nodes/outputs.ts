import type { NodeDefinition } from './types';

export const outputNodes: NodeDefinition[] = [
  {
    type: 'output_file',
    category: 'output',
    name: 'Save to File',
    icon: 'fileOps',
    color: '#06b6d4',
    description: 'Save result to file',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [],
    defaultData: { path: '', content: '' },
    fields: [
      { 
        key: 'path', 
        label: 'File Path', 
        type: 'file', 
        placeholder: '/path/to/output.txt', 
        required: true 
      },
      { 
        key: 'content', 
        label: 'Content', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'output_http',
    category: 'output',
    name: 'HTTP Response',
    icon: 'api',
    color: '#06b6d4',
    description: 'Send HTTP response',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [],
    defaultData: { status: 200, body: '', headers: '{}' },
    fields: [
      { 
        key: 'status', 
        label: 'Status Code', 
        type: 'number', 
        defaultValue: 200 
      },
      { 
        key: 'body', 
        label: 'Response Body', 
        type: 'textarea', 
        placeholder: '{{output}}' 
      },
      { 
        key: 'headers', 
        label: 'Headers (JSON)', 
        type: 'json', 
        placeholder: '{"Content-Type": "application/json"}' 
      },
    ],
  },
  {
    type: 'output_notification',
    category: 'output',
    name: 'Send Notification',
    icon: 'notify',
    color: '#06b6d4',
    description: 'Send final notification',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [],
    defaultData: { title: '', message: '' },
    fields: [
      { 
        key: 'title', 
        label: 'Title', 
        type: 'text', 
        placeholder: 'Workflow Complete', 
        required: true 
      },
      { 
        key: 'message', 
        label: 'Message', 
        type: 'textarea', 
        placeholder: '{{output}}' 
      },
    ],
  },
];
