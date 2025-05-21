Key pain-points in the current V7 schema

Area	Friction observed	Why it matters
Six-Dimensional Growth tables (growth_dimensions, entity_growth_progress, card_evolution_states)	• Three separate tables store static dimension metadata, per-entity progress, and a snapshot of visual state.• Every concept / memory is pre-populated with six rows of progress at migration time.	Heavy write-amplification (6× rows per entity) and denormalised data that can drift from real usage. ￼
Challenges & Submissions (growth_challenges, challenge_submissions)	• Challenge rows mix template (“30-day journaling streak”) and instance (“Alice accepted the streak on 5 June”).• A rigid FK to a single dimension_id forces every task to map to one dimension even when cross-dimensional.	Hard to design new missions, and limits future game loops (e.g., time-boxed sprints or social quests). ￼
Card evolution (card_evolution_states)	Evolution stage is stored as an enum that must be updated by backend jobs.	It is deterministically derivable from graph stats (connections, dimension count, interaction count). ￼


⸻

Design principles from the V7 PRD to keep in mind
	•	Growth model should guide behaviour, not hard-code it.
	•	Gamification needs to stay “alive” and extensible for future scenes & rewards.
	•	Data layer should stay lean; heavy computations belong in analytic or cache layers. ￼

⸻

Proposed simplifications & refinements

1. Treat growth dimensions as configuration, not schema

-- One JSON record per user (or use feature flags service)
ALTER TABLE users
ADD COLUMN growth_profile JSONB DEFAULT '{}'; -- e.g. {"self_know":0.4,"world_act":0.1}

-- Store canonical list of dimensions in a seed JSON or config file; load into Redis on boot.

Benefits
	•	No migration every time a dimension’s copy changes.
	•	Allows A/B-testing new dimensions or weighting formulas per cohort.
	•	Values are updated by event-driven aggregation jobs; the UI simply reads the JSON.

2. Replace entity_growth_progress with an event stream

