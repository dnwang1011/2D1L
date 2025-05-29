import { Prisma } from '@prisma/client';
import { DatabaseService } from '../index';
export interface CreateConceptData {
    user_id: string;
    name: string;
    type: string;
    description?: string;
    confidence?: number;
    metadata?: Prisma.InputJsonValue;
}
export interface CreateConceptRelationshipData {
    user_id: string;
    source_concept_id: string;
    target_concept_id: string;
    relationship_type: string;
    strength?: number;
    context_muid?: string;
    metadata?: Prisma.InputJsonValue;
}
export declare class ConceptRepository {
    private databaseService;
    private prisma;
    constructor(databaseService: DatabaseService);
    /**
     * Create or find an existing concept
     */
    createOrFindConcept(data: CreateConceptData): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    }>;
    /**
     * Get concept by ID
     */
    getConceptById(conceptId: string, userId: string): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    } | null>;
    /**
     * Get concepts for a user
     */
    getConceptsForUser(userId: string, type?: string, limit?: number, offset?: number): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    }[]>;
    /**
     * Search concepts by name
     */
    searchConceptsByName(userId: string, searchTerm: string, limit?: number): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    }[]>;
    /**
     * Create a relationship between concepts - DEPRECATED: Use Neo4j for relationships
     * This method is kept for backward compatibility but should not be used
     */
    createConceptRelationship(data: CreateConceptRelationshipData): Promise<void>;
    /**
     * Get relationships for a concept - DEPRECATED: Use Neo4j for relationships
     * This method is kept for backward compatibility but should not be used
     */
    getConceptRelationships(conceptId: string, userId: string): Promise<void>;
    /**
     * Delete concept (soft delete by setting confidence to 0)
     */
    softDeleteConcept(conceptId: string, userId: string): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    }>;
    /**
     * Update concept confidence
     */
    updateConceptConfidence(conceptId: string, confidence: number): Promise<{
        name: string;
        type: string;
        user_id: string;
        created_at: Date;
        metadata: Prisma.JsonValue | null;
        embedding_id: string | null;
        concept_id: string;
        description: string | null;
        user_defined: boolean;
        confidence: number | null;
        community_id: string | null;
        ontology_version: string | null;
        last_updated_ts: Date;
    }>;
}
//# sourceMappingURL=concept.repository.d.ts.map