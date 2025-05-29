"use strict";
/**
 * Database Configuration Loader for 2dots1line V4
 * Loads database configuration from environment variables
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
exports.loadDatabaseConfig = loadDatabaseConfig;
exports.initializeDatabases = initializeDatabases;
exports.checkDatabasesHealth = checkDatabasesHealth;
exports.closeDatabases = closeDatabases;
/**
 * Load database configuration from environment variables
 */
function loadDatabaseConfig() {
    const config = {
        prisma: {
            url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/2dots1linev4',
            logLevel: (process.env.PRISMA_LOG_LEVEL || 'info'),
        },
        neo4j: {
            uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            username: process.env.NEO4J_USERNAME || 'neo4j',
            password: process.env.NEO4J_PASSWORD || 'password',
            database: process.env.NEO4J_DATABASE || '2dots1linev4',
        },
        weaviate: {
            scheme: process.env.WEAVIATE_SCHEME || 'http',
            host: process.env.WEAVIATE_HOST || 'localhost:8080',
            apiKey: process.env.WEAVIATE_API_KEY,
        },
        redis: {
            uri: process.env.REDIS_URI,
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
            password: process.env.REDIS_PASSWORD,
            keyPrefix: process.env.REDIS_KEY_PREFIX || '2dots1linev4:',
            db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
        },
    };
    // Configure cluster mode for Redis if nodes are specified
    if (process.env.REDIS_CLUSTER_NODES) {
        // Format: host1:port1,host2:port2
        const clusterNodesStr = process.env.REDIS_CLUSTER_NODES;
        const nodeEntries = clusterNodesStr.split(',');
        config.redis.useCluster = true;
        config.redis.clusterNodes = nodeEntries.map(nodeEntry => {
            const [host, portStr] = nodeEntry.split(':');
            return {
                host,
                port: parseInt(portStr, 10),
            };
        });
    }
    return config;
}
/**
 * Initialize all database clients with the provided configuration
 */
async function initializeDatabases(config = loadDatabaseConfig()) {
    try {
        // Import clients dynamically to avoid circular dependencies
        const { PrismaClientWrapper } = await Promise.resolve().then(() => __importStar(require('./prisma')));
        const { neo4jDriver } = await Promise.resolve().then(() => __importStar(require('./neo4j')));
        const { weaviateClient } = await Promise.resolve().then(() => __importStar(require('./weaviate')));
        const { redisClient } = await Promise.resolve().then(() => __importStar(require('./redis')));
        // No explicit initialization needed for Prisma - it initializes on first use
        console.info('PrismaClient will initialize on first use');
        // Initialize Neo4j
        await neo4jDriver.initialize(config.neo4j);
        console.info('Neo4j connection initialized');
        // Initialize Weaviate
        weaviateClient.initialize(config.weaviate);
        await weaviateClient.checkConnection();
        console.info('Weaviate connection initialized');
        // Initialize Redis
        await redisClient.initialize(config.redis);
        console.info('Redis connection initialized');
    }
    catch (error) {
        console.error('Failed to initialize database connections:', error);
        throw error;
    }
}
/**
 * Check the health of all database connections
 */
async function checkDatabasesHealth() {
    try {
        // Import clients dynamically to avoid circular dependencies
        const { prismaHealthCheck } = await Promise.resolve().then(() => __importStar(require('./prisma')));
        const { neo4jDriver } = await Promise.resolve().then(() => __importStar(require('./neo4j')));
        const { weaviateClient } = await Promise.resolve().then(() => __importStar(require('./weaviate')));
        const { redisClient } = await Promise.resolve().then(() => __importStar(require('./redis')));
        // Run health checks in parallel
        const [prismaHealth, neo4jHealth, weaviateHealth, redisHealth] = await Promise.all([
            prismaHealthCheck(),
            neo4jDriver.healthCheck(),
            weaviateClient.healthCheck(),
            redisClient.healthCheck(),
        ]);
        return {
            prisma: prismaHealth,
            neo4j: neo4jHealth,
            weaviate: weaviateHealth,
            redis: redisHealth,
        };
    }
    catch (error) {
        console.error('Error checking database health:', error);
        throw error;
    }
}
/**
 * Close all database connections
 */
async function closeDatabases() {
    try {
        // Import clients dynamically to avoid circular dependencies
        const { disconnectPrisma } = await Promise.resolve().then(() => __importStar(require('./prisma')));
        const { neo4jDriver } = await Promise.resolve().then(() => __importStar(require('./neo4j')));
        const { redisClient } = await Promise.resolve().then(() => __importStar(require('./redis')));
        // Close connections in parallel
        await Promise.all([
            disconnectPrisma(),
            neo4jDriver.close(),
            redisClient.close(),
        ]);
        console.info('All database connections closed');
    }
    catch (error) {
        console.error('Error closing database connections:', error);
        throw error;
    }
}
//# sourceMappingURL=config.js.map