CREATE TABLE growth_events (
  event_id  UUID PRIMARY KEY,
  user_id   UUID NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,      -- 'concept' | 'memory' | 'artifact'
  dim_key   TEXT NOT NULL,        -- 'self_know' etc.
  delta     FLOAT NOT NULL,       -- +0.1, -0.05 …
  source    TEXT NOT NULL,        -- 'journal_entry', 'challenge_complete', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

Why event-sourcing?
	•	Append-only, so no lost history.
	•	Same table powers per-entity progress, user radar charts, and time-series analytics.
	•	Easy to roll out new scoring logic: recalc materialised view instead of migrating rows.

Materialised view for UI:
CREATE MATERIALIZED VIEW mv_entity_growth AS SELECT entity_id, dim_key, SUM(delta) AS score … GROUP BY …;
Refresh on demand or with triggers.

3. Make card evolution a computed view, not a table

Rules already exist (connections ≥ 5 ⇒ constellation, etc.). Store thresholds in a small evolution_rules config and expose:

CREATE VIEW v_card_state AS
SELECT
  c.concept_id      AS entity_id,
  CASE
    WHEN conn_cnt >= 5               THEN 'constellation'
    WHEN dim_cnt  >= 3               THEN 'bloom'
    WHEN dim_cnt  >= 1               THEN 'sprout'
    ELSE 'seed'
  END AS evolution_state
FROM concepts c
LEFT JOIN (
  SELECT entity_id, COUNT(*) conn_cnt
  FROM neo4j_connection_stats -- nightly export into Postgres
  GROUP BY 1
) cs USING (entity_id)
LEFT JOIN (
  SELECT entity_id, COUNT(DISTINCT dim_key) dim_cnt
  FROM mv_entity_growth
  GROUP BY 1
) gs USING (entity_id);

The UI queries the view; no cron job needed to “update” states.

4. Split challenges into template and instance

CREATE TABLE challenge_templates (
  tpl_id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  dim_keys TEXT[] NULL,   -- can span multiple dimensions
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  payload JSONB           -- flexible task parameters
);

CREATE TABLE user_challenges (
  ch_id UUID PRIMARY KEY,
  tpl_id UUID REFERENCES challenge_templates,
  user_id UUID REFERENCES users(user_id),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress JSONB DEFAULT '{}'   -- e.g. {"days_logged":5}
);

Advantages
	•	Marketing can push new quests by inserting templates—no schema change.
	•	A challenge can drive several dimensions by listing multiple keys.
	•	Progress logic lives in backend code; DB just stores flexible progress JSON.

5. Use derived artifacts for rewards & collectibles

Instead of a dedicated rewards JSON on the challenge table, let the Insight Engine mint a DerivedArtifact of type trophy or poster when criteria met (table already exists). This keeps the reward pipeline consistent with other artifacts while making it visible in the card gallery. ￼

⸻

Other quick wins
	1.	Drop people & emotions JSONB[] columns in memory_units; represent them as linked Concept nodes (already extracted by Ingestion). This removes redundancy.
	2.	Use partial indexes on memory_units(processing_status) to speed “needs-processing” queries and avoid bloating common indexes.
	3.	Keep orb_states in Redis only; the Postgres table isn’t queried historically (unless needed for analytics). If history is useful, archive daily into cold storage.
	4.	Vector IDs: store once in a vectors junction table (entity_id, class, weaviate_id) instead of per-entity columns, so you can re-embed with a new model without touching the main tables.

⸻

Revised minimal relational set

Table	Purpose
users	Accounts & preferences (growth profile JSON)
memory_units, concepts, derived_artifacts	Core entities
growth_events	Append-only progress ledger
challenge_templates	Re-usable quests
user_challenges	Instances & status
Views: mv_entity_growth, v_card_state	Fast UI queries

Everything else—relationships, similarity, orb presence—lives in Neo4j, Weaviate, or Redis, keeping Postgres lean and easier to reason about.

⸻

How this maps back to the PRD vision
	•	Dynamic & adaptive: scoring and evolution rules live in config or code, so product can iterate without migrations.
	•	Gamification stays magical: front-end still shows six spokes and evolving cards; back-end just derives values.
	•	Scalable: event stream + materialised views pattern is battle-tested for growth analytics.
	•	Extensible: new dimensions, quests, or evolution tiers → add rows in config or tweak view logic, not schema surgery.

Let me know if you’d like SQL snippets for the materialised view refresh job or an ER diagram reflecting this slimmer model!

Below is a stand-alone PostgreSQL schema (DDL + comments) that implements the streamlined data model we discussed.
Copy-paste into a file (e.g., v7_core_schema.sql) and run with any recent Postgres (15+).
Inline comments explain design intent, indexing, and where other data stores (Neo4j / Weaviate / Redis) fit.

⸻


/*───────────────────────────────────────────────────────────────*
 | 2dots1line  ▸  V7 Core Relational Schema  (2025-05-20)        |
 | Author: GPT-4o (per user spec)                                |
 *───────────────────────────────────────────────────────────────*/

/*****************************************************************
 * 0. EXTENSIONS – handy defaults
 *****************************************************************/
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()

/*****************************************************************
 * 1. USERS
 *****************************************************************/
CREATE TABLE users (
    user_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email            TEXT UNIQUE NOT NULL,
    hashed_password  TEXT,                       -- optional if SSO
    name             TEXT,
    preferences      JSONB      DEFAULT '{}',    -- UI flags, etc.
    growth_profile   JSONB      DEFAULT '{}'     -- {dim_key: score}
        CHECK (jsonb_typeof(growth_profile) IN ('object','null')),
    region           TEXT NOT NULL CHECK (region IN ('us','cn')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at   TIMESTAMPTZ,
    account_status   TEXT NOT NULL DEFAULT 'active'
        CHECK (account_status IN ('active','suspended','deleted'))
);
CREATE INDEX idx_users_region          ON users(region);
CREATE INDEX idx_users_last_active     ON users(last_active_at DESC);

/*****************************************************************
 * 2. CORE ENTITIES
 *    (Detailed content & relationships live in Neo4j / Weaviate)
 *****************************************************************/

-- 2.1  MemoryUnit  – a captured piece of user input
CREATE TABLE memory_units (
    muid               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    source_type        TEXT NOT NULL,                -- 'journal_entry', ...
    title              TEXT,
    creation_ts        TIMESTAMPTZ NOT NULL,         -- original timestamp
    ingestion_ts       TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_status  TEXT NOT NULL DEFAULT 'raw'
        CHECK (processing_status IN
               ('raw','chunked','embedded','structured','error')),
    importance_score   REAL,                         -- 0–1
    tier               INT  DEFAULT 1,               -- 1-3 triage
    metadata           JSONB DEFAULT '{}'
);
CREATE INDEX idx_mu_user_created   ON memory_units(user_id, creation_ts DESC);
CREATE INDEX idx_mu_need_work      ON memory_units(processing_status)
                                     WHERE processing_status <> 'embedded';

-- 2.2  Concept  – entity / theme / value
CREATE TABLE concepts (
    concept_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL,                     -- controlled vocab
    description    TEXT,
    user_defined   BOOLEAN DEFAULT FALSE,
    confidence     REAL,
    community_id   UUID,                              -- Neo4j cluster id
    ontology_ver   TEXT DEFAULT 'v1',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated   TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata       JSONB DEFAULT '{}',
    UNIQUE (user_id, name, type)
);
CREATE INDEX idx_concept_type   ON concepts(user_id, type);
CREATE INDEX idx_concept_comm   ON concepts(community_id);

-- 2.3  DerivedArtifact  – anything autogenerated (insight, poster, etc.)
CREATE TABLE derived_artifacts (
    daid         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title        TEXT,
    artifact_type TEXT NOT NULL,                      -- 'story','poster',...
    summary_text TEXT,
    source_ids   JSONB DEFAULT '[]',                  -- [{type,id},...]
    created_at   TIMESTAMPTZ DEFAULT now(),
    last_updated TIMESTAMPTZ DEFAULT now(),
    metadata     JSONB DEFAULT '{}'
);
CREATE INDEX idx_artifact_type ON derived_artifacts(artifact_type);

/*****************************************************************
 * 3. VECTORS  (Junction → Weaviate IDs)
 *****************************************************************/
CREATE TABLE entity_vectors (
    entity_id   UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('memory','concept','media')),
    weaviate_id TEXT NOT NULL,              -- external vector UUID
    model_name  TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY(entity_id, entity_type)
);
CREATE INDEX idx_vec_model ON entity_vectors(model_name);

/*****************************************************************
 * 4. GROWTH EVENT LOG  (append-only)
 *****************************************************************/
CREATE TABLE growth_events (
    event_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entity_id   UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('memory','concept','artifact')),
    dim_key     TEXT NOT NULL,             -- 'self_know', etc.
    delta       REAL NOT NULL,             -- +0.1 -> progress
    source      TEXT NOT NULL,             -- 'journal', 'challenge', ...
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ge_user_time   ON growth_events(user_id, created_at DESC);
CREATE INDEX idx_ge_entity_dim  ON growth_events(entity_id, dim_key);

-- MATERIALISED VIEW  – rolled-up growth per entity (for UI radar charts)
CREATE MATERIALIZED VIEW mv_entity_growth AS
SELECT
    entity_id,
    entity_type,
    dim_key,
    SUM(delta) AS score
FROM growth_events
GROUP BY entity_id, entity_type, dim_key;
CREATE UNIQUE INDEX mv_eg_idx ON mv_entity_growth(entity_id, dim_key);

/*****************************************************************
 * 5. CARD EVOLUTION VIEW  (computed, not stored)
 *****************************************************************/
CREATE VIEW v_card_state AS
SELECT
    c.concept_id   AS entity_id,
    CASE
        WHEN conn_cnt >= 5 THEN 'constellation'
        WHEN dim_cnt  >= 3 THEN 'bloom'
        WHEN dim_cnt  >= 1 THEN 'sprout'
        ELSE 'seed'
    END AS evolution_state
FROM concepts c
LEFT JOIN (
    /* nightly exported stats from Neo4j */
    SELECT concept_id, connections AS conn_cnt
    FROM neo4j_connection_stats
) n USING (concept_id)
LEFT JOIN (
    SELECT entity_id, COUNT(DISTINCT dim_key) AS dim_cnt
    FROM mv_entity_growth
    GROUP BY entity_id
) g ON g.entity_id = c.concept_id;

/*****************************************************************
 * 6. CHALLENGE ENGINE
 *****************************************************************/

-- 6.1 challenge templates (author-ingested, A/B-able)
CREATE TABLE challenge_templates (
    tpl_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    dim_keys    TEXT[] NULL,        -- e.g. {'self_know','world_act'}
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
    payload     JSONB DEFAULT '{}'  -- flexible task params
);

-- 6.2 per-user instances
CREATE TABLE user_challenges (
    ch_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tpl_id       UUID NOT NULL REFERENCES challenge_templates(tpl_id),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','completed','failed','expired')),
    started_at   TIMESTAMPTZ DEFAULT now(),
    due_at       TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    progress     JSONB DEFAULT '{}'     -- free-form counter map
);
CREATE INDEX idx_uc_user_status ON user_challenges(user_id, status);

/*****************************************************************
 * 7. HOUSEKEEPING JOBS
 *****************************************************************/
-- Refresh growth rollup hourly (cron or pg_cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_entity_growth;


⸻

Where the rest of the system lives

Concern	Store / Service
Graph structure (Concept ↔ Concept, Memory ↔ Concept, Community clusters)	Neo4j
Semantic search & embeddings	Weaviate (vector DB) – IDs bridged via entity_vectors table
Real-time Orb session state (current scene, last animation)	Redis (ephemeral; optionally archived daily)
Media binaries	S3 / COS object storage – URLs referenced from media table (not shown here)
Config (growth dimension list, evolution thresholds, feature flags)	Code constants or LaunchDarkly - style service


⸻

How to extend
	•	New growth dimension → add key to config; no schema change.
	•	New challenge type → insert a row in challenge_templates; payload schema belongs in app code.
	•	New card evolution rule → update v_card_state view logic or store thresholds in a small lookup table.

This lean schema keeps Postgres focused on identity, durability, event ledger, and gamification templates, while off-loading heavy graph / vector work to the right engines.

Feel free to adapt names or add FKs to the forthcoming mobile/web app services. Let me know if you’d like:
	•	Sample seed data files
	•	ER-diagram (dbdiagram.io JSON)
	•	PL/pgSQL job for auto-refreshing the materialised view.

    Below are stand-alone, copy-ready definitions for the two non-relational stores used in the V7 architecture:
	1.	Weaviate schema (JSON) – ready for POST /v1/schema or imported via console.
	2.	Neo4j schema (Cypher) – constraints, indexes, and relationship archetypes.

Both schemas align with the lean Postgres model you just adopted and preserve cross-store identifiers (uuid).

⸻

1️⃣ Weaviate Schema (v7_weaviate_schema.json)

Notes
• Uses the text2vec-openai module (swap for text2vec-palm in CN region).
• Multi-modal images are vectorised with multi2vec-clip.
• Every class stores the Postgres/Neo4j UUID in externalId.
• Cross-refs mirror Neo4j relationships for hybrid queries.

{
  "classes": [
    /*────────────────────────────── MemoryUnit ──────────────────────────────*/
    {
      "class": "MemoryUnit",
      "description": "User-captured memory block (journal entry, chat, doc).",
      "moduleConfig": {
        "text2vec-openai": { "skip": false, "vectorizeClassName": false }
      },
      "vectorIndexType": "hnsw",
      "vectorizer": "text2vec-openai",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"], "description": "Postgres muid" },
        { "name": "title", "dataType": ["text"] },
        { "name": "sourceType", "dataType": ["text"] },
        { "name": "rawText", "dataType": ["text"] },
        { "name": "createdAt", "dataType": ["date"] },
        { "name": "highlights", "dataType": ["Concept"], "description": "Key concepts", "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────────── Concept ────────────────────────────────*/
    {
      "class": "Concept",
      "description": "Entity, theme, value, or emotion in user's graph.",
      "moduleConfig": {
        "text2vec-openai": { "skip": false, "vectorizeClassName": false }
      },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"], "description": "Postgres concept_id" },
        { "name": "name", "dataType": ["text"] },
        { "name": "type", "dataType": ["text"] },
        { "name": "description", "dataType": ["text"] },
        { "name": "relatedTo", "dataType": ["Concept"], "description": "Semantic relations", "vectorizePropertyName": false }
      ]
    },

    /*──────────────────────────────── Chunk ────────────────────────────────*/
    {
      "class": "Chunk",
      "description": "Granular slice of text with its own embedding.",
      "moduleConfig": {
        "text2vec-openai": { "skip": false, "vectorizeClassName": false }
      },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"], "description": "Postgres cid" },
        { "name": "text", "dataType": ["text"] },
        { "name": "role", "dataType": ["text"] },
        { "name": "ofMemory", "dataType": ["MemoryUnit"], "vectorizePropertyName": false },
        { "name": "mentions", "dataType": ["Concept"], "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────────── Media ─────────────────────────────────*/
    {
      "class": "Media",
      "description": "Image / audio / doc asset; vectorised via CLIP.",
      "moduleConfig": {
        "multi2vec-clip": { "imageFields": ["url"] }
      },
      "vectorizer": "multi2vec-clip",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"], "description": "Postgres media_id" },
        { "name": "url", "dataType": ["text"] },
        { "name": "caption", "dataType": ["text"] },
        { "name": "ofMemory", "dataType": ["MemoryUnit"], "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────── DerivedArtifact ───────────────────────────*/
    {
      "class": "DerivedArtifact",
      "description": "AI-generated insight, poster, decision deck, etc.",
      "moduleConfig": {
        "text2vec-openai": { "skip": false, "vectorizeClassName": false }
      },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "artifactType", "dataType": ["text"] },
        { "name": "summary", "dataType": ["text"] },
        { "name": "sources", "dataType": ["MemoryUnit", "Concept"], "vectorizePropertyName": false }
      ]
    }
  ]
}

Operational guidance
	•	Embeddings refresh – re-embed by swapping module version; IDs remain stable via externalId.
	•	Hybrid search – combine vector similarity + Neo4j path queries (Concept.relatedTo) for rich retrieval.
	•	Tenant isolation – add Weaviate multi-tenant config (tenantKey) if you later shard per region.

⸻

2️⃣ Neo4j Schema (v7_graph_schema.cypher)

Run inside Neo4j 5.x+ (Enterprise optional but recommended for multi-DB).
Constraints create uniqueness & lookup indexes; relationship types mirror the knowledge-graph spec.

/*───────────────────────────────────────────────────────────────*
 | 2dots1line  ▸  V7 Graph Schema (Cypher)                       |
 *───────────────────────────────────────────────────────────────*/

/* 0. Global uniqueness */
CREATE CONSTRAINT user_id IF NOT EXISTS
ON (u:User) ASSERT u.userId IS UNIQUE;

CREATE CONSTRAINT mem_id IF NOT EXISTS
ON (m:MemoryUnit) ASSERT m.muid IS UNIQUE;

CREATE CONSTRAINT concept_id IF NOT EXISTS
ON (c:Concept) ASSERT c.conceptId IS UNIQUE;

CREATE CONSTRAINT chunk_id IF NOT EXISTS
ON (c:Chunk) ASSERT c.cid IS UNIQUE;

CREATE CONSTRAINT comm_id IF NOT EXISTS
ON (k:Community) ASSERT k.communityId IS UNIQUE;

/* 1. Node definitions (labels & core props) */

CALL db.schema.assert({}, {});

MERGE CONSTRAINTS
/* User */
ON (u:User)          REQUIRE (u.userId, u.name) IS NODE KEY;

/* MemoryUnit */
ON (m:MemoryUnit)    REQUIRE (m.muid, m.sourceType) IS NODE KEY;

/* Concept */
ON (c:Concept)       REQUIRE (c.conceptId, c.type) IS NODE KEY;

/* Chunk */
ON (ck:Chunk)        REQUIRE (ck.cid) IS NODE KEY;

/* Community (cluster) */
ON (k:Community)     REQUIRE (k.communityId) IS NODE KEY;

/* 2. Relationship types  */

//
//  (User)-[:AUTHORED]->(MemoryUnit)
//
CREATE CONSTRAINT authored_composite IF NOT EXISTS
ON ()-[r:AUTHORED]-() ASSERT (r.authorId, r.muid) IS UNIQUE;

//
//  (MemoryUnit)-[:CONTAINS]->(Chunk)
//
CREATE INDEX contains_mem IF NOT EXISTS
FOR ()-[r:CONTAINS]-() ON (r.sequenceOrder);

//
//  (MemoryUnit)-[:HIGHLIGHTS {weight}] -> (Concept)
//
CREATE INDEX highlights_weight IF NOT EXISTS
FOR ()-[r:HIGHLIGHTS]-() ON (r.weight);

//
//  (Chunk)-[:MENTIONS {weight}] -> (Concept)
//
CREATE INDEX mentions_weight IF NOT EXISTS
FOR ()-[r:MENTIONS]-() ON (r.weight);

//
//  (Concept)-[:RELATED_TO {relationshipLabel, weight}] -> (Concept)
//
CREATE INDEX related_label IF NOT EXISTS
FOR ()-[r:RELATED_TO]-() ON (r.relationshipLabel);

//
//  (User)-[:PERCEIVES {type, salience}] -> (Concept)
//
CREATE INDEX perceives_type IF NOT EXISTS
FOR ()-[r:PERCEIVES]-() ON (r.type);

//
//  (Concept)-[:BELONGS_TO]->(Community)
//
CREATE INDEX belongs_comm IF NOT EXISTS
FOR ()-[r:BELONGS_TO]-() ON ();

//
//  (MemoryUnit)-[:CONTINUES]->(MemoryUnit)
//
/* no extra props */

/* 3. Optional graph projections for GDS */
CALL gds.graph.project(
  'concept_similarity',
  ['Concept'],
  {
    RELATED_TO: {
      type: 'RELATED_TO',
      orientation: 'NATURAL',
      properties: { weight: { property: 'weight' } }
    }
  }
) YIELD graphName;

/* 4. Example merge pattern for ingestion */
UNWIND $concepts AS row
MERGE (c:Concept {conceptId: row.id})
  ON CREATE SET c.name = row.name,
                c.type = row.type,
                c.description = row.desc,
                c.createdAt = datetime()

Implementation hints

Need	Approach
Community detection	Run Louvain on concept_similarity projection; write back (c)-[:BELONGS_TO]->(k:Community) plus k.name.
Path-aware retrieval	Combine shortest-path or cosine-sim filters from Weaviate IDs.
Time-based pruning	Periodic job can detach-delete orphaned Chunk nodes older than N days if not referenced.
Regional split	Use separate databases (:US, :CN) or use user.region as filter; avoid cross-region edges.


⸻

How the three stores inter-operate

Layer	Key ID	Purpose
PostgreSQL	UUID (authoritative)	durability, events, gamification templates
Neo4j	same UUID copied into conceptId/muid, plus relationships	graph traversal, community detection
Weaviate	externalId = same UUID; cross-refs mirror Neo4j labels	semantic similarity, hybrid search

Ingestion pipeline
	1.	Raw content → Postgres memory_units / concepts.
	2.	Same record inside Ingestion Analyst:
	•	writes node + edges to Neo4j
	•	embeds & inserts into Weaviate with externalId.
	3.	Async: Neo4j cluster detect → Postgres community_id backfill.

⸻

Everything is now schema-complete.
Let me know if you’d like example ingestion code, GDS workflow for community detection, or search examples combining

Why the “raw data” tables seemed to disappear

When I produced the lean v7_core_schema.sql earlier, I focused on the new growth/evolution mechanics and kept the snippet short so you could drop it into psql and run.
I did not mean that raw chat, uploads, or media were no longer required — only that they had already been well-specified in the original V4/V5 schema and were unchanged by the growth-model simplification.

Below is the complete relational picture, showing all durable tables the system needs.
Everything is still logically grouped:

Concern	Table(s)	Comment
User & preferences	users (already present)	
Raw conversational stream	conversations, conversation_messages	
Raw uploaded & imported content	raw_content, media	
Knowledge-graph entities	memory_units, concepts, derived_artifacts	
Vector IDs	entity_vectors	
Gamification / growth	growth_events, challenge_templates, user_challenges, materialised & computed views	

Everything in blue ⬜️ below is exactly what you saw before; the tables highlighted 🟢 are re-shown to make the schema self-contained.

⸻

🔄 Patch: add the “raw data” tables back into the DDL

Append (or merge) the following blocks after the users section of v7_core_schema.sql.

/*****************************************************************
 * 2.A  CONVERSATION STREAM       🟢  (unchanged from V4/5)
 *****************************************************************/
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title           TEXT,
    start_time      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_msg_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
    status          TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','archived','deleted')),
    message_count   INT  DEFAULT 0
);
CREATE INDEX idx_conv_user_time ON conversations(user_id, last_msg_time DESC);

CREATE TABLE conversation_messages (
    message_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_type    TEXT NOT NULL CHECK (sender_type IN ('user','assistant')),
    message_text   TEXT,
    message_type   TEXT NOT NULL DEFAULT 'text'   -- 'text','image','file','action'
        CHECK (message_type IN ('text','image','file','action')),
    media_attachments JSONB DEFAULT '[]',         -- [{media_id,url},…]
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_status TEXT DEFAULT 'pending_ingestion',
    associated_muid UUID,                         -- FK later to memory_units
    metadata       JSONB DEFAULT '{}'
);
CREATE INDEX idx_msgs_conv_time ON conversation_messages(conversation_id, timestamp);
CREATE INDEX idx_msgs_user_time ON conversation_messages(user_id, timestamp DESC);
CREATE INDEX idx_msgs_needing_ingest ON conversation_messages(processing_status)
    WHERE processing_status = 'pending_ingestion';

/*****************************************************************
 * 2.B  RAW CONTENT & MEDIA       🟢
 *****************************************************************/

-- Raw slices of user input that will later be chunked/embedded.
CREATE TABLE raw_content (
    content_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    muid        UUID NOT NULL REFERENCES memory_units(muid) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
    content_type TEXT NOT NULL,              -- 'journal','chat','import','email'
    content      TEXT NOT NULL,
    sender_type  TEXT,                       -- nullable except for chat
    sequence_order INT,
    creation_ts   TIMESTAMPTZ NOT NULL,
    metadata      JSONB DEFAULT '{}'
);
CREATE INDEX idx_raw_muid        ON raw_content(muid);
CREATE INDEX idx_raw_user_type   ON raw_content(user_id, content_type);

-- Binary uploads (images, pdf, audio…)
CREATE TABLE media (
    media_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    muid          UUID REFERENCES memory_units(muid) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type          TEXT NOT NULL,                  -- 'image','audio','video','pdf'
    storage_url   TEXT NOT NULL,
    filename_orig TEXT,
    mime_type     TEXT,
    file_size     INT,
    hash_value    TEXT,                           -- dedup detection
    caption       TEXT,
    extraction_status TEXT DEFAULT 'pending'
        CHECK (extraction_status IN ('pending','processing','completed','failed')),
    embedding_id  TEXT,                           -- Weaviate UUID
    width         INT,
    height        INT,
    duration_sec  INT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata      JSONB DEFAULT '{}'
);
CREATE INDEX idx_media_user_type ON media(user_id, type);
CREATE INDEX idx_media_hash      ON media(user_id, hash_value);

Why keep these tables?
	•	Replayable provenance – any insight or constellation link can be traced to the exact chat turn or file.
	•	Moderation – raw messages needed for abuse detection, troubleshooting, or user GDPR export.
	•	Flexible ingestion – voice memo, image, PDF, even future IoT logs flow through the same media table.

⸻

Quick recap of storage responsibility

Layer	Physical table / store	Holds
Postgres	conversation_messages, raw_content, media	ground-truth raw data
Postgres	memory_units, concepts, growth_* etc.	structured & gamification data
Neo4j	nodes/edges with same UUIDs	graph semantics & traversal
Weaviate	vector classes keyed by externalId	embeddings for hybrid search
Redis	ephemeral orb_state:*, feature flags	live-session state & cache

Everything else in the simplified schema builds on top of this raw foundation; nothing was truly discarded.

⸻

Next steps (if helpful)
	•	Retention policy: decide if old raw_content needs cold-storage after N months.
	•	Automatic linking: a small ingestion worker can turn conversation_messages into raw_content (+ memory_units) in one pass.
	•	Schema script: I can regenerate the full file (v7_full_schema.sql) combining the original core block plus the patches above, if you’d like a single artefact to run.

    Below are fully self-contained schemas for both non-relational stores.
They now include all node / class types defined in the original V4/V5/V7 knowledge-model (including Annotation, Media, raw conversation slices, etc.) so you can load them without hunting through earlier replies.

⸻

1️⃣ Weaviate Schema

Save as v7_full_weaviate_schema.json and POST to /v1/schema.

{
  "classes": [
    /*────────────────────────────  USER  ───────────────────────────*/
    {
      "class": "User",
      "description": "Account root; rarely vectorised.",
      "moduleConfig": { "text2vec-openai": { "skip": true } },
      "vectorizer": "none",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"], "description": "Postgres user_id" },
        { "name": "name", "dataType": ["text"] },
        { "name": "region", "dataType": ["text"] }
      ]
    },

    /*─────────────────────────  MEMORY UNIT  ───────────────────────*/
    {
      "class": "MemoryUnit",
      "description": "Captured memory or document.",
      "moduleConfig": { "text2vec-openai": { "skip": false, "vectorizeClassName": false } },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "title", "dataType": ["text"] },
        { "name": "sourceType", "dataType": ["text"] },
        { "name": "rawText", "dataType": ["text"] },
        { "name": "createdAt", "dataType": ["date"] },
        { "name": "authoredBy", "dataType": ["User"], "vectorizePropertyName": false },
        { "name": "highlights", "dataType": ["Concept"], "vectorizePropertyName": false },
        { "name": "includes", "dataType": ["Media"], "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────────  CHUNK  ──────────────────────────*/
    {
      "class": "Chunk",
      "description": "Granular slice of text.",
      "moduleConfig": { "text2vec-openai": { "skip": false, "vectorizeClassName": false } },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "text", "dataType": ["text"] },
        { "name": "role", "dataType": ["text"] },
        { "name": "ofMemory", "dataType": ["MemoryUnit"], "vectorizePropertyName": false },
        { "name": "mentions", "dataType": ["Concept"], "vectorizePropertyName": false }
      ]
    },

    /*───────────────────────────  CONCEPT  ─────────────────────────*/
    {
      "class": "Concept",
      "description": "Entity / theme in the knowledge graph.",
      "moduleConfig": { "text2vec-openai": { "skip": false, "vectorizeClassName": false } },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "name", "dataType": ["text"] },
        { "name": "type", "dataType": ["text"] },
        { "name": "description", "dataType": ["text"] },
        { "name": "relatedTo", "dataType": ["Concept"], "vectorizePropertyName": false },
        { "name": "belongsTo", "dataType": ["Community"], "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────────  MEDIA  ──────────────────────────*/
    {
      "class": "Media",
      "description": "Image / audio / pdf (CLIP-embedded).",
      "moduleConfig": { "multi2vec-clip": { "imageFields": ["url"] } },
      "vectorizer": "multi2vec-clip",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "url", "dataType": ["text"] },
        { "name": "caption", "dataType": ["text"] },
        { "name": "ofMemory", "dataType": ["MemoryUnit"], "vectorizePropertyName": false }
      ]
    },

    /*────────────────────────  DERIVED ARTIFACT  ───────────────────*/
    {
      "class": "DerivedArtifact",
      "description": "AI-generated poster / story / decision deck.",
      "moduleConfig": { "text2vec-openai": { "skip": false, "vectorizeClassName": false } },
      "vectorizer": "text2vec-openai",
      "vectorIndexType": "hnsw",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "artifactType", "dataType": ["text"] },
        { "name": "summary", "dataType": ["text"] },
        { "name": "sources", "dataType": ["MemoryUnit", "Concept"], "vectorizePropertyName": false },
        { "name": "createdBy", "dataType": ["User"], "vectorizePropertyName": false }
      ]
    },

    /*──────────────────────────  ANNOTATION  ───────────────────────*/
    {
      "class": "Annotation",
      "description": "User/AI comment on any entity.",
      "moduleConfig": { "text2vec-openai": { "skip": false, "vectorizeClassName": false } },
      "vectorizer": "text2vec-openai",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "annotationType", "dataType": ["text"] },
        { "name": "text", "dataType": ["text"] },
        { "name": "targetConcept", "dataType": ["Concept"], "vectorizePropertyName": false },
        { "name": "targetMemory", "dataType": ["MemoryUnit"], "vectorizePropertyName": false },
        { "name": "targetChunk", "dataType": ["Chunk"], "vectorizePropertyName": false },
        { "name": "author", "dataType": ["User"], "vectorizePropertyName": false }
      ]
    },

    /*──────────────────────────  COMMUNITY  ────────────────────────*/
    {
      "class": "Community",
      "description": "Detected concept cluster.",
      "moduleConfig": { "text2vec-openai": { "skip": true } },
      "vectorizer": "none",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "name", "dataType": ["text"] },
        { "name": "description", "dataType": ["text"] }
      ]
    },

    /*─────────────────────  CONVERSATION MESSAGE  ──────────────────*/
    {
      "class": "ConversationMessage",
      "description": "Chat turn (optionally embedded).",
      "moduleConfig": { "text2vec-openai": { "skip": true } },   /* embed on demand */
      "vectorizer": "none",
      "properties": [
        { "name": "externalId", "dataType": ["uuid"] },
        { "name": "sender", "dataType": ["text"] },
        { "name": "text", "dataType": ["text"] },
        { "name": "timestamp", "dataType": ["date"] },
        { "name": "ofConversation", "dataType": ["uuid"] },
        { "name": "attachedMedia", "dataType": ["Media"], "vectorizePropertyName": false }
      ]
    }
  ]
}

