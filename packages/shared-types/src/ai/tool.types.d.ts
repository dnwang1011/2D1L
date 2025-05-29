/**
 * Core types for Deterministic Tools
 */
/**
 * Base interface for all tools in the system
 */
export interface Tool<TInput = any, TOutput = any> {
    /** Name of the tool */
    name: string;
    /** Description of what the tool does */
    description: string;
    /** Version of the tool */
    version: string;
    /** Execute the tool with given input */
    execute(input: TInput): Promise<TOutput>;
}
/**
 * Generic structure for tool input, wrapping a specific payload.
 * Contains common fields like request_id and region.
 */
export interface TToolInput<TPayload = any> {
    /** Payload specific to the tool's task */
    payload: TPayload;
    /** Optional unique ID for tracing the request, can be passed from an agent */
    request_id?: string;
    /** Region where the tool is intended to be executed or is contextually relevant */
    region?: 'us' | 'cn';
    /** Optional configuration for the tool not part of the direct payload */
    config?: Record<string, any>;
    /** User ID for context if needed by the tool (e.g., for accessing user-specific resources) */
    user_id?: string;
}
/**
 * Generic structure for tool output, wrapping a specific result.
 * Contains common metadata about the execution.
 */
export interface TToolOutput<TResult = any> {
    /** Result data specific to the tool's task */
    result?: TResult;
    /** Status of the tool execution */
    status: 'success' | 'error';
    /** Error details if status is 'error' */
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    /** Metadata about the tool execution */
    metadata?: {
        /** Time taken for the tool's task in milliseconds */
        processing_time_ms?: number;
        /** Model used if applicable (e.g., for an embedding tool) */
        model_used?: string;
        /** Any warnings generated during processing */
        warnings?: string[];
        /** Region where tool execution occurred */
        processed_in_region?: 'us' | 'cn';
        [key: string]: any;
    };
}
/**
 * Tool capability manifest structure for discovery and registration in the ToolRegistry.
 * This uses camelCase as it describes the capability of a software component rather than a data DTO.
 */
export interface IToolCapability {
    /** Name of the tool (e.g., 'text-embedding-google') */
    name: string;
    /** Description of the tool */
    description: string;
    /** Version of the tool */
    version: string;
    /** Regions where the tool is available */
    availableRegions: ('us' | 'cn')[];
    /** Categories the tool belongs to */
    categories: string[];
    /** Capabilities provided by the tool */
    capabilities: string[];
    /** JSON schema for validating the TToolInput<Payload> for this specific tool */
    inputSchema: object;
    /** JSON schema for validating the TToolOutput<Result> for this specific tool */
    outputSchema: object;
    /** Performance characteristics */
    performance?: {
        avgLatencyMs?: number;
        isAsync?: boolean;
        isIdempotent?: boolean;
    };
    cost?: {
        currency: string;
        perCall?: number;
        perUnit?: {
            unit: string;
            amount: number;
        };
    };
    limitations?: string[];
}
/**
 * Payload for a text embedding tool input.
 */
export interface TTextEmbeddingInputPayload {
    /** Text to embed */
    text_to_embed: string;
    /** Identifier of the embedding model to use (e.g., 'google-gecko-003', 'deepseek-embed-v1') */
    model_id: string;
    /** Optional: specific embedding type or task (e.g., 'retrieval_document', 'similarity_query') */
    embedding_type?: string;
}
/**
 * Result from a text embedding tool.
 */
export interface TTextEmbeddingResult {
    /** The generated vector embedding */
    vector: number[];
    /** Metadata about the embedding */
    embedding_metadata: {
        model_id_used: string;
        dimensions: number;
        model_version?: string;
        token_count?: number;
    };
}
export type TTextEmbeddingToolInput = TToolInput<TTextEmbeddingInputPayload>;
export type TTextEmbeddingToolOutput = TToolOutput<TTextEmbeddingResult>;
/**
 * Payload for a vector search tool input.
 */
export interface TVectorSearchInputPayload {
    /** Query vector */
    query_vector: number[];
    /** Number of top_k results to return */
    top_k: number;
    /** Filters to apply during the search (e.g., { user_id: 'xyz', source_type: 'journal' }) */
    filters?: Record<string, any>;
    /** Namespace, collection, or index name to search within */
    namespace?: string | null;
    /** Whether to include the vector itself in the results */
    include_vector?: boolean;
    /** Whether to include metadata in the results */
    include_metadata?: boolean;
}
/**
 * Result from a vector search tool.
 */
