"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRepository = void 0;
class MemoryRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.prisma = databaseService.prisma;
    }
    /**
     * Create a new memory unit
     */
    async createMemoryUnit(data) {
        try {
            // Create the memory unit without content field
            const memoryUnit = await this.prisma.memory_units.create({
                data: {
                    user_id: data.user_id,
                    source_type: data.source_type,
                    title: data.title,
                    creation_ts: new Date(),
                    processing_status: 'raw',
                    tier: data.tier || 1,
                    importance_score: data.importance_score,
                    is_private: data.is_private ?? true,
                    metadata: data.metadata,
                },
            });
            // If content is provided, create a raw_content entry
            if (data.content) {
                await this.prisma.raw_content.create({
                    data: {
                        muid: memoryUnit.muid,
                        user_id: data.user_id,
                        content_type: 'text', // Default to text, could be parameterized if needed
                        content: data.content,
                        creation_ts: new Date(),
                    },
                });
            }
            return memoryUnit;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Memory unit with this ID already exists.');
            }
            throw error;
        }
    }
    /**
     * Create a chunk linked to a memory unit
     */
    async createChunk(data) {
        try {
            return await this.prisma.chunks.create({
                data: {
                    muid: data.muid,
                    user_id: data.user_id,
                    text: data.text,
                    sequence_order: data.sequence_order,
                    role: data.role,
                    char_count: data.text.length,
                    token_count: Math.ceil(data.text.length / 4), // Rough token estimate
                    metadata: data.metadata,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new Error('Referenced memory unit does not exist.');
            }
            throw error;
        }
    }
    /**
     * Get memory units for a user
     */
    async getMemoryUnitsForUser(userId, limit = 20, offset = 0) {
        return await this.prisma.memory_units.findMany({
            where: { user_id: userId },
            include: {
                chunks: {
                    orderBy: { sequence_order: 'asc' },
                },
            },
            orderBy: { creation_ts: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    /**
     * Get memory unit by ID
     */
    async getMemoryUnitById(muid, userId) {
        return await this.prisma.memory_units.findFirst({
            where: {
                muid,
                user_id: userId,
            },
            include: {
                chunks: {
                    orderBy: { sequence_order: 'asc' },
                },
            },
        });
    }
    /**
     * Update memory unit processing status
     */
    async updateMemoryUnitStatus(muid, status) {
        return await this.prisma.memory_units.update({
            where: { muid },
            data: {
                processing_status: status,
                last_modified_ts: new Date(),
            },
        });
    }
    /**
     * Get chunks for a memory unit
     */
    async getChunksForMemoryUnit(muid) {
        return await this.prisma.chunks.findMany({
            where: { muid },
            orderBy: { sequence_order: 'asc' },
        });
    }
    /**
     * Update memory unit metadata
     */
    async updateMemoryUnitMetadata(muid, metadataKey, metadataValue) {
        // Get current metadata
        const memoryUnit = await this.prisma.memory_units.findUnique({
            where: { muid },
            select: { metadata: true },
        });
        if (!memoryUnit) {
            throw new Error(`Memory unit with ID ${muid} not found`);
        }
        // Merge new metadata with existing
        const currentMetadata = memoryUnit.metadata || {};
        const updatedMetadata = {
            ...currentMetadata,
            [metadataKey]: metadataValue,
        };
        return await this.prisma.memory_units.update({
            where: { muid },
            data: {
                metadata: updatedMetadata,
                last_modified_ts: new Date(),
            },
        });
    }
}
exports.MemoryRepository = MemoryRepository;
//# sourceMappingURL=memory.repository.js.map