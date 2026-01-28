import type { NodeDefinition } from './types';

export const utilityNodes: NodeDefinition[] = [
  {
    type: 'util_string',
    category: 'utility',
    name: 'String',
    icon: 'custom',
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
    icon: 'custom',
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
    icon: 'custom',
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
    icon: 'custom',
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
    icon: 'custom',
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
];
