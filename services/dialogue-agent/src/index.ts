/**
 * Dialogue Agent (Dot) for 2dots1line v4
 * Exposes the main DialogueAgent class and related utilities
 */

import { DialogueAgent, TDialogueAgentInputPayload, TDialogueAgentOutputPayload } from './agent/DialogueAgent';
import { DialogueAgentConfig, loadAgentConfig } from './config/agentConfig';
import { systemPromptManager } from './prompts/systemPromptManager';

export { DialogueAgent };
export type { TDialogueAgentInputPayload, TDialogueAgentOutputPayload };
export type { DialogueAgentConfig };
export { loadAgentConfig };
export { systemPromptManager };

// Export agent module
export * from './agent';

// This file could be used to export the agent or related utilities
// For now, just exporting the agent itself for service registration or direct use

// Potentially add factory functions or other utilities if needed later 