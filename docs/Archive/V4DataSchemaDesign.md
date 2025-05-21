Okay, let's design the data models for PostgreSQL, Weaviate, and Neo4j based on the **2dots1line Memory System V4 Technical Specification**. This will provide the concrete schema definitions that underpin the entire system.

## 2dots1line V4: Data Model Specification

This document outlines the data schemas for PostgreSQL (relational), Weaviate (vector), and Neo4j (graph) databases, as defined in the V4 Technical Specification.

---

### 1. PostgreSQL Data Model (Primary Structured Data & Metadata)

**Purpose:** Stores core entities, user data, raw content, metadata, logs, and serves as the primary source of truth for structured information before graph enrichment.

**Schema (SQL DDL with comments):**

```sql
-- Represents users of the 2dots1line system
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY, -- Unique identifier for the user (e.g., UUID)
    email VARCHAR(255) UNIQUE NOT NULL, -- User's email, used for login, must be unique
    hashed_password VARCHAR(255), -- Stored hashed password (if using password auth)
    name VARCHAR(255), -- User's display name
    preferences JSONB, -- User-specific settings (e.g., notification, Dot's humor level, UI theme)
    region VARCHAR(10) NOT NULL, -- Deployment region ('us' or 'cn') for data residency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active' NOT NULL -- 'active', 'suspended', 'deleted'
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_region ON users(region);

-- Represents a distinct piece of user memory or input (journal, conversation, document)
CREATE TABLE memory_units (
    muid VARCHAR(36) PRIMARY KEY, -- Unique identifier for the memory unit (e.g., UUID)
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Links to the user who authored this
    source_type VARCHAR(50) NOT NULL, -- Origin of the memory (e.g., 'journal_entry', 'chat_conversation', 'imported_document', 'fleeting_thought')
    title VARCHAR(512), -- User-provided or AI-generated title for the memory unit
    creation_ts TIMESTAMP WITH TIME ZONE NOT NULL, -- Timestamp of original content creation by user
    ingestion_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, -- Timestamp when ingested into the system
    last_modified_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, -- When this record or its content was last updated
    processing_status VARCHAR(50) NOT NULL DEFAULT 'raw', -- Current stage in the ingestion/analysis pipeline (e.g., 'raw', 'chunked', 'embedding_pending', 'embedded', 'structured', 'enriched', 'error')
    importance_score FLOAT, -- AI-assigned score (0.0-1.0) indicating significance
    is_private BOOLEAN DEFAULT TRUE, -- User's privacy setting for this memory unit
    tier INTEGER DEFAULT 1, -- Processing tier (1-3) assigned based on content significance
    metadata JSONB -- Additional metadata (e.g., location, device info, original file name if imported)
);
CREATE INDEX idx_memoryunits_user_creation ON memory_units(user_id, creation_ts DESC);
CREATE INDEX idx_memoryunits_user_status ON memory_units(user_id, processing_status);
CREATE INDEX idx_memoryunits_user_type ON memory_units(user_id, source_type);
CREATE INDEX idx_memoryunits_importance ON memory_units(user_id, importance_score) WHERE importance_score IS NOT NULL;

-- Raw content storage - stores the original unprocessed content (text, journal entries, conversations)
CREATE TABLE raw_content (
    content_id VARCHAR(36) PRIMARY KEY,
    muid VARCHAR(36) NOT NULL REFERENCES memory_units(muid) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'journal_text', 'chat_message', 'document_text', etc.
    content TEXT NOT NULL, -- The original raw content
    sender_type VARCHAR(20), -- For conversation: 'user' or 'assistant', NULL for other types
    sequence_order INTEGER, -- For ordered content like conversations
    creation_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB -- Additional content-specific metadata
);
CREATE INDEX idx_raw_content_muid ON raw_content(muid);
CREATE INDEX idx_raw_content_user ON raw_content(user_id);
CREATE INDEX idx_raw_content_type ON raw_content(content_type);

-- Represents granular, semantically coherent pieces of text from a MemoryUnit
CREATE TABLE chunks (
    cid VARCHAR(36) PRIMARY KEY, -- Unique identifier for the chunk (e.g., UUID)
    muid VARCHAR(36) NOT NULL REFERENCES memory_units(muid) ON DELETE CASCADE, -- Links to the parent MemoryUnit
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Denormalized for easier querying/sharding by user
    text TEXT NOT NULL, -- The actual text content of the chunk
    sequence_order INTEGER NOT NULL, -- Order of this chunk within its parent MemoryUnit
    role VARCHAR(50), -- Role in a conversation (e.g., 'user_utterance', 'dot_utterance', 'system_message', 'identified_question', 'key_insight')
    embedding_id VARCHAR(255), -- Unique ID for the vector in Weaviate (could be same as cid or a Weaviate-specific ID)
    char_count INTEGER, -- Character count of the chunk text
    token_count INTEGER, -- Token count (useful for LLM context management)
    embedding_model VARCHAR(100), -- Name/version of embedding model used
    embedding_created_at TIMESTAMP WITH TIME ZONE, -- When embedding was generated
    metadata JSONB -- Additional chunk-specific metadata
);
CREATE INDEX idx_chunks_muid_order ON chunks(muid, sequence_order);
CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_chunks_embedding_id ON chunks(embedding_id);

-- Represents entities, themes, values, emotions, topics, etc.
CREATE TABLE concepts (
    concept_id VARCHAR(36) PRIMARY KEY, -- Unique identifier for the concept (e.g., UUID)
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Each user has their own view/version of concepts, even if some are global
    name TEXT NOT NULL, -- Canonical name of the concept (e.g., "Patience", "McKinsey")
    type VARCHAR(100) NOT NULL, -- Type from the controlled ontology (e.g., 'value', 'person', 'life_event_theme')
    description TEXT, -- AI-generated or user-provided description
    user_defined BOOLEAN DEFAULT FALSE, -- True if explicitly created or heavily modified by the user
    confidence FLOAT, -- AI's confidence in this concept's identification/typing (0.0-1.0)
    community_id VARCHAR(36), -- Optional: ID of a Community this concept belongs to
    embedding_id VARCHAR(255), -- Reference to vector in Weaviate (if concept has an embedding)
    ontology_version VARCHAR(20), -- Version of the ontology this concept type adheres to
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB, -- e.g., synonyms, alternative labels
    UNIQUE (user_id, name, type) -- A concept is unique for a user by its name and type
);
CREATE INDEX idx_concepts_user_type ON concepts(user_id, type);
CREATE INDEX idx_concepts_user_name ON concepts(user_id, name);
CREATE INDEX idx_concepts_community ON concepts(community_id) WHERE community_id IS NOT NULL;

-- Represents non-text media associated with MemoryUnits
CREATE TABLE media (
    media_id VARCHAR(36) PRIMARY KEY, -- Unique identifier for the media item
    muid VARCHAR(36) REFERENCES memory_units(muid) ON DELETE CASCADE, -- Links to the parent MemoryUnit
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- e.g., 'image', 'audio', 'video', 'document_pdf'
    storage_url TEXT NOT NULL, -- URL to the media file in object storage (S3/COS)
    filename_original VARCHAR(255), -- Original filename uploaded by user
    mime_type VARCHAR(100), -- MIME type of the uploaded file
    file_size_bytes INTEGER, -- Size of the file in bytes
    hash_value VARCHAR(64), -- Hash of file content to detect duplicates
    caption TEXT, -- AI-generated or user-provided caption
    extracted_text TEXT, -- OCR'd text or transcribed audio
    extraction_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    embedding_id VARCHAR(255), -- Reference to vector in Weaviate (if media has embedding)
    width INTEGER, -- For images/videos
    height INTEGER, -- For images/videos
    duration_seconds INTEGER, -- For audio/videos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB -- e.g., EXIF data for images, dominant colors
);
CREATE INDEX idx_media_muid ON media(muid);
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_type ON media(user_id, type);
CREATE INDEX idx_media_hash ON media(user_id, hash_value);

-- Represents user or AI annotations on MemoryUnits, Chunks, or Concepts
CREATE TABLE annotations (
    aid VARCHAR(36) PRIMARY KEY, -- Unique identifier for the annotation
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_id VARCHAR(36) NOT NULL, -- ID of the item being annotated
    target_node_type VARCHAR(50) NOT NULL, -- 'MemoryUnit', 'Chunk', 'Concept', 'Relationship' (if annotating graph edges)
    annotation_type VARCHAR(100) NOT NULL, -- e.g., 'user_reflection', 'ai_inferred_significance', 'user_correction', 'emotion_tag', 'goal_link'
    text_content TEXT NOT NULL, -- The content of the annotation
    source VARCHAR(50) NOT NULL, -- 'user' or specific agent name (e.g., 'ai_csea_v1.2')
    creation_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB -- e.g., confidence score for AI annotations, user rating of the annotation itself
);
CREATE INDEX idx_annotations_target ON annotations(target_id, target_node_type);
CREATE INDEX idx_annotations_user_type ON annotations(user_id, annotation_type);
CREATE INDEX idx_annotations_source ON annotations(source);

-- Represents detected thematic clusters or communities of Concepts
CREATE TABLE communities (
    community_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255), -- AI-generated or user-assigned name for the community (e.g., "Work Projects Q3 2024")
    description TEXT, -- AI-generated summary of the community's theme
    detection_method VARCHAR(100), -- Algorithm used (e.g., 'Louvain', 'LLM_Topic_Cluster')
    confidence_score FLOAT, -- Confidence in the coherence of this community
    keywords TEXT[], -- Top keywords characterizing this community
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_analyzed_ts TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_communities_user ON communities(user_id);

-- Stores logs of conversations with Dot for session context and later analysis
CREATE TABLE conversation_messages (
    message_id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL, -- Groups messages into a single conversation session
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL, -- 'user' or 'assistant'
    message_text TEXT,
    message_type VARCHAR(20) DEFAULT 'text' NOT NULL, -- 'text', 'image', 'file', 'action'
    media_attachments JSONB, -- Array of {type, url, media_id} for media shared in chat
    suggested_actions JSONB, -- Actions suggested by Dot
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'pending_ingestion', -- Status if this turn needs to become a MemoryUnit
    associated_muid VARCHAR(36) REFERENCES memory_units(muid) ON DELETE SET NULL, -- Link if this turn became a MemoryUnit
    retrieval_context_summary TEXT, -- Brief summary of context Dot used for its response
    user_feedback_on_response VARCHAR(20), -- 'helpful', 'unhelpful', 'neutral'
    metadata JSONB -- Additional message metadata
);
CREATE INDEX idx_conversation_session_time ON conversation_messages(conversation_id, timestamp);
CREATE INDEX idx_conversation_user_time ON conversation_messages(user_id, timestamp DESC);
CREATE INDEX idx_conversation_muid ON conversation_messages(associated_muid) WHERE associated_muid IS NOT NULL;

-- Stores conversation sessions metadata
CREATE TABLE conversations (
    conversation_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255), -- AI-generated title for the conversation
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    last_message_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL, -- 'active', 'archived', 'deleted'
    message_count INTEGER DEFAULT 0 NOT NULL,
    metadata JSONB -- Additional conversation metadata
);
CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_time DESC);
CREATE INDEX idx_conversations_status ON conversations(user_id, status);

-- Stores AI-generated insights (patterns, correlations, hypotheses)
CREATE TABLE insights (
    insight_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'pattern_temporal', 'correlation_behavioral', 'metaphorical_connection', 'emergent_theme'
    description TEXT NOT NULL, -- Human-readable description of the insight
    supporting_evidence JSONB NOT NULL, -- Array of {id, type, relevance_score} pointing to MUs, Chunks, Concepts
    confidence FLOAT NOT NULL, -- AI's confidence in this insight (0.0-1.0)
    novelty_score FLOAT, -- How new or surprising this insight might be (0.0-1.0)
    source_agent VARCHAR(50) NOT NULL, -- e.g., 'InsightEngine_v1.1'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_surfaced_to_user_ts TIMESTAMP WITH TIME ZONE, -- When Dot last shared this with the user
    user_feedback VARCHAR(50), -- 'resonated', 'dismissed', 'needs_clarification'
    status VARCHAR(20) DEFAULT 'active' NOT NULL -- 'active', 'archived', 'deleted'
);
CREATE INDEX idx_insights_user_created ON insights(user_id, created_at DESC);
CREATE INDEX idx_insights_user_feedback ON insights(user_id, user_feedback);
CREATE INDEX idx_insights_unshared ON insights(user_id, confidence) WHERE last_surfaced_to_user_ts IS NULL;

-- Ontology definitions managed by Ontology Steward
CREATE TABLE ontology_terms (
    term_id VARCHAR(36) PRIMARY KEY,
    term_scope VARCHAR(50) NOT NULL, -- 'Concept.type', 'Relationship.label', 'Perception.type'
    term_name VARCHAR(255) NOT NULL,
    definition TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'deprecated', 'candidate'
    version VARCHAR(20),
    parent_term_id VARCHAR(36) REFERENCES ontology_terms(term_id), -- For hierarchical relationships
    created_by VARCHAR(50) DEFAULT 'OntologyStewardAgent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (term_scope, term_name, version)
);
CREATE INDEX idx_ontology_scope_status ON ontology_terms(term_scope, status);
CREATE INDEX idx_ontology_hierarchy ON ontology_terms(parent_term_id) WHERE parent_term_id IS NOT NULL;

-- Stores agent processing jobs and their status (for BullMQ or similar)
CREATE TABLE agent_processing_jobs (
    job_id VARCHAR(36) PRIMARY KEY,
    queue_name VARCHAR(100) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'retrying'
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    result JSONB, -- Store job result for completed jobs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_node_id VARCHAR(100), -- Identifier of the worker instance that processed it
    lock_until TIMESTAMP WITH TIME ZONE -- For manual locking of jobs
);
CREATE INDEX idx_agentjobs_status_queue ON agent_processing_jobs(status, queue_name, priority, created_at);
CREATE INDEX idx_agentjobs_processing_node ON agent_processing_jobs(processing_node_id, status);

-- Junction tables for many-to-many relationships (primarily for relational queries, graph is source of truth for links)

CREATE TABLE user_perceived_concepts (
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    concept_id VARCHAR(36) NOT NULL REFERENCES concepts(concept_id) ON DELETE CASCADE,
    perception_type VARCHAR(100) NOT NULL, -- From OntologyTerms where scope = 'Perception.type'
    current_salience FLOAT, -- How important this perception is to the user currently
    start_date DATE,
    end_date DATE, -- Null if currently active
    source_description TEXT, -- Brief note on why this perception was inferred/added
    confidence FLOAT NOT NULL, -- Confidence in this perception
    last_affirmed_ts TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, concept_id, perception_type)
);
CREATE INDEX idx_perception_salience ON user_perceived_concepts(user_id, perception_type, current_salience DESC);
CREATE INDEX idx_perception_concept ON user_perceived_concepts(concept_id);
CREATE INDEX idx_perception_active ON user_perceived_concepts(user_id, perception_type) WHERE end_date IS NULL;

CREATE TABLE concept_relationships (
    source_concept_id VARCHAR(36) NOT NULL REFERENCES concepts(concept_id) ON DELETE CASCADE,
    target_concept_id VARCHAR(36) NOT NULL REFERENCES concepts(concept_id) ON DELETE CASCADE,
    relationship_label VARCHAR(100) NOT NULL, -- From OntologyTerms where scope = 'Relationship.label'
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Relationships are per-user context
    weight FLOAT,
    confidence FLOAT NOT NULL,
    source_of_relation VARCHAR(50), -- 'ai_inferred', 'user_stated', 'ontology_default'
    creation_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    context_muid VARCHAR(36) REFERENCES memory_units(muid) ON DELETE SET NULL, -- Memory where this relationship was observed
    PRIMARY KEY (user_id, source_concept_id, target_concept_id, relationship_label)
);
CREATE INDEX idx_conceptrelationships_user_source ON concept_relationships(user_id, source_concept_id, relationship_label);
CREATE INDEX idx_conceptrelationships_user_target ON concept_relationships(user_id, target_concept_id, relationship_label);
CREATE INDEX idx_conceptrelationships_context ON concept_relationships(context_muid) WHERE context_muid IS NOT NULL;

-- System metrics and performance tracking
CREATE TABLE system_metrics (
    metric_id VARCHAR(36) PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    dimension JSONB, -- Dimensions to slice by (user_id, region, agent, etc.)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB
);
CREATE INDEX idx_metrics_name_time ON system_metrics(metric_name, timestamp DESC);
CREATE INDEX idx_metrics_dimension ON system_metrics USING GIN (dimension);

-- User activity log for analytical purposes
CREATE TABLE user_activity_log (
    log_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'journal_entry', 'chat', 'search', etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details JSONB, -- Activity-specific details
    client_info JSONB -- Device, browser, app version info
);
CREATE INDEX idx_user_activity_user_time ON user_activity_log(user_id, timestamp DESC);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type, timestamp DESC);

-- Note: Consider table partitioning for large tables (memory_units, chunks, raw_content)
-- by user_id or timestamp for improved performance at scale
```