Everything in the original lean schema is still present, plus User, Annotation, ConversationMessage, and Community classes so Weaviate can store vectors (or metadata) for any object you choose to embed.

⸻

2️⃣ Neo4j Schema

Save as v7_full_graph_schema.cypher and run in Neo4j 5.x.

/*──────────────────────────────────────────────────────────────*
 | 2dots1line  ▸  V7 FULL GRAPH SCHEMA (constraints + indexes)  |
 *──────────────────────────────────────────────────────────────*/

////////////////////////////////////////////////////////////////////////
// 0. NODE UNIQUENESS CONSTRAINTS
////////////////////////////////////////////////////////////////////////
CREATE CONSTRAINT user_pk           IF NOT EXISTS ON (u:User)            ASSERT u.userId       IS UNIQUE;
CREATE CONSTRAINT mem_pk            IF NOT EXISTS ON (m:MemoryUnit)      ASSERT m.muid         IS UNIQUE;
CREATE CONSTRAINT concept_pk        IF NOT EXISTS ON (c:Concept)         ASSERT c.conceptId    IS UNIQUE;
CREATE CONSTRAINT chunk_pk          IF NOT EXISTS ON (ck:Chunk)          ASSERT ck.cid         IS UNIQUE;
CREATE CONSTRAINT media_pk          IF NOT EXISTS ON (md:Media)          ASSERT md.mediaId     IS UNIQUE;
CREATE CONSTRAINT art_pk            IF NOT EXISTS ON (a:DerivedArtifact) ASSERT a.daid         IS UNIQUE;
CREATE CONSTRAINT annot_pk          IF NOT EXISTS ON (an:Annotation)     ASSERT an.aid         IS UNIQUE;
CREATE CONSTRAINT comm_pk           IF NOT EXISTS ON (co:Community)      ASSERT co.communityId IS UNIQUE;

