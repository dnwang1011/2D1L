import {
  TToolInput,
  TToolOutput,
  TVectorSearchToolInput,
  TVectorSearchToolOutput,
  TVectorSearchInputPayload,
  TVectorSearchResult
} from '@2dots1line/shared-types';
import type { IToolManifest, IExecutableTool } from '../types';

// Example stub implementation for a vector search tool

const manifest: IToolManifest<TVectorSearchInputPayload, TVectorSearchResult> = {
  name: 'stub-vector-search',
  description: 'Stub: Performs vector similarity search.',
  version: '0.1.0',
  availableRegions: ['us', 'cn'],
  categories: ['data_retrieval', 'vector_search'],
  capabilities: ['vector_search'],
  validateInput: (input: TVectorSearchToolInput) => {
    const valid = Array.isArray(input?.payload?.query_vector) && typeof input?.payload?.top_k === 'number';
    return { valid, errors: valid ? [] : ['Missing query_vector or top_k in payload'] };
  },
  validateOutput: (output: TVectorSearchToolOutput) => {
    const valid = Array.isArray(output?.result?.results);
    return { valid, errors: valid ? [] : ['Missing results array in result'] };
  },
  performance: {
    avgLatencyMs: 100, // Placeholder
    isAsync: true,
  },
};

const execute = async (
  input: TVectorSearchToolInput
): Promise<TVectorSearchToolOutput> => {
  const { query_vector, top_k, filters, namespace } = input.payload;

  // Simulate vector search
  const results = Array(Math.min(top_k, 5)).fill(null).map((_, i) => ({
    id: `doc_${i + 1}_${namespace || 'default'}`,
    score: Math.random(),
    metadata: { source: 'stubDB', ...(filters || {}) },
    // vector: query_vector, // Optionally include vector if requested by input.payload.include_vector
  }));

  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    status: 'success',
    result: {
      results,
    },
    metadata: {
      processing_time_ms: 100,
      model_used: 'stub-vector-search-v1',
    },
  };
};

export const StubVectorSearchTool: IExecutableTool<TVectorSearchInputPayload, TVectorSearchResult> = {
  manifest,
  execute,
};

export default StubVectorSearchTool; 