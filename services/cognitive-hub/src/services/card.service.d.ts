/**
 * CardService - Sprint 3 Task 3 Implementation
 * Business logic for card operations, Six-Dimensional Growth Model integration
 */
import { DatabaseService } from '@2dots1line/database';
export interface Card {
    id: string;
    type: 'memory_unit' | 'concept' | 'derived_artifact';
    title: string;
    preview: string;
    evolutionState: 'seed' | 'sprout' | 'bloom' | 'constellation' | 'supernova';
    growthDimensions: Array<{
        key: string;
        name: string;
        score: number;
        eventCount: number;
        lastEventAt: Date | null;
        trend: 'increasing' | 'stable' | 'decreasing';
        percentageOfMax: number;
    }>;
    importanceScore: number;
    createdAt: Date;
    updatedAt: Date;
    connections: number;
    insights: number;
    tags: string[];
}
export interface GetCardsRequest {
    userId: string;
    filters?: {
        cardType?: 'memory_unit' | 'concept' | 'derived_artifact';
        evolutionState?: string;
        growthDimension?: string;
        minImportanceScore?: number;
        limit?: number;
        offset?: number;
        sortBy?: 'created_at' | 'updated_at' | 'importance_score' | 'growth_activity';
        sortOrder?: 'asc' | 'desc';
    };
}
export interface GetCardsResponse {
    cards: Card[];
    total: number;
    hasMore: boolean;
    summary: {
        totalsByState: Record<string, number>;
        totalsByType: Record<string, number>;
        avgGrowthScore: number;
        mostActiveGrowthDimension: string | null;
    };
}
export declare class CardService {
    private databaseService;
    private cardRepository;
    constructor(databaseService: DatabaseService);
    /**
     * Get cards with enhanced Six-Dimensional Growth Model data
     * Implements S3.T3 and S3.T6 requirements
     */
    getCards(request: GetCardsRequest): Promise<GetCardsResponse>;
    /**
     * Get detailed information for a specific card
     */
    getCardDetails(cardId: string, userId: string): Promise<Card | null>;
    /**
     * Get cards grouped by evolution state for dashboard view
     */
    getCardsByEvolutionState(userId: string): Promise<Record<string, Card[]>>;
    /**
     * Get most active cards based on recent growth events
     */
    getTopGrowthCards(userId: string, limit?: number): Promise<Card[]>;
    /**
     * Transform repository card data to API card format with enhanced analytics
     */
    private transformCardData;
    /**
     * Generate summary statistics for a set of cards
     */
    private generateCardsSummary;
    /**
     * Map API sort fields to repository sort fields
     */
    private mapSortField;
}
//# sourceMappingURL=card.service.d.ts.map