////////////////////////////////////////////////////////////////////////
// 1. PROPERTY INDEXES (lookup or range)
////////////////////////////////////////////////////////////////////////

/* Quick lookup by concept name/type */
CREATE INDEX concept_name           IF NOT EXISTS FOR (c:Concept)        ON (c.name);
CREATE INDEX concept_type           IF NOT EXISTS FOR (c:Concept)        ON (c.type);

/* Range query on importance / score if stored */
CREATE INDEX mem_importance         IF NOT EXISTS FOR (m:MemoryUnit)     ON (m.importanceScore);

/* Text index for full-text search on Memory/Concept content */
CALL db.index.fulltext.createNodeIndex(
  "fts_content",
  ["MemoryUnit","Concept"],
  ["rawText","description","name"]
);

////////////////////////////////////////////////////////////////////////
// 2. RELATIONSHIP TYPES  (+ optional property indexes)
////////////////////////////////////////////////////////////////////////

/* User authors memory */
CREATE CONSTRAINT authored_unique   IF NOT EXISTS
ON ()-[r:AUTHORED]-() ASSERT (r.authorId, r.muid) IS UNIQUE;

/* Memory CONTAINS Chunk; preserve order */
CREATE INDEX contains_seq           IF NOT EXISTS
FOR ()-[r:CONTAINS]-() ON (r.sequenceOrder);

