# 2dots1line V7 Technical Specification

**Document Version:** 7.0
**Date:** July 1, 2025
**Authors:** AI Collaboration with Human Direction

## 1. Executive Summary

The 2dots1line System is a production-grade knowledge graph platform designed to help users define their identity, find their voice, gain creative agency, and build profound connections with their inner self and the world. It transforms a continuous stream of user inputs (conversations, journal entries, media, documents) into a rich, interconnected personal knowledge model presented through an immersive, emotionally resonant user experience.

This V7 Technical Specification integrates the comprehensive backend architecture from V4 with the immersive visual design language from V7 UI/UX Design to create a fully-realized product that not only discovers meaningful patterns across semantically and temporally distant data points but presents them in a way that is beautiful, intuitive, and emotionally resonant.

### Core Capabilities

- **Efficient Data Ingestion & Knowledge Graph Construction:** Process multi-modal user inputs into structured knowledge with tiered analysis based on significance.
- **Hybrid Retrieval Intelligence:** Combine vector, graph, and relational queries for nuanced retrieval across the user's knowledge and memory.
- **Proactive Insight Generation:** Discover patterns, connections, and hypotheses through advanced algorithms and metaphorical reasoning.
- **Six-Dimensional Growth Framework:** Support holistic user growth across the dimensions of knowing, acting, and showing for both self and world through the card gamification system.
- **Immersive 3-Layer Interface:** Deliver a seamless user experience through:
  - **3D Canvas Layer:** Immersive background scenes (CloudScene, AscensionScene, GraphScene) setting emotional tone and visualizing the knowledge graph.
  - **2D Modal Layer:** Structured UI for content (Card Gallery, Dashboard, Chat) floating over the 3D canvas.
  - **3D Orb:** A responsive, animated presence that embodies the AI assistant, changing appearance and behavior based on context and user interaction.
- **Cross-Region Deployment:** Support for both US (AWS/Google AI) and China (Tencent/DeepSeek) markets with appropriate data localization.

## 2. System Architecture Overview

V7 builds on the robust foundation of previous versions while refining the architecture to embrace key design principles that enhance flexibility and maintainability.

### 2.1 Foundational Principles

1.  **Tiered Processing Model:** Multi-level analysis pipeline (lightweight → deep) based on content significance.
2.  **Agent-Tool Paradigm:** Core cognitive agents with well-defined responsibilities + deterministic tool layer.
3.  **Polyglot Persistence:** Strategic use of specialized databases (relational, graph, vector, cache).
4.  **Clear Data Flow Contracts:** Typed payloads and explicit schema contracts between components.
5.  **Regional Adaptability:** Architecture designed for deployment in both US (AWS/Google AI) and China (Tencent/DeepSeek).
6.  **Progressive Enhancement:** System delivers value from day one, with knowledge graph enrichment improving over time.
7.  **UI-Backend Coherence:** Backend state and data directly drive UI elements (Orb behavior, scene transitions, card content, graph visualization).
8.  **Emotional Design Integration:** Technical systems support emotional states, transitions, and expression through the UI.

### 2.2 Refined Design Principles

Building on the foundation above, V7 incorporates these additional design principles from feedback:

1.  **Configuration over Schema**: Move static configuration and rules out of database tables and into configuration files, Redis, or code, making the system more adaptable without schema migrations.
2.  **Event-Sourcing for Growth & Analytics**: Implement an append-only event stream for historical tracking and flexible recalculation of aggregated views.
3.  **Dynamic Computation over Static Storage**: Use materialized views and computed properties for derived data rather than storing and maintaining redundant state.
4.  **Distributed Storage by Domain**: Use the right tool for each data domain, with clean interfaces between systems.

### 2.3 High-Level Architecture

The architecture combines a proven backend knowledge system with the 3-layer UI architecture:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                             USER INTERFACE LAYER                           │
│ ┌─────────────────┐  ┌──────────────────────────┐  ┌───────────────────┐  │
│ │  3D CANVAS LAYER│  │     2D MODAL LAYER      │  │   3D ORB LAYER    │  │
│ │ (THREE.js/R3F)  │  │  (React/Next.js/DOM)     │  │  (THREE.js/R3F)   │  │
│ └────────┬────────┘  └──────────────┬───────────┘  └─────────┬─────────┘  │
└──────────┼─────────────────────────┼──────────────────────────┼───────────┘
           │                         │                          │
           │           ┌─────────────▼────────────┐             │
           └───────────►   UI STATE MANAGEMENT    ◄─────────────┘
                       │   (Zustand/Redux)        │
                       └────────────┬─────────────┘
                                    │
                       ┌────────────▼─────────────┐
                       │      DIALOGUE AGENT      │
                       │          (DOT)           │
                       └────────────┬─────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────────────┐
│                        COGNITIVE AGENT LAYER                              │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│ │  INGESTION  │  │  RETRIEVAL  │  │   INSIGHT   │  │    ONTOLOGY     │    │
│ │   ANALYST   │  │   PLANNER   │  │   ENGINE    │  │     STEWARD     │    │
│ └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │
└────────┼─────────────────┼─────────────────┼───────────────┼──────────────┘
         │                 │                 │               │
┌────────┼─────────────────┼─────────────────┼───────────────┼──────────────┐
│                      DETERMINISTIC TOOLS LAYER                            │
│ ┌───────────────────────────────────────────────────────────────────┐     │
│ │ NER/Vision/Embedding/LLM/Reranking/Stats/Extraction/Summarize     │     │
│ └───────────────────────────────────────────────────────────────────┘     │
└────────┼─────────────────┼─────────────────┼───────────────────┼──────────┘
         │                 │                 │               │
┌────────▼─────────────────▼─────────────────▼───────────────▼──────────────┐
│                         PERSISTENCE LAYER                                 │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│ │ PostgreSQL  │  │   Neo4j     │  │  Weaviate   │  │     Redis       │    │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Core Components

#### 2.4.1 User Interface Layer

1.  **3D Canvas Layer:**
    *   **Purpose:** Creates immersive spatial environments that evoke emotion, provide context, and visualize the knowledge graph.
    *   **Technology:** Three.js with React Three Fiber (R3F) for WebGL rendering.
    *   **Key Scenes:**
        *   **CloudScene:** Tranquil cloudscape with snowy peaks for reflection and journaling.
        *   **AscensionScene:** Dynamic transition from atmospheric flight to cosmic space.
        *   **GraphScene:** Interactive visualization of the knowledge graph as a celestial system.

2.  **2D Modal Layer:**
    *   **Purpose:** Provides structured UI elements floating above the 3D canvas.
    *   **Technology:** React components with glassmorphic design rendered in DOM (not WebGL).
    *   **Key Components:**
        *   **Card Gallery:** Grid/field of cards representing nodes in the knowledge graph.
        *   **Dashboard:** Landing modal with metrics, insights, and recommendations.
        *   **Chat Interface:** Communication with Orb/Dialogue Agent.
        *   **HUD:** Minimal interface for navigation and quick actions.

3.  **3D Orb Layer:**
    *   **Purpose:** Visual representation of the Dialogue Agent (Dot) as a responsive, non-anthropomorphic presence.
    *   **Technology:** Three.js/R3F with custom shaders for visual effects.
    *   **Behaviors:** Changes color, form, motion patterns based on context and interaction state.
    *   **Rendered** above all UI elements to maintain consistent presence across the experience.

4.  **UI State Management:**
    *   **Purpose:** Coordinates state across the three layers and communicates with backend.
    *   **Technology:** Zustand for atomic, reactive state management with Redux DevTools integration.
    *   **Key Stores:**
        *   **SceneStore:** Controls active scene, transitions, and environment state.
        *   **OrbStore:** Manages Orb appearance, behavior, and position.
        *   **ModalStore:** Tracks open modals, active cards, and UI navigation state.
        *   **UserStore:** Maintains session state and preferences.

#### 2.4.2 Cognitive Agent Layer: Implementation & Responsibilities

Each cognitive agent has clear responsibilities, input/output contracts, tool interactions, and LLM configurations.

##### 2.4.2.1 Dialogue Agent (Orb)

*   **Purpose:** The sole user-facing agent, responsible for understanding user needs, formulating responses, and determining when to delegate to other agents. Visually represented by the Orb.
*   **Key Responsibilities (V7):**
    *   Serves as the primary conversational interface and is visually represented by the Orb.
    *   Orchestrates conversations, suggests next actions, and manages the Orb's visual/behavioral state based on its own internal state and directives from other agents or UI events.
    *   Interacts with other agents (Retrieval Planner, Insight Engine, Ingestion Analyst) to retrieve information or process inputs.
    *   Works with the event-driven growth model to track conversation context and progress, and to surface growth-related prompts or feedback.
    *   Integrates the detailed Orb System Prompt.
    *   Provides emotional resonance and empathetic responses.
*   **Input Payload (from UI/User):**
    ```json
    {
      "user_id": "string",
      "message_text": "string", // User's typed message
      "message_media": [{"type": "image/png", "url": "s3://...", "caption": "Optional caption"}], // Optional media attachments
      "conversation_id": "string", // Ongoing conversation context
      "message_id": "string", // Unique ID for this specific message
      "ui_context": { // Rich context from the UI
        "current_scene": "CloudScene | GraphScene | AscensionScene",
        "active_modal": "CardGallery | Chat | Dashboard | null",
        "focused_entity_id": "string | null", // If a card or graph node is in focus
        "orb_emotional_state_hint": "neutral | curious | reflective" // User-perceived Orb state
      },
      "timestamp": "ISO8601"
    }
    ```
*   **Output Payload (to UI):**
    ```json
    {
      "conversation_id": "string",
      "message_id": "string", // ID of this response message
      "response_text": "string", // Orb's textual response
      "response_media": [{"type": "image/jpeg", "url": "s3://...", "alt_text": "Generated image"}], // Optional media generated by Orb
      "suggested_actions": [ // Buttons/prompts for the user
        {"label": "Tell me more", "action_type": "clarify", "payload": {"topic": "..."}},
        {"label": "Explore related concepts", "action_type": "navigate_graph", "payload": {"concept_id": "..."}},
        {"label": "Save this as a memory", "action_type": "create_memory", "payload": {"title": "Insight from conversation"}}
      ],
      "orb_state_update": { // Directives for Orb's visual/behavioral state
        "emotional_tone": "empathetic | insightful | curious | celebratory",
        "visual_state": "listening | thinking | speaking | insight_flash",
        "energy_level": "float (0-1)", // Intensity of Orb's animation
        "effects": [{"type": "particle_burst", "color": "gold", "duration_ms": 2000}] // Temporary visual effects
      },
      "ui_directive": { // Optional directives for the broader UI
        "transition_to_scene": "GraphScene | null",
        "open_modal": "CardDetailModal | null",
        "highlight_entity_id": "string | null"
      },
      "growth_event_trigger": { // If the conversation led to a growth event
         "dim_key": "self_know", "delta": 0.05, "source": "dialogue_insight"
      },
      "timestamp": "ISO8601"
    }
    ```
*   **Key Tool Interactions:**
    *   **`MessageClassifier` Tool:** To determine user intent (e.g., question, statement, command).
    *   **`EmotionDetector` Tool:** To assess emotional content of user message.
    *   **`RetrievalPlannerClient` (Agent):** To fetch relevant memories or concepts.
    *   **`IngestionAnalystClient` (Agent):** To process new information shared by the user.
    *   **`InsightEngineClient` (Agent):** To request insights or explanations.
    *   **`LLM` Tool (Core):** For response generation, summarization, and rephrasing. (Region-specific: Google Gemini API / DeepSeek API)
    *   **`GrowthEventService` Tool:** To log growth events triggered by the conversation.
*   **LLM Configuration (Example - Google Gemini API):**
    *   **System Prompt:** Uses the comprehensive `orb.system.prompt.md`.
    *   **Model:** `gemini-1.5-pro-latest` (or regional equivalent).
    *   **Temperature:** 0.6 - 0.8 (balances creativity and coherence).
    *   **Top-P:** 0.95.
    *   **Safety Settings:** Configured to align with application's ethical guidelines.
    *   **Context Window Management:** Employs summarization and context distillation for long conversations.
*   **Core Logic Flow:**
    1.  Receive user input and UI context.
    2.  Classify intent and detect emotion using tools.
    3.  Build rich context: current conversation history, relevant memories/concepts (via Retrieval Planner), user profile.
    4.  Determine primary goal: answer question, provide information, offer support, guide reflection, etc.
    5.  If necessary, delegate sub-tasks to other agents (e.g., "Fetch memories about X" to Retrieval Planner).
    6.  Generate textual response using LLM, incorporating retrieved information and agent's persona.
    7.  Determine appropriate Orb emotional tone and visual state update.
    8.  Formulate suggested next actions for the user.
    9.  If applicable, identify UI directives (e.g., transition scene).
    10. Log growth events if interaction contributes to user's Six-Dimensional Growth.
    11. Send composed payload (response, Orb update, UI directives, etc.) to UI.

##### 2.4.2.2 Ingestion Analyst

*   **Purpose:** Processes raw user inputs (journal entries, conversations, uploaded documents/media) into structured, interconnected knowledge graph elements (MemoryUnits, Chunks, Concepts, Relationships, Media entities, Growth Events).
*   **Key Responsibilities (V7):**
    *   Implements tiered analysis based on content significance (Lightweight, Standard, Deep Dive).
    *   Extracts entities, relationships, and creates growth events for the Six-Dimensional Growth Model.
    *   Writes to append-only event streams for growth events, and creates/updates graph entities in PostgreSQL and Neo4j.
    *   Handles multi-modal inputs (text, images, eventually audio/video).
*   **Input Payload (from Dialogue Agent, UI upload, or scheduled jobs):**
    ```json
    {
      "user_id": "string",
      "source_type": "journal_entry | direct_upload | conversation_log | external_import",
      "content_blocks": [ // Array of content blocks
        {"type": "text", "data": "The quick brown fox...", "role": "user_reflection"},
        {"type": "image", "url": "s3://...", "caption": "Sunset photo", "metadata": {"format": "jpeg", "size_kb": 1024}},
        {"type": "file_reference", "url": "s3://mydoc.pdf", "original_filename": "My Research Notes.pdf"}
      ],
      "muid": "string | null", // Existing MemoryUnit ID if appending/updating
      "processing_tier_request": "standard | deep_dive", // Optional, defaults to standard
      "initial_title": "string | null", // User-provided title
      "timestamp": "ISO8601"
    }
    ```
