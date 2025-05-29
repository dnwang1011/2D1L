const GeminiProvider = require('../providers/GeminiProvider');
const serviceConfig = require('./service.config'); // Corrected path
const logger = require('../utils/logger').childLogger('AIServiceInitializer');

let aiProviderInstance = null;
let initializationPromise = null;

async function initialize() {
    if (aiProviderInstance && aiProviderInstance.initialized) {
        logger.info('AI Provider already initialized.');
        return aiProviderInstance;
    }

    if (initializationPromise) {
        logger.info('AI Provider initialization already in progress, awaiting completion.');
        return initializationPromise;
    }

    initializationPromise = (async () => {
        const providerName = serviceConfig.ai.defaultProvider;
        logger.info(`Initializing AI Provider: ${providerName}`);
        let provider;

        switch (providerName.toLowerCase()) {
            case 'gemini':
                provider = new GeminiProvider();
                break;
            // Add other providers here if needed
            default:
                logger.error(`Unsupported AI provider specified in config: ${providerName}. Defaulting to Gemini.`);
                provider = new GeminiProvider(); // Fallback, consider throwing an error
        }

        try {
            if (typeof provider.initialize === 'function') {
                await provider.initialize(); // Await the async initialization
            }
            if (provider.initialized) {
                logger.info(`AI Provider (${provider.constructor.name}) initialized successfully.`);
                aiProviderInstance = provider;
                return aiProviderInstance;
            } else {
                logger.error(`AI Provider (${provider.constructor.name}) failed to initialize. Check provider logs.`);
                // Reset so another attempt can be made if desired, or implement more robust error handling/retry for startup
                initializationPromise = null; 
                throw new Error(`AI Provider (${provider.constructor.name}) failed to initialize.`);
            }
        } catch (error) {
            logger.error(`Critical error during AI Provider initialization: ${error.message}`, { stack: error.stack });
            initializationPromise = null;
            // Depending on application requirements, this might be a fatal error that should stop startup.
            throw error; // Re-throw to indicate failure
        }
    })();

    return initializationPromise;
}

function getAIProvider() {
    if (!aiProviderInstance || !aiProviderInstance.initialized) {
        // This case should ideally not be hit frequently if initialize() is called at startup.
        // It indicates the provider isn't ready.
        logger.warn('getAIProvider called before successful initialization or during a failed initialization.');
        // Option 1: Throw error
        // throw new Error('AI Provider is not initialized. Ensure initialize() is called at application startup.');
        // Option 2: Return null (consumers must handle) - current behavior will rely on startup call
        // Option 3: Attempt re-initialization (can lead to issues if called concurrently) - covered by initializationPromise
        if (!initializationPromise) {
            logger.warn('Attempting late initialization of AI Provider. This should ideally occur at startup.');
            // This call to initialize() will use the existing promise if one is in flight, or create a new one.
            // However, the caller of getAIProvider won't be able to await this directly.
            // This makes it crucial that initialize() is called and awaited at startup.
            initialize().catch(err => {
                logger.error('Background AI Provider initialization attempt failed after being called late.', { error: err.message });
            });
        }
        return aiProviderInstance; // Might be null if initialization hasn't completed or failed
    }
    return aiProviderInstance;
}

module.exports = {
    initializeAIProvider: initialize, // Renamed for clarity
    getAIProvider
}; 