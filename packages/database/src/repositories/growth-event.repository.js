"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthEventRepository = void 0;
class GrowthEventRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.prisma = databaseService.prisma;
    }
    /**
     * Create a new growth event
     */
    async createGrowthEvent(data) {
        try {
            return await this.prisma.growth_events.create({
                data: {
                    user_id: data.user_id,
                    entity_id: data.entity_id,
                    entity_type: data.entity_type,
                    dim_key: data.dim_key,
                    delta: data.delta,
                    source: data.source,
                    created_at: new Date(),
                },
            });
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new Error('Referenced entity does not exist.');
            }
            throw error;
        }
    }
    /**
     * Get growth events for a user
     */
    async getGrowthEventsForUser(userId, entityType, dimKey, limit = 100, offset = 0) {
        const where = { user_id: userId };
        if (entityType) {
            where.entity_type = entityType;
        }
        if (dimKey) {
            where.dim_key = dimKey;
        }
        return await this.prisma.growth_events.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    /**
     * Get growth events for a specific entity
     */
    async getGrowthEventsForEntity(entityId, userId) {
        return await this.prisma.growth_events.findMany({
            where: {
                entity_id: entityId,
                user_id: userId,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    /**
     * Get growth summary for a user by dimension
     */
    async getGrowthSummaryByDimension(userId) {
        // This uses raw SQL to aggregate growth events by dimension
        const result = await this.prisma.$queryRaw `
      SELECT 
        dim_key,
        SUM(delta) as total_score,
        COUNT(*) as event_count,
        MAX(created_at) as last_event_at
      FROM growth_events 
      WHERE user_id = ${userId}
      GROUP BY dim_key
      ORDER BY total_score DESC
    `;
        return result;
    }
    /**
     * Get growth summary for a specific entity
     */
    async getGrowthSummaryForEntity(entityId, userId) {
        const result = await this.prisma.$queryRaw `
      SELECT 
        dim_key,
        SUM(delta) as total_score,
        COUNT(*) as event_count,
        MAX(created_at) as last_event_at
      FROM growth_events 
      WHERE entity_id = ${entityId} AND user_id = ${userId}
      GROUP BY dim_key
      ORDER BY total_score DESC
    `;
        return result;
    }
    /**
     * Get recent growth activity
     */
    async getRecentGrowthActivity(userId, hours = 24, limit = 20) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return await this.prisma.growth_events.findMany({
            where: {
                user_id: userId,
                created_at: {
                    gte: since,
                },
            },
            orderBy: { created_at: 'desc' },
            take: limit,
        });
    }
    /**
     * Calculate total growth score for a user
     */
    async getTotalGrowthScore(userId) {
        const result = await this.prisma.$queryRaw `
      SELECT SUM(delta) as total_score
      FROM growth_events 
      WHERE user_id = ${userId}
    `;
        return result[0]?.total_score || 0;
    }
    /**
     * Get growth trajectory for a dimension over time
     */
    async getGrowthTrajectory(userId, dimKey, days = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await this.prisma.$queryRaw `
      SELECT 
        DATE(created_at) as date,
        SUM(delta) as daily_delta,
        COUNT(*) as event_count
      FROM growth_events 
      WHERE user_id = ${userId} 
        AND dim_key = ${dimKey}
        AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
        return result;
    }
    /**
     * Create default growth event for memory creation
     */
    async createMemoryGrowthEvent(userId, memoryId, source = 'journal_entry') {
        return await this.createGrowthEvent({
            user_id: userId,
            entity_id: memoryId,
            entity_type: 'memory_unit',
            dim_key: 'self_know',
            delta: 0.1,
            source,
        });
    }
}
exports.GrowthEventRepository = GrowthEventRepository;
//# sourceMappingURL=growth-event.repository.js.map