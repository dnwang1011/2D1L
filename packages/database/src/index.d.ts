/**
 * Database Access Layer for 2dots1line V4
 * Provides client wrappers for PostgreSQL, Neo4j, Weaviate, and Redis
 */
import { PrismaClient } from '@prisma/client';
import { Driver } from 'neo4j-driver';
import { WeaviateClient } from 'weaviate-ts-client';
import { Redis as RedisClient } from 'ioredis';
export { loadDatabaseConfig, initializeDatabases, checkDatabasesHealth, closeDatabases, type DatabaseConfig } from './config';
export { prisma, disconnectPrisma, prismaHealthCheck, PrismaClientWrapper } from './prisma';
export { neo4jDriver, recordToObject, type Neo4jConfig } from './neo4j';
export { weaviateClient, type WeaviateConfig, type WeaviateSearchResult } from './weaviate';
export { redisClient, type RedisConfig, TTL, RedisClientWrapper } from './redis';
export { UserRepository, type CreateUserData } from './repositories/user.repository';
export { MemoryRepository, type CreateMemoryUnitData, type CreateChunkData } from './repositories/memory.repository';
export { ConceptRepository, type CreateConceptData, type CreateConceptRelationshipData } from './repositories/concept.repository';
export { GrowthEventRepository, type CreateGrowthEventData } from './repositories/growth-event.repository';
export { CardRepository, type CardData, type CardFilters } from './repositories/card.repository';
export declare class DatabaseService {
    private prismaClient;
    private neo4jDriver;
    private weaviateClient;
    private redisClient;
    constructor();
    get prisma(): PrismaClient;
    get neo4j(): Driver;
    get weaviate(): WeaviateClient;
    get redis(): RedisClient;
    testConnections(): Promise<void>;
    disconnect(): Promise<void>;
    getUserRepository(): any;
    getMemoryRepository(): any;
    getConceptRepository(): any;
    getGrowthEventRepository(): any;
    getCardRepository(): any;
    getPrismaClient(): PrismaClient;
    getNeo4j(): Driver;
    getWeaviate(): WeaviateClient;
    getRedis(): RedisClient;
}
//# sourceMappingURL=index.d.ts.map