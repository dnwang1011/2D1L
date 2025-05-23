import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

interface SystemPromptContext {
  userId: string;
  region: 'us' | 'cn'; // Retained for potential future minimal adjustments
  // Other context fields might be used for very minor, non-persona-altering tweaks
  isOnboarding?: boolean;
  messageCount?: number;
  knownInterests?: string[];
  recentTopics?: string[];
  lastInteractionTimeMs?: number;
}

export class SystemPromptManager {
  private orbSystemPrompt: string;

  constructor() {
    try {
      const promptFilePath = path.join(__dirname, 'orb.system.prompt.md');
      this.orbSystemPrompt = fs.readFileSync(promptFilePath, 'utf-8');
      logger.info('SystemPromptManager initialized with Orb system prompt from orb.system.prompt.md');
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to load orb.system.prompt.md, falling back to a hardcoded basic Orb prompt.');
      // Basic fallback in case file loading fails, not as comprehensive
      this.orbSystemPrompt = "You are Orb, a helpful and insightful AI companion. Guide the user on their journey of self-discovery.";
    }
  }

  generateSystemPrompt(context: SystemPromptContext): string {
    // The core prompt is now largely static from orb.system.prompt.md
    let prompt = this.orbSystemPrompt;

    // Example of a very minimal dynamic addition (if needed):
    // if (context.region === 'cn') {
    //   prompt += "\n(Note: You are operating in the CN region.)";
    // }

    // The comprehensive Orb prompt from the file should cover most contextual variations.
    // Extensive dynamic construction is no longer the primary approach.
    
    logger.debug({ finalPromptLength: prompt.length, context }, 'Generated system prompt');
    return prompt;
  }
} 