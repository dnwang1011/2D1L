"use strict";
/**
 * Redis Client Wrapper for 2dots1line V7
 * Provides caching, pub/sub, and rate limiting capabilities
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.RedisClientWrapper = exports.TTL = void 0;
const ioredis_1 = __importStar(require("ioredis"));
// Default configuration
const DEFAULT_CONFIG = {
    retryStrategy: (times) => Math.min(times * 100, 3000), // Max 3 seconds
    keyPrefix: '2dots1linev7:',
    enableTelemetry: true,
};
// Cache TTL defaults (in seconds)
exports.TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 1 day
};
class RedisClientWrapper {
    /**
     * Initialize the Redis client with the provided configuration
     */
    static async initialize(config) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        await this.connect();
    }
    /**
     * Connect to Redis
     */
    static async connect() {
        if (!this.config) {
            throw new Error('Redis client not initialized. Call initialize() first.');
        }
        await this.close();
        try {
            console.info('Connecting to Redis...');
            const startTime = Date.now();
            if (this.config.useCluster && this.config.clusterNodes) {
                this.instance = new ioredis_1.Cluster(this.config.clusterNodes, {
                    redisOptions: this.config,
                });
                console.info(`Connecting to Redis Cluster with ${this.config.clusterNodes.length} nodes`);
            }
            else if (this.config.uri) {
                this.instance = new ioredis_1.default(this.config.uri, this.config);
                console.info(`Connecting to Redis at ${this.config.uri}`);
            }
            else {
                this.instance = new ioredis_1.default(this.config);
                console.info(`Connecting to Redis at ${this.config.host || 'localhost'}:${this.config.port || 6379}`);
            }
            this.setupEventListeners();
            this.connectionPromise = this.verifyConnection();
            await this.connectionPromise;
            const duration = Date.now() - startTime;
            this.isConnected = true;
            this.lastError = null;
            console.info(`Connected to Redis in ${duration}ms`);
        }
        catch (error) {
            this.isConnected = false;
            this.lastError = error;
            this.instance = null;
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    /**
     * Setup event listeners for telemetry and error handling
     */
    static setupEventListeners() {
        if (!this.instance)
            return;
        this.instance.on('error', (err) => {
            console.error('Redis client error:', err);
            this.lastError = err;
            this.isConnected = false;
        });
        this.instance.on('ready', () => {
            console.info('Redis client ready');
            this.isConnected = true;
        });
        this.instance.on('reconnecting', () => {
            console.info('Redis client reconnecting...');
            this.isConnected = false;
        });
        this.instance.on('end', () => {
            console.info('Redis connection closed');
            this.isConnected = false;
        });
    }
    /**
     * Verify connection by running a simple command
     */
    static async verifyConnection() {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        await this.instance.ping();
    }
    /**
     * Close the Redis connection
     */
    static async close() {
        if (this.instance) {
            try {
                await this.instance.quit();
                this.isConnected = false;
                this.instance = null;
                console.info('Redis connection closed');
            }
            catch (error) {
                console.error('Error closing Redis connection:', error);
                throw error;
            }
        }
    }
    /**
     * Get the Redis client instance
     */
    static getClient() {
        if (!this.instance) {
            throw new Error('Redis client not initialized. Call initialize() first.');
        }
        return this.instance;
    }
    /**
     * Check the health of the Redis connection
     */
    static async healthCheck() {
        if (!this.instance) {
            return { healthy: false, error: 'Redis client not initialized' };
        }
        try {
            const startTime = Date.now();
            await this.instance.ping();
            const latency = Date.now() - startTime;
            let info;
            try {
                info = await this.instance.info();
            }
            catch (e) {
                // Ignore error, info is optional
            }
            const usedMemory = info ? this.parseInfoValue(info, 'used_memory_human') : undefined;
            const cacheHits = info ? Number(this.parseInfoValue(info, 'keyspace_hits')) : undefined;
            const cacheMisses = info ? Number(this.parseInfoValue(info, 'keyspace_misses')) : undefined;
            return {
                healthy: true,
                error: null,
                latency,
                usedMemory,
                cacheHits,
                cacheMisses,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { healthy: false, error: errorMessage };
        }
    }
    /**
     * Helper to parse info response from Redis
     */
    static parseInfoValue(info, key) {
        const regex = new RegExp(`^${key}:(.*)$`, 'm');
        const match = info.match(regex);
        return match?.[1]?.trim();
    }
    /**
     * Cache a value with optional TTL
     */
    static async set(key, value, options) {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (options?.ttl) {
            if (options.nx) {
                await this.instance.set(key, serializedValue, 'EX', options.ttl, 'NX');
            }
            else {
                await this.instance.setex(key, options.ttl, serializedValue);
            }
        }
        else {
            if (options?.nx) {
                await this.instance.set(key, serializedValue, 'NX');
            }
            else {
                await this.instance.set(key, serializedValue);
            }
        }
    }
    /**
     * Get a cached value
     */
    static async get(key, parseJson = true) {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        const value = await this.instance.get(key);
        if (value === null)
            return null;
        return parseJson ? JSON.parse(value) : value;
    }
    /**
     * Delete keys
     */
    static async delete(...keys) {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        return await this.instance.del(...keys);
    }
    /**
     * Check if keys exist
     */
    static async exists(...keys) {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        return await this.instance.exists(...keys);
    }
    /**
     * Get TTL for a key
     */
    static async ttl(key) {
        if (!this.instance) {
            throw new Error('Redis client not initialized');
        }
        return await this.instance.ttl(key);
    }
    /**
     * Reset client (for testing)
     */
    static reset() {
        this.instance = null;
        this.config = null;
        this.isConnected = false;
        this.lastError = null;
        this.connectionPromise = null;
    }
}
exports.RedisClientWrapper = RedisClientWrapper;
RedisClientWrapper.instance = null;
RedisClientWrapper.config = null;
RedisClientWrapper.isConnected = false;
RedisClientWrapper.lastError = null;
RedisClientWrapper.connectionPromise = null;
// Export singleton instance
exports.redisClient = RedisClientWrapper;
//# sourceMappingURL=index.js.map