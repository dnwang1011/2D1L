import { DatabaseService } from '../index';
export interface CreateMemoryUnitData {
    user_id: string;
    source_type: string;
    title?: string;
    content?: string;
    tier?: number;
    importance_score?: number;
    is_private?: boolean;
    metadata?: Record<string, any>;
}
export interface CreateChunkData {
    muid: string;
    user_id: string;
    text: string;
    sequence_order: number;
    role?: string;
    metadata?: Record<string, any>;
}
export declare class MemoryRepository {
    private databaseService;
    private prisma;
    constructor(databaseService: DatabaseService);
    /**
     * Create a new memory unit
     */
    createMemoryUnit(data: CreateMemoryUnitData): Promise<{
        user_id: string;
        muid: string;
        source_type: string;
        title: string | null;
        creation_ts: Date;
        ingestion_ts: Date;
        last_modified_ts: Date;
        processing_status: string;
        importance_score: number | null;
        is_private: boolean;
        tier: number;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Create a chunk linked to a memory unit
     */
    createChunk(data: CreateChunkData): Promise<{
        role: string | null;
        user_id: string;
        muid: string;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
        sequence_order: number;
        cid: string;
        text: string;
        embedding_id: string | null;
        char_count: number | null;
        token_count: number | null;
        embedding_model: string | null;
        embedding_created_at: Date | null;
    }>;
    /**
     * Get memory units for a user
     */
    getMemoryUnitsForUser(userId: string, limit?: number, offset?: number): Promise<({
        chunks: {
            role: string | null;
            user_id: string;
            muid: string;
            metadata: import(".prisma/client/runtime/library").JsonValue | null;
            sequence_order: number;
            cid: string;
            text: string;
            embedding_id: string | null;
            char_count: number | null;
            token_count: number | null;
            embedding_model: string | null;
            embedding_created_at: Date | null;
        }[];
    } & {
        user_id: string;
        muid: string;
        source_type: string;
        title: string | null;
        creation_ts: Date;
        ingestion_ts: Date;
        last_modified_ts: Date;
        processing_status: string;
        importance_score: number | null;
        is_private: boolean;
        tier: number;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
    })[]>;
    /**
     * Get memory unit by ID
     */
    getMemoryUnitById(muid: string, userId: string): Promise<({
        chunks: {
            role: string | null;
            user_id: string;
            muid: string;
            metadata: import(".prisma/client/runtime/library").JsonValue | null;
            sequence_order: number;
            cid: string;
            text: string;
            embedding_id: string | null;
            char_count: number | null;
            token_count: number | null;
            embedding_model: string | null;
            embedding_created_at: Date | null;
        }[];
    } & {
        user_id: string;
        muid: string;
        source_type: string;
        title: string | null;
        creation_ts: Date;
        ingestion_ts: Date;
        last_modified_ts: Date;
        processing_status: string;
        importance_score: number | null;
        is_private: boolean;
        tier: number;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
    }) | null>;
    /**
     * Update memory unit processing status
     */
    updateMemoryUnitStatus(muid: string, status: string): Promise<{
        user_id: string;
        muid: string;
        source_type: string;
        title: string | null;
        creation_ts: Date;
        ingestion_ts: Date;
        last_modified_ts: Date;
        processing_status: string;
        importance_score: number | null;
        is_private: boolean;
        tier: number;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Get chunks for a memory unit
     */
    getChunksForMemoryUnit(muid: string): Promise<{
        role: string | null;
        user_id: string;
        muid: string;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
        sequence_order: number;
        cid: string;
        text: string;
        embedding_id: string | null;
        char_count: number | null;
        token_count: number | null;
        embedding_model: string | null;
        embedding_created_at: Date | null;
    }[]>;
    /**
     * Update memory unit metadata
     */
    updateMemoryUnitMetadata(muid: string, metadataKey: string, metadataValue: any): Promise<{
        user_id: string;
        muid: string;
        source_type: string;
        title: string | null;
        creation_ts: Date;
        ingestion_ts: Date;
        last_modified_ts: Date;
        processing_status: string;
        importance_score: number | null;
        is_private: boolean;
        tier: number;
        metadata: import(".prisma/client/runtime/library").JsonValue | null;
    }>;
}
//# sourceMappingURL=memory.repository.d.ts.map