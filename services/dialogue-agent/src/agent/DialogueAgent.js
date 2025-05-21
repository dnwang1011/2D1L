"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueAgent = void 0;
var uuid_1 = require("uuid");
var fs = require("fs");
var path = require("path");
var logger_1 = require("../utils/logger");
var systemPromptManager_1 = require("../prompts/systemPromptManager");
var agentConfig_1 = require("../config/agentConfig");
var DialogueAgent = /** @class */ (function () {
    function DialogueAgent(dbClient, redisClient, clientFactory, toolReg) {
        this.db = dbClient;
        this.redis = redisClient;
        this.aiClientFactory = clientFactory;
        this.toolRegistry = toolReg;
        this.config = (0, agentConfig_1.loadAgentConfig)();
        this.prompts = this.loadPrompts('common.prompts.json', this.config.defaultRegion);
        logger_1.default.info('DialogueAgent initialized');
    }
    DialogueAgent.prototype.loadPrompts = function (fileName, region) {
        try {
            // Resolve path relative to the current file's directory, then to prompts
            var promptsDir = path.join(__dirname, '..', 'prompts');
            var filePath = path.join(promptsDir, fileName);
            var fileContent = fs.readFileSync(filePath, 'utf-8');
            var allPrompts = JSON.parse(fileContent);
            var regionalPrompts = {};
            for (var key in allPrompts) {
                var regionalKey = "".concat(key, "_").concat(region);
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
            logger_1.default.error({ err: error, filePathAttempt: path.join(__dirname, '..', 'prompts', fileName) }, "Failed to load prompts from ".concat(fileName));
            return {
                'error_fallback': "Sorry, an error occurred unexpectedly.",
                'default_processing_message': "Processing...",
                'tool_error': "Tool error.",
                'system_base': "You are a helpful AI assistant (fallback)."
            };
        }
    };
    DialogueAgent.prototype.getTurnContext = function (userId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, contextKey, turnContext, cachedContext, parsedContext, err_1, dbMessagesRaw, historyFromDb, messageTimestamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = payload.conversation_id || (0, uuid_1.v4)();
                        contextKey = "turnContext:".concat(userId, ":").concat(conversationId);
                        turnContext = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.redis.get(contextKey)];
                    case 2:
                        cachedContext = _a.sent();
                        if (cachedContext) {
                            parsedContext = JSON.parse(cachedContext);
                            // Ensure timestamps are Dates
                            if (parsedContext.history) {
                                parsedContext.history = parsedContext.history.map(function (h) { return (__assign(__assign({}, h), { timestamp: new Date(h.timestamp) })); });
                            }
                            turnContext = parsedContext;
                            logger_1.default.info({ conversationId: conversationId, userId: userId }, 'Retrieved turn context from Redis');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        logger_1.default.warn({ err: err_1, conversationId: conversationId, userId: userId }, 'Failed to retrieve or parse context from Redis');
                        return [3 /*break*/, 4];
                    case 4:
                        if (!!turnContext) return [3 /*break*/, 6];
                        logger_1.default.info({ conversationId: conversationId, userId: userId }, 'No context in Redis, fetching from DB or starting new');
                        return [4 /*yield*/, this.db.prisma.conversation_messages.findMany({
                                where: { conversation_id: conversationId, user_id: userId },
                                orderBy: { timestamp: 'asc' },
                            })];
                    case 5:
                        dbMessagesRaw = _a.sent();
                        historyFromDb = dbMessagesRaw.map(function (msg) { return ({
                            role: msg.sender_type, // Assuming sender_type maps to 'user' | 'assistant'
                            content: msg.message_text,
                            timestamp: new Date(msg.timestamp),
                            // tool_calls and name might be null/undefined if not stored or applicable
                        }); });
                        turnContext = {
                            conversationId: conversationId,
                            userId: userId,
                            history: historyFromDb,
                            firstInteraction: historyFromDb.filter(function (h) { return h.role === 'user'; }).length <= 1, // More robust check
                            messageCount: historyFromDb.length,
                        };
                        _a.label = 6;
                    case 6:
                        if (payload.message_text) {
                            messageTimestamp = typeof payload.timestamp === 'string' ? new Date(payload.timestamp) : payload.timestamp;
                            turnContext.history.push({
                                role: 'user',
                                content: payload.message_text,
                                timestamp: messageTimestamp
                            });
                            turnContext.messageCount = (turnContext.messageCount || 0) + 1;
                        }
                        if (turnContext.history.filter(function (h) { return h.role === 'user'; }).length > 1) {
                            turnContext.firstInteraction = false;
                        }
                        if (turnContext.history.length > this.config.maxConversationHistoryTurns * 2) {
                            turnContext.history = turnContext.history.slice(-this.config.maxConversationHistoryTurns * 2);
                        }
                        return [2 /*return*/, turnContext];
                }
            });
        });
    };
    DialogueAgent.prototype.saveTurnContext = function (turnContext) {
        return __awaiter(this, void 0, void 0, function () {
            var contextKey, serializableContext, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contextKey = "turnContext:".concat(turnContext.userId, ":").concat(turnContext.conversationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        serializableContext = __assign(__assign({}, turnContext), { history: turnContext.history.map(function (h) { return (__assign(__assign({}, h), { timestamp: h.timestamp.toISOString() })); }) });
                        return [4 /*yield*/, this.redis.set(contextKey, JSON.stringify(serializableContext), { EX: this.config.redisTurnContextTTLSeconds })];
                    case 2:
                        _a.sent();
                        logger_1.default.info({ conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Saved turn context to Redis');
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        logger_1.default.error({ err: err_2, conversationId: turnContext.conversationId, userId: turnContext.userId }, 'Failed to save context to Redis');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DialogueAgent.prototype.saveMessagesToDb = function (turnContext, userInputPayload, agentOutputPayload) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!userInputPayload.message_text) return [3 /*break*/, 2];
                                            return [4 /*yield*/, tx.conversation_messages.create({
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
                                                })];
                                        case 1:
                                            _c.sent();
                                            _c.label = 2;
                                        case 2: 
                                        // Save assistant message
                                        return [4 /*yield*/, tx.conversation_messages.create({
                                                data: {
                                                    message_id: (0, uuid_1.v4)(), // Generate new ID for assistant message
                                                    conversation_id: turnContext.conversationId,
                                                    user_id: turnContext.userId,
                                                    sender_type: 'assistant',
                                                    message_text: agentOutputPayload.response_text,
                                                    message_media: agentOutputPayload.response_media ? JSON.stringify(agentOutputPayload.response_media) : null,
                                                    suggested_actions: agentOutputPayload.suggested_actions ? JSON.stringify(agentOutputPayload.suggested_actions) : null,
                                                    proactive_insight_id: (_a = agentOutputPayload.proactive_insight) === null || _a === void 0 ? void 0 : _a.source_insight_id,
                                                    timestamp: new Date(),
                                                    // region: agentInput.metadata?.region, // from TAgentInput if available
                                                },
                                            })];
                                        case 3:
                                            // Save assistant message
                                            _c.sent();
                                            // Upsert conversation metadata (e.g., last_message_at, title if generated)
                                            return [4 /*yield*/, tx.conversations.upsert({
                                                    where: { conversation_id_user_id: { conversation_id: turnContext.conversationId, user_id: turnContext.userId } },
                                                    update: { last_message_at: new Date(), message_count: turnContext.messageCount },
                                                    create: {
                                                        conversation_id: turnContext.conversationId,
                                                        user_id: turnContext.userId,
                                                        created_at: new Date(((_b = turnContext.history[0]) === null || _b === void 0 ? void 0 : _b.timestamp) || Date.now()), // Approx created_at
                                                        last_message_at: new Date(),
                                                        message_count: turnContext.messageCount,
                                                        // title: generate_title_if_needed()
                                                    }
                                                })];
                                        case 4:
                                            // Upsert conversation metadata (e.g., last_message_at, title if generated)
                                            _c.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        logger_1.default.info({ conversationId: turnContext.conversationId }, 'Saved messages to DB');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.default.error({ err: error_1, conversationId: turnContext.conversationId }, 'Failed to save messages to DB');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DialogueAgent.prototype.processMessage = function (agentInput) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, user_id, payload, request_id, metadata, region, llmApiKey, turnContext, responseText, llmUsed, llmTokenUsage, toolCallEvents, finalOutputPayload, llmClient, iterationCount, systemPrompt, messagesForLlm, maxToolCallIterations, llmResponse, choice, assistantMessage, toolMessages, _i, _a, toolCall, toolName, toolArgs, toolInput, toolStartTime, toolOutput, toolDurationMs, error_2, toolDurationMs, error_3, lastMessageTimestamp;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        user_id = agentInput.user_id, payload = agentInput.payload, request_id = agentInput.request_id, metadata = agentInput.metadata;
                        region = (metadata === null || metadata === void 0 ? void 0 : metadata.region) || this.config.defaultRegion;
                        llmApiKey = region === 'us' ? process.env.GOOGLE_API_KEY : process.env.DEEPSEEK_API_KEY;
                        logger_1.default.info({ userId: user_id, payload: payload, requestId: request_id, region: region }, 'Processing message in DialogueAgent');
                        return [4 /*yield*/, this.getTurnContext(user_id, payload)];
                    case 1:
                        turnContext = _c.sent();
                        responseText = this.prompts['default_processing_message'] || 'I am processing your request.';
                        llmUsed = 'unknown_llm';
                        llmTokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                        toolCallEvents = [];
                        try {
                            if (!llmApiKey) {
                                throw new Error("API key for region ".concat(region, " is not configured."));
                            }
                            llmClient = this.aiClientFactory({
                                region: region,
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
                            return [2 /*return*/, {
                                    status: 'error',
                                    result: finalOutputPayload,
                                    request_id: request_id,
                                    metadata: {
                                        processing_time_ms: Date.now() - startTime,
                                        error_details: clientError.message
                                    }
                                }];
                        }
                        iterationCount = 0;
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 14, , 15]);
                        systemPrompt = systemPromptManager_1.systemPromptManager.generateSystemPrompt({
                            userId: user_id,
                            region: region,
                            isOnboarding: turnContext.firstInteraction || false,
                            messageCount: turnContext.messageCount, knownInterests: turnContext.knownInterests,
                            recentTopics: turnContext.recentTopics, lastInteractionTimeMs: turnContext.lastInteractionTimeMs
                        });
                        messagesForLlm = __spreadArray([
                            { role: 'system', content: systemPrompt }
                        ], turnContext.history.slice(-this.config.maxConversationHistoryTurns * 2), true);
                        // Ensure the last message is indeed the user's current input if not already added by getTurnContext structure
                        if (payload.message_text && messagesForLlm[messagesForLlm.length - 1].content !== payload.message_text && messagesForLlm[messagesForLlm.length - 1].role !== 'user') {
                            messagesForLlm.push({ role: 'user', content: payload.message_text });
                        }
                        maxToolCallIterations = 5;
                        iterationCount = 0;
                        _c.label = 3;
                    case 3:
                        if (!(iterationCount < maxToolCallIterations)) return [3 /*break*/, 13];
                        iterationCount++;
                        return [4 /*yield*/, llmClient.chatCompletion({
                                model_id: region === 'us' ? (this.config.googleModelId || 'gemini-pro') : (this.config.deepseekModelId || 'deepseek-chat'),
                                messages: messagesForLlm,
                                temperature: this.config.llmTemperature,
                                max_tokens: this.config.llmMaxTokens,
                                user_id: user_id,
                                region: region,
                                // tools: this.toolRegistry.getAllToolManifestsForLLM(), // Pass available tools to LLM if API supports it
                            })];
                    case 4:
                        llmResponse = _c.sent();
                        llmUsed = llmResponse.model;
                        if (llmResponse.usage) {
                            llmTokenUsage.prompt_tokens += llmResponse.usage.prompt_tokens;
                            llmTokenUsage.completion_tokens += llmResponse.usage.completion_tokens || 0;
                            llmTokenUsage.total_tokens += llmResponse.usage.total_tokens;
                        }
                        choice = llmResponse.choices && llmResponse.choices[0];
                        if (!choice) {
                            responseText = "LLM returned no choices.";
                            logger_1.default.warn({ llmResponse: llmResponse }, "LLM response had no choices.");
                            return [3 /*break*/, 13];
                        }
                        assistantMessage = choice.message;
                        messagesForLlm.push(assistantMessage); // Add assistant's message to history for next LLM call
                        if (!(assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0)) return [3 /*break*/, 11];
                        logger_1.default.info({ toolCalls: assistantMessage.tool_calls }, "LLM requested tool calls");
                        toolMessages = [];
                        _i = 0, _a = assistantMessage.tool_calls;
                        _c.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        toolCall = _a[_i];
                        toolName = toolCall.function.name;
                        toolArgs = JSON.parse(toolCall.function.arguments);
                        toolInput = {
                            payload: toolArgs,
                            request_id: request_id,
                            region: region,
                            user_id: user_id
                        };
                        toolStartTime = Date.now();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        logger_1.default.info({ toolName: toolName, toolArgs: toolArgs }, "Executing tool");
                        return [4 /*yield*/, this.toolRegistry.executeTool(toolName, toolInput)];
                    case 7:
                        toolOutput = _c.sent();
                        toolDurationMs = Date.now() - toolStartTime;
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
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _c.sent();
                        toolDurationMs = Date.now() - toolStartTime;
                        logger_1.default.error({ err: error_2, toolName: toolName }, "Error executing tool");
                        toolCallEvents.push({
                            tool_call_id: toolCall.id,
                            tool_name: toolName,
                            duration_ms: toolDurationMs,
                            success: false,
                            error: error_2.message
                        });
                        toolMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolName,
                            content: JSON.stringify({ error: error_2.message, message: "Error executing tool." }),
                        });
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 5];
                    case 10:
                        messagesForLlm.push.apply(messagesForLlm, toolMessages); // Add all tool results for next LLM iteration
                        return [3 /*break*/, 12];
                    case 11:
                        // No tool calls, or LLM provided a direct answer after tool calls
                        responseText = assistantMessage.content || "No response text from LLM.";
                        logger_1.default.info({ responseText: responseText }, "LLM provided final response or no tool calls requested");
                        return [3 /*break*/, 13]; // Exit loop, we have the final response text
                    case 12: return [3 /*break*/, 3];
                    case 13:
                        if (iterationCount >= maxToolCallIterations) {
                            logger_1.default.warn("Reached max tool call iterations. Returning last response or error.");
                            if (!responseText || responseText === (this.prompts['default_processing_message'] || 'I am processing your request.')) {
                                responseText = "Max tool call iterations reached. Could not get a final answer.";
                            }
                        }
                        return [3 /*break*/, 15];
                    case 14:
                        error_3 = _c.sent();
                        logger_1.default.error({ err: error_3, requestId: request_id, userId: user_id }, 'Error during DialogueAgent processing loop');
                        responseText = this.prompts['error_fallback'] || 'Sorry, I ran into an issue during processing.';
                        if ((_b = error_3.response) === null || _b === void 0 ? void 0 : _b.data) {
                            logger_1.default.error({ errData: error_3.response.data }, "Error data from dependent service");
                        }
                        return [3 /*break*/, 15];
                    case 15:
                        finalOutputPayload = {
                            response_text: responseText,
                            conversation_id: turnContext.conversationId,
                            // TODO: Populate suggested_actions and proactive_insight if applicable from final LLM response or context
                        };
                        lastMessageTimestamp = new Date();
                        turnContext.history.push({ role: 'assistant', content: finalOutputPayload.response_text, timestamp: lastMessageTimestamp });
                        // Ensure history is trimmed AFTER adding the latest assistant message
                        if (turnContext.history.length > this.config.maxConversationHistoryTurns * 2) {
                            turnContext.history = turnContext.history.slice(turnContext.history.length - (this.config.maxConversationHistoryTurns * 2));
                        }
                        return [4 /*yield*/, this.saveTurnContext(turnContext)];
                    case 16:
                        _c.sent();
                        // Pass the original user payload and the final agent output payload for DB saving
                        return [4 /*yield*/, this.saveMessagesToDb(turnContext, payload, finalOutputPayload)];
                    case 17:
                        // Pass the original user payload and the final agent output payload for DB saving
                        _c.sent();
                        logger_1.default.info({ output: finalOutputPayload, requestId: request_id, userId: user_id }, 'Finished processing message in DialogueAgent');
                        return [2 /*return*/, {
                                status: 'success', // Set status explicitly to match the TAgentOutput type
                                result: finalOutputPayload,
                                request_id: request_id,
                                metadata: {
                                    processing_time_ms: Date.now() - startTime,
                                    model_used: llmUsed,
                                    llm_token_usage: llmTokenUsage,
                                    tool_calls: toolCallEvents,
                                    iterations: iterationCount, // Use the iteration counter defined above
                                }
                            }];
                }
            });
        });
    };
    return DialogueAgent;
}());
exports.DialogueAgent = DialogueAgent;
