/**
 * Database Access Layer for 2dots1line V4
 * Provides client wrappers for PostgreSQL, Neo4j, Weaviate, and Redis
 */

// Export configuration utilities
export { 
  loadDatabaseConfig,
  initializeDatabases,
  checkDatabasesHealth,
  closeDatabases,
  type DatabaseConfig
} from './config';

// Export Prisma client (PostgreSQL)
export { 
  prisma,
  disconnectPrisma,
  prismaHealthCheck,
  PrismaClientWrapper
} from './prisma';

// Export Neo4j client
export {
  neo4jDriver,
  recordToObject,
  type Neo4jConfig
} from './neo4j';

// Export Weaviate client
export {
  weaviateClient,
  type WeaviateConfig,
  type WeaviateSearchResult
} from './weaviate';

// Export Redis client
export {
  redisClient,
  type RedisConfig,
  TTL,
  RedisClientWrapper
} from './redis'; 