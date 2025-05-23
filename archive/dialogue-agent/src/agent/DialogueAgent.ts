import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';
import { DialogueAgentConfig, loadAgentConfig } from '../config/agentConfig';
import type { PrismaClient } from '@prisma/client';

// Import shared types
// Using the AI namespace directly to avoid conflicting type names
import { TAgentInput, TAgentOutput } from '@2dots1line/shared-types';

// Import AI client types and factory
import {
  TMessage,
  TToolCall,
  ILLMClient,
  getAIClient,
} from '@2dots1line/ai-clients';

// Import tool registry and related types
import {
  ToolRegistry,
  ToolExecutionError
} from '@2dots1line/tool-registry';

// Import database clients
import { 
  PrismaClientWrapper,
  RedisClientWrapper 
} from '@2dots1line/database';

// Import SystemPromptManager
import { SystemPromptManager } from '../prompts/systemPromptManager';

// Type definitions for Dialogue Agent input/output
export interface TDialogueAgentInputPayload {
  conversation_id?: string | null;
  message_id: string;
  message_text?: string | null;
  message_media?: { type: string; url: string }[];
  timestamp: Date;
}

export interface TDialogueAgentOutputPayload {
  response_text: string;
  response_media?: { type: string; url: string }[];
  suggested_actions?: { action: string; label: string; payload?: Record<string, any> }[];
  proactive_insight?: { text: string; source_insight_id: string; confidence: number } | null;
  conversation_id: string;
}

// Tool input/output types
export interface TToolInputPayload {
  [key: string]: any;
}

export interface TToolOutputPayload {
  [key: string]: any;
  status: 'success' | 'error' | 'partial';
  error?: string;
}

// Interface TurnContext - Content remains the same
interface TurnContext {
  conversationId: string;
  userId: string;
  history: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string | null; name?: string; tool_calls?: TToolCall[]; tool_call_id?: string; timestamp: Date }>;
  currentIntent?: string;
  activeTools?: string[];
  firstInteraction?: boolean;
  messageCount?: number;
  knownInterests?: string[];
  recentTopics?: string[];
  lastInteractionTimeMs?: number;
}

export class DialogueAgent {
  private db: PrismaClientWrapper;
  private redis: RedisClientWrapper;
  private aiClientFactory: (region: string, apiKey?: string) => ILLMClient;
  private toolRegistry: ToolRegistry;
  private agentConfig: DialogueAgentConfig;
  private systemPromptManager: SystemPromptManager;
  private prompts: Record<string, string>;

  constructor(
    db: PrismaClientWrapper,
    redis: RedisClientWrapper,
    aiClientFactory: (region: string, apiKey?: string) => ILLMClient,
    toolRegistry: ToolRegistry
  ) {
    this.db = db;
    this.redis = redis;
    this.aiClientFactory = aiClientFactory;
    this.toolRegistry = toolRegistry;
    this.agentConfig = loadAgentConfig(); // Loads config from default path
    // Load prompts first
    this.prompts = this.loadPrompts('common.prompts.json', this.agentConfig.defaultRegion);
    // Pass the loaded prompts to SystemPromptManager
    this.systemPromptManager = new SystemPromptManager(this.prompts); 
    logger.info('DialogueAgent initialized');
  }

  public async initialize(): Promise<void> {
    try {
      await this.db.initialize();
      logger.info('Database client initialized successfully by DialogueAgent.');
    } catch (error) {
      logger.error({ err: error }, 'DialogueAgent failed to initialize database client.');
      // Optionally re-throw or handle as critical failure
      throw error;
    }
    try {
      await this.redis.initialize();
      logger.info('Redis client initialized successfully by DialogueAgent.');
    } catch (error) {
      logger.error({ err: error }, 'DialogueAgent failed to initialize Redis client.');
      // Optionally re-throw or handle as critical failure
      throw error;
    }
  }