*   **Output Payload (Notifications/Events, not a direct response):**
    *   `MemoryUnitCreated` Event: `{ muid, user_id, title, status: "processing" }`
    *   `ChunkCreated` Event (multiple): `{ cid, muid, text_preview, embedding_status: "pending" }`
    *   `ConceptIdentified` Event (multiple): `{ concept_id, name, type, source_cid }`
    *   `RelationshipProposed` Event (multiple): `{ source_concept_id, target_concept_id, label, strength }`
    *   `MediaProcessed` Event: `{ media_id, muid, status: "analyzed", thumbnail_url }`
    *   `GrowthEventCreated` (multiple): `{ event_id, user_id, entity_id, entity_type, dim_key, delta, source }` (as per schema)
    *   `MemoryUnitProcessingComplete` Event: `{ muid, status: "completed", concept_count, relationship_count }`
*   **Key Tool Interactions:**
    *   **`TextChunker` Tool:** Smartly segments text into meaningful Chunks.
    *   **`NERExtractor` Tool:** Identifies named entities (people, places, organizations, dates, etc.).
    *   **`TopicModeling` Tool:** Identifies key topics and themes.
    *   **`RelationshipExtractor` Tool:** Proposes relationships between identified concepts.
    *   **`Summarization` Tool:** Generates summaries for MemoryUnits and long texts.
    *   **`EmbeddingGenerator` Tool:** Creates vector embeddings for Chunks and Concepts (region-specific).
    *   **`ImageAnalysis` Tool:** Extracts captions, objects, and text from images. (e.g., Google Vision API / Tencent OCR)
    *   **`DocumentParser` Tool:** Extracts text and structure from PDFs, DOCX, etc.
    *   **`GrowthDimensionIdentifier` Tool:** Analyzes content against rules to identify triggers for growth events across the six dimensions.
    *   **`PrismaClient` (DB):** To create/update MemoryUnits, Chunks, Concepts in PostgreSQL.
    *   **`Neo4jDriver` (DB):** To create/update Concept nodes and relationships in Neo4j.
    *   **`WeaviateClient` (DB):** To store embeddings.
*   **LLM Configuration (Example - Google Gemini API for Deep Dive text analysis):**
    *   **Model:** `gemini-1.5-pro-latest`.
    *   **Task-Specific Prompts:**
        *   For relationship extraction: "Given this text, identify key concepts and the relationships between them. Format as {source_concept, relationship_label, target_concept}."
        *   For thematic analysis: "Identify the core themes and underlying values in this journal entry."
        *   For growth dimension identification: "Analyze this text for evidence of Know_Self, Act_World, etc., and explain your reasoning."
    *   **Temperature:** 0.3 - 0.5 (for more factual extraction tasks).
*   **Processing Tiers:**
    1.  **Lightweight (Real-time/Near Real-time):**
        *   Basic text chunking.
        *   NER for key entities.
        *   Quick classification for growth dimensions (keyword-based or simple LLM call).
        *   Embedding generation for core chunks.
        *   Goal: Make content searchable and provide initial growth event triggers quickly.
    2.  **Standard (Asynchronous Batch):**
        *   Deeper semantic analysis.
        *   More comprehensive relationship extraction.
        *   Topic modeling.
        *   Image analysis (if applicable).
        *   Refined growth event generation.
        *   Goal: Build a richer knowledge graph and more accurate growth profile.
    3.  **Deep Dive (On-demand or Scheduled):**
        *   Advanced LLM-based analysis for complex texts.
        *   Cross-document analysis and synthesis.
        *   Metaphorical reasoning and abstract concept linking.
        *   Goal: Uncover profound insights and novel connections.
*   **Core Logic Flow:**
    1.  Receive input content block(s).
    2.  Create/update `MemoryUnit` in PostgreSQL.
    3.  **Lightweight Tier:**
        *   Parse and chunk text content using `TextChunker`. Create `Chunk` records.
        *   Perform basic NER using `NERExtractor`. Create initial `Concept` stubs.
        *   Generate embeddings for chunks using `EmbeddingGenerator` and store in Weaviate.
        *   Perform quick pass for `GrowthDimensionIdentifier`. Create initial `growth_events`.
        *   Notify system (`MemoryUnitProcessingTier1Complete`).
    4.  **Standard Tier (queued if not real-time):**
        *   For each `Chunk`, perform deeper analysis:
            *   Refined NER and Concept linking.
            *   Topic modeling using `TopicModeling` tool.
            *   Relationship extraction using `RelationshipExtractor` (LLM-assisted). Update Neo4j.
        *   If media present, use `ImageAnalysis` or `DocumentParser`. Link `Media` entities.
        *   Refine `Concept` descriptions and types.
        *   Perform more thorough `GrowthDimensionIdentifier` pass. Create/update `growth_events`.
        *   Update `MemoryUnit` status to "processed_standard".
        *   Notify system (`MemoryUnitProcessingTier2Complete`).
    5.  **Deep Dive Tier (if requested/triggered):**
        *   Employ more sophisticated LLM prompts for abstract concept extraction, metaphorical linking, and synthesis across multiple related `MemoryUnit`s.
        *   Update Neo4j with highly abstract `Concept` nodes and nuanced `RELATED_TO` relationships.
        *   Generate complex `DerivedArtifact`s like "themed_collection" or "insight_summary".
        *   Update `MemoryUnit` status to "processed_deepdive".

##### 2.4.2.3 Retrieval Planner

*   **Purpose:** Formulates and executes optimal, hybrid retrieval strategies to find the most relevant information from the user's knowledge graph (PostgreSQL, Neo4j, Weaviate) in response to queries from the Dialogue Agent or Insight Engine.
*   **Key Responsibilities (V7):**
    *   Plans and executes hybrid retrieval strategies combining vector, graph, and relational queries.
    *   Powers the content for the Card Gallery, GraphScene visualization, and contextual responses for the Dialogue Agent.
    *   Optimizes retrieval based on scene context and user interaction patterns (e.g., if in GraphScene focused on a "value" concept, prioritize related "life_event_theme" concepts).
    *   Queries materialized views (`mv_entity_growth`) and direct tables/views (`v_card_state`) for efficient data access to computed growth dimensions and card states.
*   **Input Payload (from Dialogue Agent or Insight Engine):**
    ```json
    {
      "user_id": "string",
      "query_type": "natural_language_question | keyword_search | concept_similarity | path_finding | pattern_match | card_gallery_feed",
      "query_text": "string | null", // For NLQ or keyword
      "target_entity_id": "string | null", // For similarity or expansion
      "target_entity_type": "concept | memory_unit | null",
      "filters": { // Optional filters
        "source_types": ["journal_entry"],
        "date_range": {"start": "ISO8601", "end": "ISO8601"},
        "concept_types": ["value", "goal"],
        "min_importance": 0.7
      },
      "retrieval_strategy_hint": "broad_exploration | focused_answering | connection_discovery",
      "max_results": 20,
      "ui_context": { // Context from UI to guide retrieval, e.g.
          "current_scene": "GraphScene",
          "focused_graph_node_type": "value"
      },
      "include_growth_dimensions": true // Whether to fetch associated growth scores
    }
    ```
*   **Output Payload (to requesting agent):**
    ```json
    {
      "retrieved_elements": [ // Array of ranked and scored results
        {
          "entity_id": "string",
          "entity_type": "MemoryUnit | Concept | Chunk | DerivedArtifact",
          "title": "string",
          "summary_snippet": "string", // Relevant snippet
          "relevance_score": "float (0-1)",
          "source_muid": "string | null", // If a Chunk or Concept, its parent MemoryUnit
          "data": { ... }, // Core properties of the entity
          "growth_dimensions_summary": { "self_know": 0.8, ... } // If requested, from mv_entity_growth
          "evolution_state": "bloom" // If applicable, from v_card_state
        }
      ],
      "explanation": "Retrieved 5 memories related to 'creativity' and 3 concepts linked to 'art'.", // Optional explanation of strategy
      "query_id": "string" // For tracking
    }
    ```
*   **Key Tool Interactions:**
    *   **`QueryParser` Tool:** Deconstructs natural language queries into structured search parameters.
    *   **`WeaviateSearch` Tool:** Performs vector similarity searches on embeddings.
    *   **`Neo4jCypherQuery` Tool:** Executes Cypher queries for graph traversal, pattern matching, and pathfinding.
    *   **`PostgresSQLQuery` Tool:** Executes SQL queries for structured data, metadata filtering, and querying `mv_entity_growth` / `v_card_state`.
    *   **`Reranking` Tool:** Re-ranks results from multiple sources using LLM or other models.
    *   **`HybridSearchOrchestrator` Tool:** Coordinates multi-stage searches (e.g., vector search -> graph expansion -> filter by SQL).
    *   **`LLM` Tool (Core):** For query understanding, result summarization, and generating explanations.
*   **LLM Configuration (Example - for QueryParser or Reranking):**
    *   **Model:** `gemini-1.5-flash-latest` (for speed in parsing/reranking) or regional equivalent.
    *   **Task-Specific Prompts:**
        *   For QueryParsing: "Given the user query and context, extract key entities, desired relationship types, and any filters. Output as JSON: {entities: [], relationships: [], filters: {date_range: ...}}."
        *   For Reranking: "Given the user query and these candidate results, re-rank them by relevance, novelty, and diversity. Provide a score and brief justification for each."
    *   **Temperature:** 0.2 (for precise parsing), 0.5 (for nuanced reranking).
*   **Core Logic Flow (Simplified Example for NLQ):**
    1.  Receive query payload (e.g., from Dialogue Agent).
    2.  Use `QueryParser` (LLM-assisted) to understand user intent, extract key entities/terms, and identify desired information types.
    3.  **Candidate Generation (Parallel or Sequential):**
        *   **Vector Search:** Use `WeaviateSearch` tool with extracted terms/entities to find semantically similar `Chunk`s and `Concept`s.
        *   **Graph Search:** Use `Neo4jCypherQuery` tool to find `Concept`s directly matching extracted entities and explore their connections (e.g., 1-2 hops).
        *   **SQL Search:** Use `PostgresSQLQuery` to find `MemoryUnit`s or `DerivedArtifact`s matching keywords in titles/metadata or matching filter criteria.
    4.  **Result Fusion & Filtering:**
        *   Combine candidates from different sources.
        *   Apply any specified filters (date ranges, source types, concept types) using SQL or by filtering in-memory.
    5.  **Reranking & Scoring:**
        *   Use `Reranking` tool (LLM-assisted) to score and rank the fused results based on original query, UI context, and diversity/novelty.
    6.  **Enrichment:**
        *   For top N results, fetch additional details:
            *   Parent `MemoryUnit` info if a `Chunk` is retrieved.
            *   `growth_dimensions_summary` from `mv_entity_growth`.
            *   `evolution_state` from `v_card_state`.
            *   Generate contextual `summary_snippet`s using `LLM` tool if needed.
    7.  Format and return the `retrieved_elements` payload.

##### 2.4.2.4 Insight Engine

*   **Purpose:** Proactively discovers significant patterns, connections, anomalies, and hypotheses within the user's knowledge graph. Generates "Orb's Dream Cards", suggests constellation completions, and creates challenges/quests for the card gamification system.
*   **Key Responsibilities (V7):**
    *   Generates "Orb's Dream Cards" (novel connections or synthesized ideas) and "Mystery Challenges" (personalized quests).
    *   Suggests "constellation completions" based on emerging patterns in the graph.
    *   Processes growth event streams (`growth_events` table) to identify trends, plateaus, or opportunities for growth, then suggests actions or challenges.
    *   Operates mostly asynchronously, pushing insights to a queue for the Dialogue Agent or for UI notifications.
*   **Input Payload (Typically triggered by events, schedules, or specific requests):**
    ```json
    {
      "user_id": "string",
      "trigger_type": "new_memory_unit_processed | daily_digest_cron | growth_milestone_reached | user_request_for_insight",
      "context_data": { // Data relevant to the trigger
        "muid": "string | null", // If triggered by a new memory unit
        "growth_dimension_key": "self_act | null" // If triggered by a milestone
      },
      "insight_focus_hint": "emerging_themes | latent_connections | growth_opportunities | unresolved_tensions" // Optional
    }
    ```
*   **Output Payload (Published as events or `DerivedArtifact`s):**
    *   `InsightGenerated` Event:
        ```json
        {
          "user_id": "string",
          "insight_id": "string", // Corresponds to a DerivedArtifact ID
          "insight_type": "dream_card | mystery_challenge | constellation_suggestion | growth_pattern_alert",
          "title": "string",
          "summary": "string",
          "priority": "high | medium | low",
          "source_entity_ids": ["concept_id_1", "memory_unit_id_2"], // Entities that contributed to the insight
          "call_to_action": {"label": "Explore this Dream Card", "action_type": "view_artifact", "payload": {"daid": "..."}}
        }
        ```
    *   Creates `DerivedArtifact` records in PostgreSQL for "Dream Cards", "Mystery Challenges", etc.
    *   May create new `growth_events` if an insight itself represents a form of meta-growth (e.g., "user recognized a core value").
*   **Key Tool Interactions:**
    *   **`GraphPatternMiner` Tool:** Detects common or custom-defined structural patterns in Neo4j (e.g., triads, bridges between communities).
    *   **`ConceptClusterer` Tool (Weaviate/Graph):** Identifies semantic clusters of concepts or memories.
    *   **`AnomalyDetector` Tool (SQL/Stats):** Finds outliers or unusual deviations in growth event streams or entity properties.
    *   **`TemporalAnalyzer` Tool (SQL):** Analyzes trends and seasonality in `growth_events` or `MemoryUnit` creation.
    *   **`MetaphoricalMapper` Tool (LLM-based):** Finds analogical or metaphorical links between disparate concepts.
    *   **`HypothesisGenerator` Tool (LLM-based):** Formulates "what if" scenarios or potential explanations for observed patterns.
    *   **`ChallengeDesigner` Tool (LLM/Rule-based):** Creates personalized challenges based on user's growth profile and identified gaps/opportunities.
    *   **`LLM` Tool (Core):** For summarizing complex patterns into human-readable insights and narratives.
    *   **`RetrievalPlannerClient` (Agent):** To fetch supporting data or context for potential insights.
*   **LLM Configuration (Example - for MetaphoricalMapper or HypothesisGenerator):**
    *   **Model:** `gemini-1.5-pro-latest` (needs strong reasoning).
    *   **Task-Specific Prompts:**
        *   For MetaphoricalMapper: "Given Concept A (description) and Concept B (description), can you find a compelling metaphorical link between them? Explain your reasoning."
        *   For HypothesisGenerator: "The user shows a pattern of X and Y. What are three plausible hypotheses that could explain this? Which one is most likely given their other data (provide summary)?"
    *   **Temperature:** 0.7 - 0.9 (to encourage creative and divergent thinking).