/* Memory HIGHLIGHTS Concept {weight} */
CREATE INDEX highlights_weight      IF NOT EXISTS
FOR ()-[r:HIGHLIGHTS]-() ON (r.weight);

/* Chunk MENTIONS Concept */
CREATE INDEX mentions_weight        IF NOT EXISTS
FOR ()-[r:MENTIONS]-() ON (r.weight);

/* Concept RELATED_TO Concept {label,weight} */
CREATE INDEX rel_label              IF NOT EXISTS
FOR ()-[r:RELATED_TO]-() ON (r.relationshipLabel);

/* Memory INCLUDES Media */
CREATE INDEX includes_type          IF NOT EXISTS
FOR ()-[r:INCLUDES]-() ON (r.fileType);

/* Annotation annotates any node */
CREATE CONSTRAINT annot_target      IF NOT EXISTS
ON ()-[r:ANNOTATES]-() ASSERT r.targetId IS NOT NULL;

/* Concept BELONGS_TO Community */
CREATE CONSTRAINT belongs_unique    IF NOT EXISTS
ON ()-[r:BELONGS_TO]-() ASSERT (r.conceptId, r.communityId) IS UNIQUE;

/* DerivedArtifact DERIVED_FROM anything */
CREATE INDEX derived_from           IF NOT EXISTS
FOR ()-[r:DERIVED_FROM]-() ON (r.sourceType);

