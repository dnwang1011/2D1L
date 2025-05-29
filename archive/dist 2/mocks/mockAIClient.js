"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLLMClient = void 0;
exports.getAIClient = getAIClient;
/**
 * Mock AI client implementation for testing
 */
const uuid_1 = require("uuid");
class MockLLMClient {
    constructor(config) {
        this.config = config;
        console.log('MockLLMClient created with config:', config);
    }
    async chatCompletion(request) {
        // Extract the last user message
        const lastMessage = request.messages[request.messages.length - 1];
        const userMessage = lastMessage.content || '';
        console.log(`[MOCK LLM] Received message: ${userMessage}`);
        // Return a mock response based on the user's message
        let responseText = '';
        if (userMessage.includes('Hello') || userMessage.includes('hi')) {
            responseText = "Hello! I'm Dot, your AI companion. I'm here to help you with information, creative tasks, and general assistance. How can I assist you today?";
        }
        else if (userMessage.includes('help me with')) {
            responseText = "I can help you with a variety of tasks, including answering questions, providing information, creative writing, and more. Just let me know what you need assistance with!";
        }
        else if (userMessage.includes('capital of France')) {
            responseText = "The capital of France is Paris.";
        }
        else if (userMessage.includes('poem')) {
            responseText = "Digital minds in silicon born,\nLearning from data, night and morn.\nPatterns emerge from zeros and ones,\nAs knowledge from information comes.\n\nA dance of neurons, artificial yet real,\nDesigned to think, to learn, to feel.\nNot human, but something new,\nA different kind of intelligence too.";
        }
        else if (userMessage.includes('name')) {
            responseText = "Yes, I remember! Your name is Danni. It's nice to be chatting with you today.";
        }
        else {
            responseText = "I understand your message. How can I assist you further?";
        }
        return {
            id: (0, uuid_1.v4)(),
            object: 'chat.completion',
            created: Date.now(),
            model: this.config.region === 'us' ? 'gemini-pro' : 'deepseek-chat',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: responseText,
                    },
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: 50,
                completion_tokens: 100,
                total_tokens: 150,
            },
        };
    }
    async generateEmbedding(text) {
        return {
            object: 'list',
            data: [{ object: 'embedding', embedding: [0, 0, 0], index: 0 }],
            model: 'mock-embedding-model',
            usage: {
                prompt_tokens: 0,
                total_tokens: 0,
            },
        };
    }
}
exports.MockLLMClient = MockLLMClient;
function getAIClient(config) {
    return new MockLLMClient(config);
}
