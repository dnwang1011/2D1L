import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv'; // Rely on jest.setup.js
// import path from 'path'; // Rely on jest.setup.js
import { DialogueAgent } from '../../agent/DialogueAgent'; // Adjusted path
import { TAgentInput, TDialogueAgentInputPayload, TDialogueAgentResult } from '@2dots1line/shared-types';
import { loadAgentConfig } from '../../config/agentConfig'; // loadAgentConfig
import logger from '../../utils/logger'; // Default import
import { PrismaClientWrapper, RedisClientWrapper } from '@2dots1line/database';
import { getAIClient } from '@2dots1line/ai-clients';
import { ToolRegistry } from '@2dots1line/tool-registry';

// // Load .env file from v4 root -- REMOVE THIS LINE, rely on jest.setup.js
// dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

// Mock static methods of RedisClientWrapper
jest.mock('@2dots1line/database', () => {
  const originalModule = jest.requireActual('@2dots1line/database');
  return {
    ...originalModule,
    RedisClientWrapper: {
      ...originalModule.RedisClientWrapper,
      initialize: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null), // Mock for static RedisClientWrapper.get
      set: jest.fn().mockResolvedValue('OK'),   // Mock for static RedisClientWrapper.set
      del: jest.fn().mockResolvedValue(1),     // Mock for static RedisClientWrapper.del
      getClient: jest.fn().mockReturnValue({ /* mock ioredis client if needed */ }),
      isConnected: jest.fn().mockReturnValue(true),
      disconnect: jest.fn().mockResolvedValue(undefined),
    },
  };
});

const mockPrismaConcreteClient = {
  conversation_messages: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  conversations: {
    upsert: jest.fn().mockResolvedValue({}),
  },
  $transaction: jest.fn().mockImplementation(async (operations) => {
    // Simple mock: assume operations are successful and return mock results or empty array
    // For more complex tests, this might need to inspect operations and return specific data.
    if (Array.isArray(operations)) {
      return Promise.all(operations.map(op => Promise.resolve({ mockOperationResult: true })));
    }
    return Promise.resolve([]); 
  }),
  // Add other prisma models and methods if DialogueAgent uses them directly
};

const mockPrismaClient = {
  initialize: jest.fn().mockResolvedValue(undefined), // Add initialize
  getClient: jest.fn().mockReturnValue(mockPrismaConcreteClient), // Add getClient
  isConnected: jest.fn().mockReturnValue(true),
  disconnect: jest.fn().mockResolvedValue(undefined)
} as unknown as PrismaClientWrapper;

const mockRedisClient = {
  initialize: jest.fn().mockResolvedValue(undefined), // Add initialize
  getClient: jest.fn().mockReturnValue({ // Mock what the actual Redis client might look like if direct methods are called on it
    // Mock any specific ioredis methods if DialogueAgent.ts uses redis.getClient().someMethod()
  }),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  isConnected: jest.fn().mockReturnValue(true),
  disconnect: jest.fn().mockResolvedValue(undefined)
} as unknown as RedisClientWrapper;


describe('DialogueAgent E2E', () => {
  let dialogueAgent: DialogueAgent;

  beforeAll(async () => { // Make beforeAll async
    // GEMINI_API_KEY check remains, as it should be loaded by jest.setup.js
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables. Make sure .env is in the project root and jest.setup.js is working.');
    }
    
    dialogueAgent = new DialogueAgent(
      mockPrismaClient,
      mockRedisClient,
      getAIClient, 
      new ToolRegistry()
    );
    await dialogueAgent.initialize(); // Initialize the agent
  });

  test('should have a dialogue with Gemini API', async () => {
    const conversationId = `e2e-test-conv-${Date.now()}`;
    const messageId = `e2e-msg-${Date.now()}`;
    const clientTimestamp = new Date().toISOString();

    const userInput: TAgentInput<TDialogueAgentInputPayload> = {
      user_id: 'e2e-test-user',
      region: 'us', // Important for selecting the correct LLM client (GoogleAIClient)
      request_id: uuidv4(),
      metadata: {
        timestamp: clientTimestamp,
        // any other relevant metadata
      },
      payload: {
        conversation_id: conversationId,
        message_id: messageId,
        message_text: 'Hello, AI. Explain general relativity in simple terms.',
        timestamp: new Date(clientTimestamp),
        // client_timestamp: clientTimestamp, // This can be kept if used elsewhere, or removed if redundant
        // message_media can be omitted if not sending media
      },
    };

    logger.info(userInput.payload.message_text, 'Sending message to DialogueAgent:');
    const result = await dialogueAgent.processMessage(userInput);

    logger.info(result, 'Received response from DialogueAgent:');

    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    expect(result.result).toBeDefined();
    
    const agentResult = result.result as TDialogueAgentResult; // Type assertion for easier access

    expect(agentResult.response_text).toBeTruthy();
    expect(agentResult.response_text.toLowerCase()).not.toContain('error');
    expect(agentResult.response_text.toLowerCase()).not.toContain('failed');
    expect(agentResult.conversation_id).toBe(conversationId);
    
    // Add more specific assertions based on expected AI response characteristics
    expect(agentResult.response_text.toLowerCase()).toContain('relativity');

    expect(result.metadata).toBeDefined();
    expect(result.metadata.model_used).toBeDefined();
    // Example: expect(result.metadata.model_used).toContain('gemini');

    // Optional: Log the actual AI response for manual verification during test runs
    // console.log('AI Response:', agentResult.response_text);

  }, 30000); // Increase timeout for LLM API calls
}); 