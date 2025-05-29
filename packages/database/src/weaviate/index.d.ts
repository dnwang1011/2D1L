/**
 * Weaviate Client Wrapper for 2dots1line V4
 * Provides vector database operations with error handling and retry capabilities
 */
import { WeaviateClient } from 'weaviate-ts-client';
interface WeaviateConfig {
    scheme: string;
    host: string;
    apiKey?: string;
    headers?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
}
export interface WeaviateSearchResult<T> {
    data: {
        Get: {
            [className: string]: T[];
        };
    };
}
declare class WeaviateClientWrapper {
    private static instance;
    private static config;
    private static isConnected;
    private static lastError;
    /**
     * Initialize the Weaviate client with configuration
     * Must be called before using any client methods
     */
    static initialize(config: WeaviateConfig): void;
    /**
     * Get the Weaviate client instance
     * Will throw if the client hasn't been initialized
     */
    static getClient(): WeaviateClient;
    /**
     * Check the connection to Weaviate with retries
     */
    static checkConnection(retries?: number, delay?: number): Promise<boolean>;
    /**
     * Check the health of the Weaviate connection
     */
    static healthCheck(): Promise<{
        healthy: boolean;
        error: string | null;
        latency?: number;
        version?: string;
    }>;
    /**
     * Helper to perform vector search with automatic retries
     */
    static vectorSearch<T = any>(className: string, vectorQuery: number[], options?: {
        limit?: number;
        offset?: number;
        fields?: string[];
        where?: Record<string, any>;
        withDistance?: boolean;
        nearVector?: {
            vector: number[];
            certainty?: number;
        };
        nearText?: {
            concepts: string | string[];
            certainty?: number;
        };
        retries?: number;
    }): Promise<T[]>;
    /**
     * Reset the client instance (useful for testing)
     */
    static reset(): void;
    /**
     * Create a schema class in Weaviate
     */
    static createSchemaClass(classConfig: any): Promise<void>;
    /**
     * Batch import objects into Weaviate with automatic batching
     */
    static batchImport<T extends Record<string, any>>(className: string, objects: T[], options?: {
        batchSize?: number;
        retries?: number;
        vectorizer?: string;
    }): Promise<void>;
}
export declare const weaviateClient: typeof WeaviateClientWrapper;
export type { WeaviateConfig };
//# sourceMappingURL=index.d.ts.map