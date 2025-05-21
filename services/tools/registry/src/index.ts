/**
 * Tool Registry for 2dots1line V4
 * Provides a unified registry of all available tools
 */

// Import types
import { Tool } from '@2dots1line/shared-types';

// Import tools from each tool package
import { textTools } from '@2dots1line/text-tools';
import { embeddingTools } from '@2dots1line/embedding-tools';
import { visionTools } from '@2dots1line/vision-tools';
import { vectorTools } from '@2dots1line/vector-tools';
import { graphTools } from '@2dots1line/graph-tools';

// Unified registry of all tools
export const toolRegistry: Record<string, Tool> = {
  ...textTools,
  ...embeddingTools,
  ...visionTools,
  ...vectorTools,
  ...graphTools,
};

// Tool discovery functions
export function discoverToolsByCapability(capability: string): Tool[] {
  return Object.values(toolRegistry).filter(tool => 
    tool.capabilities?.includes(capability)
  );
}

export function getToolById(id: string): Tool | undefined {
  return toolRegistry[id];
} 