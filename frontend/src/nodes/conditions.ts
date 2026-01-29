import type { NodeDefinition } from './types';

export const conditionNodes: NodeDefinition[] = [
  {
    type: 'condition_if',
    category: 'condition',
    name: 'If/Else',
    icon: '🔀',
    color: '#f59e0b',
    description: 'Branch based on condition',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'True' },
      { id: 'false', type: 'output', label: 'False' }
    ],
    defaultData: { condition: '' },
    fields: [
      { 
        key: 'condition', 
        label: 'Condition', 
        type: 'text', 
        placeholder: '{{output}} > 10', 
        required: true 
      }
    ],
  },
  {
    type: 'condition_switch',
    category: 'condition',
    name: 'Switch',
    icon: '🔄',
    color: '#f59e0b',
    description: 'Multi-way branch',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'case1', type: 'output', label: 'Case 1' },
      { id: 'case2', type: 'output', label: 'Case 2' },
      { id: 'case3', type: 'output', label: 'Case 3' },
      { id: 'default', type: 'output', label: 'Default' }
    ],
    defaultData: { value: '' },
    fields: [
      { 
        key: 'value', 
        label: 'Value to Match', 
        type: 'text', 
        placeholder: '{{output}}', 
        required: true 
      }
    ],
  },
  {
    type: 'condition_manual_approval',
    category: 'condition',
    name: 'Manual Approval',
    icon: '👤',
    color: '#f59e0b',
    description: 'Wait for user approval',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'Approved' },
      { id: 'false', type: 'output', label: 'Denied' }
    ],
    defaultData: { title: 'Approval Required', message: 'Please approve this action to continue.' },
    fields: [
      { key: 'title', label: 'Dialog Title', type: 'text', placeholder: 'Approval Required' },
      { key: 'message', label: 'Dialog Message', type: 'textarea', placeholder: '{{message}}' },
    ],
  },
  {
    type: 'condition_try_catch',
    category: 'condition',
    name: 'Try/Catch',
    icon: '🛡️',
    color: '#f59e0b',
    description: 'Handle errors gracefully',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'try', type: 'output', label: 'Try' },
      { id: 'catch', type: 'output', label: 'Catch' }
    ],
    defaultData: { continueOnError: true },
    fields: [
      { key: 'continueOnError', label: 'Continue on Error', type: 'boolean', defaultValue: true },
    ],
  },
  {
    type: 'condition_filter',
    category: 'condition',
    name: 'Filter Array',
    icon: '🔎',
    color: '#f59e0b',
    description: 'Filter array items by condition',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'match', type: 'output', label: 'Matched' },
      { id: 'nomatch', type: 'output', label: 'Not Matched' }
    ],
    defaultData: { array: '', field: '', operator: 'equals', value: '' },
    fields: [
      { key: 'array', label: 'Array', type: 'text', placeholder: '{{output}} or [...]', required: true },
      { key: 'field', label: 'Field Path', type: 'text', placeholder: 'user.name or leave empty' },
      { key: 'operator', label: 'Operator', type: 'select', options: [
        { value: 'equals', label: 'Equals (==)' },
        { value: 'not_equals', label: 'Not Equals (!=)' },
        { value: 'contains', label: 'Contains' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' },
        { value: 'greater', label: 'Greater Than (>)' },
        { value: 'less', label: 'Less Than (<)' },
        { value: 'greater_eq', label: 'Greater or Equal (>=)' },
        { value: 'less_eq', label: 'Less or Equal (<=)' },
        { value: 'is_empty', label: 'Is Empty' },
        { value: 'is_not_empty', label: 'Is Not Empty' },
        { value: 'regex', label: 'Matches Regex' },
      ]},
      { key: 'value', label: 'Compare Value', type: 'text', placeholder: 'Value to compare against' },
    ],
  },
  {
    type: 'condition_type_check',
    category: 'condition',
    name: 'Type Check',
    icon: '🔢',
    color: '#f59e0b',
    description: 'Check value type',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'Matches' },
      { id: 'false', type: 'output', label: 'No Match' }
    ],
    defaultData: { value: '', type: 'string' },
    fields: [
      { key: 'value', label: 'Value', type: 'text', placeholder: '{{output}}', required: true },
      { key: 'type', label: 'Expected Type', type: 'select', options: [
        { value: 'string', label: 'String' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'array', label: 'Array' },
        { value: 'object', label: 'Object' },
        { value: 'null', label: 'Null' },
        { value: 'undefined', label: 'Undefined' },
      ]},
    ],
  },
  {
    type: 'condition_is_empty',
    category: 'condition',
    name: 'Is Empty',
    icon: '❓',
    color: '#f59e0b',
    description: 'Check if value is empty',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'Empty' },
      { id: 'false', type: 'output', label: 'Not Empty' }
    ],
    defaultData: { value: '' },
    fields: [
      { key: 'value', label: 'Value', type: 'text', placeholder: '{{output}}', required: true },
    ],
  },
  {
    type: 'condition_date_compare',
    category: 'condition',
    name: 'Date Compare',
    icon: '📅',
    color: '#f59e0b',
    description: 'Compare two dates',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'True' },
      { id: 'false', type: 'output', label: 'False' },
    ],
    defaultData: { a: '', operator: 'before', b: '' },
    fields: [
      { key: 'a', label: 'Date A', type: 'text', placeholder: '{{date}} or 2023-01-01', required: true },
      { key: 'operator', label: 'Operator', type: 'select', options: [
        { value: 'before', label: 'Is Before' },
        { value: 'after', label: 'Is After' },
        { value: 'same', label: 'Is Same' },
      ]},
      { key: 'b', label: 'Date B', type: 'text', placeholder: '{{date}} or 2023-01-01', required: true },
    ],
  },
  {
    type: 'condition_array_contains',
    category: 'condition',
    name: 'Array Contains',
    icon: '🔍',
    color: '#f59e0b',
    description: 'Check if array contains a value',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'true', type: 'output', label: 'True' },
      { id: 'false', type: 'output', label: 'False' },
    ],
    defaultData: { array: '', value: '' },
    fields: [
      { key: 'array', label: 'Array', type: 'text', placeholder: '{{items}}', required: true },
      { key: 'value', label: 'Value to Find', type: 'text', placeholder: 'search term', required: true },
    ],
  },
];

