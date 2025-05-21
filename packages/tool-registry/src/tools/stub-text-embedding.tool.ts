import {
  TToolInput,
  TToolOutput,
  TTextEmbeddingToolInput,
  TTextEmbeddingToolOutput,
  TTextEmbeddingInputPayload,
  TTextEmbeddingResult
} from '@2dots1line/shared-types';
import type { IToolManifest, IExecutableTool } from '../types';

// Example stub implementation for a text embedding tool

const manifest: IToolManifest<TTextEmbeddingInputPayload, TTextEmbeddingResult> = {
  name: 'stub-text-embedding',
  description: 'Stub: Generates vector embeddings for text.',
  version: '0.1.0',
  availableRegions: ['us', 'cn'],
  categories: ['text_processing', 'embedding'],
  capabilities: ['text_embedding'],
  validateInput: (input: TTextEmbeddingToolInput) => {
    const valid = !!input?.payload?.text_to_embed && !!input?.payload?.model_id;
    return { valid, errors: valid ? [] : ['Missing text_to_embed or model_id in payload'] };
  },
  validateOutput: (output: TTextEmbeddingToolOutput) => {
    const valid = Array.isArray(output?.result?.vector) && !!output?.result?.embedding_metadata?.model_id_used;
    return { valid, errors: valid ? [] : ['Missing vector or embedding_metadata in result'] };
  },
  performance: {
    avgLatencyMs: 50, // Placeholder
    isAsync: true,
    isIdempotent: true,
  },
};

const execute = async (
  input: TTextEmbeddingToolInput
): Promise<TTextEmbeddingToolOutput> => {
  const { text_to_embed, model_id } = input.payload;

  // Simulate embedding generation
  const vector = Array(128).fill(0).map(() => Math.random() * 2 - 1); // Dummy 128-dim vector
  const embedding_metadata = {
    model_id_used: model_id,
    dimensions: vector.length,
    token_count: Math.floor(text_to_embed.length / 4),
  };

  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 70));

  return {
    status: 'success',
    result: { // Encapsulate in result object
      vector,
      embedding_metadata,
    },
    metadata: {
      processing_time_ms: 70,
      model_used: model_id, // Can also be more specific like 'stub-embedding-v1'
    },
  };
};

export const StubTextEmbeddingTool: IExecutableTool<TTextEmbeddingInputPayload, TTextEmbeddingResult> = {
  manifest,
  execute,
};

export default StubTextEmbeddingTool; 