*   **Core Logic Flow (Example - Daily Digest Insight Generation):**
    1.  Triggered by a scheduler. Fetch user ID.
    2.  **Analyze Recent Activity:**
        *   Use `TemporalAnalyzer` on `growth_events` for the past week to find significant changes in dimension scores, new active dimensions.
        *   Use `RetrievalPlannerClient` to get recently created/modified `MemoryUnit`s and `Concept`s.
    3.  **Pattern Detection:**
        *   Use `ConceptClusterer` on recent concepts to find emerging thematic clusters.
        *   Use `GraphPatternMiner` around these new clusters/concepts in Neo4j to find interesting structural links (e.g., a new concept bridging two previously separate communities).
    4.  **Hypothesis & Creative Linking:**
        *   For interesting patterns/clusters, use `MetaphoricalMapper` or `HypothesisGenerator` (LLM tools) to generate potential "Dream Card" ideas (e.g., "Your recent thoughts on 'efficiency' and your childhood memory of 'building model airplanes' seem to share a common thread of 'elegant design'.")
    5.  **Growth Opportunity Identification:**
        *   Compare current `growth_profile` (from `users` table) with recent activity and identified patterns.
        *   If a dimension is lagging or an opportunity is clear (e.g., user mentions wanting to learn X, and a related concept Y is prominent), use `ChallengeDesigner` to craft a "Mystery Challenge".
    6.  **Insight Formulation & Prioritization:**
        *   For each potential insight/challenge, use `LLM` to generate a compelling title and summary.
        *   Score insights based on novelty, relevance to recent activity, and potential impact on growth.
    7.  **Output:**
        *   Create `DerivedArtifact` records for the top N insights/challenges.
        *   Publish `InsightGenerated` events to a queue for the Dialogue Agent to potentially surface to the user.

##### 2.4.2.5 Ontology Steward

*   **Purpose:** Manages the evolution of the knowledge graph's schema, controlled vocabularies (concept types, relationship labels), and rules for data interpretation. Ensures consistency and quality of the structured knowledge.
*   **Key Responsibilities (V7):**
    *   Manages the controlled vocabularies for `Concept.type`, `relationship_label` on `RELATED_TO` edges, and `perception_type` on `PERCEIVES` edges (from V4).
    *   Ensures consistency in concept types, relationship labels, and growth dimensions.
    *   Provides visual classification guidance for GraphScene visualization (e.g., how different concept types map to visual styles).
    *   Manages configuration data related to schema interpretation (e.g., rules for identifying growth dimension triggers, criteria for card evolution states) in Redis or config files, not hardcoded.
    *   Periodically reviews the graph for quality issues (e.g., orphaned concepts, inconsistent typing, duplicate relationships) and proposes cleanup tasks.
*   **Input Payload (Typically from other agents proposing new terms/types, or scheduled maintenance tasks):**
    ```json
    {
      "user_id": "string | null", // Null if a system-wide schema review
      "event_type": "new_term_proposed | schema_validation_request | periodic_cleanup_trigger",
      "payload": {
        "term_candidate": "new_concept_type_X | new_relationship_label_Y", // If new term
        "source_agent": "IngestionAnalyst", // Agent that proposed it
        "context_entities": ["concept_id_1", "concept_id_2"], // Entities where this term arose
        "suggested_definition": "string | null"
      }
    }
    ```
*   **Output Payload (Updates to config, notifications, or proposed changes for human review):**
    *   `VocabularyUpdated` Event: `{ vocabulary_name: "concept_types", term_added: "new_type_X", definition: "..." }` (if auto-approved)
    *   `SchemaReviewItemCreated` Event: `{ item_id, proposed_term, current_mapping, suggested_action, confidence_score }` (if needs human review)
    *   Updates to controlled vocabulary lists in Redis/config files.
    *   May trigger graph update tasks (e.g., merging concepts, re-typing entities) via Ingestion Analyst or direct DB tools.
*   **Key Tool Interactions:**
    *   **`VocabularyManager` Tool:** CRUD operations for controlled vocabularies stored in Redis/config.
    *   **`TermSimilarityAssessor` Tool (LLM/Embedding-based):** Compares a new term candidate with existing vocabulary to find synonyms or suggest mappings.
    *   **`GraphConsistencyChecker` Tool (Neo4j/SQL):** Queries for schema violations, orphaned nodes, inconsistent relationships.
    *   **`LLM` Tool (Core):** For defining new terms, suggesting mappings, and explaining schema decisions.
    *   **`DataStoreAccess` Tools (Prisma, Neo4jDriver):** To query graph data for context when evaluating new terms or schema changes.
*   **LLM Configuration (Example - for TermSimilarityAssessor or generating definitions):**
    *   **Model:** `gemini-1.5-pro-latest` (needs good semantic understanding).
    *   **Task-Specific Prompts:**
        *   For TermSimilarity: "Given the proposed term '[NEW_TERM]' with context '[CONTEXT]', and our existing vocabulary for '[VOCAB_NAME]' ([EXISTING_TERMS_WITH_DEFS]), is '[NEW_TERM]' a synonym for an existing term, a new distinct concept, or a specialization/generalization? Explain."
        *   For Definition Generation: "Provide a clear, concise definition for the concept type '[TERM]' suitable for our personal knowledge graph system, considering its purpose is to help users understand [PRIMARY_GOAL_OF_SYSTEM]."
    *   **Temperature:** 0.3 - 0.5 (for precise semantic analysis and definition).
*   **Core Logic Flow (Example - New Term Proposed by Ingestion Analyst):**
    1.  Receive `new_term_proposed` event with candidate term, context, and source.
    2.  Use `VocabularyManager` to check if term already exists in the target vocabulary (e.g., "concept_types").
    3.  If not, use `TermSimilarityAssessor` (LLM-backed) to compare candidate with existing terms.
        *   Provide LLM with the candidate, its usage context (e.g., surrounding text, concepts it connects), and the existing vocabulary list with definitions.
    4.  Based on LLM output and similarity scores:
        *   **High Confidence Synonym:** Map candidate to existing term. Notify source agent. Log decision.
        *   **High Confidence New Distinct Term:**
            *   Use `LLM` to generate a draft definition if one wasn't provided.
            *   Use `VocabularyManager` to add the new term and its definition to the vocabulary.
            *   Publish `VocabularyUpdated` event.
        *   **Medium/Low Confidence or Ambiguous:**
            *   Create a `SchemaReviewItem`.
            *   Flag for human review (e.g., via an admin interface or daily report).
            *   Temporarily map to closest existing term or a generic "unclassified" type.
    5.  If the new term impacts other configurations (e.g., a new `Concept.type` needs a default visual mapping for GraphScene), update relevant config files or Redis entries.

#### 2.4.3 Deterministic Tools Layer

This layer consists of specialized, stateless functions or services that perform specific, well-defined tasks. Agents invoke these tools with clear input/output contracts. Tools are discoverable and versioned.

##### 2.4.3.1 Tool Categories & Examples

1.  **Text Processing Tools:**
    *   **`TextChunker`**:
        *   Input: Long text, chunking strategy (sentence, paragraph, fixed size, semantic).
        *   Output: Array of text chunks with sequence info.
        *   Implementation: Rule-based, libraries (e.g., NLTK, SpaCy utilities), or small LLM for semantic chunking.
    *   **`NERExtractor`**:
        *   Input: Text.
        *   Output: Array of entities {text, type (PERSON, ORG, DATE, etc.), start_char, end_char}.
        *   Implementation: SpaCy, Stanford NER, or LLM with constrained output.
    *   **`Summarization`**:
        *   Input: Text, desired length/style (extractive, abstractive).
        *   Output: Summarized text.
        *   Implementation: LLM (e.g., `gemini-1.5-flash-latest` for speed).
    *   **`LanguageDetector`**:
        *   Input: Text.
        *   Output: Detected language code (e.g., "en", "zh").
    *   **`SentimentAnalyzer`**:
        *   Input: Text.
        *   Output: {sentiment: "positive|negative|neutral", score: float}.
    *   **`TopicModeler`**: (More complex, might be an internal service)
        *   Input: Collection of texts.
        *   Output: List of topics with associated keywords and strengths.
        *   Implementation: LDA, NMF, or newer embedding-based topic modeling.

2.  **Vision Analysis Tools (Wrappers around cloud services or local models):**
    *   **`ImageCaptioner`**:
        *   Input: Image URL or bytes.
        *   Output: Text caption.
        *   Implementation: Google Cloud Vision API, AWS Rekognition, or local models like BLIP.
    *   **`ObjectDetector`**:
        *   Input: Image URL or bytes.
        *   Output: Array of detected objects {label, confidence, bounding_box}.
    *   **`ImageOCR`**:
        *   Input: Image URL or bytes.
        *   Output: Extracted text, bounding boxes for words/lines.

3.  **Embedding Generation Tools (Region-Specific):**
    *   **`TextEmbeddingGenerator (Google)`**:
        *   Input: Text string or array of strings.
        *   Output: Vector embedding(s) (e.g., using `text-embedding-004`).
        *   Implementation: Wrapper around Google AI SDK.
    *   **`TextEmbeddingGenerator (DeepSeek)`**:
        *   Input: Text string or array of strings.
        *   Output: Vector embedding(s).
        *   Implementation: Wrapper around DeepSeek Embedding API.
    *   (Future: `ImageEmbeddingGenerator`, `AudioEmbeddingGenerator`)

4.  **LLM Interaction Tools (Core, often used by agents directly or by other tools):**
    *   **`LLMCoreInvoker`**:
        *   Input: Prompt, model_name, temperature, max_tokens, system_message, safety_settings.
        *   Output: LLM response text, usage metadata.
        *   Implementation: Handles API calls to Google Gemini or DeepSeek, including error handling, retries.
    *   **`PromptFormatter`**:
        *   Input: Template string, dictionary of variables.
        *   Output: Formatted prompt string.
    *   **`ResponseParser (JSON)`**:
        *   Input: LLM text response (expected to be JSON), JSON schema.
        *   Output: Parsed JSON object or error if non-compliant.

5.  **Vector Operation Tools (Wrappers around Weaviate client or other vector DBs):**
    *   **`VectorSimilaritySearch`**:
        *   Input: Query vector, top_k, filters.
        *   Output: Array of {id, score, metadata}.
    *   **`VectorStoreManager`**:
        *   Input: Collection name, schema. (For creating/managing Weaviate classes)
        *   Output: Status.

6.  **Graph Analysis Tools (Wrappers around Neo4j driver or graph algorithms library):**
    *   **`CypherQueryExecutor`**:
        *   Input: Cypher query string, parameters.
        *   Output: Query result set.
    *   **`GraphPatternMatcher`**:
        *   Input: Graph pattern (e.g., "Find nodes of type A connected to type B via relationship R").
        *   Output: List of matching subgraphs.
    *   **`CommunityDetector`**: (May run as a scheduled task via Ontology Steward)
        *   Input: Graph section, algorithm (e.g., Louvain, Label Propagation).
        *   Output: Node-to-community_id mappings.

7.  **Data Store Access Tools (Direct DB interaction, used carefully):**
    *   **`PrismaQueryExecutor`**: For complex SQL needs not covered by agent repositories.
    *   **`RedisClient`**: For direct cache/config manipulation.

8.  **V7 Specific Tools:**
    *   **`GrowthDimensionIdentifier`**:
        *   Input: Text content, existing user growth profile.
        *   Output: Array of identified growth dimension activations {dim_key, delta, evidence_text}.
        *   Implementation: LLM-based analysis with specific prompts targeting the six dimensions.
    *   **`CardEvolutionStateCalculator`**:
        *   Input: Entity ID, entity type.
        *   Output: Evolution state ("seed", "sprout", "bloom", "constellation").
        *   Implementation: Queries `mv_entity_growth` and Neo4j connection stats, applies rules from `v_card_state` (logic might live in this tool if view is not performant enough or rules become complex).
    *   **`ChallengeProgressUpdater`**:
        *   Input: User ID, challenge ID, relevant new growth event.
        *   Output: Updated `user_challenges.progress` JSONB.
        *   Implementation: Fetches challenge template, applies event to progress logic defined in template payload.

##### 2.4.3.2 Tool Registry & Invocation

*   **Registry:** A central service (possibly Redis-backed or a simple in-memory map in each agent host) where tools register their:
    *   `name` (unique)
    *   `version`
    *   `description` (natural language, for LLM-based tool selection if needed)
    *   `input_schema` (JSON Schema)
    *   `output_schema` (JSON Schema)
    *   `capabilities_tags` (e.g., "text_analysis", "image_processing", "graph_query")
    *   `estimated_cost_tier` (low, medium, high)
    *   `SLA_expectation` (e.g., "sync_fast", "sync_slow", "async_callback")
*   **Invocation:**
    *   Agents typically know which specific tools they need.
    *   For more dynamic scenarios (future), an agent could describe a task to a "Tool Orchestrator" which uses an LLM to select and sequence tools based on descriptions and capabilities from the registry.
    *   All tool calls are logged with input, output, and duration for monitoring and debugging.

#### 2.4.4 Persistence Layer

The persistence layer adopts a distributed approach where data is stored in the most appropriate system:

1.  **PostgreSQL (V7 specific details):**
    *   **Core Entities:** `users`, `memory_units`, `concepts`, `derived_artifacts` (includes "Orb's Dream Cards", "Mystery Challenges"), `media`, `annotations`.
    *   **Event Streams:** `growth_events` (central to V7), `user_activity_logs`, `system_events`.
    *   **Junction Tables:** `chunk_concept_links`, `memory_unit_concept_highlights`. (May be simplified if primary links are in Neo4j, with Postgres holding denormalized counts or caches).
    *   **Gamification/Growth:** `challenge_templates`, `user_challenges`.
    *   **Materialized Views:** `mv_entity_growth` (aggregates `growth_events`).
    *   **Views:** `v_card_state` (computes card evolution).
    *   **Configuration (fallback if not in Redis):** Tables for controlled vocabularies if not managed externally.

