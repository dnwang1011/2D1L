/**
 * PostgreSQL Client Wrapper for 2dots1line V4
 * Provides a singleton pattern for Prisma client access
 */
import { PrismaClient, Prisma } from '@prisma/client';
declare class PrismaClientWrapper {
    private static instance;
    private static connectionPromise;
    private static lastError;
    private static isConnectedFlag;
    /**
     * Get the singleton Prisma client instance
     * Will initialize the client if it doesn't exist
     */
    static getInstance(): PrismaClient;
    static getLastError(): Error | null;
    static isConnected(): boolean;
    /**
     * Get the managed Prisma client instance (instance method)
     */
    getClient(): PrismaClient;
    /**
     * Connect to the database
     */
    private static connect;
    /**
     * Disconnect from the database
     */
    static disconnect(): Promise<void>;
    /**
     * Setup event listeners for telemetry
     */
    private static setupEventListeners;
    /**
     * Check the connection health
     */
    static healthCheck(): Promise<{
        healthy: boolean;
        error: string | null;
        latency?: number;
    }>;
}
export { PrismaClientWrapper };
export declare const prisma: PrismaClient;
export declare const disconnectPrisma: typeof PrismaClientWrapper.disconnect;
export declare const prismaHealthCheck: typeof PrismaClientWrapper.healthCheck;
/**
 * Creates a new growth event.
 */
export declare function createGrowthEvent(data: Omit<Prisma.growth_eventsCreateInput, 'user'> & {
    userId: string;
}): Promise<{
    event_id: string;
    user_id: string;
    entity_id: string;
    entity_type: string;
    dim_key: string;
    delta: number;
    source: string;
    created_at: Date;
}>;
/**
 * Retrieves the aggregated growth profile for a user from the materialized view.
 */
export declare function getGrowthProfile(userId: string): Promise<Record<string, number>>;
/**
 * Retrieves the evolution state for a specific entity (card) from the view.
 */
export declare function getCardState(entityId: string, entityType: string, userId: string): Promise<{
    evolution_state: string;
    engaged_dimensions_count: number;
    connection_count: number;
    card_title: string;
} | null>;
//# sourceMappingURL=index.d.ts.map