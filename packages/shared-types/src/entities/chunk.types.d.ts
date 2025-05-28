/**
 * Types related to Chunks.
 */
/**
 * Represents a granular, semantically coherent piece of text from a MemoryUnit.
 * Aligns with the `chunks` table in schema.prisma.
 */
export interface TChunk {
    /** Unique identifier for the chunk (UUID) */
    cid: string;
    /** ID of the parent MemoryUnit */
    muid: string;
    /** ID of the user who owns this chunk (denormalized) */
    user_id: string;
    /** The actual text content of the chunk */
    text: string;
    /** Order of this chunk within its parent MemoryUnit */
    sequence_order: number;
    /** Role in a conversation or type of content (e.g., 'user_utterance', 'key_insight') */
    role?: string | null;
    /** Unique ID for the vector in Weaviate (if embedded) */
    embedding_id?: string | null;
    /** Character count of the chunk text */
    char_count?: number | null;
    /** Token count (useful for LLM context management) */
    token_count?: number | null;
    /** Name/version of embedding model used */
    embedding_model?: string | null;
    /** Timestamp when embedding was generated */
    embedding_created_at?: Date | null;
    /** Additional chunk-specific metadata (JSON object) */
    metadata?: Record<string, any> | null;
}
/**
 * Role types for chunks
 */
export declare enum ChunkRole {
    USER_UTTERANCE = "user_utterance",
    DOT_UTTERANCE = "dot_utterance",
    SYSTEM_MESSAGE = "system_message",
    IDENTIFIED_QUESTION = "identified_question",
    KEY_INSIGHT = "key_insight",
    PARAGRAPH = "paragraph",
    HEADING = "heading",
    LIST_ITEM = "list_item",
    CODE_BLOCK = "code_block",
    QUOTE = "quote"
}
//# sourceMappingURL=chunk.types.d.ts.map