////////////////////////////////////////////////////////////////////////
// 3. OPTIONAL GDS GRAPH PROJECTIONS
////////////////////////////////////////////////////////////////////////
/* Community detection on concept similarity */
CALL gds.graph.project(
  'concept_similarity',
  ['Concept'],
  {
    RELATED_TO: {
      type: 'RELATED_TO',
      orientation: 'NATURAL',
      properties: { weight: {property:'weight'} }
    }
  }
) YIELD graphName;

/* Persona-centric projection (user to concepts) */
CALL gds.graph.project(
  'user_interest',
  ['User','Concept'],
  {
    PERCEIVES: {type:'PERCEIVES', orientation:'NATURAL'}
  }
) YIELD graphName;

////////////////////////////////////////////////////////////////////////
// 4. EXAMPLE INGESTION PATTERNS
////////////////////////////////////////////////////////////////////////
/* Concept merge */
UNWIND $conceptBatch AS row
MERGE (c:Concept {conceptId: row.id})
  ON CREATE SET c.name = row.name,
                c.type = row.type,
                c.description = row.desc,
                c.createdAt = datetime();

/* Link MemoryUnit to Concept with weight */
UNWIND $conceptLinks AS link
MATCH (m:MemoryUnit {muid: link.muid})
MATCH (c:Concept {conceptId: link.conceptId})
MERGE (m)-[h:HIGHLIGHTS]->(c)
  ON CREATE SET h.weight = link.weight;

