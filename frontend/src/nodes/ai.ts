import type { NodeDefinition } from './types';

export const aiNodes: NodeDefinition[] = [
  {
    type: 'ai_summarize',
    category: 'ai',
    name: 'Summarize',
    icon: 'ai',
    color: '#8b5cf6',
    description: 'Summarize text content',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Summary' }],
    defaultData: { prompt: '', model: '', temperature: 0.7 },
    fields: [
      { 
        key: 'prompt', 
        label: 'Input Text', 
        type: 'textarea', 
        placeholder: 'Text to summarize... Use {{output}}', 
        required: true 
      },
      { 
        key: 'model', 
        label: 'Model', 
        type: 'text', 
        placeholder: 'gpt-4' 
      },
      { 
        key: 'temperature', 
        label: 'Temperature', 
        type: 'number', 
        defaultValue: 0.7 
      },
    ],
  },
  {
    type: 'ai_classify',
    category: 'ai',
    name: 'Classify',
    icon: 'ai',
    color: '#8b5cf6',
    description: 'Classify text into categories',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Category' }],
    defaultData: { prompt: '', categories: '', model: '' },
    fields: [
      { 
        key: 'prompt', 
        label: 'Input Text', 
        type: 'textarea', 
        placeholder: 'Text to classify...', 
        required: true 
      },
      { 
        key: 'categories', 
        label: 'Categories', 
        type: 'text', 
        placeholder: 'urgent, normal, low', 
        required: true 
      },
      { 
        key: 'model', 
        label: 'Model', 
        type: 'text', 
        placeholder: 'gpt-4' 
      },
    ],
  },
  {
    type: 'ai_extract',
    category: 'ai',
    name: 'Extract Data',
    icon: 'ai',
    color: '#8b5cf6',
    description: 'Extract structured data from text',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Data' }],
    defaultData: { prompt: '', schema: '', model: '' },
    fields: [
      { 
        key: 'prompt', 
        label: 'Input Text', 
        type: 'textarea', 
        placeholder: 'Text to extract from...', 
        required: true 
      },
      { 
        key: 'schema', 
        label: 'Data Schema (JSON)', 
        type: 'json', 
        placeholder: '{"name": "string", "email": "string"}', 
        required: true 
      },
      { 
        key: 'model', 
        label: 'Model', 
        type: 'text', 
        placeholder: 'gpt-4' 
      },
    ],
  },
  {
    type: 'ai_generate',
    category: 'ai',
    name: 'Generate Text',
    icon: 'ai',
    color: '#8b5cf6',
    description: 'Generate text from prompt',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Text' }],
    defaultData: { prompt: '', model: '', temperature: 0.7 },
    fields: [
      { 
        key: 'prompt', 
        label: 'Prompt', 
        type: 'textarea', 
        placeholder: 'Write a blog post about...', 
        required: true 
      },
      { 
        key: 'model', 
        label: 'Model', 
        type: 'text', 
        placeholder: 'gpt-4' 
      },
      { 
        key: 'temperature', 
        label: 'Temperature', 
        type: 'number', 
        defaultValue: 0.7 
      },
    ],
  },
];
