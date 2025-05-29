/**
 * @fileoverview
 * This package contains all shared TypeScript interfaces, types, and enums
 * used across the 2dots1line V4 monorepo.
 *
 * It is organized into subdirectories for better modularity:
 * - `ai/`: Types related to AI agents, tools, and LLM interactions.
 * - `api/`: Types for API request/response contracts.
 * - `entities/`: Core domain entity types, aligning with database schemas.
 */

// Export all types from subdirectories
export * as AI from './ai';
export * as API from './api';
export * as Entities from './entities';
export * as State from './state';

// Optionally, re-export very common individual types for convenience
// Example: export type { TUser } from './entities';
// Example: export type { TAgentInput, TAgentOutput } from './ai';

// Consistent error structure
export interface TErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, any>;
  request_id?: string;
}

// Consistent success structure for generic API responses
export interface TSuccessResponse<TData = any> {
  data: TData;
  message?: string;
  request_id?: string;
  metadata?: Record<string, any>; // For pagination, counts, etc.
}

// Export error types
export * from './errors';

// Re-export for easier imports
export * from './entities/user.types';
export * from './entities/memory.types';
export * from './entities/concept.types';
export * from './entities/chunk.types';

// Optionally, export specific commonly used types directly
export type { TUser } from './entities';
export type { TMemoryUnit } from './entities';
export type { TChunk } from './entities';
export type { TConcept } from './entities';
export type { TApiResponse } from './api';
export type { 
    TAgentInput, 
    TAgentOutput, 
    TAgentContext,
    TDialogueAgentInputPayload, 
    TDialogueAgentResult,
    TDialogueAgentInput,
    TDialogueAgentOutput,
    TIngestionAnalystInput,
    TIngestionAnalystInputPayload,
    TIngestionAnalystResult,
    TIngestionContentItem,
    Tool,
    TToolInput, 
    TToolOutput,
    TNERToolInput,
    TNERToolOutput,
    TTextEmbeddingToolInput,
    TTextEmbeddingToolOutput,
    TVectorSearchToolInput,
    TVectorSearchToolOutput,
    TNERInputPayload,
    TNERResult,
    TExtractedEntity,
    TTextEmbeddingInputPayload,
    TTextEmbeddingResult,
    TVectorSearchInputPayload,
    TVectorSearchResultItem,
    TVectorSearchResult,
    LLMChatInputPayload,
    LLMChatResult,
    LLMChatToolInput,
    LLMChatToolOutput,
    VisionCaptionInputPayload,
    VisionCaptionResult,
    VisionCaptionToolInput,
    VisionCaptionToolOutput,
    DocumentExtractInputPayload,
    DocumentExtractResult,
    DocumentExtractToolInput,
    DocumentExtractToolOutput
} from './ai';

export type { 
    EmbeddingJob, 
    IngestionJob, 
    InsightJob 
} from './ai';

export type { OrbData, OrbState, OrbActions, OrbStore } from './state';

// This file is a placeholder that will be populated with the actual type definitions
// in the next implementation step. 