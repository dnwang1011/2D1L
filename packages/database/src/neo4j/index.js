"use strict";
/**
 * Neo4j Client Wrapper for 2dots1line V4
 * Provides connection management and query utilities for Neo4j graph database
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neo4jDriver = void 0;
exports.recordToObject = recordToObject;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
// Default configuration can be overridden at initialization
const DEFAULT_CONFIG = {
    maxConnectionPoolSize: 50,
    maxTransactionRetryTime: 30000, // 30 seconds
};
/**
 * Neo4j Driver Wrapper provides a singleton pattern for Neo4j driver access
 * with connection management, session handling, and query utilities.
 */
class Neo4jDriverWrapper {
    /**
     * Initialize the Neo4j driver with the provided configuration
     * This must be called before using any other methods
     */
    static async initialize(config) {
        // Store configuration for potential reconnection
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        this.defaultDatabase = config.database;
        // Create and connect driver
        await this.connect();
    }
    /**
     * Connect to Neo4j database
     */
    static async connect() {
        if (!this.config) {
            throw new Error('Neo4j driver not initialized. Call initialize() first.');
        }
        // Close any existing connection
        await this.close();
        const { uri, username, password, maxConnectionPoolSize, maxTransactionRetryTime } = this.config;
        try {
            console.info(`Connecting to Neo4j at ${uri}`);
            const startTime = Date.now();
            // Create new driver instance
            this.instance = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(username, password), {
                maxConnectionPoolSize,
                maxTransactionRetryTime,
            });
            // Verify connection by running a simple query
            this.connectionPromise = this.verifyConnection();
            await this.connectionPromise;
            const duration = Date.now() - startTime;
            this.isConnected = true;
            this.lastError = null;
            console.info(`Connected to Neo4j in ${duration}ms`);
        }
        catch (error) {
            this.isConnected = false;
            this.lastError = error;
            this.instance = null;
            console.error('Failed to connect to Neo4j:', error);
            throw error;
        }
    }
    /**
     * Verify connection by running a simple query
     */
    static async verifyConnection() {
        if (!this.instance) {
            throw new Error('Neo4j driver not initialized');
        }
        const session = this.instance.session({
            database: this.defaultDatabase,
        });
        try {
            await session.run('RETURN 1 AS test');
        }
        finally {
            await session.close();
        }
    }
    /**
     * Close the Neo4j driver connection
     */
    static async close() {
        if (this.instance) {
            try {
                await this.instance.close();
                this.isConnected = false;
                this.instance = null;
                console.info('Neo4j connection closed');
            }
            catch (error) {
                console.error('Error closing Neo4j connection:', error);
                throw error;
            }
        }
    }
    /**
     * Get the Neo4j driver instance
     * Will throw if the driver hasn't been initialized
     */
    static getDriver() {
        if (!this.instance) {
            throw new Error('Neo4j driver not initialized. Call initialize() first.');
        }
        return this.instance;
    }
    /**
     * Create a new session
     */
    static getSession(database) {
        const driver = this.getDriver();
        return driver.session({
            database: database || this.defaultDatabase,
        });
    }
    /**
     * Execute a read query within an auto-managed session
     */
    static async executeRead(cypher, params, database) {
        const session = this.getSession(database);
        try {
            const startTime = Date.now();
            const result = await session.executeRead(tx => tx.run(cypher, params));
            const duration = Date.now() - startTime;
            // Log query execution time for telemetry
            if (process.env.NODE_ENV === 'development' || process.env.ENABLE_QUERY_LOGGING === 'true') {
                const queryPreview = cypher.length > 500 ? cypher.substring(0, 500) + '...' : cypher;
                console.debug(`[Neo4j Read] ${queryPreview} (${duration}ms)`);
            }
            return result;
        }
        finally {
            await session.close();
        }
    }
    /**
     * Execute a write query within an auto-managed session
     */
    static async executeWrite(cypher, params, database) {
        const session = this.getSession(database);
        try {
            const startTime = Date.now();
            const result = await session.executeWrite(tx => tx.run(cypher, params));
            const duration = Date.now() - startTime;
            // Log query execution time for telemetry
            if (process.env.NODE_ENV === 'development' || process.env.ENABLE_QUERY_LOGGING === 'true') {
                const queryPreview = cypher.length > 500 ? cypher.substring(0, 500) + '...' : cypher;
                console.debug(`[Neo4j Write] ${queryPreview} (${duration}ms)`);
            }
            return result;
        }
        finally {
            await session.close();
        }
    }
    /**
     * Check the connection health
     */
    static async healthCheck() {
        if (!this.instance) {
            return { healthy: false, error: 'Neo4j driver not initialized' };
        }
        const session = this.getSession();
        try {
            const startTime = Date.now();
            await session.run('RETURN 1 AS health');
            const latency = Date.now() - startTime;
            return { healthy: true, error: null, latency };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { healthy: false, error: errorMessage };
        }
        finally {
            await session.close();
        }
    }
    /**
     * Helper to convert Neo4j integer to JavaScript number
     */
    static toNumber(value) {
        return neo4j_driver_1.default.isInt(value) ? value.toNumber() : value;
    }
    /**
     * Helper to create a Neo4j integer from number
     */
    static toInt(value) {
        return neo4j_driver_1.default.int(value);
    }
}
Neo4jDriverWrapper.instance = null;
Neo4jDriverWrapper.config = null;
Neo4jDriverWrapper.connectionPromise = null;
Neo4jDriverWrapper.lastError = null;
Neo4jDriverWrapper.isConnected = false;
// Utility function to transform Neo4j records to plain JavaScript objects
function recordToObject(record) {
    const result = {};
    for (const key of record.keys) {
        const value = record.get(key);
        // Handle Neo4j integers
        if (neo4j_driver_1.default.isInt(value)) {
            result[key] = value.toNumber();
        }
        // Handle Neo4j Node objects
        else if (value && typeof value === 'object' && 'properties' in value) {
            result[key] = {
                ...transformProperties(value.properties),
                _id: Neo4jDriverWrapper.toNumber(value.identity),
                _labels: value.labels,
            };
        }
        // Handle Neo4j Relationship objects
        else if (value && typeof value === 'object' && 'type' in value && 'start' in value && 'end' in value) {
            result[key] = {
                ...transformProperties(value.properties),
                _id: Neo4jDriverWrapper.toNumber(value.identity),
                _type: value.type,
                _startNodeId: Neo4jDriverWrapper.toNumber(value.start),
                _endNodeId: Neo4jDriverWrapper.toNumber(value.end),
            };
        }
        // Handle Neo4j Path objects
        else if (value && typeof value === 'object' && 'start' in value && 'end' in value && 'segments' in value) {
            // Path objects have complex structure, just mapping to plain objects
            result[key] = {
                start: recordToObject(value.start),
                end: recordToObject(value.end),
                segments: value.segments.map((seg) => ({
                    start: recordToObject(seg.start),
                    relationship: recordToObject(seg.relationship),
                    end: recordToObject(seg.end),
                })),
            };
        }
        // Handle other properties
        else {
            result[key] = value;
        }
    }
    return result;
}
// Helper for transforming Neo4j properties
function transformProperties(properties) {
    const result = {};
    for (const key in properties) {
        const value = properties[key];
        if (neo4j_driver_1.default.isInt(value)) {
            result[key] = value.toNumber();
        }
        else if (Array.isArray(value)) {
            result[key] = value.map(item => neo4j_driver_1.default.isInt(item) ? item.toNumber() : item);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
// Export the main wrapper and helper functions
exports.neo4jDriver = Neo4jDriverWrapper;
//# sourceMappingURL=index.js.map