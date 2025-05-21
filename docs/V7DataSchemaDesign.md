# 2dots1line V7 Data Schema Design

## Overview

This document details the database schema design for the 2dots1line V7 implementation. It defines the data models across multiple database engines to support the immersive UI/UX features and the Six-Dimensional Growth Model outlined in the V7 UI/UX Design and Technical Specification.

### Design Principles

The V7 data schema is guided by these core principles:

1. **Growth model should guide behavior, not hard-code it**
   - Dimensions and rules are stored as configuration rather than schema
   - Event-driven approach allows for iterative refinement without migrations
   - A/B testing of dimensions and scoring formulas becomes possible

2. **Gamification needs to stay "alive" and extensible**
   - Challenge templates separate from user instances for easy addition of new quests
   - Card evolution states are computed dynamically instead of stored
   - Rewards implemented as derived artifacts for consistency with other content

3. **Data layer should stay lean**
   - Heavy computations belong in analytic or cache layers
   - Append-only event streams rather than constantly updated tables
   - Materialized views for efficient UI access to derived data

4. **Configuration over schema**
   - Key parameters stored in configuration or code, not database tables
   - Flexible JSON for extensible metadata and progress tracking
   - Reduced need for migrations when business rules change

### Polyglot Persistence Approach

The V7 data architecture uses a polyglot persistence approach with each store focused on its strengths:

1. **PostgreSQL**: 
   - Core entities: Users, memory units, concepts, derived artifacts
   - Event streams: Growth events, user activities, system logs
   - Junction tables: Entity vectors, relationships to external systems
   - Materialized views: Pre-computed for UI performance

2. **Neo4j**: 
   - Knowledge graph: Concept-to-concept relationships
   - Semantic network: Memory-to-concept connections
   - Connection patterns: Community detection, centrality analysis
   - Navigation paths: Traversal for UI visualization

3. **Weaviate**: 
   - Semantic embeddings: Text chunks, concept descriptions
   - Multimodal vectors: Image and audio embeddings
   - Hybrid search: Combined filter and vector similarity
   - Cross-references to primary records via externalId field

4. **Redis**: 
   - Configuration: Growth dimensions, evolution rules
   - Real-time state: Orb presence, session information
   - Message queues: Processing pipelines, background jobs
   - Rate limiting: API usage tracking

## Core Data Models

### User Data Model

**PostgreSQL Schema:**

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_picture_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  region VARCHAR(64) NOT NULL,
  growth_profile JSONB DEFAULT '{}',
  
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE user_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  device_info JSONB NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_session_length CHECK (expires_at > created_at)
);

CREATE TABLE user_activity_log (
  log_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  activity_type VARCHAR(64) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  details JSONB NOT NULL DEFAULT '{}',
  session_id UUID REFERENCES user_sessions(session_id) ON DELETE SET NULL
);

CREATE INDEX idx_user_activity_type ON user_activity_log(user_id, activity_type);
CREATE INDEX idx_user_activity_timestamp ON user_activity_log(user_id, timestamp);
```

### Knowledge Entities

**PostgreSQL Schema:**

```sql
CREATE TABLE concepts (
  concept_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  attributes JSONB NOT NULL DEFAULT '{}',
  source VARCHAR(64) DEFAULT 'user',
  status VARCHAR(32) DEFAULT 'active',
  
  CONSTRAINT unique_concept_per_user UNIQUE (user_id, name)
);

