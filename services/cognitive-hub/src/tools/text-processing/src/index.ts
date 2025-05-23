/**
 * Text Processing Tools for 2dots1line V4
 * Provides deterministic text analysis tools
 */

// Import types
import { Tool } from '@2dots1line/shared-types';

// Import tools
import { nerTool, extractEntities, createNERTool } from './ner';

// Export individual tools
export { 
  nerTool, 
  extractEntities, 
  createNERTool,
  type EntityResult,
  type NERInput,
  type NEROutput
} from './ner';

// Tool registry for this package
export const textTools: Record<string, Tool> = {
  'ner-basic': nerTool,
};

// Convenience exports
export const TextToolsRegistry = {
  getNERTool: () => createNERTool(),
  extractEntities,
}; 