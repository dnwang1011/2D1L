/**
 * Neo4j Client Wrapper for 2dots1line V4
 * Provides connection management and query utilities for Neo4j graph database
 */
import { Driver, Session, Record, QueryResult, Integer, RecordShape } from 'neo4j-driver';
interface Neo4jConfig {
    uri: string;
    username: string;
    password: string;
    database?: string;
    maxConnectionPoolSize?: number;
    maxTransactionRetryTime?: number;
}
/**
 * Neo4j Driver Wrapper provides a singleton pattern for Neo4j driver access
 * with connection management, session handling, and query utilities.
 */
declare class Neo4jDriverWrapper {
    private static instance;
    private static config;
    private static connectionPromise;
    private static lastError;
    private static isConnected;
    private static defaultDatabase;
    /**
     * Initialize the Neo4j driver with the provided configuration
     * This must be called before using any other methods
     */
    static initialize(config: Neo4jConfig): Promise<void>;
    /**
     * Connect to Neo4j database
     */
    private static connect;
    /**
     * Verify connection by running a simple query
     */
    private static verifyConnection;
    /**
     * Close the Neo4j driver connection
     */
    static close(): Promise<void>;
    /**
     * Get the Neo4j driver instance
     * Will throw if the driver hasn't been initialized
     */
    static getDriver(): Driver;
    /**
     * Create a new session
     */
    static getSession(database?: string): Session;
    /**
     * Execute a read query within an auto-managed session
     */
    static executeRead<T extends RecordShape = Record>(cypher: string, params?: any, database?: string): Promise<QueryResult<T>>;
    /**
     * Execute a write query within an auto-managed session
     */
    static executeWrite<T extends RecordShape = Record>(cypher: string, params?: any, database?: string): Promise<QueryResult<T>>;
    /**
     * Check the connection health
     */
    static healthCheck(): Promise<{
        healthy: boolean;
        error: string | null;
        latency?: number;
    }>;
    /**
     * Helper to convert Neo4j integer to JavaScript number
     */
    static toNumber(value: any): number;
    /**
     * Helper to create a Neo4j integer from number
     */
    static toInt(value: number): Integer;
}
export declare function recordToObject<T = any>(record: Record): T;
export declare const neo4jDriver: typeof Neo4jDriverWrapper;
export type { Neo4jConfig };
//# sourceMappingURL=index.d.ts.map