////////////////////////////////////////////////////////////////////////
// 5. MAINTENANCE QUERIES (optional)
/* Remove orphaned chunks older than 90d */
MATCH (ck:Chunk)<-[:CONTAINS]-()
WITH ck
WHERE ck.createdAt < date() - duration({days:90})
DETACH DELETE ck;


⸻

How to load & run
	1.	Weaviate

curl -X POST localhost:8080/v1/schema \
     -H "Content-Type: application/json" \
     --data-binary @v7_full_weaviate_schema.json


	2.	Neo4j
Open Cypher shell or Browser → paste v7_full_graph_schema.cypher.
	3.	Cross-store IDs
	•	All nodes/classes share the same Postgres-generated UUID in externalId / muid / conceptId, enabling joins across SQL ↔ Neo4j ↔ Weaviate.

⸻

Everything previously omitted (e.g., Annotation, raw conversation slices, community nodes, media) is now fully declared in both schemas.
Let me know if you want:
	•	Example ingestion worker snippets (Python / JS)
	•	GDS Louvain community-detection code
	•	Hybrid query samples (Cypher + Weaviate nearText filter)

Happy building!

Short answer

No, not every datatype in the graph needs its own vector.
Embed only what benefits from semantic-similarity retrieval or cross-modal search. Everything else creates cost, index bloat, and slower queries.

