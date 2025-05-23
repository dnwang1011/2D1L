import { BaseAgent, TAgentInput, TAgentOutput, TAgentContext, ToolRegistry, DatabaseService } from '@2dots1line/agent-framework';

export interface DialogueAgentPayload {
  message: string;
  conversation_id?: string;
  user_id: string; // Note: TAgentInput also has user_id. Ensure consistency or pick one source.
}

export interface DialogueAgentResult {
  response: string;
  suggested_actions?: string[];
  conversation_id: string;
}

export class DialogueAgent extends BaseAgent<
  TAgentInput<DialogueAgentPayload>,
  TAgentOutput<DialogueAgentResult>
> {
  constructor(toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    super('DialogueAgent', toolRegistry, databaseService);
    // Register specific tools for DialogueAgent if needed
    // e.g., this.registerTool(toolRegistry.getTool('ConversationHistoryTool'));
  }

  async process(
    input: TAgentInput<DialogueAgentPayload>,
    context?: TAgentContext
  ): Promise<TAgentOutput<DialogueAgentResult>> {
    this.log('Processing input:', input.payload);
    const { message, conversation_id, user_id } = input.payload;
    // const agentFrameworkUserId = input.user_id; // From TAgentInput wrapper

    const currentConversationId = conversation_id || `conv_${Date.now()}`;
    const responseMessage = `Hello ${user_id}! You said: "${message}". This is a stub response from DialogueAgent.`;

    const result: DialogueAgentResult = {
      response: responseMessage,
      conversation_id: currentConversationId,
      suggested_actions: ['Ask another question', 'Summarize chat'],
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