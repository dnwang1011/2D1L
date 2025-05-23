import { BaseAgent, TAgentInput, TAgentOutput, TAgentContext, ToolRegistry, DatabaseService } from '@2dots1line/agent-framework';

// 1. Define Payload and Result types
export interface IngestionAnalystPayload {
  data_source_id: string;
  content_type: 'text' | 'image' | 'url' | 'pdf';
  raw_content: any; 
  // metadata for the ingestion task itself, not to be confused with TAgentInput.metadata
  task_metadata?: Record<string, any>; 
}

export interface IngestionAnalystResult {
  processed_content_id: string; 
  summary?: string;
  extracted_entities?: any[]; 
}

// 2. Update class definition
export class IngestionAnalyst extends BaseAgent<
  TAgentInput<IngestionAnalystPayload>, // Use TAgentInput with the payload
  TAgentOutput<IngestionAnalystResult>  // Use TAgentOutput with the result
> {
  constructor(toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    super('IngestionAnalyst', toolRegistry, databaseService);
    // e.g., this.registerTool(toolRegistry.getTool('TextChunkingTool'));
    // e.g., this.registerTool(toolRegistry.getTool('EntityExtractionTool'));
  }

  // 3. Adjust process method
  async process(
    input: TAgentInput<IngestionAnalystPayload>, 
    context?: TAgentContext
  ): Promise<TAgentOutput<IngestionAnalystResult>> {
    this.log('Processing ingestion input:', input.payload); // Access data via input.payload
    const { data_source_id, content_type, raw_content } = input.payload;

    const processedId = `ingested_${Date.now()}`;
    this.log(`Content processed (stub), ID: ${processedId}`);

    // Construct the result part of TAgentOutput
    const result: IngestionAnalystResult = {
      processed_content_id: processedId,
      summary: 'Content ingested and processed (stub).',
    };
    
    // Return the full TAgentOutput structure
    return {
      request_id: input.request_id, // Echo request_id
      status: 'success',
      result: result, // Embed the specific result
      metadata: { // Basic metadata
        processing_time_ms: 0, // Placeholder
        processed_in_region: input.region,
      }
    };
  }
} 