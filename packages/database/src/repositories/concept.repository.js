"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptRepository = void 0;
class ConceptRepository {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.prisma = databaseService.prisma;
    }
    /**
     * Create or find an existing concept
     */
    async createOrFindConcept(data) {
        try {
            // First try to find existing concept by name and type for the user
            const existing = await this.prisma.concepts.findFirst({
                where: {
                    user_id: data.user_id,
                    name: data.name,
                    type: data.type,
                },
            });
            if (existing) {
                // Update existing concept with new data if provided
                const updateData = {
                    description: data.description || existing.description,
                    confidence: data.confidence ?? existing.confidence,
                    last_updated_ts: new Date(),
                };
                if (data.metadata !== undefined) {
                    updateData.metadata = data.metadata;
                }
                return await this.prisma.concepts.update({
                    where: { concept_id: existing.concept_id },
                    data: updateData,
                });
            }
            // Create new concept
            return await this.prisma.concepts.create({
                data: {
                    user_id: data.user_id,
                    name: data.name,
                    type: data.type,
                    description: data.description,
                    confidence: data.confidence,
                    metadata: data.metadata,
                    user_defined: false, // Default to AI-generated
                    created_at: new Date(),
                    last_updated_ts: new Date(),
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new Error('Concept with this name and type already exists.');
            }
            throw error;
        }
    }
    /**
     * Get concept by ID
     */
    async getConceptById(conceptId, userId) {
        return await this.prisma.concepts.findFirst({
            where: {
                concept_id: conceptId,
                user_id: userId,
            },
        });
    }
    /**
     * Get concepts for a user
     */
    async getConceptsForUser(userId, type, limit = 50, offset = 0) {
        const where = { user_id: userId };
        if (type) {
            where.type = type;
        }
        return await this.prisma.concepts.findMany({
            where,
            orderBy: { last_updated_ts: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    /**
     * Search concepts by name
     */
    async searchConceptsByName(userId, searchTerm, limit = 20) {
        return await this.prisma.concepts.findMany({
            where: {
                user_id: userId,
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
            orderBy: { confidence: 'desc' },
            take: limit,
        });
    }
    /**
     * Create a relationship between concepts - DEPRECATED: Use Neo4j for relationships
     * This method is kept for backward compatibility but should not be used
     */
    async createConceptRelationship(data) {
        throw new Error('Concept relationships are now handled by Neo4j. Use Neo4j repository instead.');
    }
    /**
     * Get relationships for a concept - DEPRECATED: Use Neo4j for relationships
     * This method is kept for backward compatibility but should not be used
     */
    async getConceptRelationships(conceptId, userId) {
        throw new Error('Concept relationships are now handled by Neo4j. Use Neo4j repository instead.');
    }
    /**
     * Delete concept (soft delete by setting confidence to 0)
     */
    async softDeleteConcept(conceptId, userId) {
        return await this.prisma.concepts.update({
            where: { concept_id: conceptId },
            data: {
                confidence: 0,
                last_updated_ts: new Date(),
            },
        });
    }
    /**
     * Update concept confidence
     */
    async updateConceptConfidence(conceptId, confidence) {
        return await this.prisma.concepts.update({
            where: { concept_id: conceptId },
            data: {
                confidence,
                last_updated_ts: new Date(),
            },
        });
    }
}
exports.ConceptRepository = ConceptRepository;
//# sourceMappingURL=concept.repository.js.map