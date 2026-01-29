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
  {
    type: 'loop_parallel',
    category: 'loop',
    name: 'Parallel For Each',
    icon: '⚡',
    color: '#a855f7',
    description: 'Process array items in parallel (concurrent)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'loop', type: 'output', label: 'Each Item' },
      { id: 'done', type: 'output', label: 'All Done' },
    ],
    defaultData: { array: '', itemVar: 'item', concurrency: 5 },
    fields: [
      { 
        key: 'array', 
        label: 'Array', 
        type: 'text', 
        placeholder: '{{items}} or [1,2,3]', 
        required: true 
      },
      { 
        key: 'concurrency', 
        label: 'Max Parallel', 
        type: 'select',
        options: [
          { value: '2', label: '2 concurrent' },
          { value: '5', label: '5 concurrent' },
          { value: '10', label: '10 concurrent' },
          { value: '20', label: '20 concurrent' },
        ]
      },
      { 
        key: 'itemVar', 
        label: 'Item Variable', 
        type: 'text', 
        placeholder: 'item' 
      },
    ],
  },
  {
    type: 'loop_rate_limited',
    category: 'loop',
    name: 'Rate Limited Loop',
    icon: '🕐',
    color: '#a855f7',
    description: 'Loop with delay between iterations (API-friendly)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [
      { id: 'loop', type: 'output', label: 'Each Item' },
      { id: 'done', type: 'output', label: 'Done' },
    ],
    defaultData: { array: '', itemVar: 'item', delayMs: 1000 },
    fields: [
      { 
        key: 'array', 
        label: 'Array', 
        type: 'text', 
        placeholder: '{{items}} or [1,2,3]', 
        required: true 
      },
      { 
        key: 'delayMs', 
        label: 'Delay Between Items', 
        type: 'select',
        options: [
          { value: '100', label: '100ms (fast)' },
          { value: '500', label: '500ms' },
          { value: '1000', label: '1 second' },
          { value: '2000', label: '2 seconds' },
          { value: '5000', label: '5 seconds' },
        ]
      },
      { 
        key: 'itemVar', 
        label: 'Item Variable', 
        type: 'text', 
        placeholder: 'item' 
      },
    ],
  },
];