2.  **Neo4j (V7 specific details):**
    *   **Knowledge Graph:** `Concept` nodes, `MemoryUnit` nodes (potentially, or just linked from Postgres), `User` nodes.
    *   **Relationships:** `RELATED_TO` (concept-concept, richly typed), `HIGHLIGHTS` (memory-concept), `CONTINUES` (memory-memory), `AUTHORED` (user-memory), `PERCEIVES` (user-concept), `BELONGS_TO` (concept-community), `BASED_ON` (derived_artifact-concept/memory).
    *   **Properties:** Stores intrinsic properties of nodes/relationships (e.g., `Concept.name`, `RELATED_TO.weight`).
    *   **Purpose:** Optimized for complex traversals, pattern matching, community detection, and pathfinding. Drives GraphScene visualization and connection-based insights.

3.  **Weaviate (V7 specific details):**
    *   **Semantic Embeddings:** Stores vector embeddings for `Chunk.text`, `Concept.name` + `Concept.description`, `DerivedArtifact.summary_text`.
    *   **External ID Linking:** Each vector object in Weaviate will have an `externalId` field pointing back to the primary record's ID in PostgreSQL (e.g., `cid` for Chunks, `concept_id` for Concepts).
    *   **Vectorizer Module:** Configured to `none` as embeddings are generated externally by `EmbeddingGenerator` tools. `DEFAULT_VECTORIZER_MODULE: 'none'`, `ENABLE_MODULES: ''`. (This was a key fix from previous user interaction).
    *   **Classes:** Schemas defined in Weaviate will match the structure of the data being embedded (e.g., a "Chunk" class with properties like `text_preview`, `source_muid`, `user_id`).

