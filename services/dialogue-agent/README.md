# Dialogue Agent (Dot)

The Dialogue Agent, also known as Dot, is the primary user-facing conversational agent in the 2dots1line V4 system. It handles user chats, manages conversation state, and coordinates with other agents and tools to provide rich, context-aware responses.

## Key Components

### 1. DialogueAgent Class

The main agent implementation that:
- Processes incoming user messages
- Manages conversation context through Redis and PostgreSQL
- Integrates with LLM clients (Google AI for US, DeepSeek for China)
- Calls tools from the Tool Registry as needed
- Handles tool call iteration (up to 5 cycles)
- Implements robust error handling and telemetry

### 2. System Prompt Management

The `SystemPromptManager` dynamically generates prompts based on:
- User's conversation history
- Whether this is an onboarding or returning user
- Region-specific considerations (US/CN)
- User interests and recent topics
- Available tools and their usage guidelines

### 3. Prompt Library

Region-aware prompt templates for:
- System prompts for LLM interaction
- Error messages
- Processing status messages
- Tool error handling

## Configuration

The agent can be configured through environment variables:
- `DEFAULT_REGION`: Default region ('us' or 'cn') if not specified in requests
- `REDIS_TURN_CONTEXT_TTL_SECONDS`: TTL for Redis-stored conversation state
- `MAX_CONVERSATION_HISTORY_TURNS`: Maximum conversation turns to maintain in context
- `LLM_TEMPERATURE`: Temperature setting for LLM requests
- `LLM_MAX_TOKENS`: Maximum tokens for LLM responses
- `GOOGLE_MODEL_ID`: Model ID for Google AI (US region)
- `DEEPSEEK_MODEL_ID`: Model ID for DeepSeek (China region)
- `LOG_LEVEL`: Logging level (info, warn, error, debug)

## Usage

```typescript
import { DialogueAgent } from '@services/dialogue-agent';
import { PrismaClientWrapper, RedisClientWrapper } from '@2dots1line/database';
import { getAIClient } from '@2dots1line/ai-clients';
import { ToolRegistry } from '@2dots1line/tool-registry';

// Initialize dependencies
const dbClient = new PrismaClientWrapper();
const redisClient = new RedisClientWrapper();
const toolRegistry = new ToolRegistry();

// Create DialogueAgent instance
const dialogueAgent = new DialogueAgent(
  dbClient,
  redisClient,
  getAIClient,
  toolRegistry
);

// Process a message
const response = await dialogueAgent.processMessage({
  user_id: 'user-123',
  payload: {
    conversation_id: 'conv-456',
    message_id: 'msg-789',
    message_text: 'Hello, Dot! How can you help me?',
    timestamp: new Date()
  },
  request_id: 'req-123',
  metadata: {
    region: 'us'
  }
});
```

## Testing

Run tests with:

```bash
npm test
```

## Design Considerations

1. **Region-specific behavior**: The agent adapts to US/China regions by selecting appropriate LLM models and language.

2. **Tool Integration**: Dot can use a variety of tools like retrieval, insight generation, and user preferences to enhance responses.

3. **Conversation Management**: Context is stored in both Redis (short-term) and PostgreSQL (long-term) for optimal performance and persistence.

4. **Error Handling**: Comprehensive error handling ensures graceful degradation when services fail.

5. **Telemetry**: Detailed telemetry for request processing time, token usage, and tool call performance. 