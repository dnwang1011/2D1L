/**
 * Redis Client Wrapper for 2dots1line V4
 * Provides caching, pub/sub, and rate limiting capabilities
 */

import Redis, { RedisOptions, Redis as RedisClient, Cluster } from 'ioredis';

export interface RedisConfig extends RedisOptions {
  uri?: string;
  clusterNodes?: { host: string; port: number }[];
  useCluster?: boolean;
  keyPrefix?: string;
  enableTelemetry?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Partial<RedisConfig> = {
  retryStrategy: (times: number) => Math.min(times * 100, 3000), // Max 3 seconds
  keyPrefix: '2dots1linev4:',
  enableTelemetry: true,
};

// Cache TTL defaults (in seconds)
export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
};

export class RedisClientWrapper {
  private static instance: RedisClient | Cluster | null = null;
  private static config: RedisConfig | null = null;
  private static isConnected: boolean = false;
  private static lastError: Error | null = null;
  private static connectionPromise: Promise<void> | null = null;

  /**
   * Initialize the Redis client with the provided configuration
   * This must be called before using any other methods
   */
  public static async initialize(config: RedisConfig): Promise<void> {
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
  private static async connect(): Promise<void> {
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
        this.instance = new Redis.Cluster(this.config.clusterNodes, {
          redisOptions: this.config,
        });
        console.info(`Connecting to Redis Cluster with ${this.config.clusterNodes.length} nodes`);
      } else if (this.config.uri) {
        // Create client from URI
        this.instance = new Redis(this.config.uri, this.config);
        console.info(`Connecting to Redis at ${this.config.uri}`);
      } else {
        // Create client from options
        this.instance = new Redis(this.config);
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
    } catch (error) {
      this.isConnected = false;
      this.lastError = error as Error;
      this.instance = null;
      
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for telemetry and error handling
   */
  private static setupEventListeners(): void {
    if (!this.instance) return;

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
  private static async verifyConnection(): Promise<void> {
    if (!this.instance) {
      throw new Error('Redis client not initialized');
    }

    await this.instance.ping();
  }

  /**
   * Close the Redis connection
   */
  public static async close(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.quit();
        this.isConnected = false;
        this.instance = null;
        console.info('Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
        throw error;
      }
    }
  }

  /**
   * Get the Redis client instance
   */
  public static getClient(): RedisClient | Cluster {
    if (!this.instance) {
      throw new Error('Redis client not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Check the health of the Redis connection
   */
  public static async healthCheck(): Promise<{ 
    healthy: boolean;
    error: string | null;
    latency?: number;
    usedMemory?: string;
    cacheHits?: number;
    cacheMisses?: number;
  }> {
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
      } catch (e) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { healthy: false, error: errorMessage };
    }
  }
  
  /**
   * Helper to parse info response from Redis
   */
  private static parseInfoValue(info: string, key: string): string | undefined {
    const regex = new RegExp(`^${key}:(.*)$`, 'm');
    const match = info.match(regex);
    return match?.[1]?.trim();
  }

  /**
   * Cache a value with optional TTL
   */
  public static async set(
    key: string, 
    value: string | number | Buffer | object,
    options?: {
      ttl?: number; // seconds
      keepTTL?: boolean;
      onlyIfNotExists?: boolean;
      onlyIfExists?: boolean; // Be mindful: NX and XX are mutually exclusive
    }
  ): Promise<string | null> {
    const client = this.getClient();
    
    const valueToStore = typeof value === 'object' && !Buffer.isBuffer(value) 
      ? JSON.stringify(value) 
      : value;
      
    const commandArgs: (string | number | Buffer)[] = [key, valueToStore];

    if (options?.ttl) {
      commandArgs.push('EX', options.ttl);
    } else if (options?.keepTTL) {
      commandArgs.push('KEEPTTL');
    }

    // Ensure NX and XX are not used simultaneously if that's a concern
    // For now, this logic will add NX if onlyIfNotExists is true,
    // then potentially XX if onlyIfExists is true and onlyIfNotExists was false.
    // Redis itself will error if both NX and XX are sent.
    // A stricter options validation or logic might be needed depending on desired behavior.
    if (options?.onlyIfNotExists) {
      commandArgs.push('NX');
    } else if (options?.onlyIfExists) { // This else-if ensures they are mutually exclusive in application logic
      commandArgs.push('XX');
    }
    
    // Using type assertion as client.set has many overloads
    // @ts-ignore // Can use ts-ignore if type assertion is still tricky for complex overloads
    return client.set(...commandArgs as [string, string | Buffer | number, ...any[]]);
  }

  /**
   * Retrieve a value from cache
   */
  public static async get<T = any>(key: string, parseJson: boolean = true): Promise<T | null> {
    const client = this.getClient();
    const value = await client.get(key);
    
    if (value === null) {
      return null;
    }
    
    if (parseJson) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        // Not JSON, return as is
        return value as unknown as T;
      }
    }
    
    return value as unknown as T;
  }

  /**
   * Delete one or more keys
   */
  public static async delete(...keys: string[]): Promise<number> {
    const client = this.getClient();
    return client.del(...keys);
  }

  /**
   * Check if a key exists
   */
  public static async exists(...keys: string[]): Promise<number> {
    const client = this.getClient();
    return client.exists(...keys);
  }

  /**
   * Get the TTL of a key in seconds
   */
  public static async ttl(key: string): Promise<number> {
    const client = this.getClient();
    return client.ttl(key);
  }
  
  /**
   * Implement a distributed rate limiter using Redis
   * Returns true if the action should be allowed, false if it should be rate limited
   */
  public static async rateLimit(
    key: string,
    options: {
      maxRequests: number;
      windowSizeInSeconds: number;
    }
  ): Promise<{
    allowed: boolean;
    current: number;
    remaining: number;
    resetInSeconds: number;
  }> {
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
  public static async acquireLock(
    lockName: string,
    ttlMs: number,
    retryOptions?: {
      retryCount?: number;
      retryDelayMs?: number;
    }
  ): Promise<string | null> {
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
  public static async releaseLock(lockName: string, token: string): Promise<boolean> {
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
  public static async queueJob<T = any>(
    queueName: string,
    jobData: T,
    options?: {
      delaySeconds?: number;
      priority?: number;
      ttlSeconds?: number;
    }
  ): Promise<string> {
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
    } else {
      await client.lpush(queueKey, jobId);
    }
    
    return jobId;
  }
  
  /**
   * Get the next job from a queue
   */
  public static async dequeueJob<T = any>(
    queueName: string,
    options?: {
      visibilityTimeoutSeconds?: number;
    }
  ): Promise<{ id: string; data: T } | null> {
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
      await client.set(
        `job:${queueName}:${jobId}:processing`,
        Date.now().toString(),
        'EX',
        options.visibilityTimeoutSeconds
      );
    }
    
    return {
      id: jobId,
      data: jobData.data
    };
  }
  
  /**
   * Reset the Redis client (useful for testing)
   */
  public static reset(): void {
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

// Export the client wrapper and utilities
export const redisClient = RedisClientWrapper; 