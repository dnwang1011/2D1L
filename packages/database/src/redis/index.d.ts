/**
 * Redis Client Wrapper for 2dots1line V7
 * Provides caching, pub/sub, and rate limiting capabilities
 */
import IORedis, { Cluster } from 'ioredis';
export interface RedisConfig {
    uri?: string;
    host?: string;
    port?: number;
    password?: string;
    keyPrefix?: string;
    db?: number;
    useCluster?: boolean;
    clusterNodes?: Array<{
        host: string;
        port: number;
    }>;
    retryStrategy?: (times: number) => number;
    enableTelemetry?: boolean;
}
export interface CacheOptions {
    ttl?: number;
    nx?: boolean;
}
export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}
export interface LockOptions {
    retryDelay?: number;
    retryCount?: number;
}
export interface QueueOptions {
    priority?: number;
    delay?: number;
}
export interface HealthCheckResult {
    healthy: boolean;
    error?: string | null;
    latency?: number;
    usedMemory?: string;
    cacheHits?: number;
    cacheMisses?: number;
}
export declare const TTL: {
    SHORT: number;
    MEDIUM: number;
    LONG: number;
    VERY_LONG: number;
};
export declare class RedisClientWrapper {
    private static instance;
    private static config;
    private static isConnected;
    private static lastError;
    private static connectionPromise;
    /**
     * Initialize the Redis client with the provided configuration
     */
    static initialize(config: RedisConfig): Promise<void>;
    /**
     * Connect to Redis
     */
    static connect(): Promise<void>;
    /**
     * Setup event listeners for telemetry and error handling
     */
    private static setupEventListeners;
    /**
     * Verify connection by running a simple command
     */
    private static verifyConnection;
    /**
     * Close the Redis connection
     */
    static close(): Promise<void>;
    /**
     * Get the Redis client instance
     */
    static getClient(): IORedis | Cluster;
    /**
     * Check the health of the Redis connection
     */
    static healthCheck(): Promise<HealthCheckResult>;
    /**
     * Helper to parse info response from Redis
     */
    private static parseInfoValue;
    /**
     * Cache a value with optional TTL
     */
    static set(key: string, value: any, options?: CacheOptions): Promise<void>;
    /**
     * Get a cached value
     */
    static get<T = any>(key: string, parseJson?: boolean): Promise<T | null>;
    /**
     * Delete keys
     */
    static delete(...keys: string[]): Promise<number>;
    /**
     * Check if keys exist
     */
    static exists(...keys: string[]): Promise<number>;
    /**
     * Get TTL for a key
     */
    static ttl(key: string): Promise<number>;
    /**
     * Reset client (for testing)
     */
    static reset(): void;
}
export declare const redisClient: typeof RedisClientWrapper;
//# sourceMappingURL=index.d.ts.map