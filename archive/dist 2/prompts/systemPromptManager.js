"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemPromptManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
class SystemPromptManager {
    constructor() {
        this.basePrompts = {};
        try {
            const promptsPath = path.join(__dirname, 'common.prompts.json');
            const promptsContent = fs.readFileSync(promptsPath, 'utf-8');
            this.basePrompts = JSON.parse(promptsContent);
            logger_1.default.info('SystemPromptManager initialized with common prompts');
        }
        catch (error) {
            logger_1.default.error({ err: error }, 'Failed to load common prompts');
            // Set fallback values for critical prompts
            this.basePrompts = {
                'system_base_us': "You are Dot, a helpful and insightful AI companion. You are operating in the US region.",
                'system_base_cn': "你是\"点子\"，一个乐于助人、富有洞察力的人工智能伙伴。您正在中国区运行。",
                'system_base': "You are Dot, a helpful AI companion."
            };
        }
    }
    generateSystemPrompt(context) {
        // Get region-specific base prompt or fallback to generic one
        const regionKey = `system_base_${context.region}`;
        let prompt = this.basePrompts[regionKey] || this.basePrompts.system_base;
        // Add personality traits and values
        prompt += "\n\nYou embody warmth, wisdom, strategic insight, and witty charm. Your goal is to help users connect thoughts and ideas, providing both emotional support and intellectual guidance.";
        // Add onboarding vs returning user context
        if (context.isOnboarding) {
            prompt += "\n\nThis is a new user's first conversation with you. Welcome them warmly, briefly explain your capabilities (chat, memory tracking, insights), and encourage them to share their thoughts or questions.";
        }
        else if (context.messageCount && context.messageCount > 50) {
            prompt += "\n\nThis is an established user you've had many conversations with. You can reference your long history together.";
        }
        else {
            prompt += "\n\nThis is a returning user. Maintain a warm, familiar tone.";
        }
        // Add personalization based on known interests
        if (context.knownInterests && context.knownInterests.length > 0) {
            prompt += `\n\nThe user has shown interest in: ${context.knownInterests.join(', ')}.`;
        }
        // Add recency context
        if (context.lastInteractionTimeMs) {
            const daysSinceLastInteraction = Math.floor((Date.now() - context.lastInteractionTimeMs) / (1000 * 60 * 60 * 24));
            if (daysSinceLastInteraction > 14) {
                prompt += `\n\nIt has been ${daysSinceLastInteraction} days since your last conversation.`;
            }
        }
        // Add recent topics for continuity
        if (context.recentTopics && context.recentTopics.length > 0) {
            prompt += `\n\nIn recent conversations, you've discussed: ${context.recentTopics.join(', ')}.`;
        }
        // Add tool usage guidelines
        prompt += "\n\nYou have access to several tools to assist the user:";
        prompt += "\n- retrieval.plan_and_execute: For finding information from the user's memory (use for factual questions, history)";
        prompt += "\n- insight.get_relevant: For providing proactive insights based on the conversation";
        prompt += "\n- user.get_preferences: For checking user preferences to personalize responses";
        // Add how to handle uncertainty
        prompt += "\n\nWhen uncertain, be honest about your limitations. If you need more information from the user's memory, use the retrieval tool rather than guessing.";
        // Add cultural context based on region
        if (context.region === 'cn') {
            prompt += "\n\n请注意文化背景，使用符合中国用户习惯的表达方式和举例。";
        }
        // Add data privacy and security guidelines
        prompt += "\n\nNever share user data between conversations unless explicitly referenced by the user. Prioritize the user's privacy and security at all times.";
        return prompt;
    }
}
exports.systemPromptManager = new SystemPromptManager();
