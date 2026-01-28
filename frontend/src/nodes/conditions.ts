import type { NodeDefinition } from './types';

export const conditionNodes: NodeDefinition[] = [
  {
    type: 'condition_if',
    category: 'condition',
    name: 'If/Else',
    icon: 'condition',
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
    icon: 'condition',
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
];
