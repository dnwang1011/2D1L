-- Migration: Directive 4 - Remove Redundant PostgreSQL Relationship Tables
-- Date: 2025-01-26
-- Purpose: Remove concept_relationships and user_perceived_concepts tables as they duplicate Neo4j functionality

-- Step 1: Create backup tables (for rollback capability)
CREATE TABLE concept_relationships_backup AS SELECT * FROM concept_relationships;
CREATE TABLE user_perceived_concepts_backup AS SELECT * FROM user_perceived_concepts;

-- Step 2: Remove foreign key constraints and indexes
DROP INDEX IF EXISTS concept_relationships_user_id_relationship_type_idx;
DROP INDEX IF EXISTS concept_relationships_user_id_source_concept_id_idx;
DROP INDEX IF EXISTS concept_relationships_user_id_target_concept_id_idx;
DROP INDEX IF EXISTS user_perceived_concepts_user_id_last_updated_ts_idx;

-- Step 3: Drop the redundant tables
-- Note: These relationships are better managed in Neo4j for graph operations
DROP TABLE IF EXISTS concept_relationships;
DROP TABLE IF EXISTS user_perceived_concepts;

-- Step 4: Remove raw_content table as specified in Directive 5
-- This table is redundant with MemoryUnit.content storage
CREATE TABLE raw_content_backup AS SELECT * FROM raw_content;
DROP INDEX IF EXISTS raw_content_muid_idx;
DROP INDEX IF EXISTS raw_content_user_id_idx;
DROP INDEX IF EXISTS raw_content_content_type_idx;
DROP TABLE IF EXISTS raw_content;

-- Step 5: Update memory_units table to better handle content storage
-- Add content_source field to track original vs processed content
ALTER TABLE memory_units 
ADD COLUMN IF NOT EXISTS content_source VARCHAR(50) DEFAULT 'processed',
ADD COLUMN IF NOT EXISTS original_content TEXT,
ADD COLUMN IF NOT EXISTS content_processing_notes JSONB;

-- Add index for content source queries
CREATE INDEX IF NOT EXISTS memory_units_content_source_idx ON memory_units(user_id, content_source);

-- Step 6: Create materialized view for entity growth progress (Directive 2)
-- This replaces the need for relationship tables in PostgreSQL
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_entity_growth_progress AS
SELECT 
  user_id,
  entity_id,
  entity_type,
  dim_key,
  SUM(delta) AS score,
  COUNT(*) AS event_count,
  MAX(created_at) AS last_event_ts,
  MIN(created_at) AS first_event_ts
FROM growth_events 
GROUP BY user_id, entity_id, entity_type, dim_key;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS mv_entity_growth_progress_user_entity_idx 
ON mv_entity_growth_progress(user_id, entity_id, entity_type);

CREATE INDEX IF NOT EXISTS mv_entity_growth_progress_user_dim_idx 
ON mv_entity_growth_progress(user_id, dim_key);

CREATE INDEX IF NOT EXISTS mv_entity_growth_progress_score_idx 
ON mv_entity_growth_progress(user_id, score DESC);

-- Step 7: Create view for card evolution states (replaces relationship-based logic)
CREATE OR REPLACE VIEW v_card_evolution_state AS
SELECT 
  c.concept_id AS entity_id,
  c.user_id,
  'concept' AS entity_type,
  c.name AS card_title,
  CASE 
    WHEN COALESCE(gs.dim_count, 0) >= 5 AND COALESCE(gs.total_score, 0) >= 2.0 THEN 'supernova'
    WHEN COALESCE(gs.dim_count, 0) >= 3 AND COALESCE(gs.total_score, 0) >= 1.0 THEN 'constellation'
    WHEN COALESCE(gs.dim_count, 0) >= 2 AND COALESCE(gs.total_score, 0) >= 0.5 THEN 'bloom'
    WHEN COALESCE(gs.dim_count, 0) >= 1 AND COALESCE(gs.total_score, 0) >= 0.1 THEN 'sprout'
    ELSE 'seed'
  END AS evolution_state,
  COALESCE(gs.dim_count, 0) AS active_dimensions,
  COALESCE(gs.total_score, 0) AS total_growth_score
FROM concepts c
LEFT JOIN (
  SELECT 
    entity_id,
    user_id,
    entity_type,
    COUNT(DISTINCT dim_key) AS dim_count,
    SUM(score) AS total_score,
    COUNT(*) AS total_events
  FROM mv_entity_growth_progress 
  WHERE entity_type = 'concept' AND score > 0
  GROUP BY entity_id, user_id, entity_type
) gs ON c.concept_id = gs.entity_id AND c.user_id = gs.user_id;

-- Step 8: Add comments for documentation
COMMENT ON MATERIALIZED VIEW mv_entity_growth_progress IS 
'Directive 2 & 4: Replaces concept_relationships table. Provides per-entity growth data for cards.';

COMMENT ON VIEW v_card_evolution_state IS 
'Directive 4: Replaces relationship-based evolution logic with growth-event-based calculation.';

COMMENT ON TABLE concept_relationships_backup IS 
'Backup of removed concept_relationships table. Can be used for rollback if needed.';

COMMENT ON TABLE user_perceived_concepts_backup IS 
'Backup of removed user_perceived_concepts table. Can be used for rollback if needed.';

COMMENT ON TABLE raw_content_backup IS 
'Backup of removed raw_content table. Content now stored in memory_units.content.';

-- Step 9: Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_entity_growth_progress; 