"use strict";
/**
 * CardService - Sprint 3 Task 3 Implementation
 * Business logic for card operations, Six-Dimensional Growth Model integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
class CardService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        const { CardRepository } = require('@2dots1line/database');
        this.cardRepository = new CardRepository(databaseService);
    }
    /**
     * Get cards with enhanced Six-Dimensional Growth Model data
     * Implements S3.T3 and S3.T6 requirements
     */
    async getCards(request) {
        const { userId, filters = {} } = request;
        try {
            // Convert API filters to repository filters
            const repoFilters = {
                cardType: filters.cardType,
                evolutionState: filters.evolutionState,
                limit: filters.limit || 20,
                offset: filters.offset || 0,
                sortBy: this.mapSortField(filters.sortBy),
                sortOrder: filters.sortOrder || 'desc'
            };
            // Get base card data from repository
            const repoResult = await this.cardRepository.getCards(userId, repoFilters);
            // Transform repository data to API format with enhanced growth analysis
            const cards = await Promise.all(repoResult.cards.map(async (cardData) => this.transformCardData(cardData)));
            // Filter by minimum importance score if specified
            const filteredCards = filters.minImportanceScore
                ? cards.filter(card => card.importanceScore >= filters.minImportanceScore)
                : cards;
            // Generate summary statistics
            const summary = this.generateCardsSummary(filteredCards);
            return {
                cards: filteredCards,
                total: repoResult.total,
                hasMore: repoResult.hasMore,
                summary
            };
        }
        catch (error) {
            console.error('Error in CardService.getCards:', error);
            throw new Error(`Failed to get cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get detailed information for a specific card
     */
    async getCardDetails(cardId, userId) {
        try {
            const cardData = await this.cardRepository.getCardDetails(cardId, userId);
            if (!cardData) {
                return null;
            }
            return this.transformCardData(cardData);
        }
        catch (error) {
            console.error('Error in CardService.getCardDetails:', error);
            throw new Error(`Failed to get card details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get cards grouped by evolution state for dashboard view
     */
    async getCardsByEvolutionState(userId) {
        try {
            const evolutionStates = ['seed', 'sprout', 'bloom', 'constellation', 'supernova'];
            const result = {};
            for (const state of evolutionStates) {
                const repoCards = await this.cardRepository.getCardsByEvolutionState(userId, state);
                result[state] = await Promise.all(repoCards.map((cardData) => this.transformCardData(cardData)));
            }
            return result;
        }
        catch (error) {
            console.error('Error in CardService.getCardsByEvolutionState:', error);
            throw new Error(`Failed to get cards by evolution state: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get most active cards based on recent growth events
     */
    async getTopGrowthCards(userId, limit = 10) {
        try {
            const repoCards = await this.cardRepository.getTopGrowthCards(userId, limit);
            return await Promise.all(repoCards.map((cardData) => this.transformCardData(cardData)));
        }
        catch (error) {
            console.error('Error in CardService.getTopGrowthCards:', error);
            throw new Error(`Failed to get top growth cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Transform repository card data to API card format with enhanced analytics
     */
    async transformCardData(cardData) {
        // Calculate growth trends and percentages
        const enhancedGrowthDimensions = cardData.growthDimensions.map((dimension) => {
            // Simple trend calculation (would be more sophisticated with historical data)
            const trend = dimension.score > 0.5 ? 'increasing' :
                dimension.score > 0.1 ? 'stable' : 'decreasing';
            // Calculate percentage of theoretical maximum (1.0)
            const percentageOfMax = Math.round(dimension.score * 100);
            return {
                ...dimension,
                trend: trend,
                percentageOfMax
            };
        });
        // Get additional metadata (stubbed for now)
        const connections = 0; // TODO: Get from Neo4j when graph queries are implemented
        const insights = 0; // TODO: Get from derived_artifacts table
        const tags = []; // TODO: Extract from concepts or annotations
        return {
            id: cardData.id,
            type: cardData.type,
            title: cardData.title,
            preview: cardData.preview,
            evolutionState: cardData.evolutionState,
            growthDimensions: enhancedGrowthDimensions,
            importanceScore: cardData.importanceScore,
            createdAt: cardData.createdAt,
            updatedAt: cardData.updatedAt,
            connections,
            insights,
            tags
        };
    }
    /**
     * Generate summary statistics for a set of cards
     */
    generateCardsSummary(cards) {
        const totalsByState = {};
        const totalsByType = {};
        const dimensionScores = {};
        cards.forEach(card => {
            // Count by evolution state
            totalsByState[card.evolutionState] = (totalsByState[card.evolutionState] || 0) + 1;
            // Count by type
            totalsByType[card.type] = (totalsByType[card.type] || 0) + 1;
            // Collect growth dimension scores
            card.growthDimensions.forEach((dimension) => {
                if (!dimensionScores[dimension.key]) {
                    dimensionScores[dimension.key] = [];
                }
                dimensionScores[dimension.key].push(dimension.score);
            });
        });
        // Calculate average growth score across all dimensions
        const allScores = Object.values(dimensionScores).flat();
        const avgGrowthScore = allScores.length > 0
            ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
            : 0;
        // Find most active growth dimension
        let mostActiveGrowthDimension = null;
        let maxAvgScore = 0;
        Object.entries(dimensionScores).forEach(([dimension, scores]) => {
            const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            if (avgScore > maxAvgScore) {
                maxAvgScore = avgScore;
                mostActiveGrowthDimension = dimension;
            }
        });
        return {
            totalsByState,
            totalsByType,
            avgGrowthScore: Math.round(avgGrowthScore * 100) / 100,
            mostActiveGrowthDimension
        };
    }
    /**
     * Map API sort fields to repository sort fields
     */
    mapSortField(sortBy) {
        switch (sortBy) {
            case 'growth_activity':
                return 'updated_at'; // Use updated_at as proxy for growth activity
            case 'created_at':
            case 'updated_at':
            case 'importance_score':
                return sortBy;
            default:
                return 'updated_at';
        }
    }
}
exports.CardService = CardService;
//# sourceMappingURL=card.service.js.map