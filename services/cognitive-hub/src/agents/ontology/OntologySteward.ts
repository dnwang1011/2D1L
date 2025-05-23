import { BaseAgent, TAgentInput, TAgentOutput, TAgentContext, ToolRegistry, DatabaseService } from '@2dots1line/agent-framework';

export interface OntologyStewardPayload {
  action: 'propose_link' | 'validate_concept' | 'evolve_schema';
  data: any; 
  user_id: string; // TAgentInput also has user_id.
}

export interface OntologyStewardResult {
  result_summary: string;
  updated_entity_ids?: string[];
  validation_status?: string;
}

export class OntologySteward extends BaseAgent<
  TAgentInput<OntologyStewardPayload>,
  TAgentOutput<OntologyStewardResult>
> {
  constructor(toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    super('OntologySteward', toolRegistry, databaseService);
    // e.g., this.registerTool(toolRegistry.getTool('ConceptLinkingTool'));
    // e.g., this.registerTool(toolRegistry.getTool('SchemaValidationTool'));
  }

  async process(
    input: TAgentInput<OntologyStewardPayload>,
    context?: TAgentContext
  ): Promise<TAgentOutput<OntologyStewardResult>> {
    this.log('Processing ontology input:', input.payload);
    const { action, data } = input.payload;

    let summary = '';
    switch (action) {
      case 'propose_link':
        // const linkProposal = await this.executeTool('ConceptLinkingTool', input.data);
        summary = `Link proposal processed (stub).`;
        break;
      case 'validate_concept':
        summary = `Concept validation performed (stub).`;
        break;
      case 'evolve_schema':
        summary = `Schema evolution task handled (stub).`;
        break;
      default:
        summary = 'Unknown ontology action.';
    }

    const result: OntologyStewardResult = {
      result_summary: summary,
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