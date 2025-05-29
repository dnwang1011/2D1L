"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueAgent = void 0;
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const systemPromptManager_1 = require("../prompts/systemPromptManager");
const agentConfig_1 = require("../config/agentConfig");
class DialogueAgent {
    constructor(dbClient, redisClient, clientFactory, toolReg) {
        this.db = dbClient;
        this.redis = redisClient;
        this.aiClientFactory = clientFactory;
        this.toolRegistry = toolReg;
        this.config = (0, agentConfig_1.loadAgentConfig)();
        this.prompts = this.loadPrompts('common.prompts.json', this.config.defaultRegion);
        logger_1.default.info('DialogueAgent initialized');
    }
    loadPrompts(fileName, region) {
        try {
            // Resolve path relative to the current file's directory, then to prompts
            const promptsDir = path.join(__dirname, '..', 'prompts');
            const filePath = path.join(promptsDir, fileName);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const allPrompts = JSON.parse(fileContent);
            const regionalPrompts = {};
            for (const key in allPrompts) {
                const regionalKey = `${key}_${region}`;
                if (allPrompts[regionalKey]) {
                    regionalPrompts[key] = allPrompts[regionalKey];
                }
                else if (!key.includes('_us') && !key.includes('_cn')) {
                    regionalPrompts[key] = allPrompts[key];
                }
            }
            regionalPrompts['error_fallback'] = regionalPrompts['error_fallback'] || allPrompts['error_fallback_us'] || "Sorry, an error occurred.";
            regionalPrompts['default_processing_message'] = regionalPrompts['default_processing_message'] || allPrompts['default_processing_message_us'] || "I am processing your request.";
            regionalPrompts['tool_error'] = regionalPrompts['tool_error'] || allPrompts['tool_error_us'] || "I had trouble using one of my tools.";
            regionalPrompts['system_base'] = regionalPrompts['system_base'] || allPrompts['system_base_us'] || "You are a helpful AI assistant.";
            return regionalPrompts;
        }
        catch (error) {
            logger_1.default.error({ err: error, filePathAttempt: path.join(__dirname, '..', 'prompts', fileName) }, `Failed to load prompts from ${fileName}`);
            return {
                'error_fallback': "Sorry, an error occurred unexpectedly.",
                'default_processing_message': "Processing...",
                'tool_error': "Tool error.",
                'system_base': "You are a helpful AI assistant (fallback)."
            };
        }
    }
    async getTurnContext(userId, payload) {
        const conversationId = payload.conversation_id || (0, uuid_1.v4)();
        const contextKey = `turnContext:${userId}:${conversationId}`;
        let turnContext = null;
        try {
            const cachedContext = await this.redis.get(contextKey);
            if (cachedContext) {
                const parsedContext = JSON.parse(cachedContext);
                // Ensure timestamps are Dates
                if (parsedContext.history) {
                    parsedContext.history = parsedContext.history.map(h => ({ ...h, timestamp: new Date(h.timestamp) }));
                }
                turnContext = parsedContext;
                logger_1.default.info({ conversationId, userId }, 'Retrieved turn context from Redis');
            }
        }
        catch (err) {
            logger_1.default.warn({ err, conversationId, userId }, 'Failed to retrieve or parse context from Redis');
        }
        if (!turnContext) {
            logger_1.default.info({ conversationId, userId }, 'No context in Redis, fetching from DB or starting new');
            // Use Prisma client for database operations
            const dbMessagesRaw = await this.db.prisma.conversation_messages.findMany({
                where: { conversation_id: conversationId, user_id: userId },
                orderBy: { timestamp: 'asc' },
            });
            // Map dbMessagesRaw to TMessage compatible structure for history
            const historyFromDb = dbMessagesRaw.map((msg) => ({
                role: msg.sender_type, // Assuming sender_type maps to 'user' | 'assistant'
                content: msg.message_text,
                timestamp: new Date(msg.timestamp),
                // tool_calls and name might be null/undefined if not stored or applicable
            }));
            turnContext = {
                conversationId,
                userId,
                history: historyFromDb,
                firstInteraction: historyFromDb.filter(h => h.role === 'user').length <= 1, // More robust check
                messageCount: historyFromDb.length,
            };
        }
        if (payload.message_text) {
            const messageTimestamp = typeof payload.timestamp === 'string' ? new Date(payload.timestamp) : payload.timestamp;
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
        if (turnContext.history.length > this.config.maxConversationHistoryTurns * 2) {
            turnContext.history = turnContext.history.slice(-this.config.maxConversationHistoryTurns * 2);
        }
        return turnContext;
    }
    async saveTurnContext(turnContext) {
        const contextKey = `turnContext:${turnContext.userId}:${turnContext.conversationId}`;
        try {
            // Ensure history timestamps are ISO strings for JSON serialization
            const serializableContext = {
                ...turnContext,
                history: turnContext.history.map(h => ({ ...h, timestamp: h.timestamp.toISOString() }))
            };
            await this.redis.set(contextKey, JSON.stringify(serializableContext), { EX: this.config.redisTurnContextTTLSeconds });
            logger_1.default.info({ conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Saved turn context to Redis');
        }
        catch (err) {
            logger_1.default.error({ err, conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Failed to save context to Redis');
        }
    }
    async saveMessagesToDb(turnContext, userInputPayload, agentOutputPayload) {
        try {
            await this.db.prisma.$transaction(async (tx) => {
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
                        message_id: (0, uuid_1.v4)(), // Generate new ID for assistant message
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
            logger_1.default.info({ conversationId: turnContext.conversationId }, 'Saved messages to DB');
        }
        catch (error) {
            logger_1.default.error({ err: error, conversationId: turnContext.conversationId }, 'Failed to save messages to DB');
        }
    }
    async processMessage(agentInput) {
        const startTime = Date.now();
        const { user_id, payload, request_id, metadata } = agentInput;
        const region = metadata?.region || this.config.defaultRegion;
        const llmApiKey = region === 'us' ? process.env.GOOGLE_API_KEY : process.env.DEEPSEEK_API_KEY;
        logger_1.default.info({ userId: user_id, payload, requestId: request_id, region }, 'Processing message in DialogueAgent');
        const turnContext = await this.getTurnContext(user_id, payload);
        let responseText = this.prompts['default_processing_message'] || 'I am processing your request.';
        let llmUsed = 'unknown_llm';
        let llmTokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        const toolCallEvents = [];
        let finalOutputPayload;
        let llmClient;
        try {
            if (!llmApiKey) {
                throw new Error(`API key for region ${region} is not configured.`);
            }
            llmClient = this.aiClientFactory({
                region,
                googleApiKey: region === 'us' ? llmApiKey : undefined,
                deepseekApiKey: region === 'cn' ? llmApiKey : undefined,
            });
        }
        catch (clientError) {
            logger_1.default.error({ err: clientError, userId: user_id, requestId: request_id }, 'Failed to initialize AI client');
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
            const systemPrompt = systemPromptManager_1.systemPromptManager.generateSystemPrompt({
                userId: user_id, region, isOnboarding: turnContext.firstInteraction || false,
                messageCount: turnContext.messageCount, knownInterests: turnContext.knownInterests,
                recentTopics: turnContext.recentTopics, lastInteractionTimeMs: turnContext.lastInteractionTimeMs
            });
            // Initialize messagesForLlm with system prompt and current user message
            const messagesForLlm = [
                { role: 'system', content: systemPrompt },
                // Add existing history from turnContext, already including the current user payload by getTurnContext
                ...turnContext.history.slice(-this.config.maxConversationHistoryTurns * 2)
            ];
            // Ensure the last message is indeed the user's current input if not already added by getTurnContext structure
            if (payload.message_text && messagesForLlm[messagesForLlm.length - 1].content !== payload.message_text && messagesForLlm[messagesForLlm.length - 1].role !== 'user') {
                messagesForLlm.push({ role: 'user', content: payload.message_text });
            }
            let maxToolCallIterations = 5; // Safeguard against infinite loops
            iterationCount = 0;
            while (iterationCount < maxToolCallIterations) {
                iterationCount++;
                const llmResponse = await llmClient.chatCompletion({
                    model_id: region === 'us' ? (this.config.googleModelId || 'gemini-pro') : (this.config.deepseekModelId || 'deepseek-chat'),
                    messages: messagesForLlm,
                    temperature: this.config.llmTemperature,
                    max_tokens: this.config.llmMaxTokens,
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
                    logger_1.default.warn({ llmResponse }, "LLM response had no choices.");
                    break;
                }
                const assistantMessage = choice.message;
                messagesForLlm.push(assistantMessage); // Add assistant's message to history for next LLM call
                if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                    logger_1.default.info({ toolCalls: assistantMessage.tool_calls }, "LLM requested tool calls");
                    const toolMessages = [];
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
                            logger_1.default.info({ toolName, toolArgs }, "Executing tool");
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
                        }
                        catch (error) {
                            const toolDurationMs = Date.now() - toolStartTime;
                            logger_1.default.error({ err: error, toolName }, "Error executing tool");
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
                }
                else {
                    // No tool calls, or LLM provided a direct answer after tool calls
                    responseText = assistantMessage.content || "No response text from LLM.";
                    logger_1.default.info({ responseText }, "LLM provided final response or no tool calls requested");
                    break; // Exit loop, we have the final response text
                }
            }
            if (iterationCount >= maxToolCallIterations) {
                logger_1.default.warn("Reached max tool call iterations. Returning last response or error.");
                if (!responseText || responseText === (this.prompts['default_processing_message'] || 'I am processing your request.')) {
                    responseText = "Max tool call iterations reached. Could not get a final answer.";
                }
            }
        }
        catch (error) {
            logger_1.default.error({ err: error, requestId: request_id, userId: user_id }, 'Error during DialogueAgent processing loop');
            responseText = this.prompts['error_fallback'] || 'Sorry, I ran into an issue during processing.';
            if (error.response?.data) {
                logger_1.default.error({ errData: error.response.data }, "Error data from dependent service");
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
        if (turnContext.history.length > this.config.maxConversationHistoryTurns * 2) {
            turnContext.history = turnContext.history.slice(turnContext.history.length - (this.config.maxConversationHistoryTurns * 2));
        }
        await this.saveTurnContext(turnContext);
        // Pass the original user payload and the final agent output payload for DB saving
        await this.saveMessagesToDb(turnContext, payload, finalOutputPayload);
        logger_1.default.info({ output: finalOutputPayload, requestId: request_id, userId: user_id }, 'Finished processing message in DialogueAgent');
        return {
            status: 'success',
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
exports.DialogueAgent = DialogueAgent;