  private loadPrompts(fileName: string, region: 'us' | 'cn'): Record<string, string> {
    try {
      // Resolve path relative to the current file's directory, then to prompts
      const promptsDir = path.join(__dirname, '..', 'prompts');
      const filePath = path.join(promptsDir, fileName);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const allPrompts = JSON.parse(fileContent) as Record<string,string>;
      
      const regionalPrompts: Record<string, string> = {};
      for (const key in allPrompts) {
        const regionalKey = `${key}_${region}`;
        if (allPrompts[regionalKey]) {
          regionalPrompts[key] = allPrompts[regionalKey];
        } else if (!key.includes('_us') && !key.includes('_cn')) {
          regionalPrompts[key] = allPrompts[key];
        }
      }
      regionalPrompts['error_fallback'] = regionalPrompts['error_fallback'] || allPrompts['error_fallback_us'] || "Sorry, an error occurred.";
      regionalPrompts['default_processing_message'] = regionalPrompts['default_processing_message'] || allPrompts['default_processing_message_us'] || "I am processing your request.";
      regionalPrompts['tool_error'] = regionalPrompts['tool_error'] || allPrompts['tool_error_us'] || "I had trouble using one of my tools.";
      regionalPrompts['system_base'] = regionalPrompts['system_base'] || allPrompts['system_base_us'] || "You are a helpful AI assistant.";
      
      return regionalPrompts;
    } catch (error: any) {
      logger.error({ err: error, filePathAttempt: path.join(__dirname, '..', 'prompts', fileName) }, `Failed to load prompts from ${fileName}`);
      return {
         'error_fallback': "Sorry, an error occurred unexpectedly.",
         'default_processing_message': "Processing...",
         'tool_error': "Tool error.",
         'system_base': "You are a helpful AI assistant (fallback)."
        };
    }
  }

  private async getTurnContext(
    userId: string,
    payload: TDialogueAgentInputPayload
  ): Promise<TurnContext> {
    const conversationId = payload.conversation_id || uuidv4();
    const contextKey = `turnContext:${userId}:${conversationId}`;
    let turnContext: TurnContext | null = null;

    try {
      const cachedContext = await RedisClientWrapper.get(contextKey);
      if (cachedContext) {
        const parsedContext = JSON.parse(cachedContext) as TurnContext;
        // Ensure timestamps are Dates
        if (parsedContext.history) {
            parsedContext.history = parsedContext.history.map(h => {
              let timestamp = h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp as any);
              if (!(timestamp instanceof Date && !isNaN(timestamp.getTime()))) {
                logger.warn({ historyEntry: h, reason: "Invalid timestamp from Redis cache, using current time." });
                timestamp = new Date();
              }
              return {...h, timestamp };
            });
        }
        turnContext = parsedContext;
        logger.info({ conversationId, userId }, 'Retrieved turn context from Redis');
      }
    } catch (err) {
      logger.warn({ err, conversationId, userId }, 'Failed to retrieve or parse context from Redis');
    }

    if (!turnContext) {
      logger.info({ conversationId, userId }, 'No context in Redis, fetching from DB or starting new');
      // Use Prisma client for database operations
      const dbMessagesRaw = await this.db.getClient().conversation_messages.findMany({
        where: { conversation_id: conversationId, user_id: userId },
        orderBy: { timestamp: 'asc' },
      });

      // Map dbMessagesRaw to TMessage compatible structure for history
      const historyFromDb: TurnContext['history'] = dbMessagesRaw.map((msg: any) => { // msg should be typed from Prisma schema
        let timestamp = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
        if (!(timestamp instanceof Date && !isNaN(timestamp.getTime()))) {
          logger.warn({dbMsgId: msg.message_id, dbTimestamp: msg.timestamp}, "Invalid timestamp in DB message, using current time for history entry.");
          timestamp = new Date(); // Fallback for invalid DB timestamps
        }
        return {
          role: msg.sender_type, // Assuming sender_type maps to 'user' | 'assistant'
          content: msg.message_text,
          timestamp: timestamp,
          // tool_calls and name might be null/undefined if not stored or applicable
        };
      });
      
      turnContext = {
        conversationId,
        userId,
        history: historyFromDb,
        firstInteraction: historyFromDb.filter(h => h.role === 'user').length <= 1, // More robust check
        messageCount: historyFromDb.length,
      };
    }
    