4.  **Redis (V7 specific details):**
    *   **Configuration:**
        *   Controlled vocabularies (concept types, relationship labels, growth dimension keys and their definitions).
        *   Rules for growth dimension activation.
        *   Card evolution criteria (if not fully in `v_card_state` view logic).
        *   Visual mapping rules for GraphScene (Concept.type to visual style).
    *   **Real-time State:** Orb presence/state hints (if needed for cross-service coordination beyond Dialogue Agent's direct UI comms), active user sessions.
    *   **Message Queues (BullMQ):** For inter-agent communication and asynchronous task processing (e.g., queuing standard/deep dive ingestion tasks).
    *   **Caching:** Frequently accessed data (e.g., user profiles, hot concepts, pre-computed parts of `mv_entity_growth` if view refresh is too slow).
    *   **Rate Limiting:** Tracking API usage per user/IP.
    *   **Tool Registry Cache:** If the tool registry itself is a service, its data can be cached here by agents.

### 2.5 Key Integration Points

1.  **Orb-Dialogue Agent Binding:**
    *   The Orb's visual state (color, motion, effects) is directly driven by the Dialogue Agent's internal state and its `orb_state_update` output.
    *   Example: When analyzing, the Orb pulses with amethyst glow; when sharing insights, it emits golden particles.

2.  **GraphScene-Knowledge Graph Binding:**
    *   The celestial bodies and connections in the GraphScene directly visualize Neo4j data, queried via the Retrieval Planner.
    *   Node properties (type, importance, recency) map to visual properties (size, color, glow), configured via Ontology Steward rules in Redis.
    *   Real-time updates (e.g., new connections appearing as animated light trails) can be pushed via WebSockets if Dialogue Agent or Ingestion Analyst signals a graph change.

3.  **Card Gallery & Modals - Growth System Binding:**
    *   Card visual states (evolution, dimension highlights) reflect computed states from `v_card_state` and scores from `mv_entity_growth`, fetched via Retrieval Planner.
    *   User interactions with cards (e.g., adding an annotation that triggers a growth dimension) are processed by Ingestion Analyst, which creates `growth_events`. The UI can then reflect updates after a refresh or via WebSocket notification.
    *   Completed dimensions and constellation achievements trigger particle effects and Orb responses, orchestrated by the Dialogue Agent based on events or UI feedback.

4.  **Scene Transitions-Navigation Events:**
    *   UI navigation (e.g., "explore graph") initiates scene transition sequences, potentially informing the Dialogue Agent of context change.
    *   Backend state changes (e.g., Insight Engine finding a major new constellation) can prompt the Dialogue Agent to suggest scene transitions (e.g., "I notice a pattern forming in your cosmos, want to take a look in the GraphScene?").

## 3. User Interface Implementation

This section details how the UI components leverage the event-sourcing approach, computed views, and direct agent communication to display information to users in an engaging, visually coherent way, ensuring a seamless experience across the 3D Canvas, 2D Modal, and 3D Orb layers.

### 3.1 Card Modal and Card Gallery

*   **Data Source:** The `RetrievalPlanner` agent is responsible for populating the Card Gallery and individual Card Modals. It queries `PostgreSQL` (for `memory_units`, `concepts`, `derived_artifacts`, `annotations`), `mv_entity_growth` (for aggregated growth scores), and `v_card_state` (for evolution status like "seed", "sprout", "bloom").
*   **Display Logic:**
    *   Cards in the gallery show titles, summaries, and visual cues for evolution state and dominant growth dimensions.
    *   The Card Modal displays full content, associated media, annotations, detailed growth dimension scores, and evolution history.
*   **Interactions & Events:**
    *   User interactions (e.g., creating an annotation, linking cards) trigger calls to the `IngestionAnalyst` or `DialogueAgent`.
    *   `IngestionAnalyst` processes these, creating `growth_events` and updating the knowledge graph.
    *   The UI can receive updates via WebSocket notifications (e.g., from the `DialogueAgent` or a dedicated notification service listening to database events) to refresh card data, or it can refetch on specific user actions.
    *   Clicking "Evolve Card" (if available based on `v_card_state`) might trigger an animation and a call to `DialogueAgent` to acknowledge the milestone.

### 3.2 Dashboard Modal

*   **Data Source:**
    *   The user's overall Six-Dimensional Growth profile (radar chart, dimension scores) is sourced directly from the `users.growth_profile` field in `PostgreSQL`, which is updated periodically based on `mv_entity_growth`.
    *   Recent activity feeds, newly discovered insights ("Orb's Dream Cards"), and active "Mystery Challenges" are populated by the `RetrievalPlanner` querying `derived_artifacts`, `user_challenges`, and recent `growth_events`.
*   **Display Logic:**
    *   Visualizes the Six-Dimensional Growth radar chart.
    *   Lists active challenges and their progress (from `user_challenges.progress`).
    *   Showcases recently evolved cards or significant insights.
*   **Interactions & Events:**
    *   Clicking on a challenge can navigate to the relevant content or section of the app.
    *   The dashboard might suggest actions based on data from the `InsightEngine` (e.g., "You're close to evolving a concept in 'Self-Knowledge'!").

### 3.3 Card & Dashboard Visual Design Integration

*   **Emotional Resonance:** Visual design (colors, textures, animations) of cards and dashboard elements will align with the V7 UI/UX Design Language, reflecting the emotional tone of the content or growth dimension. For example, "Self-Knowing" dimension achievements might use calming blues and purples, while "World-Acting" might use more energetic oranges and yellows.
*   **Dynamic Elements:**
    *   Card evolution states ("seed" to "constellation") are visually distinct, using particle effects, glows, or subtle animations as defined in the UI design.
    *   Growth dimension scores on cards can be represented by filled segments of a small radial progress bar or highlighted icons.
    *   The Orb's appearance and animations (Section 2.4.1) complement dashboard insights or card evolution milestones, with the `DialogueAgent` sending `orb_state_update` directives.

### 3.4 Frontend Implementation (Technical Details)

*   **State Management (Zustand):**
    *   `CardStore`: Manages state for the currently viewed card in a modal, including its full data, annotations, and related entities.
    *   `DashboardStore`: Holds data for dashboard widgets, including growth profile, challenges, and recent insights.
    *   `GraphSceneStore`: Manages the state of the GraphScene, including node positions, selected nodes, and filter criteria. This store receives data primarily from the `RetrievalPlanner` via API calls initiated by user interactions or `DialogueAgent` directives.
    *   `AgentCommunicationStore`: Handles WebSocket connections for real-time updates from backend agents (e.g., `DialogueAgent` for Orb state, `InsightGenerated` events, `GrowthEventCreated` notifications if fine-grained UI updates are desired).
*   **Component Interactions:**
    *   `CardGallery.tsx` maps over a list of card summaries (fetched via `useCardGalleryQuery` hook) and renders `CardPreview.tsx` components.
    *   `CardModal.tsx` fetches full card details (via `useCardDetailQuery` hook) when a card is selected. It includes sub-components for displaying content, media, annotations (`AnnotationList.tsx`), and growth dimensions (`GrowthDisplay.tsx`).
    *   `Dashboard.tsx` uses hooks like `useUserProfileQuery` and `useChallengesQuery` to populate its sections.
*   **API Integration:**
    *   Custom hooks (e.g., `useRetrievalPlanner`, `useDialogueAgent`) encapsulate `fetch` calls to the backend API Gateway, which routes requests to the appropriate agents. These hooks handle request/response typing, loading states, and errors.
    *   Payloads for these hooks align with the Input/Output payloads defined for agents in Section 2.4.2.

### 3.5 UI-Backend Integration and Data Flow for V7

*   **Event-Driven Updates:** While direct API calls fetch initial data, subsequent updates related to growth, card evolution, or new insights are increasingly event-driven.
    *   The `IngestionAnalyst` creating a `growth_event` updates `PostgreSQL`. This can trigger database notifications (e.g., LISTEN/NOTIFY in Postgres) or a change data capture (CDC) stream.
    *   A backend service can listen to these events and push targeted updates to relevant connected clients via WebSockets. For example, if a `growth_event` causes a card to evolve, clients viewing that card or the Card Gallery could receive an update.
    *   The `DialogueAgent` plays a key role in orchestrating UI feedback for significant events, sending `orb_state_update` and `ui_directive` messages.
*   **Computed Views for Efficiency:** The UI relies heavily on pre-computed data from `mv_entity_growth` and `v_card_state` to avoid complex calculations on the frontend or in API responses. The `RetrievalPlanner` directly queries these views.
*   **Optimistic Updates:** For certain user actions (e.g., adding a quick annotation), the UI might optimistically update the state and then sync with the backend, providing a more responsive feel. Error handling for failed optimistic updates is crucial.

## 4. Knowledge Model (V7 Refined)

This section details both the conceptual knowledge model and its technical implementation, illustrating how backend data structures manifest as user-facing elements in the V7 UI.

### 4.1 Core Knowledge Graph Schema

The knowledge graph forms the foundation of the system's understanding, with a rich schema of entities and relationships.

#### 4.1.1 Core Entities & UI Representation

*   **`User`**:
    * **Properties:** `user_id` (unique), `name`, `email`, `preferences`, `growth_profile` (JSONB)
    * **UI Representation:** Preferences influence UI styling and Orb behavior. `growth_profile` drives dashboard visuals.
    * **Purpose:** Central anchor point for a user's memory graph and growth journey.

*   **`MemoryUnit`**:
    * **Properties:** `muid` (unique), `creation_ts`, `last_modified_ts`, `source_type` (e.g., "journal_entry", "conversation", "imported_document"), `title`, `processing_status`, `importance_score`
    * **UI Representation:** Appears as `Card` in Card Gallery or "Memory Star" in GraphScene.
    * **Purpose:** Container for a distinct piece of user memory/input.

*   **`Chunk`**:
    * **Properties:** `cid` (unique), `muid` (parent link), `text`, `sequence_order`, `role` (e.g., "user_utterance", "dot_utterance", "question", "key_insight"), `embedding_id`
    * **UI Representation:** Content for Cards, context for retrieval. Not directly visualized as separate entities.
    * **Purpose:** Granular, semantically searchable units of text extracted from MemoryUnits.

*   **`Concept`**:
    * **Properties:** `concept_id` (unique), `name`, `type`, `description`, `user_defined` (boolean), `confidence`, `last_updated_ts`, `community_id` (optional)
    * **UI Representation:** Primary nodes in GraphScene ("Concept Nebula/Node"), also as `Card`s. `type` property dictates visual style in GraphScene.
    * **Purpose:** Represents entities, themes, values, emotions, topics, or other significant abstract ideas in the user's life.
    * **The `type` property** draws from a controlled vocabulary managed by the Ontology Steward:
      * **Self Domain:** "value", "personal_trait", "skill", "emotion", "interest", "struggle"
      * **Life Events Domain:** "life_event_theme", "achievement", "decision_point", "milestone" 
      * **Relationships Domain:** "person", "organization", "group", "relationship_dynamic"
      * **Future Orientation Domain:** "goal", "aspiration", "plan", "concern"
      * **General:** "location", "time_period", "activity", "artwork", "topic", "abstract_idea"

*   **`Media`**:
    * **Properties:** `media_id` (unique), `muid` (parent link), `type` (e.g., "image", "audio", "document"), `url`, `caption`, `extraction_status`, `metadata` (JSONB)
    * **UI Representation:** Displayed within `Card`s or as thumbnails.
    * **Purpose:** Represents non-text media associated with MemoryUnits.

*   **`Annotation`**:
    * **Properties:** `aid` (unique), `target_id`, `target_type` (e.g., "MemoryUnit", "Chunk", "Concept"), `annotation_type` (e.g., "user_reflection", "ai_significance", "user_correction"), `text`, `creation_ts`, `source` ("user" or "agent_name")
    * **UI Representation:** Displayed within `Card`s as notes/reflections. `annotation_type` can link to Six-Dimensional Growth.
    * **Purpose:** Layer of interpretation or meta-commentary on graph elements.

*   **`Community`**:
    * **Properties:** `community_id` (unique), `name`, `description`, `creation_ts`, `detection_method`, `confidence_score`
    * **UI Representation:** Visualized as constellations/clusters in GraphScene.
    * **Purpose:** Represents detected concept clusters/communities, enabling higher-order organization.

*   **`DerivedArtifact`**:
    * **Properties:** `daid` (unique), `user_id`, `artifact_type` (e.g., "dream_card", "mystery_challenge", "insight_summary"), `title`, `summary_text`, `source_entities` (JSONB array of IDs), `creation_ts`
    * **UI Representation:** Special `Card`s (Orb's Dream Cards, Mystery Challenges, Cosmic Quests).
    * **Purpose:** AI-generated synthesis, insight, or challenge based on patterns in the knowledge graph.

*   **`GrowthEvent`**:
    * **Properties:** `event_id` (unique), `user_id`, `entity_id`, `entity_type`, `dim_key`, `delta`, `source`, `evidence_text`, `creation_ts`
    * **UI Representation:** Not directly visualized as individual events, but as aggregated effects driving growth visualizations, card evolution, and dashboard metrics.
    * **Purpose:** Atomic units of tracked growth within the Six-Dimensional Growth model, stored as an append-only event stream.

#### 4.1.2 Relationship Types

1. **`(User)-[:AUTHORED]->(MemoryUnit)`**
   * Connects users to their memory units

2. **`(MemoryUnit)-[:CONTAINS]->(Chunk)`**
   * Connects memory units to their constituent chunks

3. **`(MemoryUnit)-[:HIGHLIGHTS]->(Concept)`**
   * **Properties:** `weight` (float), `significance` (string)
   * **UI Representation:** In GraphScene, displayed as connections between Memory Stars and Concept Nodes
   * Indicates a memory unit prominently features a concept

4. **`(Chunk)-[:MENTIONS]->(Concept)`**
   * **Properties:** `weight` (float)
   * Indicates a chunk references a concept
   * Not directly visualized but influences search and retrieval

5. **`(MemoryUnit)-[:INCLUDES]->(Media)`**
   * Links media assets to their parent memory units
   * Visualized as thumbnails or galleries within Card views

6. **`(Concept)-[:RELATED_TO]->(Concept)`**
   * **Properties:** `relationship_label` (string), `weight` (float), `source` (string), `creation_ts` (timestamp)
   * **UI Representation:** Visualized as connections in GraphScene, with different styles based on relationship type
   * The critical relationship for building the semantic web
   * The `relationship_label` is controlled by the Ontology Steward and includes:
     * **Hierarchical:** "is_a_type_of", "is_part_of", "is_instance_of"
     * **Causal:** "causes", "influences", "enables", "prevents", "contributes_to"
     * **Temporal:** "precedes", "follows", "co-occurs_with"
     * **Association:** "is_similar_to", "is_opposite_of", "is_analogous_to"
     * **Domain-specific:** "inspires", "supports_value", "exemplifies_trait", "is_milestone_for"
     * **Metaphorical:** "is_metaphor_for", "represents_symbolically"

7. **`(User)-[:PERCEIVES]->(Concept)`**
   * **Properties:** `perception_type` (string), `current_salience` (float), `start_date` (date), `end_date` (date)
   * Represents the user's relationship to concepts over time
   * Informs Dashboard visualizations and personal insights
   * The `perception_type` includes: "holds_value", "has_interest", "possesses_trait", "pursues_goal", "experiences_emotion", "struggles_with"

8. **`(MemoryUnit)-[:CONTINUES]->(MemoryUnit)`**
   * **Properties:** `reason` (string)
   * Links related memory units temporally or thematically
   * Visualized as sequential connections in temporal views

9. **`(Annotation)-[:ANNOTATES]->(MemoryUnit | Chunk | Concept)`**
   * Links annotations to their targets
   * Visualized as notes or reflections on Cards

10. **`(Concept)-[:BELONGS_TO]->(Community)`**
    * Indicates a concept is part of a detected community/cluster
    * Visualized in GraphScene as membership in constellations

11. **`(DerivedArtifact)-[:BASED_ON]->(Concept | MemoryUnit)`**
    * **Properties:** `relevance` (float), `contribution_type` (string)
    * Connects AI-generated artifacts to their source entities
    * Enables "Show me why" explanations in the UI

### 4.2 Four Domains of Understanding

These domains are not explicit containers but emergent perspectives queried from the knowledge graph, visualized differently in the UI:

1. **SELF:** 
   * **Graph Query:** `(User)-[:PERCEIVES]->(Concept)` where `Concept.type` reflects aspects of identity, values, traits, emotions.
   * **UI Representation:** Core elements in personal Dashboard, often visualized with introspective color schemes (purples, blues).
   * **Examples:** Personal values, traits, skills, emotions

2. **LIFE EVENTS:** 
   * **Graph Query:** `MemoryUnit`s that `:HIGHLIGHTS` concepts with types like "life_event_theme", "milestone", etc.
   * **UI Representation:** Often represented chronologically in Card Gallery, with temporal navigation options.
   * **Examples:** Major life transitions, achievements, significant experiences

3. **RELATIONSHIPS:** 
   * **Graph Query:** Focused on `Concept`s of type "person", "group", etc., and the memory units mentioning them.
   * **UI Representation:** Often visualized as networks or clusters in GraphScene.
   * **Examples:** People, organizations, communities, relationship dynamics

4. **FUTURE ORIENTATION:** 
   * **Graph Query:** Centered on `(User)-[:PERCEIVES {perception_type: "pursues_goal"}]->(Concept)` and concepts of type "goal", "aspiration", etc.
   * **UI Representation:** Forward-looking sections in Dashboard, often with aspirational color schemes (golds, teals).
   * **Examples:** Goals, aspirations, plans, anticipated challenges

### 4.3 Six-Dimensional Growth Model & UI

The Six-Dimensional Growth model provides a structured framework for tracking personal development:

* **`growth_profile` (on `users` table):** 
  * Directly feeds the main radar chart on the Dashboard. 
  * This JSONB field stores the latest aggregated scores for each of the six dimensions (e.g., `{"self_know": 0.75, "self_act": 0.60, ...}`).
  * Values range from 0-1, with higher values indicating greater development.

* **Growth Dimensions:**
  * **Self-Knowing:** Self-awareness, introspection, understanding one's identity
  * **Self-Acting:** Agency, discipline, initiative in personal matters
  * **Self-Showing:** Self-expression, creativity, authentic presentation
  * **World-Knowing:** Understanding of external systems, topics, concepts
  * **World-Acting:** Taking action in the world, contributing externally
  * **World-Showing:** Communicating ideas, teaching others, external expression

* **`growth_events` (table):**
  * Represents atomic units of growth across the six dimensions
  * Aggregated by the materialized view `mv_entity_growth` to show current scores per dimension associated with specific entities
  * Powers the visualization of entity-specific dimension scores on `Card`s
  * Recent `growth_events` populate activity timelines or "What's New" sections on the Dashboard
  * Patterns in this event stream trigger the `InsightEngine` to create `DerivedArtifact` `Card`s like "Mystery Challenges"

* **Card Evolution States:**
  * The view `v_card_state` computes the `evolution_state` of `Card`s:
    * **"seed":** Initial state of all cards
    * **"sprout":** Reaches threshold in primary dimension
    * **"bloom":** Multiple dimensions reach thresholds
    * **"constellation":** Forms meaningful connections with other "bloom" cards
  * These states dictate the visual appearance of cards with different particle effects, glows, and animations

* **Challenge System:**
  * `challenge_templates` store the definition of growth challenges
  * `user_challenges` tracks user progress on active challenges
  * Completing challenges triggers `growth_events` and UI celebrations
  * Mystery Challenges are personalized quests generated by the Insight Engine

* **Activation Logic (UI Impact):**
  1. User performs an action (e.g., journaling, reflection, annotation)
  2. `IngestionAnalyst` processes the input using `GrowthDimensionIdentifier` tool
  3. Creates `growth_events` in the append-only stream
  4. Backend processes update `mv_entity_growth` and subsequently `users.growth_profile`
  5. UI reflects changes through:
     * Immediate updates (WebSocket notifications or optimistic updates)
     * On-refresh updates to dimension scores and card states
     * Celebrations for significant milestones (Orb animations, particle effects)

### 4.4 Schema Governance and Evolution

The system employs strict schema governance to maintain consistency while allowing evolution:

1. **Controlled Vocabularies:**
   * The Ontology Steward manages vocabularies for:
     * `Concept.type` (e.g., "value", "person", "goal")
     * `relationship_label` on `RELATED_TO` edges (e.g., "causes", "is_part_of")
     * `perception_type` on `PERCEIVES` edges (e.g., "holds_value", "pursues_goal")
     * Growth dimension keys and rules

2. **Schema Evolution Process:**
   * New candidate terms are proposed (by agents or users)
   * Ontology Steward evaluates based on frequency, distinctiveness, and utility
   * Terms may be:
     * Promoted to the canonical vocabulary
     * Mapped to existing terms
     * Flagged for user review
     * Rejected (mapped to closest existing term)

3. **V7 Implementation:**
   * Controlled vocabularies stored in Redis or configuration files (not hardcoded)
   * Visual mapping rules (e.g., how Concept types map to GraphScene visuals) maintained by Ontology Steward
   * Growth dimension identification rules stored as configurable rule sets
   * Card evolution criteria defined in view logic or configuration, not hardcoded

4. **Quality Management:**
   * Periodic graph consistency checks
   * Duplicate detection and merging
   * Orphaned concept identification
   * Inconsistent relationship pruning

### 4.5 Vector Embedding Strategy

The embedding strategy enables semantic search and concept clustering:

1. **Embedding Targets:**
   * **Chunk Embeddings:** Each `Chunk.text` is embedded for semantic search
   * **Concept Embeddings:** `Concept.name` + `Concept.description` for concept similarity
   * **DerivedArtifact Embeddings:** For finding similar insights or challenges
   * **Media Embeddings:** Image captions, extracted features from visual content

2. **Regional Models:**
   * **US:** Google Gemini embedding models (1536-dimensional)
   * **China:** DeepSeek embedding models (equivalent dimensions)

3. **Storage & Retrieval:**
   * Embeddings stored in Weaviate with `externalId` linking back to PostgreSQL
   * Efficient vector search with HNSW indexing
   * Hybrid search combining vector similarity with metadata filtering
   * Multiple embedding spaces maintained for different entity types, but with shared dimensionality for cross-type similarity

## 5. Frontend Implementation

This section details the technical implementation of the 3-layer UI architecture, component structure, and state management strategy for the V7 interface.

### 5.1 Technical Stack

The frontend leverages modern web technologies to deliver a seamless experience across the 3D Canvas, 2D Modal, and 3D Orb layers:

- **Core Framework:** Next.js 14+ (App Router) with React 18+
- **3D Rendering:** Three.js with React Three Fiber (R3F) for WebGL
- **State Management:** Zustand for atomic, reactive state management
- **Styling:** Tailwind CSS with custom design system components
- **Animation:** Framer Motion (for 2D), R3F/drei hooks (for 3D)
- **Data Fetching:** React Query + custom API hooks
- **Real-time:** Socket.IO client for WebSocket communication
- **Form Handling:** React Hook Form with Zod validation
- **Accessibility:** ARIA-compliant components, keyboard navigation support
- **Testing:** Jest, React Testing Library, Cypress (E2E)

### 5.2 3D Layer Implementation

The 3D Canvas and Orb layers are implemented using Three.js with React Three Fiber:

#### 5.2.1 3D Canvas Layer (R3F)

The 3D Canvas provides immersive scenes that set the emotional tone and visualize the knowledge graph:

```jsx
// Scene architecture (simplified)
const CloudScene = () => {
  const { fogColor, cloudDensity, mood } = useSceneStore();
  
  return (
    <R3F.Canvas camera={{ position: [0, 50, 100], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <SceneLighting mood={mood} />
      <SceneFog color={fogColor} />
      <Clouds density={cloudDensity} />
      <Mountains />
      <SkyboxHDRI path="/environment-maps/cloudscape.hdr" />
      <EffectsComposer>
        <Bloom intensity={1.5} />
        <DepthOfField focusDistance={0} />
      </EffectsComposer>
      <OrbitControls enableZoom={true} enablePan={false} />
    </R3F.Canvas>
  )
};
```

**Key Scene Components:**

1. **CloudScene:**
   - Serene cloudscape with mountains for reflection and journaling
   - Dynamic cloud simulation using noise-based vertex displacement
   - Soft lighting and atmospheric scattering effects
   - Supports mood transitions (peaceful, contemplative, energetic)
   - Serves as backdrop for journaling and reflective activities

2. **AscensionScene:**
   - Transition sequence from clouds through atmosphere to space
   - Implements camera path animation along a predefined spline
   - Features particle systems for stars and atmospheric effects
   - Uses shader-based sky gradient and light scattering
   - Triggered during significant moments of insight or growth

3. **GraphScene:**
   - Interactive visualization of the knowledge graph
   - Implements force-directed layout with physics simulation
   - Renders concepts as glowing orbs with custom shaders
   - Visualizes relationships as light beams with particle effects
   - Supports clustering, filtering, and focusing operations
   - Dynamically loads graph data via the Retrieval Planner

**Technical Implementation Details:**

- **Performance Optimization:**
  - Level-of-detail (LOD) for complex objects
  - Instanced mesh rendering for repeated elements (clouds, stars)
  - Frustum culling for off-screen elements
  - WebGL2 features when available (compute shaders)
  - Texture compression and mipmap generation

- **Custom Shaders:**
  - GLSL shaders for volumetric clouds, light beams, and node glows
  - Atmospheric scattering simulation for realistic sky rendering
  - Rim lighting effects for concept nodes
  - Particle system shaders for constellation effects

- **Asset Management:**
  - Progressive loading of 3D assets based on scene requirements
  - GLTF format for 3D models with draco compression
  - HDR environment maps for realistic lighting
  - Texture atlasing for material variations

- **Interaction System:**
  - Raycasting for precise object selection
  - Custom camera controls with inertia and boundary constraints
  - Event delegation for object interactions
  - Zoom-to-focus animations for selected elements

#### 5.2.2 3D Orb Layer (R3F)

The Orb is a responsive, animated presence rendered as a separate 3D layer:

```jsx
// Orb component (simplified)
const Orb = () => {
  const { 
    emotionalTone, 
    energyLevel, 
    visualState,
    effectsQueue
  } = useOrbStore();
  
  return (
    <R3F.Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <OrbCore 
        emotionalTone={emotionalTone} 
        energyLevel={energyLevel}
        visualState={visualState}
      />
      <OrbEffects effects={effectsQueue} />
      <EffectsComposer>
        <Bloom intensity={1.2} />
        <ChromaticAberration offset={0.002} />
      </EffectsComposer>
    </R3F.Canvas>
  )
};
```

**Orb Implementation Details:**

1. **Core Appearance:**
   - Fluid, non-anthropomorphic spherical form
   - Layer-based composition with:
     - Inner core (emotional tone indication)
     - Middle layer (dynamic fluid simulation)
     - Outer aura (energy and activity indication)
   - Custom GLSL shaders for fluid dynamics simulation
   - Real-time color and intensity variations based on state

2. **Emotional States:**
   - **Neutral/Listening:** Calm, gentle blue pulsation
   - **Curious:** Bright teal with quick movements
   - **Thoughtful:** Deep purple with slower, deliberate motion
   - **Insightful:** Golden glow with particle bursts
   - **Celebratory:** Vibrant rainbow ripples with firework-like effects
   - **Empathetic:** Warm rose with gentle pulsation
   - **Focused:** Concentrated white-blue with directed energy

3. **Visual Behaviors:**
   - **Idle:** Gentle pulsation with subtle movement
   - **Listening:** Ripple effects that react to audio amplitude
   - **Thinking:** Circular flowing patterns with increased complexity
   - **Speaking:** Synchronized pulsation with speech cadence
   - **Insight Flash:** Sudden expansion with particle burst
   - **Transition:** Morphing between states with fluid animation

4. **Technical Features:**
   - Custom fluid simulation shader using curl noise
   - Audio reactivity that maps voice patterns to visual effects
   - Particle system for expressive effects
   - Glow and light emission through post-processing

### 5.3 2D Layer Implementation (React/DOM)

The 2D Modal Layer provides structured UI elements that float above the 3D canvas:

#### 5.3.1 Modal Architecture

Modals use a glass-morphic design that maintains visual connection to the 3D background:

```jsx
// BaseModal component (simplified)
const BaseModal = ({ 
  children, 
  title, 
  size = 'medium', 
  onClose, 
  blurStrength = 10
}) => {
  return (
    <motion.div 
      className={`modal-container modal-${size}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div 
        className="modal-content" 
        style={{ 
          backdropFilter: `blur(${blurStrength}px)`,
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
```

#### 5.3.2 Key UI Components

1. **Card Gallery:**
   - Grid/masonry layout of memory and concept cards
   - Virtualized rendering for performance with large collections
   - Filtering and sorting controls
   - Animation for card evolution states
   - Integrates with `v_card_state` data to display evolution visuals

2. **Card Detail:**
   - Rich content display with markdown rendering
   - Media gallery integration
   - Annotation interface
   - Growth dimension visualization
   - Related concepts and memories
   - History timeline of interactions and evolutions

3. **Dashboard:**
   - Growth radar chart visualization
   - Recent activity timeline
   - Challenge progress tracking
   - Insight highlights (Dream Cards)
   - Quick actions and recommendations
   - Personalized growth statistics

4. **Chat Interface:**
   - Message thread with support for rich content
   - Optimistic updates for seamless conversation
   - Suggested action buttons
   - Image and document upload
   - Visual indication of Orb state synchronized with 3D Orb
   - Input field with contextual suggestions

5. **HUD (Heads-Up Display):**
   - Minimal persistent navigation
   - Scene switcher (CloudScene, GraphScene)
   - Quick action buttons
   - Notification indicators
   - Growth milestone alerts
   - User settings access

#### 5.3.3 Card Component Architecture

Cards are a central UI element with complex state and visualization:

```jsx
// Card component (simplified)
const Card = ({ 
  entityId,
  entityType,
  initialData,
  size = 'medium',
  interactionMode = 'gallery'
}) => {
  const { data, isLoading } = useCardData(entityId, entityType, initialData);
  const { evolutionState, growthDimensions } = data || {};
  
  return (
    <motion.div 
      className={`card card-${size} card-${evolutionState}`}
      whileHover={{ scale: 1.02 }}
    >
      <CardEvolutionVisual state={evolutionState} />
      
      <div className="card-content">
        <h3>{data?.title}</h3>
        <p>{data?.summary}</p>
        
        {growthDimensions && (
          <GrowthDimensionsVisual dimensions={growthDimensions} />
        )}
        
        <CardActions entityId={entityId} entityType={entityType} />
      </div>
      
      {interactionMode === 'gallery' && (
        <CardHoverEffects entityId={entityId} />
      )}
    </motion.div>
  );
};
```

**Card Evolution Visuals:**

- **Seed:** Minimal glow, simple border
- **Sprout:** Growing glow effect, animated particle tendrils
- **Bloom:** Full radiance, distinctive colored aura based on primary growth dimension
- **Constellation:** Connected star-like effect with animated particle connections to related cards

### 5.4 State Management

The application uses Zustand for state management with multiple atomic stores:

#### 5.4.1 Core State Stores

```jsx
// SceneStore.js (simplified)
const useSceneStore = create((set) => ({
  currentScene: 'CloudScene',
  sceneParams: {
    CloudScene: { fogDensity: 0.2, mood: 'peaceful' },
    GraphScene: { focusedNodeId: null, viewDistance: 500 },
    AscensionScene: { transitionProgress: 0, transitionSpeed: 1 }
  },
  transitionActive: false,
  
  setCurrentScene: (scene) => set({ currentScene: scene }),
  updateSceneParams: (scene, params) => set((state) => ({
    sceneParams: {
      ...state.sceneParams,
      [scene]: { ...state.sceneParams[scene], ...params }
    }
  })),
  startTransition: (targetScene) => set({ 
    transitionActive: true,
    targetScene
  }),
  // Additional actions...
}));

// OrbStore.js (simplified)
const useOrbStore = create((set) => ({
  emotionalTone: 'neutral',
  visualState: 'idle',
  energyLevel: 0.5,
  effectsQueue: [],
  
  updateOrbState: (state) => set(state),
  queueEffect: (effect) => set((state) => ({
    effectsQueue: [...state.effectsQueue, effect]
  })),
  clearEffect: (effectId) => set((state) => ({
    effectsQueue: state.effectsQueue.filter(e => e.id !== effectId)
  })),
  // Additional actions...
}));

// ModalStore.js (simplified)
const useModalStore = create((set) => ({
  activeModals: [],
  modalHistory: [],
  cardInFocus: null,
  
  openModal: (modalType, props) => set((state) => ({
    activeModals: [...state.activeModals, { id: uuidv4(), type: modalType, props }],
    modalHistory: [...state.modalHistory, modalType]
  })),
  closeModal: (modalId) => set((state) => ({
    activeModals: state.activeModals.filter(m => m.id !== modalId)
  })),
  setCardInFocus: (cardId) => set({ cardInFocus: cardId }),
  // Additional actions...
}));
```

#### 5.4.2 Agent Communication Store

Manages WebSocket connections and real-time updates:

```jsx
// AgentCommunicationStore.js (simplified)
const useAgentCommunicationStore = create((set, get) => ({
  socket: null,
  connectionStatus: 'disconnected',
  messageQueue: [],
  activeListeners: {},
  
  initializeSocket: () => {
    const socket = io('/agent-communication');
    
    socket.on('connect', () => {
      set({ 
        socket, 
        connectionStatus: 'connected',
        // Send any queued messages
        messageQueue: get().messageQueue.filter(msg => {
          socket.emit(msg.channel, msg.payload);
          return false; // Remove from queue
        })
      });
    });
    
    socket.on('disconnect', () => {
      set({ connectionStatus: 'disconnected' });
    });
    
    // Set up event handlers for various message types
    socket.on('orb-updates', (data) => {
      useOrbStore.getState().updateOrbState(data);
    });
    
    socket.on('growth-events', (data) => {
      // Handle growth events, card evolution notifications
      if (data.type === 'card-evolution') {
        // Trigger visual celebration
      }
    });
    
    socket.on('insight-generated', (data) => {
      // Handle new insights from the Insight Engine
      useModalStore.getState().queueNotification({
        type: 'insight',
        title: data.title,
        body: data.summary
      });
    });
    
    return socket;
  },
  
  sendMessage: (channel, payload) => {
    const { socket, connectionStatus, messageQueue } = get();
    
    if (connectionStatus === 'connected' && socket) {
      socket.emit(channel, payload);
    } else {
      // Queue message for when connection resumes
      set((state) => ({
        messageQueue: [...state.messageQueue, { channel, payload }]
      }));
    }
  },
  
  // Additional methods for specific agent interactions
}));
```

### 5.5 Data Fetching and API Integration

Custom hooks integrate with backend agent services:

#### 5.5.1 Agent-Specific Hooks

```jsx
// useDialogueAgent.js (simplified)
export const useDialogueAgent = () => {
  const sendMessage = async (message, mediaAttachments = []) => {
    const { conversationId } = useConversationStore.getState();
    const { currentScene, sceneParams } = useSceneStore.getState();
    const { emotionalTone } = useOrbStore.getState();
    const { activeModal, cardInFocus } = useModalStore.getState();
    
    const payload = {
      user_id: useAuthStore.getState().userId,
      message_text: message,
      message_media: mediaAttachments,
      conversation_id: conversationId,
      message_id: uuidv4(),
      ui_context: {
        current_scene: currentScene,
        active_modal: activeModal,
        focused_entity_id: cardInFocus,
        orb_emotional_state_hint: emotionalTone
      },
      timestamp: new Date().toISOString()
    };
    
    // Optimistic update for UI
    useConversationStore.getState().addMessage({
      id: payload.message_id,
      text: message,
      sender: 'user',
      status: 'sending',
      timestamp: payload.timestamp
    });
    
    try {
      const response = await fetch('/api/dialogue/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const responseData = await response.json();
      
      // Update UI based on response
      useConversationStore.getState().updateMessageStatus(
        payload.message_id, 
        'sent'
      );
      
      // Handle Orb state update
      if (responseData.orb_state_update) {
        useOrbStore.getState().updateOrbState(responseData.orb_state_update);
      }
      
      // Handle UI directive
      if (responseData.ui_directive) {
        handleUIDirective(responseData.ui_directive);
      }
      
      // Add agent response to conversation
      useConversationStore.getState().addMessage({
        id: responseData.message_id,
        text: responseData.response_text,
        sender: 'agent',
        suggestedActions: responseData.suggested_actions,
        timestamp: responseData.timestamp
      });
      
      // Handle growth event if present
      if (responseData.growth_event_trigger) {
        handleGrowthEvent(responseData.growth_event_trigger);
      }
      
      return responseData;
    } catch (error) {
      useConversationStore.getState().updateMessageStatus(
        payload.message_id, 
        'error'
      );
      throw error;
    }
  };
  
  // Additional dialogue agent methods
  
  return { sendMessage /* ... */ };
};

// useRetrievalPlanner.js (simplified)
export const useRetrievalPlanner = () => {
  const fetchCards = async (options = {}) => {
    const defaultOptions = {
      query_type: 'card_gallery_feed',
      max_results: 20,
      include_growth_dimensions: true,
      ui_context: {
        current_scene: useSceneStore.getState().currentScene
      }
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch('/api/knowledge/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: useAuthStore.getState().userId,
          ...queryOptions
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch cards');
      
      const data = await response.json();
      return data.retrieved_elements;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  };
  
  const fetchGraphData = async (options = {}) => {
    // Similar implementation for graph data retrieval
  };
  
  // Additional retrieval methods
  
  return { fetchCards, fetchGraphData /* ... */ };
};
```

#### 5.5.2 React Query Integration

For more complex data fetching patterns, React Query is utilized:

```jsx
// useCardData.js (simplified)
export const useCardData = (entityId, entityType, initialData = null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['card', entityId, entityType],
    queryFn: async () => {
      const response = await fetch(`/api/knowledge/entity/${entityId}?type=${entityType}`);
      if (!response.ok) throw new Error('Failed to fetch card data');
      return response.json();
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      // Update related data in the query cache
      if (data.related_entities) {
        data.related_entities.forEach(related => {
          queryClient.setQueryData(
            ['card', related.entity_id, related.entity_type],
            related
          );
        });
      }
    }
  });
};

// useGrowthProfile.js (simplified)
export const useGrowthProfile = () => {
  return useQuery({
    queryKey: ['growthProfile'],
    queryFn: async () => {
      const response = await fetch('/api/growth/profile');
      if (!response.ok) throw new Error('Failed to fetch growth profile');
      return response.json();
    },
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });
};
```

### 5.6 Optimization Strategies

The frontend implements various optimization techniques:

#### 5.6.1 Performance Optimizations

1. **Code Splitting:**
   - Route-based splitting with Next.js
   - Dynamic imports for modal components
   - Lazy loading for 3D scene components

2. **Rendering Optimizations:**
   - React memo and useMemo for expensive components
   - Virtualized lists for large collections (Card Gallery)
   - Throttled state updates for real-time animations
   - Selective re-rendering through Zustand selectors

3. **Asset Optimization:**
   - Image optimization with Next.js Image component
   - WebP format for textures and images
   - Progressive loading for 3D assets
   - Texture atlasing for material variations

4. **WebGL Optimizations:**
   - Instanced mesh rendering for repeated elements
   - Frustum culling for off-screen objects
   - Level-of-detail (LOD) switching based on distance
   - Object pooling for particle effects

#### 5.6.2 Mobile Optimizations

1. **Responsive Design:**
   - Tailwind CSS breakpoints for layout adaptation
   - Component-specific mobile variants
   - Touch-friendly interaction targets

2. **3D Performance:**
   - Reduced particle counts on mobile
   - Simplified shaders for mobile GPUs
   - Lower resolution textures and post-processing
   - Optional "lite mode" for older devices

3. **Network Considerations:**
   - Reduced API payload sizes for mobile
   - Progressive loading of non-critical data
   - Offline support for journaling features
   - Bandwidth-aware media loading

#### 5.6.3 Accessibility Considerations

1. **Keyboard Navigation:**
   - Full keyboard support for all interactions
   - Focus management across 2D and 3D elements
   - Skip links for navigation

2. **Screen Reader Support:**
   - ARIA attributes for custom components
   - Alternative text for visual elements
   - Announcements for dynamic content changes
   - Text alternatives for 3D visualizations

3. **Motion Sensitivity:**
   - Respects `prefers-reduced-motion` setting
   - Options to reduce animations and effects
   - Static alternatives for dynamic visualizations

### 5.7 Mobile Application

The mobile app maintains feature parity while optimizing for mobile contexts:

1. **Implementation Approach:**
   - React Native for core UI components
   - React Native Web for shared components with web
   - Three.js via react-three-fiber-native for 3D elements
   - Native modules for platform-specific features

2. **Native Features:**
   - Camera integration for image capture
   - Notifications for insights and challenges
   - Background sync for offline journaling
   - Biometric authentication

3. **Performance Considerations:**
   - Reduced complexity in 3D scenes
   - Optimized asset loading for cellular connections
   - Battery-aware processing modes
   - Memory-efficient rendering for limited RAM

This comprehensive frontend implementation creates a cohesive, responsive user experience that seamlessly integrates the 3D immersive elements with practical UI components, while ensuring optimal performance across devices and accessibility for all users.

## 6. Backend Implementation

This section details the technical implementation of the backend services, focusing on data flow, processing pipelines, and integration between components.

### 6.1 Technology Stack

The backend implementation leverages modern technologies optimized for AI-driven systems:

**Core Services:**
- **Languages:** TypeScript/Node.js for services, Python for specific ML tools
- **API Framework:** Express.js with strong typing (via TypeScript interfaces)
- **Real-time Communication:** Socket.IO for WebSocket connections
- **Message Queues:** BullMQ (Redis-backed) for async processing
- **Container Orchestration:** Docker + Kubernetes or AWS ECS
- **GraphQL:** Apollo Server for complex data queries (complementing REST)

**AI Services:**
- **US Region:** Google AI API (Gemini models for LLM, embedding services)
- **China Region:** DeepSeek API (equivalent model tiers)
- **Local Processing:** TensorFlow.js, ONNX Runtime for edge processing

**Database Access:**
- **PostgreSQL:** Prisma ORM for type-safe database access
- **Neo4j:** Official Neo4j JavaScript Driver
- **Weaviate:** Weaviate JavaScript client
- **Redis:** ioredis client

**Monitoring & Logging:**
- Prometheus for metrics collection
- OpenTelemetry for distributed tracing
- Structured logging (JSON format) with correlation IDs

### 6.2 Core Backend Services

The system is implemented as a collection of microservices, with clear boundaries between components:

#### 6.2.1 API Gateway

- Serves as the entry point for all client requests
- Handles authentication, rate limiting, and request validation
- Routes requests to appropriate agent services
- Manages WebSocket connections for real-time updates
- Implements GraphQL endpoint for complex queries

**Key Endpoints:**
- `/api/auth/*` - Authentication endpoints
- `/api/dialogue` - Interface to Dialogue Agent
- `/api/knowledge/*` - Knowledge graph exploration endpoints
- `/api/user/*` - User profile and preferences
- `/api/media/*` - Media upload and processing
- `/graphql` - GraphQL endpoint for complex data fetching

**WebSocket Channels:**
- `orb-updates` - Real-time Orb state changes
- `notification` - System notifications
- `growth-events` - Real-time growth and card evolution events

#### 6.2.2 Agent Services

Each cognitive agent is implemented as a separate service with its own API:

**Dialogue Agent Service:**
- Primary user-facing service
- Manages conversation state and history
- Coordinates with other agents through internal APIs
- Maintains Orb state and triggers UI directives
- Implements LLM safety guardrails and content filtering

**Ingestion Analyst Service:**
- Processes incoming content (journal entries, conversations, uploads)
- Manages the tiered processing workflow (lightweight → deep)
- Coordinates embedding generation jobs
- Writes to multiple data stores (PostgreSQL, Neo4j, Weaviate)
- Publishes events for knowledge graph updates

**Retrieval Planner Service:**
- Executes hybrid search strategies
- Coordinates access to all data stores
- Implements custom ranking algorithms
- Optimizes response format based on UI context
- Caches common query patterns

**Insight Engine Service:**
- Runs scheduled and event-triggered insight discovery
- Manages asynchronous pattern detection jobs
- Generates "Dream Cards" and "Mystery Challenges"
- Tracks growth dimension milestones
- Publishes insights to notification queue

**Ontology Steward Service:**
- Manages controlled vocabularies
- Evaluates new term candidates
- Enforces schema consistency
- Maintains visual mapping rules for GraphScene
- Provides schema metadata for UI components

### 6.3 Data Flow & Processing

This section details key end-to-end flows, incorporating the event-sourcing model and agent collaboration patterns.

#### 6.3.1 User Input Processing Flow

When a user creates a journal entry or sends a message:

1. **Input Reception:**
   - Client sends content to API Gateway
   - Gateway validates input and routes to Dialogue Agent
   - Dialogue Agent acknowledges receipt to user (optimistic UI update)

2. **Ingestion Pipeline:**
   ```
   ┌────────────┐    ┌────────────┐    ┌────────────────┐    ┌────────────┐
   │  Dialogue  │    │ Ingestion  │    │  Embedding     │    │  Growth    │
   │   Agent    │───►│  Analyst   │───►│    Worker      │───►│  Events    │
   └────────────┘    └────────────┘    └────────────────┘    └────────────┘
          │                │                                        │
          │                ▼                                        ▼
          │          ┌────────────┐                          ┌────────────┐
          │          │ PostgreSQL │                          │Materialized│
          │          │   Neo4j    │◄─────────────────────────┤   Views    │
          │          │  Weaviate  │                          └────────────┘
          │          └────────────┘                                │
          ▼                                                        ▼
   ┌────────────┐                                           ┌────────────┐
   │ WebSocket  │                                           │    UI      │
   │ Updates    │◄──────────────────────────────────────────┤  Updates   │
   └────────────┘                                           └────────────┘
   ```

3. **Tiered Processing:**
   - **Tier 1 (Immediate):**
     - Create `MemoryUnit` record
     - Perform basic chunking
     - Extract simple entities
     - Queue embedding jobs
     - Generate initial growth events
     - Send "processing started" WebSocket update

   - **Tier 2 (Background, within minutes):**
     - Process embeddings
     - Extract relationships
     - Perform media analysis
     - Create additional graph connections
     - Update materialized views (`mv_entity_growth`)
     - Check for card evolution state changes
     - Send "processing complete" WebSocket update with evolution state

   - **Tier 3 (Deep Analysis, scheduled or triggered):**
     - Run advanced LLM analysis
     - Create metaphorical connections
     - Generate complex insights
     - Publish `InsightGenerated` events

4. **Growth Event Processing:**
   - `GrowthEvent` records are written to the append-only stream
   - Database triggers or scheduled jobs refresh `mv_entity_growth`
   - Card evolution state is computed via `v_card_state`
   - Significant milestones trigger notifications
   - UI updates reflect new growth dimensions and card states

#### 6.3.2 Retrieval & Chat Flow

When a user asks a question or requests information:

1. **Query Processing:**
   ```
   ┌────────────┐    ┌────────────┐    ┌────────────────┐    ┌────────────┐
   │    User    │    │  Dialogue  │    │   Retrieval    │    │ Knowledge  │
   │   Query    │───►│   Agent    │───►│    Planner     │───►│  Stores    │
   └────────────┘    └────────────┘    └────────────────┘    └────────────┘
                           │                    │                   │
                           │                    ▼                   │
                           │             ┌────────────┐             │
                           │             │ Reranking  │             │
                           │             │   Logic    │◄────────────┘
                           │             └────────────┘
                           │                    │
                           ▼                    ▼
                     ┌────────────┐      ┌────────────┐
                     │    LLM     │      │  Context   │
                     │  Response  │◄─────┤   Bundle   │
                     └────────────┘      └────────────┘
                           │
                           ▼
                     ┌────────────┐
                     │  UI/Orb    │
                     │  Update    │
                     └────────────┘
   ```

2. **Multi-Strategy Execution:**
   - Dialogue Agent receives query and determines intent
   - If knowledge retrieval is needed, calls Retrieval Planner
   - Retrieval Planner executes the optimal strategy:
     - Vector search in Weaviate
     - Graph traversal in Neo4j
     - Structured queries against PostgreSQL views
   - Results are reranked and combined into context bundle
   - Bundle enriched with growth dimension data from `mv_entity_growth`

3. **Response Generation:**
   - Dialogue Agent formulates response using LLM with retrieved context
   - Determines appropriate Orb state update
   - Generates UI directives if needed (e.g., scene transition)
   - Returns comprehensive payload to client
   - May trigger growth events if interaction demonstrates growth

4. **UI Updates:**
   - Response displayed in chat
   - Orb updates its visual state
   - UI may transition between scenes
   - Card Gallery or Graph visualization may update to highlight referenced entities

#### 6.3.3 Insight Generation Flow

The asynchronous process for discovering patterns and generating insights:

1. **Trigger Mechanisms:**
   ```
   ┌────────────┐    ┌────────────┐    ┌────────────────┐
   │ Scheduled  │    │  Insight   │    │   Pattern      │
   │   Jobs     │───►│   Engine   │───►│   Detection    │
   └────────────┘    └────────────┘    └────────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
   ┌────────────┐    ┌────────────┐      ┌────────────┐
   │  Growth    │    │  Concept   │      │ Hypothesis │
   │  Milestone │    │   Graph    │      │ Generation │
   └────────────┘    └────────────┘      └────────────┘
                           │                    │
                           │                    ▼
                           │             ┌────────────┐
                           │             │  Derived   │
                           └────────────►│ Artifacts  │
                                         └────────────┘
                                               │
                                               ▼
                                         ┌────────────┐
                                         │ Dialogue   │
                                         │   Agent    │
                                         └────────────┘
   ```

2. **Pattern Discovery Process:**
   - Regularly scheduled jobs analyze the knowledge graph
   - Growth event stream is analyzed for trends and milestones
   - Graph algorithms detect communities and interesting patterns
   - LLM-assisted analysis finds metaphorical connections
   - Hypotheses about patterns are generated and evaluated

3. **Insight Creation:**
   - High-value insights become "Dream Cards" (derived_artifacts)
   - Growth opportunities become "Mystery Challenges" (challenge_templates)
   - Pattern completions become "Constellation Suggestions"
   - All insights are prioritized and stored in PostgreSQL

4. **Delivery Mechanisms:**
   - High-priority insights are pushed to the Dialogue Agent
   - Dialogue Agent may surface them in conversation
   - Insights appear on Dashboard via Retrieval Planner
   - Card Gallery may feature Dream Cards
   - GraphScene may highlight Constellation Suggestions

#### 6.3.4 Growth System Flow

The event-sourcing approach for tracking user growth:

1. **Growth Event Creation:**
   - User actions (journaling, reflection, annotation) are processed by Ingestion Analyst
   - GrowthDimensionIdentifier tool detects dimension activation
   - `growth_events` records are created with:
     - `user_id` - The user who performed the action
     - `entity_id` - Related entity (concept, memory unit)
     - `entity_type` - Type of entity
     - `dim_key` - Growth dimension (e.g., "self_know")
     - `delta` - Contribution amount (0.01-1.0)
     - `source` - Action that triggered the event
     - `evidence` - Supporting text or context

2. **Aggregation Process:**
   - Materialized view `mv_entity_growth` aggregates events by:
     - Entity (to compute entity-specific dimension scores)
     - User (to compute overall dimension scores)
     - Time period (for trend analysis)
   - View is refreshed on schedule or triggered by thresholds

3. **Card Evolution Process:**
   - View `v_card_state` applies evolution rules:
     - "seed": Initial state
     - "sprout": Reaches threshold in primary dimension
     - "bloom": Multiple dimensions reach thresholds
     - "constellation": Forms meaningful connections with other "bloom" cards
   - UI queries these states to determine visual representation

4. **Challenge Progression:**
   - User actions create growth events
   - Challenge criteria are evaluated against events
   - `user_challenges.progress` is updated
   - Completed challenges trigger celebrations and rewards
   - New challenges are recommended based on growth profile

### 6.4 Security Implementation

The system implements comprehensive security measures to protect user data:

#### 6.4.1 Authentication & Authorization

- **JWT-based Auth Flow:**
  - Short-lived access tokens (1 hour)
  - Longer-lived refresh tokens (7 days)
  - Secure HttpOnly cookies for token storage
  - CSRF protection mechanisms

- **Authorization Framework:**
  - Role-based permissions (user, admin)
  - Resource-level access control
  - Attribute-based policies for sharing settings

- **API Security:**
  - Request validation middleware
  - Rate limiting per endpoint and user
  - Input sanitization to prevent injection attacks

#### 6.4.2 Data Protection

- **Encryption:**
  - TLS for all network communications
  - Encryption at rest for all databases
  - Field-level encryption for sensitive data

- **Privacy Controls:**
  - Granular user control over data processing
  - Ability to mark memories as private
  - Data retention policies with automatic archiving
  - Complete data export and deletion options

- **AI Safeguards:**
  - Content filtering for harmful material
  - Configurable safety settings in LLM calls
  - Prompt injection prevention
  - Audit logging of all LLM interactions

### 6.5 API Design

The API architecture combines RESTful endpoints for simple operations with GraphQL for complex data fetching:

#### 6.5.1 Core REST Endpoints

**Dialogue API:**
- `POST /api/dialogue/message` - Send user message
- `GET /api/dialogue/conversations` - List conversations
- `GET /api/dialogue/conversation/{id}` - Get conversation history

**Knowledge Graph API:**
- `POST /api/knowledge/memory-unit` - Create memory unit
- `GET /api/knowledge/memory-units` - List memory units with filtering
- `GET /api/knowledge/concepts` - List concepts with filtering
- `GET /api/knowledge/concepts/{id}` - Get concept details

**Growth API:**
- `GET /api/growth/profile` - Get user growth profile
- `GET /api/growth/challenges` - Get active challenges
- `POST /api/growth/challenge/{id}/progress` - Update challenge progress

**Media API:**
- `POST /api/media/upload` - Upload media file
- `GET /api/media/{id}` - Get media metadata and URL

#### 6.5.2 GraphQL Schema

For complex, nested queries, the GraphQL API provides a flexible interface:

```graphql
type Query {
  # Memory exploration
  memoryUnits(filter: MemoryUnitFilter): [MemoryUnit!]!
  memoryUnit(muid: ID!): MemoryUnit
  
  # Concept exploration
  concepts(filter: ConceptFilter): [Concept!]!
  concept(id: ID!): Concept
  
  # Knowledge graph exploration
  conceptGraph(rootConceptId: ID!, depth: Int): ConceptGraph
  community(id: ID!): Community
  
  # Growth data
  userGrowthProfile: GrowthProfile
  growthDimension(dimKey: String!): GrowthDimension
  challenges(status: ChallengeStatus): [Challenge!]!
}

type Mutation {
  createAnnotation(input: AnnotationInput!): Annotation
  updateConceptFeedback(id: ID!, feedback: ConceptFeedbackInput!): Concept
  generateInsight(focus: InsightFocusInput): InsightGenerationResult
}
```

### 6.6 Deployment and Scalability

Building on Section 9 (Deployment Strategy), specific implementation details include:

#### 6.6.1 Service Architecture

- **Core Agent Services:** Containerized microservices deployed as:
  - Kubernetes deployments/pods in AWS EKS or Tencent TKE
  - Auto-scaling based on CPU/memory usage and queue depth
  - Health checks and graceful degradation

- **Tool Services:** Lightweight, stateless functions deployed as:
  - AWS Lambda functions or Tencent SCF
  - Container-based for more complex tools
  - Regional deployment with equivalent capabilities

- **Database Scaling:**
  - PostgreSQL: Read replicas for query load
  - Neo4j: Causal clustering for high availability
  - Weaviate: Sharded deployment for large vector collections
  - Redis: Clustered for performance and reliability

#### 6.6.2 Regional Architecture

- **Resource Isolation:**
  - Separate database clusters per region
  - Region-specific AI provider integrations
  - Shared codebase with feature flags
  - Configuration-driven regional differences

- **Deployment Pipeline:**
  - CI/CD with region-specific deployment targets
  - Automated testing for each region
  - Blue/green deployment strategy
  - Canary releases for risk mitigation

## 7. Testing and Quality Assurance

A comprehensive testing strategy ensures the system's reliability, accuracy, and performance.

### 7.1 Testing Approach

The testing strategy employs multiple layers to ensure quality:

#### 7.1.1 Unit Testing

- **Agent Logic:** Test agent decision making with mocked dependencies
- **Tool Functions:** Verify tool input/output behavior with known test cases
- **Database Models:** Test data access patterns and constraints
- **Framework:** Jest for JavaScript/TypeScript, pytest for Python tools
- **Coverage Target:** 80%+ for core business logic

#### 7.1.2 Integration Testing

- **Agent Pipelines:** Verify end-to-end flows between agents
- **Database Interactions:** Test database operations with test instances
- **Tool Chains:** Validate sequences of tool operations
- **Framework:** Supertest for API endpoints, custom harness for agent interactions
- **Scope:** Critical user journeys and data processing pipelines

#### 7.1.3 Semantic Testing

- **LLM Quality:** Evaluate LLM outputs against predefined criteria
- **Embedding Quality:** Measure embedding accuracy and clustering
- **Insight Quality:** Assess validity and usefulness of generated insights
- **Retrieval Quality:** Measure precision, recall, and relevance
- **Framework:** Custom evaluation harnesses with human-in-the-loop validation

#### 7.1.4 UI Testing

- **Component Tests:** Verify individual React components
- **Visual Testing:** Ensure 3D scenes render correctly
- **Integration Tests:** Validate UI-backend interactions
- **End-to-End Tests:** Test complete user journeys
- **Framework:** React Testing Library, Cypress, Storybook

#### 7.1.5 Load & Performance Testing

- **API Endpoints:** Measure response times under load
- **Database Queries:** Optimize and verify query performance
- **WebSocket Connections:** Test with high connection counts
- **Graph Operations:** Benchmark complex graph traversals
- **WebGL Performance:** Test 3D scene rendering with varied complexity
- **Framework:** k6 for load testing, custom benchmarking tools

### 7.2 Quality Assurance Processes

Beyond automated testing, quality is ensured through:

#### 7.2.1 Code Quality Controls

- **Static Analysis:** ESLint, TypeScript compiler, SonarQube
- **Code Reviews:** Required for all changes
- **Architecture Reviews:** For significant system changes
- **Documentation Standards:** Required for all components
- **Style Guidelines:** Enforced through tooling

#### 7.2.2 AI Quality Controls

- **Prompt Engineering Review:** Structured review process for LLM prompts
- **Output Validation:** Sampling and verification of AI-generated content
- **Bias Detection:** Monitoring for biased or problematic outputs
- **Safety Testing:** Regular red-teaming for security vulnerabilities
- **Model Evaluation:** Benchmarking of LLM and embedding models

#### 7.2.3 User Experience Validation

- **Usability Testing:** Regular sessions with target users
- **A/B Testing:** For UI variations and interaction patterns
- **Feedback Collection:** In-app mechanisms for user feedback
- **Emotional Response Testing:** Evaluate emotional design elements
- **Accessibility Testing:** Ensure inclusive design

### 7.3 Monitoring and Continuous Improvement

Ongoing quality assurance is maintained through:

#### 7.3.1 Production Monitoring

- **Error Tracking:** Capture and classify production errors
- **Performance Metrics:** Track response times and resource usage
- **Quality Metrics:** Measure AI output quality and user satisfaction
- **Usage Patterns:** Identify popular features and pain points
- **Growth Event Analytics:** Track effectiveness of growth dimension identification

#### 7.3.2 Feedback Loops

- **User Feedback Integration:** Process for incorporating user feedback
- **Error-Driven Development:** Prioritize fixes based on impact
- **Model Improvement:** Cycle for improving LLM prompts and embedding models
- **Performance Optimization:** Continuous database and API optimization
- **UI Refinement:** Iterate on 3D visualizations and interactions

#### 7.3.3 Testing Infrastructure

- **Continuous Integration:** Automated testing on each code change
- **Test Environments:** Development, staging, and production-like environments
- **Test Data Generation:** Synthetic data sets for comprehensive testing
- **Regression Testing:** Prevent reintroduction of fixed issues
- **Security Scanning:** Regular vulnerability assessment

This testing strategy ensures the V7 system delivers a reliable, performant, and emotionally resonant experience while maintaining data integrity and security.

## 8. Future Considerations

*(As per V7 spec. Can include more advanced agent collaboration, dynamic tool generation, richer multi-modal support, etc.)*

## 9. Deployment Strategy

The deployment strategy addresses the dual-region requirement (US/AWS and China/Tencent) while ensuring consistency and compliance.

### 9.1 Infrastructure Architecture

**US Deployment (AWS):**
- **Compute:** AWS ECS (Fargate) for containerized services
- **Function-as-a-Service:** AWS Lambda for lightweight tools
- **Database Services:**
  - PostgreSQL: Amazon RDS PostgreSQL
  - Neo4j: Self-hosted on EC2 or Neo4j Aura DB
  - Weaviate: Self-hosted on EKS or EC2
  - Redis: Amazon ElastiCache
- **Storage:** S3 for media, backups, logs
- **Networking:** CloudFront CDN, API Gateway, VPC
- **AI Services:** Google AI API for LLM/embedding services

**China Deployment (Tencent Cloud):**
- **Compute:** Tencent CVM or TKE (Kubernetes)
- **Function-as-a-Service:** Tencent SCF
- **Database Services:**
  - PostgreSQL: TencentDB for PostgreSQL
  - Neo4j: Self-hosted on CVM
  - Weaviate: Self-hosted on TKE
  - Redis: Tencent Cloud Redis
- **Storage:** Tencent COS for media, backups, logs
- **Networking:** Tencent CDN, API Gateway
- **AI Services:** DeepSeek API for LLM/embedding services

**Shared Components:**
- Containerization strategy (Docker)
- Terraform modules for infrastructure as code
- Monitoring and logging standards
- CI/CD pipeline with region-specific deployment targets
- UI/3D assets distribution via CDN with region-specific endpoints

### 9.2 Data Residency & Compliance

To maintain compliance with both US and Chinese regulations:

1. **Regional Data Isolation:**
   - User data stored only in their region's databases
   - No cross-region data transfer for user content
   - Separate database instances for each region

2. **Model Access Strategy:**
   - US users: Google AI models (Gemini)
   - China users: DeepSeek models
   - LLM clients designed for seamless switching based on region

3. **Codebase Adaptations:**
   - Shared core logic
   - Region-specific configurations and service connectors
   - Feature flags for region-specific features

4. **User Migration (if needed):**
   - Documented process for migrating users between regions (with their consent)
   - Data export/import tools that respect regional boundaries

5. **UI Asset Delivery:**
   - 3D models, textures, and animations delivered through region-specific CDNs
   - Localized UI text and interface elements

### 9.3 Scaling Strategy

**Horizontal Scaling:**
- Agent services scale horizontally based on load
- Database read replicas for high-traffic periods
- Worker pools scale based on queue depth
- WebSocket servers scale for real-time UI communications

**Resource Allocation:**
- Dialogue Agent: Priority scaling (user-facing)
- Retrieval Planner: Medium priority (interactive queries)
- Ingestion Analyst: Scales with input volume
- Embedding Workers: Background scaling based on queue
- Insight Engine: Lowest priority, runs in off-peak hours
- 3D Rendering Services: Scale based on active users in immersive views

**Cost Optimization:**
- Auto-scaling based on traffic patterns
- Scheduled scaling for predictable loads
- Spot instances for non-critical background processing
- Tiered storage for infrequently accessed data
- WebGL/3D rendering optimization to reduce client-side resource usage

### 9.4 Monitoring & Observability

**Key Metrics:**
- **System Health:** Service uptime, error rates, resource utilization
- **Performance:** Response times, queue depths, processing latency
- **User Engagement:** Active users, message volume, retention, scene/view usage
- **AI Quality:** Model latency, token usage, error rates
- **UI Performance:** Frame rates, load times, 3D scene rendering statistics
- **Growth Events:** Tracking of growth dimension activations and card evolutions
- **Business Metrics:** User growth, premium conversions, core feature usage

**Monitoring Tools:**
- **US:** AWS CloudWatch, DataDog
- **China:** Tencent Cloud Monitor
- **Shared:** Prometheus, Grafana dashboards
- **Frontend:** Sentry for error tracking, custom metrics for 3D performance

**Alerting Strategy:**
- Critical service degradation alerts
- Abnormal error rate alerts
- Cost threshold alerts
- Model performance degradation alerts
- Frontend performance degradation alerts

### 9.5 Backup & Disaster Recovery

**Backup Strategy:**
- Daily incremental backups of all databases
- Weekly full backups
- Transaction log archiving for point-in-time recovery
- Cross-zone/region backups within compliance boundaries
- Event stream preservation for potential growth_event recalculation

**Disaster Recovery:**
- Automated failover for critical components
- Manual failover procedures documented for complex scenarios
- Regular DR testing and validation
- Maximum allowable downtime defined by service tier

**Business Continuity:**
- Multiple availability zone deployment
- Circuit breakers and graceful degradation
- Read-only mode capabilities during write service outages
- Offline functionality for core journaling features

## 10. Implementation Roadmap

### 10.1 Phase-based Development Approach

**Phase 1: Foundation (Months 1-2)**
- Core knowledge model implementation (PostgreSQL, Neo4j, Weaviate)
- Basic Ingestion Analyst and tool layer
- Simple Dialogue Agent with basic retrieval
- Event-sourcing model for growth events
- 3D Canvas Layer with CloudScene (minimal functionality)
- 2D Modal Layer with basic Card Gallery and Chat

**Phase 2: Core Capabilities (Months 3-4)**
- Enhanced Retrieval Planner with hybrid search
- Knowledge graph visualization (initial GraphScene)
- Tier 1-3 processing pipeline complete
- Six-dimensional growth tracking
- Orb implementation with basic emotional states
- Mobile app MVP

**Phase 3: Intelligence Layer (Months 5-6)**
- Insight Engine implementation
- Proactive engagement features
- Ontology Steward and schema evolution
- Advanced UI features and personalization
- Card evolution system
- AscensionScene transition effects

**Phase 4: Advanced Features (Months 7-8)**
- Full 3D knowledge visualization in GraphScene
- Deep metaphorical connections
- Mystery Challenges and Dream Cards
- Performance optimization
- Cross-region deployment
- Full constellation visualization and achievements

### 10.2 Critical Success Factors

1. **User-Centered Development:**
   - Early user testing of core interactions
   - Regular feedback cycles on AI outputs
   - Balancing proactivity with user control
   - Testing emotional resonance of UI/UX elements

2. **Technical Excellence:**
   - Knowledge graph design optimization
   - Embedding strategy refinement
   - Query performance tuning
   - Agent prompt engineering and fine-tuning
   - WebGL/Three.js optimization for various devices

3. **Growth Framework Effectiveness:**
   - Clear value for users in the Six-Dimensional Growth model
   - Balance between automated growth tracking and user agency
   - Meaningful card evolution that feels rewarding
   - Ensuring challenges contribute to genuine personal growth

4. **UI/Backend Integration:**
   - Seamless communication between backend states and frontend visualization
   - Consistent emotional tone across Orb behavior, scene design, and agent responses
   - Efficient data flow from knowledge graph to 3D visualization

5. **Team Organization:**
   - Domain-focused teams (agents, persistence, UI)
   - Regular cross-team technical reviews
   - AI ethics and oversight committee
   - 3D/visualization specialists working closely with backend teams

### 10.3 Key Integration Points

Building on Section 2.5, these specific integration milestones are critical for successful implementation:

1. **Card Evolution Pipeline:**
   - Ingestion Analyst creates growth_events
   - mv_entity_growth aggregates dimension scores
   - v_card_state computes evolution states
   - UI renders appropriate visual representation
   - Dialogue Agent acknowledges significant evolutions

2. **GraphScene Data Flow:**
   - Neo4j data structures map to visual elements
   - Retrieval Planner provides filtered graph sections
   - Three.js/R3F renders interactive visualization
   - UI interactions trigger backend queries and updates

3. **Orb State Management:**
   - Dialogue Agent determines appropriate emotional states
   - OrbStore maintains and transitions between states
   - Three.js/R3F renders visual representation
   - Audio/particle effects enhance emotional resonance

4. **Challenge System:**
   - Insight Engine generates personalized challenges
   - User actions create growth_events that progress challenges
   - Dashboard displays challenge status and rewards
   - Completing challenges triggers card evolution and celebrations

### 10.4 Open Questions & Research Areas

1. **Retrieval Optimization:**
   - Best hybrid search algorithms for complex queries
   - Graph traversal optimization for insight discovery
   - Caching strategies for common query patterns

2. **Knowledge Evolution:**
   - Long-term graph maintenance as user knowledge grows
   - Concept drift detection and management
   - Temporal vs. semantic organization tradeoffs

3. **Growth Dimension Tracking:**
   - Refinement of dimension detection algorithms
   - Balancing automated tracking with user confirmation
   - Cross-cultural variations in growth dimension interpretation

4. **3D Visualization Performance:**
   - Optimization for lower-end devices
   - Level-of-detail strategies for complex knowledge graphs
   - Mobile-specific rendering optimizations

5. **Emotional Design Impact:**
   - Measuring emotional resonance of different Orb states
   - Cultural variations in color/animation interpretation
   - Personalization of emotional cues based on user preferences

6. **Advanced Agent Collaboration:**
   - Dynamic workflow patterns between agents for complex tasks
   - Agent-to-agent communication protocols
   - Memory sharing and context preservation between agents

7. **Dynamic Tool Generation:**
   - On-demand creation of specialized tools for specific user needs
   - Tool version management and compatibility
   - Performance monitoring of dynamically generated tools

8. **Richer Multi-modal Support:**
   - Integration of audio, video, and other media types
   - Cross-modal pattern recognition
   - Unified embedding space across modalities

This V7 Technical Specification combines the immersive, emotionally resonant UI design with the robust backend architecture to create a comprehensive system that supports users in their journey of self-discovery and growth. By integrating the event-sourcing model for growth tracking with the three-layer interface, we've created a platform that not only discovers meaningful patterns across semantically and temporally distant data points but presents them in a way that is beautiful, intuitive, and impactful. 