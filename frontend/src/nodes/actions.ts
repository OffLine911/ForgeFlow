import type { NodeDefinition } from './types';

export const actionNodes: NodeDefinition[] = [
  // === HTTP & API ===
  {
    type: 'action_http',
    category: 'action',
    name: 'HTTP Request',
    icon: 'api',
    color: '#3b82f6',
    description: 'Make an HTTP request',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Response' }],
    defaultData: { method: 'GET', url: '', headers: '{}', body: '' },
    fields: [
      { 
        key: 'method', 
        label: 'Method', 
        type: 'select', 
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ]
      },
      { 
        key: 'url', 
        label: 'URL', 
        type: 'url', 
        placeholder: 'https://api.example.com/data', 
        required: true 
      },
      { 
        key: 'headers', 
        label: 'Headers (JSON)', 
        type: 'json', 
        placeholder: '{"Authorization": "Bearer ..."}' 
      },
      { 
        key: 'body', 
        label: 'Body', 
        type: 'textarea', 
        placeholder: 'Request body...' 
      },
    ],
  },

  // === FILE OPERATIONS ===
  {
    type: 'action_file_read',
    category: 'action',
    name: 'Read File',
    icon: 'fileOps',
    color: '#3b82f6',
    description: 'Read file contents',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Content' }],
    defaultData: { path: '' },
    fields: [
      { 
        key: 'path', 
        label: 'File Path', 
        type: 'file', 
        placeholder: '/path/to/file.txt', 
        required: true 
      },
    ],
  },
  {
    type: 'action_file_write',
    category: 'action',
    name: 'Write File',
    icon: 'fileOps',
    color: '#3b82f6',
    description: 'Write content to file',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { path: '', content: '' },
    fields: [
      { 
        key: 'path', 
        label: 'File Path', 
        type: 'file', 
        placeholder: '/path/to/file.txt', 
        required: true 
      },
      { 
        key: 'content', 
        label: 'Content', 
        type: 'textarea', 
        placeholder: 'File content... Use {{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'action_file_delete',
    category: 'action',
    name: 'Delete File',
    icon: 'fileOps',
    color: '#3b82f6',
    description: 'Delete a file',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { path: '' },
    fields: [
      { 
        key: 'path', 
        label: 'File Path', 
        type: 'file', 
        placeholder: '/path/to/file.txt', 
        required: true 
      },
    ],
  },
  {
    type: 'action_file_copy',
    category: 'action',
    name: 'Copy File',
    icon: 'fileOps',
    color: '#3b82f6',
    description: 'Copy file to destination',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { source: '', destination: '' },
    fields: [
      { 
        key: 'source', 
        label: 'Source Path', 
        type: 'file', 
        placeholder: '/path/to/source.txt', 
        required: true 
      },
      { 
        key: 'destination', 
        label: 'Destination Path', 
        type: 'file', 
        placeholder: '/path/to/dest.txt', 
        required: true 
      },
    ],
  },
  {
    type: 'action_file_move',
    category: 'action',
    name: 'Move File',
    icon: 'fileOps',
    color: '#3b82f6',
    description: 'Move/rename file',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { source: '', destination: '' },
    fields: [
      { 
        key: 'source', 
        label: 'Source Path', 
        type: 'file', 
        placeholder: '/path/to/source.txt', 
        required: true 
      },
      { 
        key: 'destination', 
        label: 'Destination Path', 
        type: 'file', 
        placeholder: '/path/to/dest.txt', 
        required: true 
      },
    ],
  },

  // === SHELL & SYSTEM ===
  {
    type: 'action_shell',
    category: 'action',
    name: 'Run Command',
    icon: 'shell',
    color: '#3b82f6',
    description: 'Execute a shell command',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Output' }],
    defaultData: { command: '', args: '', workDir: '' },
    fields: [
      { 
        key: 'command', 
        label: 'Command', 
        type: 'text', 
        placeholder: 'node', 
        required: true 
      },
      { 
        key: 'args', 
        label: 'Arguments', 
        type: 'text', 
        placeholder: 'script.js --flag' 
      },
      { 
        key: 'workDir', 
        label: 'Working Directory', 
        type: 'folder', 
        placeholder: '/path/to/dir' 
      },
    ],
  },

  // === NOTIFICATIONS ===
  {
    type: 'action_notification',
    category: 'action',
    name: 'Notification',
    icon: 'notify',
    color: '#3b82f6',
    description: 'Show a notification',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { title: '', message: '' },
    fields: [
      { 
        key: 'title', 
        label: 'Title', 
        type: 'text', 
        placeholder: 'Notification title', 
        required: true 
      },
      { 
        key: 'message', 
        label: 'Message', 
        type: 'text', 
        placeholder: 'Notification message' 
      },
    ],
  },

  // === UTILITIES ===
  {
    type: 'action_delay',
    category: 'action',
    name: 'Delay',
    icon: 'time',
    color: '#3b82f6',
    description: 'Wait for a duration',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Continue' }],
    defaultData: { duration: 1000 },
    fields: [
      { 
        key: 'duration', 
        label: 'Duration (ms)', 
        type: 'number', 
        placeholder: '1000', 
        required: true 
      },
    ],
  },
  {
    type: 'action_set_variable',
    category: 'action',
    name: 'Set Variable',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Set a workflow variable',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { name: '', value: '' },
    fields: [
      { 
        key: 'name', 
        label: 'Variable Name', 
        type: 'text', 
        placeholder: 'myVariable', 
        required: true 
      },
      { 
        key: 'value', 
        label: 'Value', 
        type: 'textarea', 
        placeholder: 'Value or {{expression}}' 
      },
    ],
  },
  {
    type: 'action_clipboard_write',
    category: 'action',
    name: 'Copy to Clipboard',
    icon: 'notify',
    color: '#3b82f6',
    description: 'Copy text to clipboard',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { content: '' },
    fields: [
      { 
        key: 'content', 
        label: 'Content', 
        type: 'textarea', 
        placeholder: 'Text to copy... Use {{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'action_open_url',
    category: 'action',
    name: 'Open URL',
    icon: 'api',
    color: '#3b82f6',
    description: 'Open URL in browser',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { url: '' },
    fields: [
      { 
        key: 'url', 
        label: 'URL', 
        type: 'url', 
        placeholder: 'https://example.com', 
        required: true 
      },
    ],
  },

  // === DATA PROCESSING ===
  {
    type: 'action_json_parse',
    category: 'action',
    name: 'Parse JSON',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Parse JSON string',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Object' }],
    defaultData: { json: '' },
    fields: [
      { 
        key: 'json', 
        label: 'JSON String', 
        type: 'textarea', 
        placeholder: '{"key": "value"} or {{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'action_json_stringify',
    category: 'action',
    name: 'Stringify JSON',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Convert object to JSON string',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'String' }],
    defaultData: { object: '' },
    fields: [
      { 
        key: 'object', 
        label: 'Object', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'action_template',
    category: 'action',
    name: 'Template',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Render a text template',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Text' }],
    defaultData: { template: '' },
    fields: [
      { 
        key: 'template', 
        label: 'Template', 
        type: 'textarea', 
        placeholder: 'Hello {{name}}! Today is {{date}}.', 
        required: true 
      },
    ],
  },
  {
    type: 'action_regex',
    category: 'action',
    name: 'Regex',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Extract or replace with regex',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { text: '', pattern: '', replacement: '', mode: 'match' },
    fields: [
      { 
        key: 'text', 
        label: 'Input Text', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'pattern', 
        label: 'Regex Pattern', 
        type: 'text', 
        placeholder: '\\d+', 
        required: true 
      },
      { 
        key: 'mode', 
        label: 'Mode', 
        type: 'select', 
        options: [
          { value: 'match', label: 'Match (extract)' },
          { value: 'matchAll', label: 'Match All' },
          { value: 'replace', label: 'Replace' },
          { value: 'test', label: 'Test (true/false)' },
        ]
      },
      { 
        key: 'replacement', 
        label: 'Replacement', 
        type: 'text', 
        placeholder: 'For replace mode' 
      },
    ],
  },
  {
    type: 'action_math',
    category: 'action',
    name: 'Math',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Perform math operations',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { operation: 'add', a: '', b: '' },
    fields: [
      { 
        key: 'operation', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'add', label: 'Add (+)' },
          { value: 'subtract', label: 'Subtract (-)' },
          { value: 'multiply', label: 'Multiply (×)' },
          { value: 'divide', label: 'Divide (÷)' },
          { value: 'modulo', label: 'Modulo (%)' },
          { value: 'power', label: 'Power (^)' },
          { value: 'round', label: 'Round' },
          { value: 'floor', label: 'Floor' },
          { value: 'ceil', label: 'Ceiling' },
          { value: 'abs', label: 'Absolute' },
        ]
      },
      { 
        key: 'a', 
        label: 'Value A', 
        type: 'text', 
        placeholder: '{{output}} or number' 
      },
      { 
        key: 'b', 
        label: 'Value B', 
        type: 'text', 
        placeholder: 'Second value (if needed)' 
      },
    ],
  },
  {
    type: 'action_log',
    category: 'action',
    name: 'Log',
    icon: 'custom',
    color: '#3b82f6',
    description: 'Log message to console',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Done' }],
    defaultData: { message: '', level: 'info' },
    fields: [
      { 
        key: 'message', 
        label: 'Message', 
        type: 'textarea', 
        placeholder: 'Log: {{output}}', 
        required: true 
      },
      { 
        key: 'level', 
        label: 'Level', 
        type: 'select', 
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' },
        ]
      },
    ],
  },
];