    if (payload.message_text) {
      // Ensure payload.timestamp is a valid Date object
      let messageTimestamp = payload.timestamp instanceof Date ? payload.timestamp : new Date(payload.timestamp);
      if (!(messageTimestamp instanceof Date && !isNaN(messageTimestamp.getTime()))) {
        logger.warn({payloadTimestamp: payload.timestamp, defaultRegion: this.agentConfig.defaultRegion}, "Invalid timestamp in user payload, using current time for history.");
        messageTimestamp = new Date(); // Fallback to current time
      }
      turnContext.history.push({ 
        role: 'user', 
        content: payload.message_text, 
        timestamp: messageTimestamp 
      });
      turnContext.messageCount = (turnContext.messageCount || 0) + 1;
    }
        
    if (turnContext.history.filter(h => h.role === 'user').length > 1) {
      turnContext.firstInteraction = false;
    }
    
    if (turnContext.history.length > this.agentConfig.maxConversationHistoryTurns * 2) {
      turnContext.history = turnContext.history.slice(-this.agentConfig.maxConversationHistoryTurns * 2);
    }
    return turnContext;
  }

  private async saveTurnContext(turnContext: TurnContext): Promise<void> {
    const contextKey = `turnContext:${turnContext.userId}:${turnContext.conversationId}`;
    try {
      // Ensure history timestamps are ISO strings for JSON serialization
      const serializableContext = {
          ...turnContext,
          history: turnContext.history.map(h => ({...h, timestamp: h.timestamp.toISOString()}))
      };
      await RedisClientWrapper.set(contextKey, JSON.stringify(serializableContext), { ttl: this.agentConfig.redisTurnContextTTLSeconds });
      logger.info({ conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Saved turn context to Redis');
    } catch (err) {
      logger.error({ err, conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Failed to save context to Redis');
    }
  }

  private async saveMessagesToDb(
    turnContext: TurnContext,
    userInputPayload: TDialogueAgentInputPayload,
    agentOutputPayload: TDialogueAgentOutputPayload
  ): Promise<void> {
    try {
      await this.db.getClient().$transaction(async (tx: PrismaClient) => {
        // Save user message
        if (userInputPayload.message_text) {
          await tx.conversation_messages.create({
            data: {
              message_id: userInputPayload.message_id,
              conversation_id: turnContext.conversationId,
              user_id: turnContext.userId,
              sender_type: 'user',
              message_text: userInputPayload.message_text,
              message_media: userInputPayload.message_media ? JSON.stringify(userInputPayload.message_media) : null,
              timestamp: userInputPayload.timestamp,
              // region: agentInput.metadata?.region, // from TAgentInput if available
            },
          });
        }

        // Save assistant message
        await tx.conversation_messages.create({
          data: {
            message_id: uuidv4(), // Generate new ID for assistant message
            conversation_id: turnContext.conversationId,
            user_id: turnContext.userId,
            sender_type: 'assistant',
            message_text: agentOutputPayload.response_text,
            message_media: agentOutputPayload.response_media ? JSON.stringify(agentOutputPayload.response_media) : null,
            suggested_actions: agentOutputPayload.suggested_actions ? JSON.stringify(agentOutputPayload.suggested_actions) : null,
            proactive_insight_id: agentOutputPayload.proactive_insight?.source_insight_id,
            timestamp: new Date(),
            // region: agentInput.metadata?.region, // from TAgentInput if available
          },
        });

        // Upsert conversation metadata (e.g., last_message_at, title if generated)
        await tx.conversations.upsert({
            where: { conversation_id_user_id: { conversation_id: turnContext.conversationId, user_id: turnContext.userId } },
            update: { last_message_at: new Date(), message_count: turnContext.messageCount },
            create: {
                conversation_id: turnContext.conversationId,
                user_id: turnContext.userId,
                created_at: new Date(turnContext.history[0]?.timestamp || Date.now()), // Approx created_at
                last_message_at: new Date(),
                message_count: turnContext.messageCount,
                // title: generate_title_if_needed()
            }
        });
      });
      logger.info({ conversationId: turnContext.conversationId }, 'Saved messages to DB');
    } catch (error) {
      logger.error({ err: error, conversationId: turnContext.conversationId }, 'Failed to save messages to DB');
    }
  }

  public async processMessage(
    agentInput: TAgentInput<TDialogueAgentInputPayload>
  ): Promise<TAgentOutput<TDialogueAgentOutputPayload>> {
    const startTime = Date.now();
    const { user_id, payload, request_id, metadata } = agentInput;
    const region = metadata?.region as 'us' | 'cn' || this.agentConfig.defaultRegion;
    const llmApiKey = region === 'us' ? process.env.GOOGLE_API_KEY : process.env.DEEPSEEK_API_KEY;

    logger.info({ userId: user_id, payload, requestId: request_id, region }, 'Processing message in DialogueAgent');

    const turnContext = await this.getTurnContext(user_id, payload);
    let responseText = this.prompts['default_processing_message'] || 'I am processing your request.';
    let llmUsed = 'unknown_llm';
    let llmTokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const toolCallEvents: any[] = [];
    let finalOutputPayload: TDialogueAgentOutputPayload;

    let llmClient: ILLMClient;
    try {
        if (!llmApiKey) {
            throw new Error(`API key for region ${region} is not configured.`);
        }
        llmClient = this.aiClientFactory({
            region,
            googleApiKey: region === 'us' ? llmApiKey : undefined,
            deepseekApiKey: region === 'cn' ? llmApiKey : undefined,
        });
    } catch (clientError: any) {
        logger.error({ err: clientError, userId: user_id, requestId: request_id }, 'Failed to initialize AI client');
        finalOutputPayload = {
            response_text: this.prompts['error_fallback'] || 'AI client initialization failed.',
            conversation_id: turnContext.conversationId,
        };
        return {
            status: 'error',
            result: finalOutputPayload,
            request_id,
            metadata: {
                processing_time_ms: Date.now() - startTime,
                error_details: clientError.message
            }
        };
    }

    let iterationCount = 0; // Define iteration counter here
    
    try {
      const systemPrompt = this.systemPromptManager.generateSystemPrompt({
        userId: user_id, region, isOnboarding: turnContext.firstInteraction || false,
        messageCount: turnContext.messageCount, knownInterests: turnContext.knownInterests,
        recentTopics: turnContext.recentTopics, lastInteractionTimeMs: turnContext.lastInteractionTimeMs
      });
      
      // Initialize messagesForLlm with system prompt and current user message
      const messagesForLlm: TMessage[] = [
          { role: 'system', content: systemPrompt },
          // Add existing history from turnContext, already including the current user payload by getTurnContext
          ...turnContext.history.slice(-this.agentConfig.maxConversationHistoryTurns * 2) 
      ];
      // Ensure the last message is indeed the user's current input if not already added by getTurnContext structure
      if (payload.message_text && messagesForLlm[messagesForLlm.length -1].content !== payload.message_text && messagesForLlm[messagesForLlm.length -1].role !== 'user'){
        messagesForLlm.push({role: 'user', content: payload.message_text});
      }

      let maxToolCallIterations = 5; // Safeguard against infinite loops
      iterationCount = 0;

      while (iterationCount < maxToolCallIterations) {
        iterationCount++;

        const llmResponse = await llmClient.chatCompletion({
          model_id: region === 'us' ? (this.agentConfig.googleModelId || 'gemini-2.0-flash') : (this.agentConfig.deepseekModelId || 'deepseek-chat'),
          messages: messagesForLlm,
          temperature: this.agentConfig.llmTemperature,
          max_tokens: this.agentConfig.llmMaxTokens,
          user_id: user_id, 
          region: region,
          // tools: this.toolRegistry.getAllToolManifestsForLLM(), // Pass available tools to LLM if API supports it
        });

        llmUsed = llmResponse.model;
        if (llmResponse.usage) {
          llmTokenUsage.prompt_tokens += llmResponse.usage.prompt_tokens;
          llmTokenUsage.completion_tokens += llmResponse.usage.completion_tokens || 0;
          llmTokenUsage.total_tokens += llmResponse.usage.total_tokens;
        }

        const choice = llmResponse.choices && llmResponse.choices[0];
        if (!choice) {
          responseText = "LLM returned no choices.";
          logger.warn({llmResponse}, "LLM response had no choices.");
          break; 
        }

        const assistantMessage = choice.message;
        messagesForLlm.push(assistantMessage); // Add assistant's message to history for next LLM call

        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          logger.info({ toolCalls: assistantMessage.tool_calls }, "LLM requested tool calls");
          const toolMessages: TMessage[] = [];

          for (const toolCall of assistantMessage.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);
            
            // Create tool input with appropriate structure 
            const toolInput = { 
              payload: toolArgs, 
              request_id, 
              region, 
              user_id 
            };
            
            const toolStartTime = Date.now();
            try {
              logger.info({ toolName, toolArgs }, "Executing tool");
              const toolOutput = await this.toolRegistry.executeTool(toolName, toolInput);
              const toolDurationMs = Date.now() - toolStartTime;
              
              toolCallEvents.push({
                tool_call_id: toolCall.id,
                tool_name: toolName,
                duration_ms: toolDurationMs,
                success: toolOutput.status === 'success',
                // input_payload: toolArgs, // Optional logging
                // output_payload: toolOutput.result, // Optional logging
              });

              toolMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolName,
                content: JSON.stringify(toolOutput.result || toolOutput.error || { status: toolOutput.status }),
              });
            } catch (error: any) {
              const toolDurationMs = Date.now() - toolStartTime;
              logger.error({ err: error, toolName }, "Error executing tool");
              toolCallEvents.push({ 
                tool_call_id: toolCall.id,
                tool_name: toolName, 
                duration_ms: toolDurationMs, 
                success: false, 
                error: error.message 
              });
              toolMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolName,
                content: JSON.stringify({ error: error.message, message: "Error executing tool." }),
              });
            }
          }
          messagesForLlm.push(...toolMessages); // Add all tool results for next LLM iteration
          // Continue loop to let LLM process tool results
        } else {
          // No tool calls, or LLM provided a direct answer after tool calls
          responseText = assistantMessage.content || "No response text from LLM.";
          logger.info({ responseText }, "LLM provided final response or no tool calls requested");
          break; // Exit loop, we have the final response text
        }
      }
      if (iterationCount >= maxToolCallIterations) {
        logger.warn("Reached max tool call iterations. Returning last response or error.");
        if (!responseText || responseText === (this.prompts['default_processing_message'] || 'I am processing your request.')) {
            responseText = "Max tool call iterations reached. Could not get a final answer.";
        }
      }

    } catch (error: any) {
      logger.error({ err: error, requestId: request_id, userId: user_id }, 'Error during DialogueAgent processing loop');
      responseText = this.prompts['error_fallback'] || 'Sorry, I ran into an issue during processing.';
      if (error.response?.data) { 
        logger.error({ errData: error.response.data }, "Error data from dependent service");
      }
    }

    finalOutputPayload = {
      response_text: responseText,
      conversation_id: turnContext.conversationId,
      // TODO: Populate suggested_actions and proactive_insight if applicable from final LLM response or context
    };

    // Update turn context with final assistant message for saving
    const lastMessageTimestamp = new Date();
    turnContext.history.push({ role: 'assistant', content: finalOutputPayload.response_text, timestamp: lastMessageTimestamp });
    // Ensure history is trimmed AFTER adding the latest assistant message
    if (turnContext.history.length > this.agentConfig.maxConversationHistoryTurns * 2) {
      turnContext.history = turnContext.history.slice(turnContext.history.length - (this.agentConfig.maxConversationHistoryTurns * 2));
    }
    
    await this.saveTurnContext(turnContext);
    // Pass the original user payload and the final agent output payload for DB saving
    await this.saveMessagesToDb(turnContext, payload, finalOutputPayload);
    
    logger.info({ output: finalOutputPayload, requestId: request_id, userId: user_id }, 'Finished processing message in DialogueAgent');
    
    return {
      status: 'success', // Set status explicitly to match the TAgentOutput type
      result: finalOutputPayload,
      request_id,
      metadata: {
        processing_time_ms: Date.now() - startTime,
        model_used: llmUsed,
        llm_token_usage: llmTokenUsage,
        tool_calls: toolCallEvents,
        iterations: iterationCount, // Use the iteration counter defined above
      }
    };
  }
} 