// src/services/ai.service.js
// Service acting as a facade for AI operations, delegating to a specific provider.

// const GeminiProvider = require('../providers/GeminiProvider'); // No longer directly instantiating here
const { getAIProvider, initializeAIProvider } = require('../config/aiServiceInitializer'); // Import the new initializer
const logger = require('../utils/logger').childLogger('AI_Service_Facade');
const { handleServiceError, ServiceError } = require('../utils/errorHandler');
// const aiConfig = require('../../config/ai.config'); // May not be needed directly here anymore
// const serviceConfig = require('../../config/service.config'); // Config is handled by initializer

// The initializeAIService function from this module is now handled by aiServiceInitializer.js
// It should be called once at application startup.

// Facade functions will now get the provider from the initializer
function getInitializedProvider() {
    const provider = getAIProvider();
    if (!provider || !provider.initialized) {
        logger.error('AI Provider not available or not initialized. This should have been handled at startup.');
        // This error indicates a problem with the application's startup sequence.
        throw new ServiceError('AI Service is critically uninitialized. Please check server logs.', 503);
    }
    return provider;
}

async function sendMessage(userId, sessionId, message, options = {}) {
    try {
        const provider = getInitializedProvider();
        return await provider.sendMessage(userId, sessionId, message, options);
    } catch (error) {
        // If it's our ServiceError from getInitializedProvider, rethrow
        if (error instanceof ServiceError && error.statusCode === 503) throw error;
        // Otherwise, log and return a standard error structure
        logger.error(`AI Service sendMessage failed: ${error.message}`, { stack: error.stack });
        // handleServiceError(error, 'AI Service Facade sendMessage'); // Provider should handle its own errors
        return { success: false, text: null, error: error.message || 'Failed to send message via AI Service' };
    }
}

async function analyzeImage({ userId, sessionId, file, userMessage }) {
    try {
        const provider = getInitializedProvider();
        return await provider.analyzeImage({ userId, sessionId, file, userMessage });
    } catch (error) {
        if (error instanceof ServiceError && error.statusCode === 503) throw error;
        logger.error(`AI Service analyzeImage failed: ${error.message}`, { stack: error.stack });
        return { success: false, text: null, error: error.message || 'Failed to analyze image via AI Service' };
    }
}

async function generateEmbeddings(content) {
    try {
        const provider = getInitializedProvider();
        return await provider.generateEmbeddings(content);
    } catch (error) {
        if (error instanceof ServiceError && error.statusCode === 503) throw error;
        logger.error(`AI Service generateEmbeddings failed: ${error.message}`, { stack: error.stack });
        return null; // Provider returns null on error, maintaining consistency
    }
}

async function getCompletion(prompt) {
    try {
        const provider = getInitializedProvider();
        return await provider.getCompletion(prompt);
    } catch (error) {
        if (error instanceof ServiceError && error.statusCode === 503) throw error;
        logger.error(`AI Service getCompletion failed: ${error.message}`, { stack: error.stack });
        return null; // Provider returns null on error, maintaining consistency
    }
}

module.exports = {
    // Expose initializeAIProvider so it can be called at startup
    initializeAIProvider,
    sendMessage,
    analyzeImage,
    generateEmbeddings,
    getCompletion,
    // Expose getAIProvider for components that might need direct access (e.g., MemoryManager for importance scoring)
    // Though they should also check for provider.initialized
    getAIProvider 
}; 