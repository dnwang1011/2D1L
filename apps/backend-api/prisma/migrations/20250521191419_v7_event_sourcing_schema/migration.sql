-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT,
    "name" TEXT,
    "preferences" JSONB,
    "region" TEXT NOT NULL DEFAULT 'us',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3),
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "growth_profile" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "growth_events" (
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "dim_key" TEXT NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "memory_units" (
    "muid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "title" TEXT,
    "creation_ts" TIMESTAMP(3) NOT NULL,
    "ingestion_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_status" TEXT NOT NULL DEFAULT 'raw',
    "importance_score" DOUBLE PRECISION,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "memory_units_pkey" PRIMARY KEY ("muid")
);

-- CreateTable
CREATE TABLE "raw_content" (
    "content_id" TEXT NOT NULL,
    "muid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender_type" TEXT,
    "sequence_order" INTEGER,
    "creation_ts" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "raw_content_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "chunks" (
    "cid" TEXT NOT NULL,
    "muid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "role" TEXT,
    "embedding_id" TEXT,
    "char_count" INTEGER,
    "token_count" INTEGER,
    "embedding_model" TEXT,
    "embedding_created_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "concepts" (
    "concept_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "user_defined" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "community_id" TEXT,
    "embedding_id" TEXT,
    "ontology_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("concept_id")
);

-- CreateTable
CREATE TABLE "media" (
    "media_id" TEXT NOT NULL,
    "muid" TEXT,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "filename_original" TEXT,
    "mime_type" TEXT,
    "file_size_bytes" INTEGER,
    "hash_value" TEXT,
    "caption" TEXT,
    "extracted_text" TEXT,
    "extraction_status" TEXT NOT NULL DEFAULT 'pending',
    "embedding_id" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "media_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "annotations" (
    "aid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_node_type" TEXT NOT NULL,
    "annotation_type" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "creation_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("aid")
);

-- CreateTable
CREATE TABLE "communities" (
    "community_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "detection_method" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "keywords" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_analyzed_ts" TIMESTAMP(3),

    CONSTRAINT "communities_pkey" PRIMARY KEY ("community_id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "message_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sender_type" TEXT NOT NULL,
    "message_text" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "media_attachments" JSONB,
    "suggested_actions" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_status" TEXT NOT NULL DEFAULT 'pending_ingestion',
    "associated_muid" TEXT,
    "retrieval_context_summary" TEXT,
    "user_feedback_on_response" TEXT,
    "metadata" JSONB,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "last_message_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "summary" TEXT,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "insights" (
    "insight_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_muids" TEXT[],
    "source_concepts" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("insight_id")
);

-- CreateTable
CREATE TABLE "ontology_terms" (
    "term_id" TEXT NOT NULL,
    "term_name" TEXT NOT NULL,
    "term_type" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "parent_term_id" TEXT,
    "related_terms" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ontology_terms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "agent_processing_jobs" (
    "job_id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "target_entity_id" TEXT,
    "target_node_type" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "result" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "agent_processing_jobs_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "user_perceived_concepts" (
    "perception_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "perceived_name" TEXT,
    "understanding_level" DOUBLE PRECISION,
    "interest_level" DOUBLE PRECISION,
    "last_updated_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_muids" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "user_perceived_concepts_pkey" PRIMARY KEY ("perception_id")
);

-- CreateTable
CREATE TABLE "concept_relationships" (
    "relationship_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_concept_id" TEXT NOT NULL,
    "target_concept_id" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "strength" DOUBLE PRECISION,
    "user_defined" BOOLEAN NOT NULL DEFAULT false,
    "context_muid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "concept_relationships_pkey" PRIMARY KEY ("relationship_id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "metric_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" JSONB,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("metric_id")
);

-- CreateTable
CREATE TABLE "user_activity_log" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "user_activity_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_region_idx" ON "users"("region");

-- CreateIndex
CREATE INDEX "growth_events_user_id_created_at_idx" ON "growth_events"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "growth_events_user_id_entity_type_entity_id_idx" ON "growth_events"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "growth_events_user_id_dim_key_idx" ON "growth_events"("user_id", "dim_key");

-- CreateIndex
CREATE INDEX "memory_units_user_id_creation_ts_idx" ON "memory_units"("user_id", "creation_ts" DESC);

-- CreateIndex
CREATE INDEX "memory_units_user_id_processing_status_idx" ON "memory_units"("user_id", "processing_status");

-- CreateIndex
CREATE INDEX "memory_units_user_id_source_type_idx" ON "memory_units"("user_id", "source_type");

-- CreateIndex
CREATE INDEX "memory_units_user_id_importance_score_idx" ON "memory_units"("user_id", "importance_score");

-- CreateIndex
CREATE INDEX "raw_content_muid_idx" ON "raw_content"("muid");

-- CreateIndex
CREATE INDEX "raw_content_user_id_idx" ON "raw_content"("user_id");

-- CreateIndex
CREATE INDEX "raw_content_content_type_idx" ON "raw_content"("content_type");

-- CreateIndex
CREATE INDEX "chunks_muid_sequence_order_idx" ON "chunks"("muid", "sequence_order");

-- CreateIndex
CREATE INDEX "chunks_user_id_idx" ON "chunks"("user_id");

-- CreateIndex
CREATE INDEX "chunks_embedding_id_idx" ON "chunks"("embedding_id");

-- CreateIndex
CREATE INDEX "concepts_user_id_type_idx" ON "concepts"("user_id", "type");

-- CreateIndex
CREATE INDEX "concepts_user_id_name_idx" ON "concepts"("user_id", "name");

-- CreateIndex
CREATE INDEX "concepts_community_id_idx" ON "concepts"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_user_id_name_type_key" ON "concepts"("user_id", "name", "type");

-- CreateIndex
CREATE INDEX "media_muid_idx" ON "media"("muid");

-- CreateIndex
CREATE INDEX "media_user_id_idx" ON "media"("user_id");

-- CreateIndex
CREATE INDEX "media_user_id_type_idx" ON "media"("user_id", "type");

-- CreateIndex
CREATE INDEX "media_user_id_hash_value_idx" ON "media"("user_id", "hash_value");

-- CreateIndex
CREATE INDEX "annotations_target_id_target_node_type_idx" ON "annotations"("target_id", "target_node_type");

-- CreateIndex
CREATE INDEX "annotations_user_id_annotation_type_idx" ON "annotations"("user_id", "annotation_type");

-- CreateIndex
CREATE INDEX "annotations_source_idx" ON "annotations"("source");

-- CreateIndex
CREATE INDEX "communities_user_id_idx" ON "communities"("user_id");

-- CreateIndex
CREATE INDEX "conversation_messages_conversation_id_timestamp_idx" ON "conversation_messages"("conversation_id", "timestamp");

-- CreateIndex
CREATE INDEX "conversation_messages_user_id_timestamp_idx" ON "conversation_messages"("user_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "conversation_messages_associated_muid_idx" ON "conversation_messages"("associated_muid");

-- CreateIndex
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "insights_user_id_type_idx" ON "insights"("user_id", "type");

-- CreateIndex
CREATE INDEX "insights_user_id_generated_at_idx" ON "insights"("user_id", "generated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ontology_terms_term_name_key" ON "ontology_terms"("term_name");

-- CreateIndex
CREATE INDEX "ontology_terms_term_name_term_type_idx" ON "ontology_terms"("term_name", "term_type");

-- CreateIndex
CREATE INDEX "agent_processing_jobs_job_type_status_idx" ON "agent_processing_jobs"("job_type", "status");

-- CreateIndex
CREATE INDEX "agent_processing_jobs_target_entity_id_target_node_type_idx" ON "agent_processing_jobs"("target_entity_id", "target_node_type");

-- CreateIndex
CREATE INDEX "agent_processing_jobs_priority_created_at_idx" ON "agent_processing_jobs"("priority", "created_at");

-- CreateIndex
CREATE INDEX "user_perceived_concepts_user_id_last_updated_ts_idx" ON "user_perceived_concepts"("user_id", "last_updated_ts" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_perceived_concepts_user_id_concept_id_key" ON "user_perceived_concepts"("user_id", "concept_id");

-- CreateIndex
CREATE INDEX "concept_relationships_user_id_relationship_type_idx" ON "concept_relationships"("user_id", "relationship_type");

-- CreateIndex
CREATE INDEX "concept_relationships_user_id_source_concept_id_idx" ON "concept_relationships"("user_id", "source_concept_id");

-- CreateIndex
CREATE INDEX "concept_relationships_user_id_target_concept_id_idx" ON "concept_relationships"("user_id", "target_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "concept_relationships_user_id_source_concept_id_target_conc_key" ON "concept_relationships"("user_id", "source_concept_id", "target_concept_id", "relationship_type");

-- CreateIndex
CREATE INDEX "system_metrics_name_timestamp_idx" ON "system_metrics"("name", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "user_activity_log_user_id_timestamp_idx" ON "user_activity_log"("user_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "user_activity_log_action_idx" ON "user_activity_log"("action");

-- AddForeignKey
ALTER TABLE "growth_events" ADD CONSTRAINT "growth_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_units" ADD CONSTRAINT "memory_units_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_content" ADD CONSTRAINT "raw_content_muid_fkey" FOREIGN KEY ("muid") REFERENCES "memory_units"("muid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_content" ADD CONSTRAINT "raw_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_muid_fkey" FOREIGN KEY ("muid") REFERENCES "memory_units"("muid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_muid_fkey" FOREIGN KEY ("muid") REFERENCES "memory_units"("muid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_associated_muid_fkey" FOREIGN KEY ("associated_muid") REFERENCES "memory_units"("muid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_perceived_concepts" ADD CONSTRAINT "user_perceived_concepts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_perceived_concepts" ADD CONSTRAINT "user_perceived_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("concept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_source_concept_id_fkey" FOREIGN KEY ("source_concept_id") REFERENCES "concepts"("concept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_target_concept_id_fkey" FOREIGN KEY ("target_concept_id") REFERENCES "concepts"("concept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relationships" ADD CONSTRAINT "concept_relationships_context_muid_fkey" FOREIGN KEY ("context_muid") REFERENCES "memory_units"("muid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- V7 Materialized View: mv_entity_growth
-- Computes current growth scores for each entity and dimension.
CREATE MATERIALIZED VIEW mv_entity_growth AS
SELECT
  user_id, -- Added user_id for partitioning/filtering if necessary
  entity_id,
  entity_type,
  dim_key,
  SUM(delta) AS score
FROM growth_events
GROUP BY user_id, entity_id, entity_type, dim_key;

-- V7 View: v_card_state
-- Computes the evolution state of a card (concept, memory, etc.)
CREATE VIEW v_card_state AS
SELECT
  c.concept_id AS entity_id,
  c.user_id,    -- Added user_id
  'concept' AS entity_type,
  c.name as card_title, -- Added for convenience
  CASE
    WHEN COALESCE(cs.conn_cnt, 0) >= 5 THEN 'constellation' -- Assuming conn_cnt is from a synced table or another view
    WHEN COALESCE(gs.dim_cnt, 0) >= 3 THEN 'bloom'
    WHEN COALESCE(gs.dim_cnt, 0) >= 1 THEN 'sprout'
    ELSE 'seed'
  END AS evolution_state
FROM concepts c
LEFT JOIN (
  SELECT cr.source_concept_id AS entity_id, cr.user_id, COUNT(DISTINCT cr.target_concept_id) AS conn_cnt -- Corrected: use source_concept_id as entity_id and target_concept_id for counting distinct connections
  FROM concept_relationships cr
  WHERE cr.relationship_type = 'RELATED_TO' -- Example filter
  GROUP BY cr.source_concept_id, cr.user_id -- Corrected: group by source_concept_id and user_id
) cs ON c.concept_id = cs.entity_id AND c.user_id = cs.user_id
LEFT JOIN (
  SELECT entity_id, user_id, entity_type, COUNT(DISTINCT dim_key) AS dim_cnt
  FROM mv_entity_growth meg -- Note: This now correctly references the materialized view
  WHERE meg.entity_type = 'concept' AND meg.score > 0 -- Consider only positive progress for dimension count
  GROUP BY entity_id, user_id, entity_type
) gs ON c.concept_id = gs.entity_id AND c.user_id = gs.user_id AND gs.entity_type = 'concept';
