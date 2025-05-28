/**
 * Main entry point for the @2dots1line/tool-registry package.
 */

export { ToolRegistry } from './registry';
export type {
  IExecutableTool,
  IToolManifest,
  IToolSearchCriteria,
} from './types';
export { ToolExecutionError } from './types';

// Re-export types from shared-types for convenience
export type { Tool, TToolInput, TToolOutput } from '@2dots1line/shared-types';

// Placeholder for future tool exports, e.g.:
// export * from './tools/text-embedding.tool'; 