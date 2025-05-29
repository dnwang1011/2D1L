"use strict";
/**
 * Database Access Layer for 2dots1line V4
 * Provides client wrappers for PostgreSQL, Neo4j, Weaviate, and Redis
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.CardRepository = exports.GrowthEventRepository = exports.ConceptRepository = exports.MemoryRepository = exports.UserRepository = exports.RedisClientWrapper = exports.TTL = exports.redisClient = exports.weaviateClient = exports.recordToObject = exports.neo4jDriver = exports.PrismaClientWrapper = exports.prismaHealthCheck = exports.disconnectPrisma = exports.prisma = exports.closeDatabases = exports.checkDatabasesHealth = exports.initializeDatabases = exports.loadDatabaseConfig = void 0;
const client_1 = require("@prisma/client");
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const weaviate_ts_client_1 = __importDefault(require("weaviate-ts-client"));
const ioredis_1 = __importDefault(require("ioredis"));
// Export configuration utilities
var config_1 = require("./config");
Object.defineProperty(exports, "loadDatabaseConfig", { enumerable: true, get: function () { return config_1.loadDatabaseConfig; } });
Object.defineProperty(exports, "initializeDatabases", { enumerable: true, get: function () { return config_1.initializeDatabases; } });
Object.defineProperty(exports, "checkDatabasesHealth", { enumerable: true, get: function () { return config_1.checkDatabasesHealth; } });
Object.defineProperty(exports, "closeDatabases", { enumerable: true, get: function () { return config_1.closeDatabases; } });
// Export Prisma client (PostgreSQL)
var prisma_1 = require("./prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
Object.defineProperty(exports, "disconnectPrisma", { enumerable: true, get: function () { return prisma_1.disconnectPrisma; } });
Object.defineProperty(exports, "prismaHealthCheck", { enumerable: true, get: function () { return prisma_1.prismaHealthCheck; } });
Object.defineProperty(exports, "PrismaClientWrapper", { enumerable: true, get: function () { return prisma_1.PrismaClientWrapper; } });
// Export Neo4j client
var neo4j_1 = require("./neo4j");
Object.defineProperty(exports, "neo4jDriver", { enumerable: true, get: function () { return neo4j_1.neo4jDriver; } });
Object.defineProperty(exports, "recordToObject", { enumerable: true, get: function () { return neo4j_1.recordToObject; } });
// Export Weaviate client
var weaviate_1 = require("./weaviate");
Object.defineProperty(exports, "weaviateClient", { enumerable: true, get: function () { return weaviate_1.weaviateClient; } });
// Export Redis client
var redis_1 = require("./redis");
Object.defineProperty(exports, "redisClient", { enumerable: true, get: function () { return redis_1.redisClient; } });
Object.defineProperty(exports, "TTL", { enumerable: true, get: function () { return redis_1.TTL; } });
Object.defineProperty(exports, "RedisClientWrapper", { enumerable: true, get: function () { return redis_1.RedisClientWrapper; } });
// Export repositories
var user_repository_1 = require("./repositories/user.repository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return user_repository_1.UserRepository; } });
var memory_repository_1 = require("./repositories/memory.repository");
Object.defineProperty(exports, "MemoryRepository", { enumerable: true, get: function () { return memory_repository_1.MemoryRepository; } });
var concept_repository_1 = require("./repositories/concept.repository");
Object.defineProperty(exports, "ConceptRepository", { enumerable: true, get: function () { return concept_repository_1.ConceptRepository; } });
var growth_event_repository_1 = require("./repositories/growth-event.repository");
Object.defineProperty(exports, "GrowthEventRepository", { enumerable: true, get: function () { return growth_event_repository_1.GrowthEventRepository; } });
var card_repository_1 = require("./repositories/card.repository");
Object.defineProperty(exports, "CardRepository", { enumerable: true, get: function () { return card_repository_1.CardRepository; } });
// Ensure these environment variables are set in your .env file
const DATABASE_URL = process.env.DATABASE_URL; // Used by Prisma internally
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j://localhost:7688';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password123'; // Default from docker-compose
const WEAVIATE_SCHEME = process.env.WEAVIATE_SCHEME || 'http';
const WEAVIATE_HOST = process.env.WEAVIATE_HOST || 'localhost:8080'; // Default from docker-compose
const REDIS_URL = process.env.REDIS_URL; // E.g., redis://localhost:6379
class DatabaseService {
    constructor() {
        console.log('Initializing DatabaseService...');
        console.log('DATABASE_URL:', DATABASE_URL ? `${DATABASE_URL.substring(0, 20)}...` : 'NOT SET');
        this.prismaClient = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: DATABASE_URL,
                },
            },
            // log: ['query', 'info', 'warn', 'error'], // Optional: for detailed logging
        });
        console.log('PrismaClient configured.');
        this.neo4jDriver = neo4j_driver_1.default.driver(NEO4J_URI, neo4j_driver_1.default.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
        console.log('Neo4j Driver configured.');
        this.weaviateClient = weaviate_ts_client_1.default.client({
            scheme: WEAVIATE_SCHEME,
            host: WEAVIATE_HOST,
            // Can add headers for API keys if Weaviate auth is enabled
        });
        console.log('Weaviate Client configured.');
        if (!REDIS_URL) {
            console.warn('REDIS_URL not provided. Redis client will not be initialized.');
            // Assign a non-functional client or handle appropriately
            this.redisClient = {}; // Or throw error, depending on requirements
        }
        else {
            this.redisClient = new ioredis_1.default(REDIS_URL);
            console.log('Redis Client configured.');
            this.redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
            });
            this.redisClient.on('connect', () => {
                console.log('Redis Client connected.');
            });
        }
        this.testConnections().catch(err => {
            console.error("Failed to connect to one or more databases during initial test:", err);
        });
    }
    get prisma() {
        return this.prismaClient;
    }
    get neo4j() {
        return this.neo4jDriver;
    }
    get weaviate() {
        return this.weaviateClient;
    }
    get redis() {
        if (!this.redisClient || typeof this.redisClient.ping !== 'function') {
            throw new Error('Redis client is not initialized or not functional. Check REDIS_URL.');
        }
        return this.redisClient;
    }
    async testConnections() {
        try {
            await this.prismaClient.$connect();
            console.log('Successfully connected to PostgreSQL (Prisma).');
        }
        catch (error) {
            console.error('Failed to connect to PostgreSQL (Prisma):', error);
            // throw error; // Optional: rethrow if critical for startup
        }
        try {
            await this.neo4jDriver.verifyConnectivity();
            console.log('Successfully connected to Neo4j.');
        }
        catch (error) {
            console.error('Failed to connect to Neo4j:', error);
            // throw error;
        }
        try {
            const isLive = await this.weaviateClient.misc.liveChecker().do();
            console.log('Successfully connected to Weaviate. Live status:', isLive);
        }
        catch (error) {
            console.error('Failed to connect to Weaviate:', error);
            // throw error;
        }
        if (this.redisClient && typeof this.redisClient.ping === 'function') {
            try {
                const pong = await this.redisClient.ping();
                console.log('Successfully connected to Redis (ping response):', pong);
            }
            catch (error) {
                console.error('Failed to connect to Redis:', error);
                // throw error;
            }
        }
        else {
            console.warn('Redis client not initialized, skipping Redis connection test.');
        }
    }
    async disconnect() {
        console.log('Disconnecting DatabaseService...');
        await this.prismaClient.$disconnect();
        console.log('PrismaClient disconnected.');
        await this.neo4jDriver.close();
        console.log('Neo4j Driver closed.');
        // Weaviate client does not have an explicit disconnect method
        if (this.redisClient && typeof this.redisClient.quit === 'function') {
            await this.redisClient.quit();
            console.log('Redis Client disconnected.');
        }
        console.log('DatabaseService disconnected.');
    }
    // Repository factory methods
    getUserRepository() {
        const { UserRepository } = require('./repositories/user.repository');
        return new UserRepository(this);
    }
    getMemoryRepository() {
        const { MemoryRepository } = require('./repositories/memory.repository');
        return new MemoryRepository(this);
    }
    getConceptRepository() {
        const { ConceptRepository } = require('./repositories/concept.repository');
        return new ConceptRepository(this);
    }
    getGrowthEventRepository() {
        const { GrowthEventRepository } = require('./repositories/growth-event.repository');
        return new GrowthEventRepository(this);
    }
    getCardRepository() {
        const { CardRepository } = require('./repositories/card.repository');
        return new CardRepository(this);
    }
    // Direct client access methods
    getPrismaClient() {
        return this.prismaClient;
    }
    getNeo4j() {
        return this.neo4jDriver;
    }
    getWeaviate() {
        return this.weaviateClient;
    }
    getRedis() {
        if (!this.redisClient || typeof this.redisClient.ping !== 'function') {
            throw new Error('Redis client is not initialized or not functional. Check REDIS_URL.');
        }
        return this.redisClient;
    }
}
exports.DatabaseService = DatabaseService;
// Optional: Export a singleton instance
// export const databaseService = new DatabaseService(); 
//# sourceMappingURL=index.js.map