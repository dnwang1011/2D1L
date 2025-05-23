import { BaseAgent, TAgentInput, TAgentOutput, TAgentContext, ToolRegistry, DatabaseService } from '@2dots1line/agent-framework';

export interface RetrievalPlannerPayload {
  query: string;
  user_id: string; // Again, TAgentInput has user_id.
  retrieval_constraints?: Record<string, any>; // e.g., date_range, source_type
  max_results?: number;
}

export interface RetrievalPlannerResult {
  retrieved_item_ids: string[];
  retrieval_summary: string;
  // Could include ranked results with scores later
}

export class RetrievalPlanner extends BaseAgent<
  TAgentInput<RetrievalPlannerPayload>,
  TAgentOutput<RetrievalPlannerResult>
> {
  constructor(toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    super('RetrievalPlanner', toolRegistry, databaseService);
    // e.g., this.registerTool(toolRegistry.getTool('VectorSearchTool'));
    // e.g., this.registerTool(toolRegistry.getTool('GraphSearchTool'));
  }

  async process(
    input: TAgentInput<RetrievalPlannerPayload>,
    context?: TAgentContext
  ): Promise<TAgentOutput<RetrievalPlannerResult>> {
    this.log('Processing retrieval input:', input.payload);
    const { query } = input.payload;

    // Dummy logic
    // const vectorResults = await this.executeTool('VectorSearchTool', { query: input.query, topK: 5 });
    // const graphResults = await this.executeTool('GraphSearchTool', { query: input.query });

    const itemIds = [`retrieved_item_${Date.now()}_1`, `retrieved_item_${Date.now()}_2`];
    
    const result: RetrievalPlannerResult = {
      retrieved_item_ids: itemIds,
      retrieval_summary: `Retrieved ${itemIds.length} items based on query (stub): "${query}"`, 
    };

    return {
      request_id: input.request_id,
      status: 'success',
      result: result,
      metadata: {
        processing_time_ms: 0,
        processed_in_region: input.region,
      }
    };
  }
} 