export interface TVectorSearchResultItem {
    id: string;
    score: number;
    metadata?: Record<string, any>;
    vector?: number[];
}
export interface TVectorSearchResult {
    results: TVectorSearchResultItem[];
    search_metadata?: {
        total_results_before_limit?: number;
        vectors_compared?: number;
        filter_efficiency?: number;
    };
}
export type TVectorSearchToolInput = TToolInput<TVectorSearchInputPayload>;
export type TVectorSearchToolOutput = TToolOutput<TVectorSearchResult>;
/**
 * Payload for NER (Named Entity Recognition) tool input.
 */
export interface TNERInputPayload {
    text_to_analyze: string;
    /** Optional: Model tier or specific model_id for NER */
    model_id_or_tier?: string | (1 | 2 | 3);
    /** Optional: language of the text if not auto-detectable */
    language?: string;
}
/**
 * Represents a single extracted entity.
 */
export interface TExtractedEntity {
    text: string;
    type: string;
    start_offset: number;
    end_offset: number;
    confidence?: number | null;
    metadata?: Record<string, any>;
}
/**
 * Result from NER (Named Entity Recognition) tool.
 */
export interface TNERResult {
    entities: TExtractedEntity[];
}
export type TNERToolInput = TToolInput<TNERInputPayload>;
export type TNERToolOutput = TToolOutput<TNERResult>;
/**
 * Payload for LLM Chat tool input.
 */
export interface LLMChatInputPayload {
    /** The main user message to send to the LLM */
    userMessage: string;
    /** Conversation history (excluding current message) */
    history: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp?: string;
    }>;
    /** System prompt to guide the LLM's behavior */
    systemPrompt: string;
    /** User ID for context */
    userId: string;
    /** Session/conversation ID */
    sessionId: string;
    /** Optional memory context to include */
    memoryContextBlock?: string;
    /** Optional model configuration */
    modelConfig?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
    };
}
/**
 * Result from LLM Chat tool.
 */
export interface LLMChatResult {
    /** Generated response text */
    text: string;
    /** Token usage information */
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    /** Model used for generation */
    modelUsed?: string;
    /** Additional metadata from the LLM */
    metadata?: Record<string, any>;
}
export type LLMChatToolInput = TToolInput<LLMChatInputPayload>;
export type LLMChatToolOutput = TToolOutput<LLMChatResult>;
/**
 * Payload for Vision Caption tool input.
 */
export interface VisionCaptionInputPayload {
    /** URL of the image to analyze */
    imageUrl: string;
    /** MIME type of the image */
    imageType: string;
    /** Optional prompt to guide captioning */
    prompt?: string;
    /** Optional model to use for captioning */
    modelId?: string;
}
/**
 * Result from Vision Caption tool.
 */
export interface VisionCaptionResult {
    /** Generated caption for the image */
    caption: string;
    /** Confidence score of the caption (0-1) */
    confidence?: number;
    /** Detected objects/entities in the image */
    detectedObjects?: Array<{
        name: string;
        confidence: number;
        boundingBox?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
export type VisionCaptionToolInput = TToolInput<VisionCaptionInputPayload>;
export type VisionCaptionToolOutput = TToolOutput<VisionCaptionResult>;
/**
 * Payload for Document Extract tool input.
 */
export interface DocumentExtractInputPayload {
    /** URL of the document to extract text from */
    documentUrl: string;
    /** MIME type of the document */
    documentType: string;
    /** Optional extraction options */
    options?: {
        includeMetadata?: boolean;
        preserveFormatting?: boolean;
        extractImages?: boolean;
    };
}
/**
 * Result from Document Extract tool.
 */
export interface DocumentExtractResult {
    /** Extracted text content */
    extractedText: string;
    /** Document metadata */
    metadata?: {
        title?: string;
        author?: string;
        pageCount?: number;
        language?: string;
        createdDate?: string;
        modifiedDate?: string;
    };
    /** Extracted images if requested */
    extractedImages?: Array<{
        url: string;
        caption?: string;
    }>;
}
export type DocumentExtractToolInput = TToolInput<DocumentExtractInputPayload>;
export type DocumentExtractToolOutput = TToolOutput<DocumentExtractResult>;
//# sourceMappingURL=tool.types.d.ts.map