---

### 2. Weaviate Data Model (Vector Embeddings)

**Purpose:** Stores vector embeddings for fast semantic search and similarity calculations.

**Collections (Classes in Weaviate terms):**

1.  **`ChunkEmbeddings`**
    *   **Vector Field:** `vector` (e.g., 768 or 1024 dimensions, depending on embedding model). Configured with HNSW indexing for ANN search.
    *   **Properties (Metadata for filtering/linking):**
        *   `cid`: TEXT (Primary key, links to `chunks.cid` in PostgreSQL). **Must be unique.**
        *   `muid`: TEXT (Links to `memory_units.muid` in PostgreSQL).
        *   `user_id`: TEXT (Links to `users.user_id` in PostgreSQL).
        *   `text_preview`: TEXT (Optional: first ~100 chars of chunk text for quick inspection).
        *   `creation_ts`: DATE (Timestamp of chunk creation for time-based filtering).
        *   `embedding_model`: TEXT (e.g., "gemini-gecko-003", "deepseek-embed-v1").
        *   `source_type`: TEXT (from `memory_units.source_type` for filtering).
        *   `region`: TEXT (user's region for data residency compliance).
    *   **Vectorizer:** `none` (assumes vectors are pre-computed and imported).
    *   **Sharding Strategy:** `by-user_id` (ensures data residency and performance).
    *   **Index Configuration:** 
        *   HNSW with `efConstruction=128`, `maxConnections=64` for build time
        *   `ef=40` for search time (adjust based on performance testing)
        *   Vector cache enabled for frequently accessed users

2.  **`ConceptEmbeddings`**
    *   **Vector Field:** `vector` (same dimensionality as `ChunkEmbeddings` for comparability, or a dedicated concept embedding model).
    *   **Properties:**
        *   `concept_id`: TEXT (Primary key, links to `concepts.concept_id` in PostgreSQL). **Must be unique.**
        *   `user_id`: TEXT.
        *   `name`: TEXT (Concept name).
        *   `type`: TEXT (Concept type).
        *   `description_preview`: TEXT (Optional: first ~100 chars of concept description).
        *   `embedding_model`: TEXT.
        *   `region`: TEXT (user's region for data residency compliance).
    *   **Vectorizer:** `none`.
    *   **Sharding Strategy:** `by-user_id` (ensures data residency and performance).
    *   **Index Configuration:** Similar to ChunkEmbeddings but with potentially higher precision settings.

3.  **`MediaEmbeddings`**
    *   **Vector Field:** `vector` (for media captions, extracted features, or visual embeddings).
    *   **Properties:**
        *   `media_id`: TEXT (Primary key, links to `media.media_id` in PostgreSQL).
        *   `user_id`: TEXT.
        *   `muid`: TEXT.
        *   `media_type`: TEXT (image, audio, video, document).
        *   `caption_preview`: TEXT (for text-based filtering).
        *   `embedding_model`: TEXT (specifies which model generated the embedding).
        *   `embedding_type`: TEXT (e.g., 'caption', 'visual_features', 'audio_features').
        *   `region`: TEXT (user's region for data residency compliance).
    *   **Vectorizer:** `none`.
    *   **Sharding Strategy:** Same as other collections.

**Cross-References and Consistency Considerations:**

1. **Referential Integrity:** While Weaviate doesn't enforce referential integrity like PostgreSQL, application logic must ensure:
   - Only store vectors for valid cid/concept_id/media_id values
   - Delete vectors when corresponding PostgreSQL records are deleted
   - Maintain consistency between PostgreSQL and Weaviate

2. **Batch Operations:** Use batch operations for vector insertions and updates to improve performance.

3. **Multi-Tenancy:** User isolation achieved through filter properties and sharding.

4. **Hybrid Search Configuration:**
   - Enable BM25 text search alongside vector search
   - Configure property weights (e.g., name, text_preview) for text search
   - Set sensible default balance between vector and keyword search (0.75/0.25)

5. **Performance Optimization:**
   - Implement vector caching for frequently accessed users
   - Consider quantization for large collections to reduce memory requirements
   - Monitor and adjust HNSW parameters based on recall/performance metrics

6. **Schema Evolution Strategy:**
   - Plan for embedding model upgrades (store embeddings with model version)
   - Support multiple embedding dimensions through separate class properties
   - Schema versioning approach for breaking changes

---

### 3. Neo4j Data Model (Knowledge Graph Structure)

**Purpose:** Stores the interconnected web of entities, relationships, and their semantic properties. Optimized for traversals, pattern matching, and complex relationship queries.

**Node Labels & Key Properties:**
*(Properties listed are key identifiers and commonly queried attributes. Full details might be in PostgreSQL, with Neo4j storing a subset for graph-native operations or a direct link via ID to PostgreSQL record).*

1.  **`:User`**
    *   Properties: 
        *   `userId` (string, unique, indexed)
        *   `name` (string)
        *   `region` (string)

2.  **`:MemoryUnit`**
    *   Properties: 
        *   `muid` (string, unique, indexed)
        *   `creation_ts` (datetime, indexed)
        *   `title` (string)
        *   `source_type` (string, indexed)
        *   `importance_score` (float)
        *   `tier` (integer) - Processing tier level

3.  **`:Chunk`**
    *   Properties: 
        *   `cid` (string, unique, indexed)
        *   `sequence_order` (integer)
        *   `role` (string)
        *   `text_preview` (string) - First ~50 chars for quick inspection
        *   `embedding_id` (string) - Link to vector in Weaviate

4.  **`:Concept`**
    *   Properties: 
        *   `concept_id` (string, unique, indexed)
        *   `name` (string, indexed)
        *   `type` (string, indexed)
        *   `user_defined` (boolean)
        *   `confidence` (float)
        *   `description` (string)

5.  **`:Media`**
    *   Properties: 
        *   `media_id` (string, unique, indexed)
        *   `type` (string, indexed)
        *   `url` (string, pointer to S3/COS)
        *   `caption` (string)
        *   `embedding_id` (string) - Link to vector in Weaviate

6.  **`:Annotation`**
    *   Properties: 
        *   `aid` (string, unique, indexed)
        *   `annotation_type` (string, indexed)
        *   `source` (string)
        *   `creation_ts` (datetime)
        *   `text_preview` (string) - Shortened version for quick inspection

7.  **`:Community`**
    *   Properties: 
        *   `community_id` (string, unique, indexed)
        *   `name` (string, indexed)
        *   `detection_method` (string)
        *   `confidence_score` (float)
        *   `keywords` (string[])

**Relationship Types & Key Properties:**

1.  **`(User)-[:AUTHORED]->(MemoryUnit)`**
    *   No additional properties needed - simple ownership relation

2.  **`(MemoryUnit)-[:CONTAINS]->(Chunk)`**
    *   Properties: 
        *   `sequence_order` (integer, for traversal ordering)

3.  **`(MemoryUnit)-[:HIGHLIGHTS]->(Concept)`**
    *   Properties: 
        *   `weight` (float) - Strength of association (0.0-1.0)
        *   `significance` (string) - e.g., "key_theme", "defining_moment", "minor_mention"
        *   `source` (string) - What identified this highlight (agent name)
        *   `confidence` (float) - Confidence in this association

4.  **`(Chunk)-[:MENTIONS]->(Concept)`**
    *   Properties: 
        *   `weight` (float) - Strength of mention (0.0-1.0)
        *   `start_offset` (integer) - Position in chunk text (optional)
        *   `end_offset` (integer) - End position in chunk text (optional)
        *   `confidence` (float) - Confidence in this mention

5.  **`(MemoryUnit)-[:INCLUDES]->(Media)`**
    *   Properties:
        *   `role` (string) - The role this media plays in the memory unit (e.g., "primary", "supporting", "reference")

6.  **`(Concept)-[:RELATED_TO]->(Concept)`**
    *   Properties: 
        *   `relationship_label` (string, indexed) - From controlled vocabulary
        *   `weight` (float) - Strength of relationship (0.0-1.0)
        *   `source` (string) - Origin of relation ('ai_inferred', 'user_stated', 'ontology_default')
        *   `creation_ts` (datetime)
        *   `context_muid` (string, optional) - If relationship was identified in specific memory
        *   `confidence` (float) - Confidence in this relationship (0.0-1.0)

7.  **`(User)-[:PERCEIVES]->(Concept)`**
    *   Properties: 
        *   `perception_type` (string, indexed) - From controlled vocabulary
        *   `current_salience` (float) - Importance to user (0.0-1.0)
        *   `start_date` (date) - When this perception began
        *   `end_date` (date, nullable) - When this perception ended (if no longer current)
        *   `confidence` (float) - Confidence in this perception (0.0-1.0)

8.  **`(MemoryUnit)-[:CONTINUES]->(MemoryUnit)`** 
    *   Properties: 
        *   `reason` (string) - Why these are connected
        *   `strength` (float) - How strongly connected (0.0-1.0)
        *   `temporal_gap` (integer) - Time between units (in minutes/hours/days)

9.  **`(Annotation)-[:ANNOTATES]->(MemoryUnit | Chunk | Concept | Community)`**
    *   Properties:
        *   `relevance` (float) - How relevant the annotation is (0.0-1.0)

10. **`(Concept)-[:BELONGS_TO]->(Community)`**
    *   Properties: 
        *   `membership_strength` (float) - How strongly this concept belongs to community (0.0-1.0)
        *   `centrality` (float) - Measure of centrality within community (0.0-1.0)

**Neo4j-Specific Indexing & Optimization:**

1. **Node Label Indexes:**
   ```cypher
   CREATE INDEX user_id_index FOR (u:User) ON (u.userId);
   CREATE INDEX memory_unit_id_index FOR (m:MemoryUnit) ON (m.muid);
   CREATE INDEX concept_id_index FOR (c:Concept) ON (c.concept_id);
   CREATE INDEX chunk_id_index FOR (ch:Chunk) ON (ch.cid);
   CREATE INDEX media_id_index FOR (m:Media) ON (m.media_id);
   ```

2. **Composite Indexes:**
   ```cypher
   CREATE INDEX memory_unit_user_index FOR (m:MemoryUnit) ON (m.muid, m.userId);
   CREATE INDEX concept_type_index FOR (c:Concept) ON (c.type, c.name);
   ```

3. **Relationship Indexes:**
   ```cypher
   CREATE INDEX related_to_label_index FOR ()-[r:RELATED_TO]-() ON (r.relationship_label);
   CREATE INDEX perceives_type_index FOR ()-[r:PERCEIVES]-() ON (r.perception_type);
   ```

4. **Full-Text Indexes:**
   ```cypher
   CREATE FULLTEXT INDEX memory_unit_title_index FOR (m:MemoryUnit) ON EACH [m.title];
   CREATE FULLTEXT INDEX concept_name_desc_index FOR (c:Concept) ON EACH [c.name, c.description];
   ```

5. **Graph-Specific Optimizations:**

   * **Neighborhood Queries:** For key pattern traversals, use pattern-specific indexes:
     ```cypher
     // Example: Find concepts mentioned by chunks in a memory unit
     MATCH (m:MemoryUnit {muid: $muid})-[:CONTAINS]->(ch:Chunk)-[:MENTIONS]->(c:Concept)
     RETURN c;
     ```

   * **Path Finding:** Pre-compute and cache important relationship paths for key entities:
     ```cypher
     // Example: Find paths between two concepts
     MATCH path = shortestPath((c1:Concept {concept_id: $concept1})-[:RELATED_TO*..4]-(c2:Concept {concept_id: $concept2}))
     RETURN path;
     ```

   * **Community Detection:** Use Neo4j Graph Data Science library for built-in algorithms:
     ```cypher
     // Example: Calculate community detection on concept subgraph
     CALL gds.louvain.write({
       nodeProjection: 'Concept',
       relationshipProjection: 'RELATED_TO',
       relationshipWeightProperty: 'weight',
       writeProperty: 'communityId'
     });
     ```

6. **Data Consistency Considerations:**

   * **Transaction Management:** Use explicit transactions for multi-statement operations.
   * **Lock Management:** Implement optimistic concurrency control for high-contention nodes.
   * **Batch Processing:** Use efficient batching for large graph updates:
     ```cypher
     UNWIND $conceptRelationships AS rel
     MATCH (c1:Concept {concept_id: rel.source_id})
     MATCH (c2:Concept {concept_id: rel.target_id})
     MERGE (c1)-[r:RELATED_TO {relationship_label: rel.label}]->(c2)
     ON CREATE SET r += {weight: rel.weight, source: rel.source, creation_ts: datetime()}
     ON MATCH SET r.weight = rel.weight, r.updated_ts = datetime();
     ```

7. **Efficient Graph Queries:**
   * Use parameterized Cypher queries to leverage query plan caching
   * Limit results early in query chains with `LIMIT`
   * Use `SKIP` and `LIMIT` for pagination, but be aware of performance implications
   * Prefer pattern-based queries over global graph algorithms for interactive queries

---

### 4. Cross-Database Consistency & Sync Mechanisms

**Data Consistency Strategy:**

1. **Primary Source of Truth:**
   * PostgreSQL is the source of truth for entity existence, core properties, and metadata
   * Neo4j is the source of truth for relationships and graph structure
   * Weaviate is the source of truth for vector embeddings

2. **Sync Mechanisms:**
   * **PostgreSQL → Neo4j:** For entity creation and core property updates
     * Transaction-based replication for critical paths
     * Batch sync for non-critical updates
     
   * **Neo4j → PostgreSQL:** For relationship denormalization (when needed for performance)
     * Scheduled sync jobs
     * Event-based triggers for critical relationships
     
   * **PostgreSQL → Weaviate:** For vector storage with metadata
     * Transaction-based workflow for user-facing vectors
     * Batch processing queue for background embedding generation

3. **Consistency Checking:**
   * Scheduled reconciliation jobs to detect and fix inconsistencies
   * Checksums/versioning for detecting out-of-sync entities
   * Health check API endpoints to validate cross-database consistency

4. **Failure Handling:**
   * Circuit breakers to prevent cascade failures
   * Retry queues for failed sync operations
   * Recovery procedures for rebuilding database state
   * Partial degradation paths that maintain core functionality

5. **Transactional Boundaries:**
   * Define clear transaction boundaries across databases
   * Use compensating transactions for rollback across databases
   * Implement eventually consistent patterns for non-critical paths

---

This detailed data model specification provides a solid foundation for building the 2dots1line V4 system. The PostgreSQL schema handles the bulk of structured data and metadata, Weaviate provides fast semantic search capabilities, and Neo4j captures the rich, interconnected nature of the user's personal knowledge graph. The clear distinction of responsibilities between these databases, guided by the V4 Tech Spec, ensures a robust and scalable system with appropriate consistency guarantees across databases.