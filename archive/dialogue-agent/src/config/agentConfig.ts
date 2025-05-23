/**
 * Configuration for the DialogueAgent
 */

export interface DialogueAgentConfig {
  defaultRegion: 'us' | 'cn';
  redisTurnContextTTLSeconds: number;
  maxConversationHistoryTurns: number;
  llmTemperature: number;
  llmMaxTokens: number;
  googleModelId?: string;
  deepseekModelId?: string;
  // Add other agent-specific configurations here
}

/**
 * Load configuration from environment variables
 */
export function loadAgentConfig(): DialogueAgentConfig {
  // In a real scenario, load from environment variables or a config service
  return {
    defaultRegion: (process.env.DEFAULT_REGION as 'us' | 'cn') || 'us',
    redisTurnContextTTLSeconds: parseInt(process.env.REDIS_TURN_CONTEXT_TTL_SECONDS || '3600', 10), // 1 hour
    maxConversationHistoryTurns: parseInt(process.env.MAX_CONVERSATION_HISTORY_TURNS || '20', 10),
    llmTemperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '500', 10),
    googleModelId: process.env.GOOGLE_MODEL_ID || 'gemini-2.0-flash',
    deepseekModelId: process.env.DEEPSEEK_MODEL_ID || 'deepseek-chat',
  };
} 