CREATE TABLE memory_units (
  memory_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  memory_type VARCHAR(64) NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  location JSONB,
  people JSONB[] DEFAULT '{}',
  emotions JSONB[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  attributes JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE derived_artifacts (
  artifact_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  artifact_type VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  source_entities JSONB[] NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}',
  thumbnail_url VARCHAR(1024)
);

CREATE INDEX idx_concepts_user ON concepts(user_id);
CREATE INDEX idx_memory_user ON memory_units(user_id);
CREATE INDEX idx_artifacts_user ON derived_artifacts(user_id);
```

### Six-Dimensional Growth Model

**PostgreSQL Schema:**

```sql
-- Store growth profile as JSON in users table
ALTER TABLE users
ADD COLUMN growth_profile JSONB DEFAULT '{}'; -- e.g. {"self_know":0.4,"world_act":0.1}

-- Growth events stream (append-only)
CREATE TABLE growth_events (
  event_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('concept', 'memory', 'artifact')),
  dim_key TEXT NOT NULL,        -- 'self_know', 'world_act', etc.
  delta FLOAT NOT NULL,         -- +0.1, -0.05, etc.
  source TEXT NOT NULL,         -- 'journal_entry', 'challenge_complete', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materialized view for efficient UI access
CREATE MATERIALIZED VIEW mv_entity_growth AS 
SELECT 
  entity_id, 
  entity_type,
  dim_key, 
  SUM(delta) AS score
FROM growth_events
GROUP BY entity_id, entity_type, dim_key;

-- Computed view for card evolution states
CREATE VIEW v_card_state AS
SELECT
  c.concept_id AS entity_id,
  'concept' AS entity_type,
  CASE
    WHEN conn_cnt >= 5 THEN 'constellation'
    WHEN dim_cnt >= 3 THEN 'bloom'
    WHEN dim_cnt >= 1 THEN 'sprout'
    ELSE 'seed'
  END AS evolution_state
FROM concepts c
LEFT JOIN (
  SELECT entity_id, COUNT(*) conn_cnt
  FROM neo4j_connection_stats -- nightly export into Postgres
  GROUP BY entity_id
) cs USING (entity_id)
LEFT JOIN (
  SELECT entity_id, COUNT(DISTINCT dim_key) dim_cnt
  FROM mv_entity_growth
  WHERE entity_type = 'concept'
  GROUP BY entity_id
) gs USING (entity_id);
```

**Design Philosophy:**

The Six-Dimensional Growth Model is implemented using an event-sourcing approach that provides several advantages:

1. **Growth Dimensions as Configuration**: Instead of a static table, dimensions are stored as configuration in a seed JSON file or Redis, making it easy to A/B test dimensions or modify parameters without requiring database migrations.

2. **Event-Sourced Progress**: 
   - Append-only stream of growth events provides a complete history
   - Single data source powers entity progress, user charts, and time-series analytics
   - Enables flexible evolution of scoring algorithms without data migration

3. **Computed Evolution States**: Card evolution states are dynamically calculated based on connection count and dimension engagement rather than stored as static values requiring background jobs to update.

4. **User Growth Profile**: A JSON column in the user table efficiently stores aggregate dimension scores for fast access by the UI.

### Challenge System

**PostgreSQL Schema:**

```sql
-- Challenge templates
CREATE TABLE challenge_templates (
  tpl_id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  dim_keys TEXT[] NULL,   -- can span multiple dimensions
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  payload JSONB           -- flexible task parameters
);

-- User-specific challenge instances
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
```

**Design Philosophy:**

The challenge system is split into templates and instances to provide greater flexibility:

1. **Decoupled Template/Instance Design**: 
   - Templates define reusable challenge structures
   - User instances track individual progress and state

2. **Multi-Dimensional Challenges**: A single challenge can drive growth across multiple dimensions by listing multiple dimension keys.

3. **Flexible Progress Tracking**: JSON-based progress allows complex completion criteria without schema changes.

4. **Consistent Reward System**: Rewards are implemented as DerivedArtifacts of type "trophy" or "poster" for consistency with other system artifacts.

### Rewards & Collectibles

Instead of a dedicated rewards table, the system leverages the existing DerivedArtifacts table:

```sql
-- Example of creating a trophy as a derived artifact
INSERT INTO derived_artifacts (
  user_id, 
  title, 
  artifact_type, 
  summary_text, 
  source_ids,
  metadata
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '30-Day Journaling Streak',
  'trophy',
  'Completed 30 consecutive days of journaling',
  '[{"type":"challenge","id":"789e4567-e89b-12d3-a456-426614174001"}]',
  '{"display_type": "gold", "icon_path": "/assets/trophies/gold-pen.svg"}'
);
```

This approach:
- Maintains consistency with other artifact types
- Makes rewards visible in the card gallery alongside other content
- Allows connection to concepts and inclusion in the knowledge graph

### Optimized Storage Strategy

The revised schema optimizes storage and query performance through several techniques:

1. **Event-Driven Architecture**: Growth data is stored as an event stream, enabling efficient time-series analysis and simplified concurrency management.

2. **Materialized Views**: Frequently accessed aggregations are stored as materialized views, reducing computation overhead during UI rendering.

3. **Distributed Data Model**:
   - **PostgreSQL**: Core entities, user data, and transactional records
   - **Neo4j**: Relationships, graph connections, and semantic networks
   - **Weaviate**: Vector embeddings for semantic search
   - **Redis**: Configuration, caching, and ephemeral state (e.g., orb_states)

4. **Storage Optimizations**:
   - Vector IDs stored in a dedicated junction table (entity_vectors) to simplify re-embedding with new models
   - Partial indexes for filtering active processing tasks
   - Cold storage archiving for historical data not needed for real-time operation

### Entity Relationships

With this revised approach, relationships between entities are primarily stored in Neo4j while PostgreSQL maintains the core data. The system uses:

1. **Bi-directional Syncing**: Critical relationship data from Neo4j is synced to PostgreSQL for card evolution calculations.

2. **Growth Events as Evidence**: Growth events carry context about which entity interactions triggered dimension progress.

3. **JSON Source References**: The source_ids field in DerivedArtifacts provides flexible linking to source entities.

The overall design emphasizes:
- Lean relational data models
- Configuration over schema
- Event-sourcing for historical tracking
- Computed views for derived states
- Distributed storage according to data access patterns

### Annotations and Reflections

**PostgreSQL Schema:**

```sql
CREATE TABLE annotations (
  aid UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_node_type VARCHAR(64) NOT NULL,
  annotation_type VARCHAR(64) NOT NULL,
  text_content TEXT,
  media_url VARCHAR(1024),
  source VARCHAR(64) DEFAULT 'user',
  creation_ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_modified_ts TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE reflections (
  reflection_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  reflection_type VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  related_entities JSONB[] DEFAULT '{}',
  sentiment FLOAT,
  insights JSONB[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_annotations_user ON annotations(user_id);
CREATE INDEX idx_annotations_target ON annotations(target_id, target_node_type);
CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_created ON reflections(user_id, created_at);
```

### Dialogue Interactions

**PostgreSQL Schema:**

```sql
CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'active',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE conversation_messages (
  message_id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  referenced_entities JSONB[] DEFAULT '{}'
);

CREATE TABLE orb_states (
  state_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  visual_state VARCHAR(64) NOT NULL,
  emotional_tone VARCHAR(64) NOT NULL,
  energy_level FLOAT NOT NULL CHECK (energy_level >= 0 AND energy_level <= 1),
  is_speaking BOOLEAN DEFAULT FALSE,
  position JSONB,
  effects JSONB[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  context JSONB DEFAULT '{}'
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX idx_orb_states_user ON orb_states(user_id);
CREATE INDEX idx_orb_states_created ON orb_states(created_at);
```

### Knowledge Graph Schema (Neo4j)

```cypher
// Node Labels
CREATE CONSTRAINT user_id IF NOT EXISTS ON (u:User) ASSERT u.user_id IS UNIQUE;
CREATE CONSTRAINT concept_id IF NOT EXISTS ON (c:Concept) ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT memory_id IF NOT EXISTS ON (m:MemoryUnit) ASSERT m.id IS UNIQUE;
CREATE CONSTRAINT artifact_id IF NOT EXISTS ON (a:DerivedArtifact) ASSERT a.id IS UNIQUE;
CREATE CONSTRAINT tag_id IF NOT EXISTS ON (t:Tag) ASSERT t.id IS UNIQUE;

// Time-based indices
CREATE INDEX memory_occurred_idx IF NOT EXISTS FOR (m:MemoryUnit) ON (m.occurred_at);
CREATE INDEX entity_created_idx IF NOT EXISTS FOR (n) ON (n.created_at) WHERE n:Concept OR n:MemoryUnit OR n:DerivedArtifact;

// Entity-specific indices
CREATE INDEX concept_name_idx IF NOT EXISTS FOR (c:Concept) ON (c.name);
CREATE INDEX memory_type_idx IF NOT EXISTS FOR (m:MemoryUnit) ON (m.memory_type);
CREATE INDEX artifact_type_idx IF NOT EXISTS FOR (a:DerivedArtifact) ON (a.artifact_type);

// Node properties template
// Concept: {id, name, user_id, description, created_at, updated_at, source, attributes:{...}}
// MemoryUnit: {id, user_id, title, content, memory_type, occurred_at, created_at, location:{lat,lng}, emotions:[...], attributes:{...}}
// DerivedArtifact: {id, user_id, title, description, artifact_type, created_at, attributes:{...}}
// Person: {id, user_id, name, relationship, attributes:{...}}
// Location: {id, user_id, name, coordinates:{lat,lng}, attributes:{...}}
// Tag: {id, user_id, name, type}

// Relationship types
// RELATED_TO - General relationship between nodes
// PART_OF - Hierarchical relationship
// CREATED - Creation relationship (User CREATED entity)
// EXPERIENCED - User's experience of a memory
// REFERENCES - Entity references another entity
// EVOLVED_FROM - Entity evolved from another entity
// HAPPENED_AT - Event location
// INVOLVES - Event participant
// TAGGED_WITH - Entity tagging
// INSPIRED_BY - Creative inspiration
// CONTRADICTS - Logical contradiction
// SUPPORTS - Supporting evidence
```

### Vector Database Schema (Weaviate)

```json
{
  "classes": [
    {
      "class": "UserConcept",
      "description": "User-defined concepts and ideas",
      "vectorizer": "text2vec-contextual",
      "moduleConfig": {
        "text2vec-contextual": {
          "model": "palm-2",
          "modelVersion": "latest",
          "type": "sentence"
        }
      },
      "properties": [
        {
          "name": "conceptId",
          "dataType": ["string"],
          "description": "Unique id of the concept",
          "indexInverted": true
        },
        {
          "name": "userId",
          "dataType": ["string"],
          "description": "Owner of this concept",
          "indexInverted": true
        },
        {
          "name": "name",
          "dataType": ["text"],
          "description": "Name of the concept",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "description",
          "dataType": ["text"],
          "description": "Description of the concept",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "tags",
          "dataType": ["string[]"],
          "description": "Associated tags",
          "indexInverted": true
        },
        {
          "name": "evolutionState",
          "dataType": ["string"],
          "description": "Evolution state of this concept card",
          "indexInverted": true
        }
      ]
    },
    {
      "class": "UserMemory",
      "description": "User memories and personal experiences",
      "vectorizer": "text2vec-contextual",
      "moduleConfig": {
        "text2vec-contextual": {
          "model": "palm-2",
          "modelVersion": "latest",
          "type": "sentence"
        }
      },
      "properties": [
        {
          "name": "memoryId",
          "dataType": ["string"],
          "description": "Unique id of the memory",
          "indexInverted": true
        },
        {
          "name": "userId",
          "dataType": ["string"],
          "description": "Owner of this memory",
          "indexInverted": true
        },
        {
          "name": "title",
          "dataType": ["text"],
          "description": "Title of the memory",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "content",
          "dataType": ["text"],
          "description": "Content of the memory",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "memoryType",
          "dataType": ["string"],
          "description": "Type of memory",
          "indexInverted": true
        },
        {
          "name": "occurredAt",
          "dataType": ["date"],
          "description": "When the memory occurred",
          "indexInverted": true
        },
        {
          "name": "emotions",
          "dataType": ["string[]"],
          "description": "Emotions associated with this memory",
          "indexInverted": true
        },
        {
          "name": "evolutionState",
          "dataType": ["string"],
          "description": "Evolution state of this memory card",
          "indexInverted": true
        }
      ]
    },
    {
      "class": "UserArtifact",
      "description": "User-created artifacts and compositions",
      "vectorizer": "text2vec-contextual",
      "moduleConfig": {
        "text2vec-contextual": {
          "model": "palm-2",
          "modelVersion": "latest",
          "type": "sentence"
        }
      },
      "properties": [
        {
          "name": "artifactId",
          "dataType": ["string"],
          "description": "Unique id of the artifact",
          "indexInverted": true
        },
        {
          "name": "userId",
          "dataType": ["string"],
          "description": "Owner of this artifact",
          "indexInverted": true
        },
        {
          "name": "title",
          "dataType": ["text"],
          "description": "Title of the artifact",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "description",
          "dataType": ["text"],
          "description": "Description of the artifact",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "artifactType",
          "dataType": ["string"],
          "description": "Type of artifact",
          "indexInverted": true
        },
        {
          "name": "sourceEntities",
          "dataType": ["string[]"],
          "description": "Source entities used to create this artifact",
          "indexInverted": true
        },
        {
          "name": "evolutionState",
          "dataType": ["string"],
          "description": "Evolution state of this artifact card",
          "indexInverted": true
        }
      ]
    },
    {
      "class": "ConversationChunk",
      "description": "Chunks of conversation between user and Dot",
      "vectorizer": "text2vec-contextual",
      "moduleConfig": {
        "text2vec-contextual": {
          "model": "palm-2",
          "modelVersion": "latest",
          "type": "sentence"
        }
      },
      "properties": [
        {
          "name": "chunkId",
          "dataType": ["string"],
          "description": "Unique id of the chunk",
          "indexInverted": true
        },
        {
          "name": "userId",
          "dataType": ["string"],
          "description": "Owner of this conversation",
          "indexInverted": true
        },
        {
          "name": "conversationId",
          "dataType": ["string"],
          "description": "ID of the conversation",
          "indexInverted": true
        },
        {
          "name": "content",
          "dataType": ["text"],
          "description": "Content of the chunk",
          "moduleConfig": {
            "text2vec-contextual": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "indexInverted": true
        },
        {
          "name": "sequence",
          "dataType": ["int"],
          "description": "Sequence number within conversation",
          "indexInverted": true
        },
        {
          "name": "timestamp",
          "dataType": ["date"],
          "description": "When this chunk was created",
          "indexInverted": true
        },
        {
          "name": "entities",
          "dataType": ["string[]"],
          "description": "Entities referenced in this chunk",
          "indexInverted": true
        }
      ]
    }
  ]
}
```

### Cache and Real-time Data (Redis)

**Key Patterns:**

| Key Pattern | Purpose | TTL | Example |
|-------------|---------|-----|---------|
| `user:{uid}:session:{sid}` | Active user session | 3 days | `user:123:session:abc` |
| `user:{uid}:orb:state` | Current Orb state | N/A | `user:123:orb:state` |
| `user:{uid}:scene:active` | Current active scene | N/A | `user:123:scene:active` |
| `card:{id}:growth` | Card growth data cache | 1 hour | `card:456:growth` |
| `user:{uid}:cards:recent` | Recently viewed cards | 24 hours | `user:123:cards:recent` |
| `user:{uid}:graph:viewport` | Graph visualization state | 1 hour | `user:123:graph:viewport` |
| `challenge:{id}:state` | Challenge state cache | 15 min | `challenge:789:state` |
| `user:{uid}:stats:daily` | Daily user stats | 1 day | `user:123:stats:daily` |
| `user:{uid}:insights:unread` | Unread insights counter | N/A | `user:123:insights:unread` |
| `rate_limit:api:{ip}` | API rate limiting | Varies | `rate_limit:api:1.2.3.4` |

**Pub/Sub Channels:**

| Channel | Purpose | Example Message |
|---------|---------|-----------------|
| `user:{uid}:orb_state` | Orb state changes | `{"visual_state":"thinking","emotional_tone":"curious"}` |
| `user:{uid}:cards` | Card updates | `{"action":"updated","card_id":"123","evolution_state":"bloom"}` |
| `user:{uid}:challenges` | Challenge updates | `{"action":"new","challenge_id":"456","title":"New perspective"}` |
| `user:{uid}:insights` | New insights | `{"insight_id":"789","urgency":"high","source_entities":["123","456"]}` |
| `user:{uid}:scene` | Scene transitions | `{"from":"cloud","to":"graph","transition_type":"zoom"}` |

## Data Model Relationships

### Growth Model Integration

The Six-Dimensional Growth Model is integrated across the data model:

1. **Growth Dimensions** (PostgreSQL): Define the six dimensions (Self/World × Know/Act/Show)
2. **Entity Growth Progress** (PostgreSQL): Track progress for each entity across dimensions
3. **Card Evolution States** (PostgreSQL): Track card evolution from seed to supernova
4. **Growth Challenges** (PostgreSQL): Tasks to advance growth in specific dimensions
5. **Neo4j Integration**: Growth dimensions are tracked as node properties for visualization
6. **Vector Search Integration**: Evolution state and growth dimensions as searchable properties

### Card Gallery Integration

The Card Gallery system is built on:

1. **Entity Core Data** (PostgreSQL): Basic information about concepts, memories, artifacts
2. **Growth Progress** (PostgreSQL): Dimension-specific progress for cards
3. **Evolution States** (PostgreSQL): Visual state of cards based on growth and connections
4. **Entity Relationships** (Neo4j): Connections between cards for visualization
5. **Vector Embeddings** (Weaviate): Semantic search and clustering of cards
6. **Real-time Updates** (Redis): Card state changes and evolution events

### 3D Visualization Support

Data structures supporting 3D visualization:

1. **Graph Nodes and Relationships** (Neo4j): Knowledge graph structure
2. **Graph Visual Properties** (Neo4j): Node and relationship visual attributes
3. **Node Clustering** (Neo4j & PostgreSQL): Grouping nodes for visualization
4. **Orb States** (PostgreSQL & Redis): Visual and emotional states of the Orb
5. **Scene State** (Redis): Active scene and transition information
6. **Viewport State** (Redis): User's current view position and focus

## Query Patterns

### Growth Dimension Queries

**Get a Card's Growth Dimensions:**

```sql
-- PostgreSQL 
-- First, get the growth scores for this entity
SELECT 
  eg.dim_key,
  eg.score,
  COALESCE(cd.description, 'Dimension description') AS description,
  COALESCE(cd.color, '#808080') AS color,
  COALESCE(
    (SELECT source FROM growth_events 
     WHERE entity_id = $entity_id AND dim_key = eg.dim_key 
     ORDER BY created_at DESC LIMIT 1), 
    'unknown'
  ) AS last_source
FROM mv_entity_growth eg
LEFT JOIN config.dimensions cd ON eg.dim_key = cd.dim_key
WHERE eg.entity_id = $entity_id AND eg.entity_type = $entity_type
ORDER BY eg.dim_key;
```

**Get User's Overall Growth Summary:**

```sql
-- PostgreSQL
SELECT 
  eg.dim_key,
  SUM(eg.score) as total_score,
  COUNT(DISTINCT eg.entity_id) as entity_count,
  MAX(ge.created_at) as last_activity
FROM users u
LEFT JOIN growth_events ge ON u.user_id = ge.user_id
LEFT JOIN mv_entity_growth eg ON eg.entity_id = ge.entity_id AND eg.dim_key = ge.dim_key
WHERE u.user_id = $user_id
GROUP BY eg.dim_key;
```

### Card Connections and Evolution

**Find Card Connections in Knowledge Graph:**

```cypher
// Neo4j
MATCH (source {id: $card_id, user_id: $user_id})
MATCH (source)-[r]-(target)
WHERE target.user_id = $user_id
RETURN source, r, target
```

**Update Card Evolution State:**

```sql
-- PostgreSQL
-- Get card evolution state from the view directly
SELECT 
  entity_id,
  entity_type,
  evolution_state
FROM v_card_state
WHERE entity_id = $entity_id AND entity_type = 'concept';

-- No need to update as it's a computed view that always reflects current state
-- The evolution state is derived from:
-- 1. Connection count from Neo4j graph data
-- 2. Dimension count from the growth_events table
-- This eliminates the need for background job updates
```

### Semantic Search and Retrieval

**Vector Search for Relevant Cards:**

```json
// Weaviate
{
  "query": {
    "Get": {
      "UserConcept": {
        "nearText": {
          "concepts": ["creativity", "inspiration"],
          "certainty": 0.7
        },
        "where": {
          "operator": "Equal",
          "path": ["userId"],
          "valueString": "user-123"
        },
        "limit": 10
      }
    }
  }
}
```

**Hybrid Search (Vector + Graph):**

1. First, search for semantically similar cards in Weaviate:

```json
// Weaviate
{
  "query": {
    "Get": {
      "UserConcept": {
        "nearText": {
          "concepts": ["personal growth", "self-improvement"],
          "certainty": 0.7
        },
        "where": {
          "operator": "Equal",
          "path": ["userId"],
          "valueString": "user-123"
        },
        "limit": 5,
        "fields": ["conceptId"]
      }
    }
  }
}
```

2. Then, expand with graph relationships in Neo4j:

```cypher
// Neo4j
MATCH (c:Concept)
WHERE c.id IN $concept_ids AND c.user_id = $user_id
OPTIONAL MATCH (c)-[r]-(related)
WHERE related.user_id = $user_id
RETURN c, r, related
```

### Real-time State Management

**Update Orb State:**

```javascript
// Redis Operations
// 1. Get current state
redis.get(`user:${userId}:orb:state`);

// 2. Update state
redis.set(`user:${userId}:orb:state`, JSON.stringify({
  visual_state: "speaking",
  emotional_tone: "excited",
  energy_level: 0.8,
  is_speaking: true,
  effects: [{ id: "effect-123", type: "particles", /* ... */ }]
}));

// 3. Publish state change event
redis.publish(`user:${userId}:orb_state`, JSON.stringify({
  visual_state: "speaking",
  emotional_tone: "excited",
  energy_level: 0.8,
  timestamp: Date.now()
}));
```

**Scene Transition:**

```javascript
// Redis Operations
// 1. Get current scene
const currentScene = await redis.get(`user:${userId}:scene:active`);

// 2. Update scene
await redis.set(`user:${userId}:scene:active`, "graph");

// 3. Publish transition event
await redis.publish(`user:${userId}:scene`, JSON.stringify({
  from: currentScene,
  to: "graph",
  transition_type: "zoom",
  focus_entity: "concept-456",
  timestamp: Date.now()
}));
```

## Migration Strategy

### Migrating from V4 to V7

The migration from V4 to V7 involves:

1. **Schema Expansion:** Add new tables for Growth Model, Evolution States, etc.
2. **Data Transformation:** 
   - Convert existing entities to the V7 card model
   - Initialize growth dimensions for existing cards
   - Set initial evolution states based on existing data
3. **Vector Re-embedding:** Create embeddings for all entities in Weaviate
4. **Graph Enrichment:** Enhance the Neo4j graph with visual properties

**Migration Steps:**

1. **Preparation**
   - Create backup of V4 databases
   - Deploy V7 schema with foreign key constraints disabled

2. **Core Data Migration**
   - Migrate users and authentication data
   - Migrate basic entity data with UUIDs preserved

3. **Growth Model Initialization**
   - Create growth dimensions (predefined)
   - Initialize entity growth progress records (default to 'unactivated')
   - Analyze existing data to set initial growth values where applicable

4. **Graph and Vector Migration**
   - Migrate Neo4j relationships with enhanced properties
   - Create vector embeddings for all entities in Weaviate

5. **Validation**
   - Verify data integrity with consistency checks
   - Test sample queries and data access patterns

**Migration SQL Example:**

```sql
-- Create growth events for existing concepts
INSERT INTO growth_events (
  event_id, user_id, entity_id, entity_type, dim_key,
  delta, source, created_at
)
SELECT 
  gen_random_uuid(), c.user_id, c.concept_id, 'concept', d.dim_key,
  0.1, 'migration', NOW()
FROM concepts c
CROSS JOIN (
  SELECT dim_key FROM UNNEST(ARRAY['self_know', 'self_act', 'self_show', 
                                   'world_know', 'world_act', 'world_show']) AS dim_key
) d
WHERE EXISTS (
  -- Only add events for concepts that have some connections
  -- or other indicators of dimension activity
  SELECT 1 FROM graph_connections gc 
  WHERE gc.entity_id = c.concept_id 
  LIMIT 1
);

-- Update user growth profiles based on events
UPDATE users u
SET growth_profile = (
  SELECT jsonb_object_agg(dim_key, SUM(delta))
  FROM growth_events ge
  WHERE ge.user_id = u.user_id
  GROUP BY dim_key
)
WHERE EXISTS (
  SELECT 1 FROM growth_events ge WHERE ge.user_id = u.user_id
);

-- Populate materialized view for entity growth
REFRESH MATERIALIZED VIEW mv_entity_growth;

-- Create the v_card_state view for evolution states
CREATE VIEW v_card_state AS
SELECT
  c.concept_id AS entity_id,
  c.user_id,
  CASE
    WHEN conn_cnt >= 5 THEN 'constellation'
    WHEN dim_cnt >= 3 THEN 'bloom'
    WHEN dim_cnt >= 1 THEN 'sprout'
    ELSE 'seed'
  END AS evolution_state
FROM concepts c
LEFT JOIN (
  -- Connection count from Neo4j or graph_connections
  SELECT entity_id, COUNT(*) AS conn_cnt
  FROM graph_connections
  GROUP BY entity_id
) cs ON c.concept_id = cs.entity_id
LEFT JOIN (
  -- Dimension count from materialized view
  SELECT entity_id, COUNT(DISTINCT dim_key) AS dim_cnt
  FROM mv_entity_growth
  WHERE score > 0
  GROUP BY entity_id
) gs ON c.concept_id = gs.entity_id;
```

## Conclusion

The V7 Data Schema Design provides a streamlined, event-driven foundation for implementing the immersive UI/UX features and Six-Dimensional Growth Model described in the V7 UI/UX Design. The polyglot persistence approach leverages the strengths of multiple database technologies while keeping the core schema lean and flexible.

Key features of the design include:

1. **Event-Sourced Growth Model:** An append-only ledger of growth events that maintains history and enables flexible recalculation
2. **Computed Card Evolution:** Dynamic derivation of card states from connection and dimension data
3. **Configuration Over Schema:** Moving dimension definitions and rules into configuration rather than database tables
4. **Real-time State Management:** Fast access to Orb and scene state information
5. **Semantic + Graph Search:** Combined vector and graph queries for rich retrieval
6. **Performance Optimization:** Materialized views and caching for real-time responsiveness

This schema design enables all the core features of the 2dots1line V7 system while providing a robust foundation for future extensions and enhancements without requiring schema changes. The event-sourcing approach also preserves historical data for analytics and allows for flexible recalculation of derived metrics. 