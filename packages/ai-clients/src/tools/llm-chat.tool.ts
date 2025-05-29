/**
 * LLM Chat Tool
 * Handles AI conversation through Gemini API
 * Adapted from legacy ai.service.js and moved to packages for reusability
 */

import { 
  Tool, 
  TToolInput, 
  TToolOutput,
  AI
} from '@2dots1line/shared-types';
import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export type LLMChatToolInput = TToolInput<AI.LLMChatInputPayload>;
export type LLMChatToolOutput = TToolOutput<AI.LLMChatResult>;

export class LLMChatTool implements Tool<LLMChatToolInput, LLMChatToolOutput> {
  public name = 'llm_chat';
  public description = 'AI conversation tool using Gemini for DialogueAgent';
  public version = '1.0.0';
  
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  /**
   * Execute LLM chat conversation
   */
  async execute(input: LLMChatToolInput): Promise<LLMChatToolOutput> {
    try {
      const startTime = performance.now();

      // Construct the full prompt following legacy pattern
      const fullPrompt = this.constructPrompt(
        input.payload.systemPrompt,
        input.payload.history,
        input.payload.memoryContextBlock,
        input.payload.userMessage
      );

      // Start chat session with history
      const chat = this.model.startChat({
        history: this.formatHistoryForGemini(input.payload.history),
        generationConfig: {
          temperature: input.payload.modelConfig?.temperature || 0.7,
          maxOutputTokens: input.payload.modelConfig?.maxTokens || 2048,
        },
      });

      // Send the current message
      const result = await chat.sendMessage(input.payload.userMessage);
      const response = await result.response;
      const text = response.text();

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      return {
        status: 'success',
        result: {
          text,
          usage: {
            inputTokens: this.estimateTokens(fullPrompt),
            outputTokens: this.estimateTokens(text),
            totalTokens: this.estimateTokens(fullPrompt + text)
          },
          modelUsed: 'gemini-pro',
          metadata: {
            finishReason: response.candidates?.[0]?.finishReason || 'stop'
          }
        },
        metadata: {
          processing_time_ms: Math.round(processingTime),
          model_used: 'gemini-pro'
        }
      };

    } catch (error) {
      console.error('LLMChatTool execution error:', error);
      
      return {
        status: 'error',
        error: {
          code: 'LLM_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown LLM error',
          details: { tool: this.name }
        },
        metadata: {
          processing_time_ms: 0,
          model_used: 'gemini-pro'
        }
      };
    }
  }

  /**
   * Construct full prompt with system instructions, context, and history
   * Adapted from legacy ai.service.js pattern
   */
  private constructPrompt(
    systemPrompt: string,
    history: Array<{ role: string; content: string; timestamp?: string }>,
    memoryContextBlock?: string,
    userMessage?: string
  ): string {
    let prompt = systemPrompt + '\n\n';

    // Add memory context if provided
    if (memoryContextBlock) {
      prompt += `RELEVANT CONTEXT FROM USER'S PAST:\n${memoryContextBlock}\n\n`;
    }

    // Add recent conversation history (last 5 exchanges to keep context manageable)
    if (history.length > 0) {
      prompt += 'RECENT CONVERSATION:\n';
      const recentHistory = history.slice(-10); // Last 10 messages
      
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'User' : 'Dot';
        prompt += `${role}: ${msg.content}\n`;
      }
      prompt += '\n';
    }

    // Add current user message context
    if (userMessage) {
      prompt += `Current User Message: ${userMessage}\n\n`;
    }

    prompt += 'Please respond as Dot, keeping in mind the user\'s growth journey and the context provided above.';

    return prompt;
  }

  /**
   * Format conversation history for Gemini API
   */
  private formatHistoryForGemini(history: Array<{ role: string; content: string }>): Array<any> {
    return history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
} 