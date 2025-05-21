import * as fs from 'fs';
import * as path from 'path';

export interface PromptOptions {
  userId: string;
  region: 'us' | 'cn';
  isOnboarding: boolean;
  messageCount?: number;
  knownInterests?: string[];
  recentTopics?: string[];
  lastInteractionTimeMs?: number;  // Time elapsed since last interaction in milliseconds
}

export class SystemPromptManager {
  private prompts: Record<string, string>;
  private dynamicGreetingTemplates: string[];
  private returnPrompts: boolean;
  
  constructor(promptsFilePath?: string) {
    // Load prompts from the provided file path or use default
    this.prompts = this.loadPrompts(promptsFilePath || path.join(__dirname, 'common.prompts.json'));
    
    // Prepare dynamic greeting templates for established users
    this.dynamicGreetingTemplates = [
      "How are you today? Anything on your mind?",
      "It's good to see you again. What would you like to explore today?",
      "Welcome back! How have things been since we last chatted?",
      "I've been looking forward to our conversation. What's been on your mind lately?",
      "Nice to connect with you again. What would you like to talk about today?",
      "Hello! I'm here and ready to chat whenever you are.",
      "How's your day going so far?",
      "What's been keeping you busy lately?",
      "Is there something specific you'd like to discuss today?",
      "Have you had any interesting thoughts or experiences since we last spoke?"
    ];
    
    // Flag to determine if we should return prompt text for testing/debugging
    this.returnPrompts = process.env.RETURN_PROMPTS === 'true';
  }
  
  private loadPrompts(filePath: string): Record<string, string> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Failed to load prompts from ${filePath}`, error);
      return {
        system_base: "You are Dot, an AI companion who listens deeply and helps users reflect.",
        system_greeting_onboarding: "Welcome! I'm Dot, your AI companion.",
        system_greeting_established: "Hello again! I'm here to chat.",
        error_fallback: "Sorry, I encountered an error."
      };
    }
  }
  
  /**
   * Generate a system prompt with appropriate greeting based on user context
   */
  public generateSystemPrompt(options: PromptOptions): string {
    const systemBase = this.prompts.system_base;
    let greeting = this.selectGreeting(options);
    
    // Combine the greeting with the base system prompt
    return `${greeting}\n\n${systemBase}`;
  }
  
  /**
   * Select an appropriate greeting based on user context
   */
  private selectGreeting(options: PromptOptions): string {
    const { isOnboarding, userId, messageCount, knownInterests, recentTopics, lastInteractionTimeMs } = options;
    
    // For new users, use onboarding greeting
    if (isOnboarding) {
      return this.generateOnboardingGreeting();
    }
    
    // For established users, create a dynamic greeting
    return this.generateEstablishedUserGreeting({
      userId,
      messageCount: messageCount || 0,
      knownInterests: knownInterests || [],
      recentTopics: recentTopics || [],
      lastInteractionTimeMs: lastInteractionTimeMs || 0
    });
  }
  
  /**
   * Generate a greeting for first-time users
   */
  private generateOnboardingGreeting(): string {
    // For onboarding, we use a consistent but warm welcome message
    const baseOnboardingTemplate = this.prompts.system_greeting_onboarding;
    
    // Simple onboarding greetings
    const onboardingGreetings = [
      "Hi there! I'm Dot, your personal AI companion. I'm here to listen, reflect, and engage in meaningful conversations with you. What's on your mind today?",
      "Hello! I'm Dot, and I'm delighted to meet you. I'm here to be a thoughtful conversation partner. What would you like to talk about?",
      "Welcome! I'm Dot, your AI companion. I'm designed to be a good listener and thoughtful conversation partner. What brings you here today?",
      "I'm Dot, and I'm excited to get to know you. I'm here to listen and chat about whatever's on your mind. What would you like to explore together?"
    ];
    
    // Return a randomly selected onboarding greeting
    return onboardingGreetings[Math.floor(Math.random() * onboardingGreetings.length)];
  }
  
  /**
   * Generate a contextual greeting for returning users
   */
  private generateEstablishedUserGreeting(context: {
    userId: string;
    messageCount: number;
    knownInterests: string[];
    recentTopics: string[];
    lastInteractionTimeMs: number;
  }): string {
    const { messageCount, knownInterests, recentTopics, lastInteractionTimeMs } = context;
    const baseEstablishedTemplate = this.prompts.system_greeting_established;
    
    // Calculate days since last interaction
    const daysSinceLastInteraction = Math.floor(lastInteractionTimeMs / (1000 * 60 * 60 * 24));
    
    // If we have recent topics, we might reference them
    if (recentTopics.length > 0 && Math.random() > 0.5) {
      const topic = recentTopics[Math.floor(Math.random() * recentTopics.length)];
      return `I remember we were discussing ${topic} last time. Have you had any more thoughts about that?`;
    }
    
    // If it's been a while since the last interaction
    if (daysSinceLastInteraction > 7) {
      return `It's been a while! How have you been these past ${daysSinceLastInteraction} days?`;
    }
    
    // If they have a lot of chat history, acknowledge the ongoing relationship
    if (messageCount > 100) {
      return "Always a pleasure to continue our conversations. What's been happening in your world?";
    }
    
    // If we know their interests, occasionally reference them
    if (knownInterests.length > 0 && Math.random() > 0.7) {
      const interest = knownInterests[Math.floor(Math.random() * knownInterests.length)];
      return `I know you're interested in ${interest}. Has anything new caught your attention in that area?`;
    }
    
    // Default to a random greeting template
    return this.dynamicGreetingTemplates[Math.floor(Math.random() * this.dynamicGreetingTemplates.length)];
  }
  
  /**
   * For testing and debugging purposes
   */
  public getBasePrompt(): string {
    return this.prompts.system_base;
  }
}

// Export a singleton instance
export const systemPromptManager = new SystemPromptManager();

export default systemPromptManager; 