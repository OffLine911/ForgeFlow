import type { NodeDefinition } from './types';

export const utilityNodes: NodeDefinition[] = [
  {
    type: 'util_string',
    category: 'utility',
    name: 'String',
    icon: '📝',
    color: '#64748b',
    description: 'Transform strings (case, trim, split)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'lower', text: '', delimiter: ',', length: '10', char: ' ', start: '0' },
    fields: [
      { 
        key: 'mode', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'lower', label: 'lowercase' },
          { value: 'upper', label: 'UPPERCASE' },
          { value: 'title', label: 'Title Case' },
          { value: 'camel', label: 'camelCase' },
          { value: 'snake', label: 'snake_case' },
          { value: 'kebab', label: 'kebab-case' },
          { value: 'trim', label: 'Trim whitespace' },
          { value: 'padStart', label: 'Pad start' },
          { value: 'padEnd', label: 'Pad end' },
          { value: 'split', label: 'Split to array' },
          { value: 'replace', label: 'Replace text' },
          { value: 'substring', label: 'Substring' },
        ]
      },
      { 
        key: 'text', 
        label: 'Text', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'delimiter', 
        label: 'Delimiter/Search', 
        type: 'text', 
        placeholder: 'For split/replace' 
      },
      { 
        key: 'replacement', 
        label: 'Replacement', 
        type: 'text', 
        placeholder: 'For replace' 
      },
      { 
        key: 'length', 
        label: 'Length', 
        type: 'number', 
        placeholder: 'For pad/substring' 
      },
      { 
        key: 'char', 
        label: 'Pad Char', 
        type: 'text', 
        placeholder: '0 or space' 
      },
      { 
        key: 'start', 
        label: 'Start Index', 
        type: 'number', 
        placeholder: 'For substring' 
      },
    ],
  },
  {
    type: 'util_array',
    category: 'utility',
    name: 'Array',
    icon: '📋',
    color: '#64748b',
    description: 'Array operations (map, filter, sort, join)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'length', array: '', field: '', separator: ', ', item: '', start: '0', end: '', order: 'asc' },
    fields: [
      { 
        key: 'mode', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'length', label: 'Length' },
          { value: 'push', label: 'Push (add item)' },
          { value: 'slice', label: 'Slice (portion)' },
          { value: 'join', label: 'Join (to string)' },
          { value: 'map', label: 'Map (extract field)' },
          { value: 'sort', label: 'Sort' },
          { value: 'reverse', label: 'Reverse' },
          { value: 'unique', label: 'Unique' },
          { value: 'flatten', label: 'Flatten' },
          { value: 'first', label: 'First item' },
          { value: 'last', label: 'Last item' },
        ]
      },
      { 
        key: 'array', 
        label: 'Array', 
        type: 'text', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'field', 
        label: 'Field', 
        type: 'text', 
        placeholder: 'For map/sort/unique' 
      },
      { 
        key: 'item', 
        label: 'Item', 
        type: 'text', 
        placeholder: 'For push' 
      },
      { 
        key: 'separator', 
        label: 'Separator', 
        type: 'text', 
        placeholder: 'For join' 
      },
      { 
        key: 'start', 
        label: 'Start', 
        type: 'number', 
        placeholder: 'For slice' 
      },
      { 
        key: 'end', 
        label: 'End', 
        type: 'number', 
        placeholder: 'For slice' 
      },
      { 
        key: 'order', 
        label: 'Order', 
        type: 'select', 
        options: [
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ]
      },
    ],
  },
  {
    type: 'util_field',
    category: 'utility',
    name: 'Field',
    icon: '🔑',
    color: '#64748b',
    description: 'Get or set field in object',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'get', path: '', value: '' },
    fields: [
      { 
        key: 'mode', 
        label: 'Mode', 
        type: 'select', 
        options: [
          { value: 'get', label: 'Get Field' },
          { value: 'set', label: 'Set Field' },
        ]
      },
      { 
        key: 'path', 
        label: 'Field Path', 
        type: 'text', 
        placeholder: 'user.name or items[0].id', 
        required: true 
      },
      { 
        key: 'value', 
        label: 'Value', 
        type: 'text', 
        placeholder: 'For set mode' 
      },
    ],
  },
  {
    type: 'util_merge',
    category: 'utility',
    name: 'Merge',
    icon: '🔗',
    color: '#64748b',
    description: 'Merge multiple inputs',
    inputs: [
      { id: 'in1', type: 'input', label: 'Input 1' },
      { id: 'in2', type: 'input', label: 'Input 2' },
    ],
    outputs: [{ id: 'out', type: 'output', label: 'Merged' }],
    defaultData: { mode: 'array' },
    fields: [
      { 
        key: 'mode', 
        label: 'Merge Mode', 
        type: 'select', 
        options: [
          { value: 'array', label: 'As Array' },
          { value: 'object', label: 'As Object' },
          { value: 'concat', label: 'Concatenate' },
        ]
      },
    ],
  },
  {
    type: 'util_generate',
    category: 'utility',
    name: 'Generate',
    icon: '🎲',
    color: '#64748b',
    description: 'Generate UUID, random values',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'uuid', min: '0', max: '100', length: '8' },
    fields: [
      { 
        key: 'mode', 
        label: 'Type', 
        type: 'select', 
        options: [
          { value: 'uuid', label: 'UUID' },
          { value: 'number', label: 'Random Number' },
          { value: 'string', label: 'Random String' },
        ]
      },
      { 
        key: 'min', 
        label: 'Min', 
        type: 'number', 
        placeholder: 'For number' 
      },
      { 
        key: 'max', 
        label: 'Max', 
        type: 'number', 
        placeholder: 'For number' 
      },
      { 
        key: 'length', 
        label: 'Length', 
        type: 'number', 
        placeholder: 'For string' 
      },
    ],
  },
  {
    type: 'util_encode',
    category: 'utility',
    name: 'Encode/Decode',
    icon: '🔐',
    color: '#64748b',
    description: 'Base64, URL encode, hashing (MD5, SHA)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'base64_encode', text: '' },
    fields: [
      { 
        key: 'mode', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'base64_encode', label: 'Base64 Encode' },
          { value: 'base64_decode', label: 'Base64 Decode' },
          { value: 'url_encode', label: 'URL Encode' },
          { value: 'url_decode', label: 'URL Decode' },
          { value: 'hex_encode', label: 'Hex Encode' },
          { value: 'hex_decode', label: 'Hex Decode' },
          { value: 'html_encode', label: 'HTML Encode' },
          { value: 'html_decode', label: 'HTML Decode' },
        ]
      },
      { 
        key: 'text', 
        label: 'Text', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
    ],
  },
  {
    type: 'util_object',
    category: 'utility',
    name: 'Object',
    icon: '{}',
    color: '#64748b',
    description: 'Object operations (keys, values, entries, pick, omit)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'keys', object: '', fields: '' },
    fields: [
      { 
        key: 'mode', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'keys', label: 'Get Keys (array)' },
          { value: 'values', label: 'Get Values (array)' },
          { value: 'entries', label: 'Get Entries ([key, value] pairs)' },
          { value: 'pick', label: 'Pick Fields (keep only specified)' },
          { value: 'omit', label: 'Omit Fields (remove specified)' },
          { value: 'delete', label: 'Delete Field' },
          { value: 'has', label: 'Has Key (boolean)' },
          { value: 'size', label: 'Size (number of keys)' },
        ]
      },
      { 
        key: 'object', 
        label: 'Object', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'fields', 
        label: 'Fields (comma-separated)', 
        type: 'text', 
        placeholder: 'field1, field2, nested.field' 
      },
    ],
  },
  {
    type: 'util_comment',
    category: 'utility',
    name: 'Comment',
    icon: '💬',
    color: '#64748b',
    description: 'Add notes to your workflow (no execution)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Pass' }],
    defaultData: { comment: '', color: '#64748b' },
    fields: [
      { 
        key: 'comment', 
        label: 'Comment', 
        type: 'textarea', 
        placeholder: 'Add notes about this workflow section...' 
      },
      { 
        key: 'color', 
        label: 'Color', 
        type: 'select', 
        options: [
          { value: '#64748b', label: 'Gray' },
          { value: '#3b82f6', label: 'Blue' },
          { value: '#22c55e', label: 'Green' },
          { value: '#f59e0b', label: 'Orange' },
          { value: '#ef4444', label: 'Red' },
          { value: '#a855f7', label: 'Purple' },
        ]
      },
    ],
  },
  {
    type: 'util_json',
    category: 'utility',
    name: 'JSON',
    icon: '{ }',
    color: '#64748b',
    description: 'Parse or stringify JSON',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'parse', input: '', pretty: true },
    fields: [
      { 
        key: 'mode', 
        label: 'Mode', 
        type: 'select', 
        options: [
          { value: 'parse', label: 'Parse (string → object)' },
          { value: 'stringify', label: 'Stringify (object → string)' },
        ]
      },
      { 
        key: 'input', 
        label: 'Input', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'pretty', 
        label: 'Pretty Print', 
        type: 'boolean', 
        defaultValue: true 
      },
    ],
  },
  {
    type: 'util_counter',
    category: 'utility',
    name: 'Counter',
    icon: '🔢',
    color: '#64748b',
    description: 'Increment/decrement a counter variable',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Value' }],
    defaultData: { name: 'counter', operation: 'increment', amount: 1 },
    fields: [
      { 
        key: 'name', 
        label: 'Counter Name', 
        type: 'text', 
        placeholder: 'counter', 
        required: true 
      },
      { 
        key: 'operation', 
        label: 'Operation', 
        type: 'select', 
        options: [
          { value: 'increment', label: 'Increment (+)' },
          { value: 'decrement', label: 'Decrement (-)' },
          { value: 'reset', label: 'Reset to 0' },
          { value: 'get', label: 'Get Value' },
          { value: 'set', label: 'Set Value' },
        ]
      },
      { 
        key: 'amount', 
        label: 'Amount', 
        type: 'number', 
        placeholder: '1', 
        defaultValue: 1 
      },
    ],
  },
  {
    type: 'util_hash',
    category: 'utility',
    name: 'Hash',
    icon: '#️⃣',
    color: '#64748b',
    description: 'Generate cryptographic hashes (MD5, SHA)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Hash' }],
    defaultData: { algorithm: 'sha256', text: '', uppercase: false },
    fields: [
      { 
        key: 'algorithm', 
        label: 'Algorithm', 
        type: 'select', 
        options: [
          { value: 'md5', label: 'MD5 (32 chars)' },
          { value: 'sha1', label: 'SHA-1 (40 chars)' },
          { value: 'sha256', label: 'SHA-256 (64 chars)' },
          { value: 'sha512', label: 'SHA-512 (128 chars)' },
        ]
      },
      { 
        key: 'text', 
        label: 'Text', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'uppercase', 
        label: 'Uppercase', 
        type: 'boolean', 
        defaultValue: false 
      },
    ],
  },
  {
    type: 'util_encrypt',
    category: 'utility',
    name: 'Encrypt/Decrypt',
    icon: '🔒',
    color: '#64748b',
    description: 'AES encryption and decryption',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Result' }],
    defaultData: { mode: 'encrypt', algorithm: 'aes-256', text: '', key: '' },
    fields: [
      { 
        key: 'mode', 
        label: 'Mode', 
        type: 'select', 
        options: [
          { value: 'encrypt', label: 'Encrypt' },
          { value: 'decrypt', label: 'Decrypt' },
        ]
      },
      { 
        key: 'algorithm', 
        label: 'Algorithm', 
        type: 'select', 
        options: [
          { value: 'aes-128', label: 'AES-128' },
          { value: 'aes-256', label: 'AES-256' },
        ]
      },
      { 
        key: 'text', 
        label: 'Text', 
        type: 'textarea', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'key', 
        label: 'Secret Key', 
        type: 'password', 
        placeholder: 'Your encryption key', 
        required: true 
      },
    ],
  },
  {
    type: 'util_wait_all',
    category: 'utility',
    name: 'Wait All',
    icon: '⏸️',
    color: '#64748b',
    description: 'Wait for all inputs before continuing',
    inputs: [
      { id: 'in1', type: 'input', label: 'Input 1' },
      { id: 'in2', type: 'input', label: 'Input 2' },
      { id: 'in3', type: 'input', label: 'Input 3' },
    ],
    outputs: [{ id: 'out', type: 'output', label: 'All Done' }],
    defaultData: { mode: 'all' },
    fields: [
      { 
        key: 'mode', 
        label: 'Wait Mode', 
        type: 'select', 
        options: [
          { value: 'all', label: 'Wait for ALL inputs' },
          { value: 'any', label: 'Wait for ANY input' },
        ]
      },
    ],
  },
  {
    type: 'util_switch',
    category: 'utility',
    name: 'Switch/Router',
    icon: '🔀',
    color: '#64748b',
    description: 'Route data to different outputs based on value',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'case1', type: 'output', label: 'Case 1' },
      { id: 'case2', type: 'output', label: 'Case 2' },
      { id: 'case3', type: 'output', label: 'Case 3' },
      { id: 'default', type: 'output', label: 'Default' },
    ],
    defaultData: { value: '', case1: '', case2: '', case3: '' },
    fields: [
      { 
        key: 'value', 
        label: 'Value to Check', 
        type: 'text', 
        placeholder: '{{output}}', 
        required: true 
      },
      { 
        key: 'case1', 
        label: 'Case 1 Value', 
        type: 'text', 
        placeholder: 'Match value for Case 1' 
      },
      { 
        key: 'case2', 
        label: 'Case 2 Value', 
        type: 'text', 
        placeholder: 'Match value for Case 2' 
      },
      { 
        key: 'case3', 
        label: 'Case 3 Value', 
        type: 'text', 
        placeholder: 'Match value for Case 3' 
      },
    ],
  },
  {
    type: 'util_debounce',
    category: 'utility',
    name: 'Debounce',
    icon: '⏱️',
    color: '#64748b',
    description: 'Limit execution frequency (wait for quiet period)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Output' }],
    defaultData: { delay: 500, key: 'default' },
    fields: [
      { 
        key: 'delay', 
        label: 'Wait Time (ms)', 
        type: 'select',
        options: [
          { value: '100', label: '100ms' },
          { value: '250', label: '250ms' },
          { value: '500', label: '500ms' },
          { value: '1000', label: '1 second' },
          { value: '2000', label: '2 seconds' },
        ]
      },
      { 
        key: 'key', 
        label: 'Debounce Key', 
        type: 'text', 
        placeholder: 'Unique key for this debounce' 
      },
    ],
  },
];
