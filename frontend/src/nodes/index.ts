// Node definitions - modular structure inspired by workflow-automator
import { triggerNodes } from './triggers';
import { actionNodes } from './actions';
import { conditionNodes } from './conditions';
import { aiNodes } from './ai';
import { outputNodes } from './outputs';
import { loopNodes } from './loops';
import { utilityNodes } from './utilities';
import type { NodeDefinition } from './types';

// Combine all node definitions
export const nodeDefinitions: NodeDefinition[] = [
  ...triggerNodes,
  ...actionNodes,
  ...conditionNodes,
  ...aiNodes,
  ...outputNodes,
  ...loopNodes,
  ...utilityNodes,
];

// Helper functions
export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return nodeDefinitions.find(n => n.type === type);
}

export function getNodesByCategory(category: string): NodeDefinition[] {
  return nodeDefinitions.filter(n => n.category === category);
}

// Re-export for convenience
export * from './triggers';
export * from './actions';
export * from './conditions';
export * from './ai';
export * from './outputs';
export * from './loops';
export * from './utilities';
export * from './types';
