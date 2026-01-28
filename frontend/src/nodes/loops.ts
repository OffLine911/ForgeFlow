import type { NodeDefinition } from './types';

export const loopNodes: NodeDefinition[] = [
  {
    type: 'loop_foreach',
    category: 'loop',
    name: 'For Each',
    icon: 'loop',
    color: '#a855f7',
    description: 'Loop over array items',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'loop', type: 'output', label: 'Each Item' },
      { id: 'done', type: 'output', label: 'Done' },
    ],
    defaultData: { array: '', itemVar: 'item', indexVar: 'index' },
    fields: [
      { 
        key: 'array', 
        label: 'Array', 
        type: 'text', 
        placeholder: '{{items}} or [1,2,3]', 
        required: true 
      },
      { 
        key: 'itemVar', 
        label: 'Item Variable', 
        type: 'text', 
        placeholder: 'item' 
      },
      { 
        key: 'indexVar', 
        label: 'Index Variable', 
        type: 'text', 
        placeholder: 'index' 
      },
    ],
  },
  {
    type: 'loop_repeat',
    category: 'loop',
    name: 'Repeat',
    icon: 'loop',
    color: '#a855f7',
    description: 'Repeat N times',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'loop', type: 'output', label: 'Each' },
      { id: 'done', type: 'output', label: 'Done' },
    ],
    defaultData: { count: 5, indexVar: 'i' },
    fields: [
      { 
        key: 'count', 
        label: 'Repeat Count', 
        type: 'number', 
        placeholder: '5', 
        required: true 
      },
      { 
        key: 'indexVar', 
        label: 'Index Variable', 
        type: 'text', 
        placeholder: 'i' 
      },
    ],
  },
  {
    type: 'loop_while',
    category: 'loop',
    name: 'While Loop',
    icon: 'loop',
    color: '#a855f7',
    description: 'Loop while condition is true',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'loop', type: 'output', label: 'Loop' },
      { id: 'done', type: 'output', label: 'Done' },
    ],
    defaultData: { condition: '', maxIterations: 100 },
    fields: [
      { 
        key: 'condition', 
        label: 'Condition', 
        type: 'text', 
        placeholder: '{{counter}} < 10', 
        required: true 
      },
      { 
        key: 'maxIterations', 
        label: 'Max Iterations', 
        type: 'number', 
        placeholder: '100' 
      },
    ],
  },
];
