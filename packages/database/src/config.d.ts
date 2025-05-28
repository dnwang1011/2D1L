/**
 * Database Configuration Loader for 2dots1line V4
 * Loads database configuration from environment variables
 */
import { RedisConfig } from './redis';
import { Neo4jConfig } from './neo4j';
import { WeaviateConfig } from './weaviate';
interface DatabaseConfig {
    prisma: {
        url: string;
        logLevel?: 'info' | 'query' | 'warn' | 'error';
    };
    neo4j: Neo4jConfig;
    weaviate: WeaviateConfig;
    redis: RedisConfig;
}
/**
 * Load database configuration from environment variables
 */
export declare function loadDatabaseConfig(): DatabaseConfig;
/**
 * Initialize all database clients with the provided configuration
 */
export declare function initializeDatabases(config?: DatabaseConfig): Promise<void>;
/**
 * Check the health of all database connections
 */
export declare function checkDatabasesHealth(): Promise<Record<string, {
    healthy: boolean;
    error?: string | null;
    latency?: number;
}>>;
/**
 * Close all database connections
 */
export declare function closeDatabases(): Promise<void>;
export type { DatabaseConfig };
//# sourceMappingURL=config.d.ts.map