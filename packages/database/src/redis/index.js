"use strict";
/**
 * Redis Client Wrapper for 2dots1line V4
 * Provides caching, pub/sub, and rate limiting capabilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.RedisClientWrapper = exports.TTL = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Default configuration
const DEFAULT_CONFIG = {
    retryStrategy: (times) => Math.min(times * 100, 3000), // Max 3 seconds
    keyPrefix: '2dots1linev4:',
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
     * This must be called before using any other methods
     */
    static async initialize(config) {
        // Store configuration for potential reconnection
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        // Create and connect client
        await this.connect();
    }
    /**
     * Connect to Redis
     */
    static async connect() {
        if (!this.config) {
            throw new Error('Redis client not initialized. Call initialize() first.');
        }
        // Close any existing connection
        await this.close();
        try {
            console.info('Connecting to Redis...');
            const startTime = Date.now();
            // Create new client instance based on configuration
            if (this.config.useCluster && this.config.clusterNodes) {
                // Create cluster client
                this.instance = new ioredis_1.default.Cluster(this.config.clusterNodes, {
                    redisOptions: this.config,
                });
                console.info(`Connecting to Redis Cluster with ${this.config.clusterNodes.length} nodes`);
            }
            else if (this.config.uri) {
                // Create client from URI
                this.instance = new ioredis_1.default(this.config.uri, this.config);
                console.info(`Connecting to Redis at ${this.config.uri}`);
            }
            else {
                // Create client from options
                this.instance = new ioredis_1.default(this.config);
                console.info(`Connecting to Redis at ${this.config.host || 'localhost'}:${this.config.port || 6379}`);
            }
            // Set up event listeners
            this.setupEventListeners();
            // Verify connection by running a simple command
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
        // Monitor command execution time if telemetry is enabled
        if (this.config?.enableTelemetry) {
            // Unfortunately, there's no native event for command execution time in ioredis
            // Here we could patch the internal command execution if needed
        }
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
            // Check connection with PING
            const startTime = Date.now();
            await this.instance.ping();
            const latency = Date.now() - startTime;
            // Gather additional metrics if available
            let info;
            try {
                info = await this.instance.info();
            }
            catch (e) {
                // Ignore error, info is optional
            }
            // Parse info response
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
        const client = this.getClient();
        const valueToStore = typeof value === 'object' && !Buffer.isBuffer(value)
            ? JSON.stringify(value)
            : value;
        const commandArgs = [key, valueToStore];
        if (options?.ttl) {
            commandArgs.push('EX', options.ttl);
        }
        else if (options?.keepTTL) {
            commandArgs.push('KEEPTTL');
        }
        // Ensure NX and XX are not used simultaneously if that's a concern
        // For now, this logic will add NX if onlyIfNotExists is true,
        // then potentially XX if onlyIfExists is true and onlyIfNotExists was false.
        // Redis itself will error if both NX and XX are sent.
        // A stricter options validation or logic might be needed depending on desired behavior.
        if (options?.onlyIfNotExists) {
            commandArgs.push('NX');
        }
        else if (options?.onlyIfExists) { // This else-if ensures they are mutually exclusive in application logic
            commandArgs.push('XX');
        }
        // Using type assertion as client.set has many overloads
        // @ts-ignore // Can use ts-ignore if type assertion is still tricky for complex overloads
        return client.set(...commandArgs);
    }
    /**
     * Retrieve a value from cache
     */
    static async get(key, parseJson = true) {
        const client = this.getClient();
        const value = await client.get(key);
        if (value === null) {
            return null;
        }
        if (parseJson) {
            try {
                return JSON.parse(value);
            }
            catch (e) {
                // Not JSON, return as is
                return value;
            }
        }
        return value;
    }
    /**
     * Delete one or more keys
     */
    static async delete(...keys) {
        const client = this.getClient();
        return client.del(...keys);
    }
    /**
     * Check if a key exists
     */
    static async exists(...keys) {
        const client = this.getClient();
        return client.exists(...keys);
    }
    /**
     * Get the TTL of a key in seconds
     */
    static async ttl(key) {
        const client = this.getClient();
        return client.ttl(key);
    }
    /**
     * Implement a distributed rate limiter using Redis
     * Returns true if the action should be allowed, false if it should be rate limited
     */
    static async rateLimit(key, options) {
        const client = this.getClient();
        const { maxRequests, windowSizeInSeconds } = options;
        // Get current window
        const currentTimestampSec = Math.floor(Date.now() / 1000);
        const windowStartTimestamp = currentTimestampSec - (currentTimestampSec % windowSizeInSeconds);
        const windowKey = `${key}:${windowStartTimestamp}`;
        // Atomic increment operation
        const current = await client.incr(windowKey);
        // Set the key to expire at the end of the window if it's new
        if (current === 1) {
            await client.expire(windowKey, windowSizeInSeconds);
        }
        // Calculate response
        const allowed = current <= maxRequests;
        const remaining = Math.max(0, maxRequests - current);
        const resetInSeconds = windowSizeInSeconds - (currentTimestampSec % windowSizeInSeconds);
        return {
            allowed,
            current,
            remaining,
            resetInSeconds
        };
    }
    /**
     * Implement a simple distributed lock with Redis
     */
    static async acquireLock(lockName, ttlMs, retryOptions) {
        const client = this.getClient();
        // Generate a unique token for this lock acquisition
        const token = Date.now().toString() + Math.random().toString().substring(2);
        const lockKey = `lock:${lockName}`;
        // First attempt without retry
        const acquired = await client.set(lockKey, token, 'PX', ttlMs, 'NX');
        if (acquired === 'OK') {
            return token; // Lock acquired
        }
        // Retry if options provided
        if (retryOptions && retryOptions.retryCount && retryOptions.retryCount > 0) {
            const { retryCount, retryDelayMs = 100 } = retryOptions;
            for (let i = 0; i < retryCount; i++) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                // Try to acquire the lock again
                const acquired = await client.set(lockKey, token, 'PX', ttlMs, 'NX');
                if (acquired === 'OK') {
                    return token; // Lock acquired
                }
            }
        }
        return null; // Failed to acquire lock
    }
    /**
     * Release a distributed lock
     */
    static async releaseLock(lockName, token) {
        const client = this.getClient();
        const lockKey = `lock:${lockName}`;
        // Only release the lock if it's still ours (check-and-set)
        const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;
        const result = await client.eval(script, 1, lockKey, token);
        return result === 1;
    }
    /**
     * Queue a job with optional delay
     */
    static async queueJob(queueName, jobData, options) {
        const client = this.getClient();
        const jobId = Date.now().toString() + Math.random().toString().substring(2);
        const queueKey = `queue:${queueName}`;
        // Store job data
        const jobKey = `job:${queueName}:${jobId}`;
        await client.set(jobKey, JSON.stringify({
            id: jobId,
            data: jobData,
            status: 'pending',
            createdAt: Date.now(),
            priority: options?.priority || 0
        }));
        // Set TTL if provided
        if (options?.ttlSeconds) {
            await client.expire(jobKey, options.ttlSeconds);
        }
        // Add to queue with optional delay
        if (options?.delaySeconds) {
            const delayedQueueKey = `queue:${queueName}:delayed`;
            const processAt = Date.now() + (options.delaySeconds * 1000);
            await client.zadd(delayedQueueKey, processAt, jobId);
        }
        else {
            await client.lpush(queueKey, jobId);
        }
        return jobId;
    }
    /**
     * Get the next job from a queue
     */
    static async dequeueJob(queueName, options) {
        const client = this.getClient();
        const queueKey = `queue:${queueName}`;
        // Get the next job ID from the queue
        const jobId = await client.rpop(queueKey);
        if (!jobId) {
            return null;
        }
        // Get the job data
        const jobKey = `job:${queueName}:${jobId}`;
        const jobDataStr = await client.get(jobKey);
        if (!jobDataStr) {
            return null; // Job was deleted or expired
        }
        const jobData = JSON.parse(jobDataStr);
        // Set visibility timeout if needed
        if (options?.visibilityTimeoutSeconds) {
            await client.set(`job:${queueName}:${jobId}:processing`, Date.now().toString(), 'EX', options.visibilityTimeoutSeconds);
        }
        return {
            id: jobId,
            data: jobData.data
        };
    }
    /**
     * Reset the Redis client (useful for testing)
     */
    static reset() {
        if (this.instance) {
            // Don't wait for the promise - just trigger the close
            this.instance.quit().catch(err => console.error('Error quitting Redis:', err));
        }
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
// Export the client wrapper and utilities
exports.redisClient = RedisClientWrapper;
//# sourceMappingURL=index.js.map