⸻

Practical Weaviate-embedding blueprint

Class (from the full schema)	Embed?	Why / Retrieval use-case
Concept	Yes (text)	Core to “find similar concepts”, “what else feels like imposter syndrome?”.
MemoryUnit	Yes (title + summary) but tiered	Needed for “surface past moments like this”. Use a light model for all, upgrade to high-dimensional model when importance_score ≥ threshold.
Chunk	On-demand	Only embed if: (a) the user searches inside long docs, or (b) Dot wants sentence-level context. Use lazy job queue; store a flag so you don’t double-embed.
Media (image/audio/pdf)	Yes via CLIP / multi-vec—but only for images ≥ relevance threshold	Enables “show me memories that look like this sketch” or “cluster by mood board”. Skip uninformative images (e.g., UI screenshots).
DerivedArtifact	Optional	Embed only if artifact will appear in search results (e.g., user wants to search inside generated stories). Otherwise omit.
Annotation	No	Usually short; value comes from link to target. Use graph hop, not semantic search.
ConversationMessage	No by default	99 % of retrieval is via MemoryUnits once messages are ingested. If you plan a “semantic chat history” feature, embed last N days only.
User / Community	No	Retrieval is identity or ID-based, not similarity.


⸻

Cost-aware embedding strategy
	1.	Tiered queue
	•	Tier 0: create MemoryUnit row → async “cheap” embedding (OpenAI Ada, DeepSeek-Lite, etc.).
	•	Tier 1: if importance_score > 0.7 or the user bookmarks the memory → re-embed with a higher-quality model.
	•	Store both vector IDs (v_low, v_high) in entity_vectors with model_name.
	2.	Lazy chunk policy
	•	When the Retrieval Planner needs fine-grain recall, it calls embedIfMissing(cid) which:

IF vectors.exists(cid) == false:
    enqueue(chunk_text, model=cheap, class=Chunk)


	•	UI waits; fallback to keyword search until vector ready.

	3.	Vector pruning / re-index
	•	Periodic job: if a vector hasn’t been hit in queries for 90 days and its parent entity is still searchable by concept links → delete the vector row and Weaviate object (keeps index light).
	•	Re-embed on the fly if that memory surfaces again.

⸻

Implementation hints

# Example: selective embedding guard
def should_embed_memory(mu):
    return (
        mu.importance_score >= 0.35
        or mu.source_type in {"imported_document", "voice_note"}
        or mu.metadata.get("user_starred") is True
    )

// Graph → vector cross-join pattern
MATCH (c:Concept {name:$q})
CALL weaviate.nearVector({
  class: "MemoryUnit",
  vector: c.embedding,   // stored on node
  limit: 15
}) YIELD object AS mem
RETURN mem.title, mem.sourceType

If c.embedding is absent (cold node), fetch from Weaviate by externalId; if missing there too, enqueue embedding job.

⸻

TL;DR checklist
	•	✅ Embed: Concept, tiered MemoryUnit, relevant Media.
	•	⚠️ Lazy embed: Chunk, DerivedArtifact (only if searchable).
	•	🚫 Skip by default: Annotation, ConversationMessage, User/Community.
	•	🔄 Automate: tiered queue, pruning, upgrade path.

Following this selective approach keeps Weaviate fast, inexpensive, and aligned with the product’s real retrieval needs.