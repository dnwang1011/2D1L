"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemPromptManager = void 0;
var fs = require("fs");
var path = require("path");
var logger_1 = require("../utils/logger");
var SystemPromptManager = /** @class */ (function () {
    function SystemPromptManager() {
        this.basePrompts = {};
        try {
            var promptsPath = path.join(__dirname, 'common.prompts.json');
            var promptsContent = fs.readFileSync(promptsPath, 'utf-8');
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
    SystemPromptManager.prototype.generateSystemPrompt = function (context) {
        // Get region-specific base prompt or fallback to generic one
        var regionKey = "system_base_".concat(context.region);
        var prompt = this.basePrompts[regionKey] || this.basePrompts.system_base;
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
            prompt += "\n\nThe user has shown interest in: ".concat(context.knownInterests.join(', '), ".");
        }
        // Add recency context
        if (context.lastInteractionTimeMs) {
            var daysSinceLastInteraction = Math.floor((Date.now() - context.lastInteractionTimeMs) / (1000 * 60 * 60 * 24));
            if (daysSinceLastInteraction > 14) {
                prompt += "\n\nIt has been ".concat(daysSinceLastInteraction, " days since your last conversation.");
            }
        }
        // Add recent topics for continuity
        if (context.recentTopics && context.recentTopics.length > 0) {
            prompt += "\n\nIn recent conversations, you've discussed: ".concat(context.recentTopics.join(', '), ".");
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
    };
    return SystemPromptManager;
}());
exports.systemPromptManager = new SystemPromptManager();
