/**
 * Card Repository - Sprint 3 Task 3 Implementation
 * Fetches card data from PostgreSQL including growth dimensions and evolution states
 */
import { DatabaseService } from '../index';
export interface CardData {
    id: string;
    type: 'memory_unit' | 'concept' | 'derived_artifact';
    title: string;
    preview: string;
    userId: string;
    evolutionState: 'seed' | 'sprout' | 'bloom' | 'constellation' | 'supernova';
    growthDimensions: Array<{
        key: string;
        name: string;
        score: number;
        eventCount: number;
        lastEventAt: Date | null;
    }>;
    importanceScore: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CardFilters {
    cardType?: 'memory_unit' | 'concept' | 'derived_artifact';
    evolutionState?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'updated_at' | 'importance_score';
    sortOrder?: 'asc' | 'desc';
}
export declare class CardRepository {
    private databaseService;
    constructor(databaseService: DatabaseService);
    /**
     * Fetch cards for a user with growth data from database views
     * Implements S3.T3 and S3.T6 requirements
     */
    getCards(userId: string, filters?: CardFilters): Promise<{
        cards: CardData[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get detailed data for a specific card
     */
    getCardDetails(cardId: string, userId: string): Promise<CardData | null>;
    /**
     * Get cards by evolution state for dashboard views
     */
    getCardsByEvolutionState(userId: string, state: string): Promise<CardData[]>;
    /**
     * Get cards with highest growth activity
     */
    getTopGrowthCards(userId: string, limit?: number): Promise<CardData[]>;
}
//# sourceMappingURL=card.repository.d.ts.map