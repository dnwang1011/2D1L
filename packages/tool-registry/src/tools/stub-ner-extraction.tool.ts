import {
  TToolInput,
  TToolOutput,
  TNERToolInput,
  TNERToolOutput,
  TNERInputPayload,
  TNERResult,
  TExtractedEntity,
} from '@2dots1line/shared-types';
import type { IToolManifest, IExecutableTool } from '../types';

// Example stub implementation for an NER tool

const manifest: IToolManifest<TNERInputPayload, TNERResult> = {
  name: 'stub-ner-extraction',
  description: 'Stub: Extracts named entities from text.',
  version: '0.1.0',
  availableRegions: ['us', 'cn'],
  categories: ['text_processing', 'ner'],
  capabilities: ['ner_extraction'],
  validateInput: (input: TNERToolInput) => {
    const valid = !!input?.payload?.text_to_analyze;
    return { valid, errors: valid ? [] : ['Missing text_to_analyze in payload'] };
  },
  validateOutput: (output: TNERToolOutput) => {
    const valid = Array.isArray(output?.result?.entities);
    return { valid, errors: valid ? [] : ['Missing entities array in result'] };
  },
};

const execute = async (
  input: TNERToolInput
): Promise<TNERToolOutput> => {
  const { text_to_analyze } = input.payload;

  // Simulate NER processing
  const entities: TExtractedEntity[] = [];
  if (text_to_analyze.toLowerCase().includes('apple')) {
    entities.push({
      text: 'Apple',
      type: 'ORG',
      start_offset: text_to_analyze.toLowerCase().indexOf('apple'),
      end_offset: text_to_analyze.toLowerCase().indexOf('apple') + 5,
      confidence: 0.9,
    });
  }
  if (text_to_analyze.toLowerCase().includes('paris')) {
    entities.push({ text: 'Paris', type: 'LOC', start_offset: text_to_analyze.toLowerCase().indexOf('paris'), end_offset: text_to_analyze.toLowerCase().indexOf('paris') + 5, confidence: 0.95 });
  }
  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    status: 'success',
    result: {
      entities,
    },
    metadata: {
      processing_time_ms: 50,
      model_used: 'stub-ner-v1',
    },
  };
};

export const StubNerExtractionTool: IExecutableTool<TNERInputPayload, TNERResult> = {
  manifest,
  execute,
};

export default StubNerExtractionTool; 