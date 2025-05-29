import { DatabaseService } from '../index';
export interface CreateGrowthEventData {
    user_id: string;
    entity_id: string;
    entity_type: string;
    dim_key: string;
    delta: number;
    source: string;
}
export declare class GrowthEventRepository {
    private databaseService;
    private prisma;
    constructor(databaseService: DatabaseService);
    /**
     * Create a new growth event
     */
    createGrowthEvent(data: CreateGrowthEventData): Promise<{
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
     * Get growth events for a user
     */
    getGrowthEventsForUser(userId: string, entityType?: string, dimKey?: string, limit?: number, offset?: number): Promise<{
        event_id: string;
        user_id: string;
        entity_id: string;
        entity_type: string;
        dim_key: string;
        delta: number;
        source: string;
        created_at: Date;
    }[]>;
    /**
     * Get growth events for a specific entity
     */
    getGrowthEventsForEntity(entityId: string, userId: string): Promise<{
        event_id: string;
        user_id: string;
        entity_id: string;
        entity_type: string;
        dim_key: string;
        delta: number;
        source: string;
        created_at: Date;
    }[]>;
    /**
     * Get growth summary for a user by dimension
     */
    getGrowthSummaryByDimension(userId: string): Promise<unknown>;
    /**
     * Get growth summary for a specific entity
     */
    getGrowthSummaryForEntity(entityId: string, userId: string): Promise<unknown>;
    /**
     * Get recent growth activity
     */
    getRecentGrowthActivity(userId: string, hours?: number, limit?: number): Promise<{
        event_id: string;
        user_id: string;
        entity_id: string;
        entity_type: string;
        dim_key: string;
        delta: number;
        source: string;
        created_at: Date;
    }[]>;
    /**
     * Calculate total growth score for a user
     */
    getTotalGrowthScore(userId: string): Promise<any>;
    /**
     * Get growth trajectory for a dimension over time
     */
    getGrowthTrajectory(userId: string, dimKey: string, days?: number): Promise<unknown>;
    /**
     * Create default growth event for memory creation
     */
    createMemoryGrowthEvent(userId: string, memoryId: string, source?: string): Promise<{
        event_id: string;
        user_id: string;
        entity_id: string;
        entity_type: string;
        dim_key: string;
        delta: number;
        source: string;
        created_at: Date;
    }>;
}
//# sourceMappingURL=growth-event.repository.d.ts.map