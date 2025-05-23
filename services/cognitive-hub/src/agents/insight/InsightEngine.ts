import { BaseAgent, TAgentInput, TAgentOutput, TAgentContext, ToolRegistry, DatabaseService } from '@2dots1line/agent-framework';

export interface InsightEnginePayload {
  topic?: string; 
  data_ids?: string[]; 
  user_id: string; // TAgentInput also has user_id.
  insight_type: 'pattern_detection' | 'summary_generation' | 'anomaly_detection';
}

export interface InsightEngineResult {
  insight_id: string; 
  title: string;
  summary: string;
  raw_insight_data: any;
}

export class InsightEngine extends BaseAgent<
  TAgentInput<InsightEnginePayload>,
  TAgentOutput<InsightEngineResult>
> {
  constructor(toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    super('InsightEngine', toolRegistry, databaseService);
    // e.g., this.registerTool(toolRegistry.getTool('PatternAnalysisTool'));
    // e.g., this.registerTool(toolRegistry.getTool('SummarizationTool'));
  }

  async process(
    input: TAgentInput<InsightEnginePayload>,
    context?: TAgentContext
  ): Promise<TAgentOutput<InsightEngineResult>> {
    this.log('Generating insight from input:', input.payload);
    const { topic, insight_type, data_ids } = input.payload;

    const insightId = `insight_${Date.now()}`;
    const title = `Generated Insight for ${topic || insight_type} (stub)`;
    const summary = `This is a stub insight for type: ${insight_type}.`;

    const result: InsightEngineResult = {
      insight_id: insightId,
      title,
      summary,
      raw_insight_data: { details: 'Stub insight data.' },
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