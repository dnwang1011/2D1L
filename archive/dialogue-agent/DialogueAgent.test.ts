import { DialogueAgent } from '../src/agent/DialogueAgent';
import { systemPromptManager } from '../src/prompts/systemPrompts';

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock the fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{"system_base": "You are Dot, an AI companion.", "system_greeting_onboarding": "Onboarding greeting", "system_greeting_established": "Established greeting"}'),
}));

describe('DialogueAgent', () => {
  let agent: DialogueAgent;
  let mockRedisClient: any;
  let mockDbClient: any;
  let mockAiManager: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock dependencies
    mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    };

    mockDbClient = {
      $transaction: jest.fn().mockImplementation(async (callback) => callback({})),
      conversation_messages: {},
      conversations: {},
    };

    mockAiManager = {
      getClient: jest.fn().mockReturnValue({
        modelName: 'test-model',
        generateText: jest.fn().mockResolvedValue({
          text: 'Test response',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        }),
      }),
    };

    // Initialize the agent with mocked dependencies
    agent = new DialogueAgent(mockDbClient, mockRedisClient, mockAiManager);
  });

  test('should generate dynamic onboarding greeting for new users', async () => {
    // Mock systemPromptManager to verify greeting generation
    const generateSystemPromptSpy = jest.spyOn(systemPromptManager, 'generateSystemPrompt');
    
    // Process a message as if from a new user
    await agent.processMessage({
      message_id: 'test-msg-1',
      message_text: 'Hello!',
      timestamp: new Date(),
    });

    // Verify the system prompt was generated with isOnboarding=true
    expect(generateSystemPromptSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isOnboarding: true,
      })
    );
  });

  test('should generate established user greeting for returning users', async () => {
    // Mock Redis to return a context indicating previous interactions
    const existingContext = {
      conversationId: 'test-convo',
      userId: 'test-user',
      history: [
        { sender: 'user', message: 'Previous message', timestamp: new Date().toISOString() },
        { sender: 'assistant', message: 'Previous response', timestamp: new Date().toISOString() },
      ],
      firstInteraction: false,
      messageCount: 2,
    };
    
    mockRedisClient.get.mockResolvedValue(JSON.stringify(existingContext));
    
    // Mock systemPromptManager to verify greeting generation
    const generateSystemPromptSpy = jest.spyOn(systemPromptManager, 'generateSystemPrompt');
    
    // Process a message as if from a returning user
    await agent.processMessage({
      conversation_id: 'test-convo',
      message_id: 'test-msg-2',
      message_text: 'I am back!',
      timestamp: new Date(),
    });

    // Verify the system prompt was generated with isOnboarding=false
    expect(generateSystemPromptSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isOnboarding: false,
      })
    );
  });

  test('should handle various greeting contexts', () => {
    // Test different greeting scenarios directly with the prompt manager
    
    // 1. Brand new user
    const newUserPrompt = systemPromptManager.generateSystemPrompt({
      userId: 'new-user',
      region: 'us',
      isOnboarding: true,
    });
    expect(newUserPrompt).toContain('I\'m Dot');
    
    // 2. Returning user with known interests
    const returningUserWithInterestsPrompt = systemPromptManager.generateSystemPrompt({
      userId: 'returning-user',
      region: 'us',
      isOnboarding: false,
      knownInterests: ['artificial intelligence', 'psychology'],
      messageCount: 50,
    });
    expect(returningUserWithInterestsPrompt).not.toBe(newUserPrompt);
    
    // 3. User with many interactions
    const frequentUserPrompt = systemPromptManager.generateSystemPrompt({
      userId: 'frequent-user',
      region: 'us',
      isOnboarding: false,
      messageCount: 150,
    });
    expect(frequentUserPrompt).not.toBe(newUserPrompt);
    
    // 4. User returning after a long absence
    const longAbsenceUserPrompt = systemPromptManager.generateSystemPrompt({
      userId: 'absent-user',
      region: 'us',
      isOnboarding: false,
      lastInteractionTimeMs: 14 * 24 * 60 * 60 * 1000, // 14 days
      messageCount: 20,
    });
    expect(longAbsenceUserPrompt).not.toBe(newUserPrompt);
  });
}); 