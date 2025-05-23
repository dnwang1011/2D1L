"use strict";
/**
 * Configuration for the DialogueAgent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAgentConfig = loadAgentConfig;
/**
 * Load configuration from environment variables
 */
function loadAgentConfig() {
    // In a real scenario, load from environment variables or a config service
    return {
        defaultRegion: process.env.DEFAULT_REGION || 'us',
        redisTurnContextTTLSeconds: parseInt(process.env.REDIS_TURN_CONTEXT_TTL_SECONDS || '3600', 10), // 1 hour
        maxConversationHistoryTurns: parseInt(process.env.MAX_CONVERSATION_HISTORY_TURNS || '20', 10),
        llmTemperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '500', 10),
        googleModelId: process.env.GOOGLE_MODEL_ID || 'gemini-pro',
        deepseekModelId: process.env.DEEPSEEK_MODEL_ID || 'deepseek-chat',
    };
}
