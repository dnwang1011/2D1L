Absolutely. This is a significant undertaking. Let's synthesize everything into a comprehensive, implementation-ready design document for **2dots1line v2.0**, keeping in mind accessibility for new readers, your specified tech stack, and deployment considerations.

## Design Document: 2dots1line - Personal Memory & Narrative Engine v2.0

**Document Version:** 2.0
**Date:** May 08, 2025
**Author:** AI Language Model (based on user collaboration)

**Abstract:**
2dots1line is a sophisticated personal memory and narrative engine designed to empower users to capture, understand, and derive meaning from their life experiences. It leverages a hybrid data storage model (relational, graph, vector) and an AI-driven agent architecture to transform everyday inputs into a richly interconnected personal knowledge graph. This graph enables deep reflection, pattern discovery, proactive insights, and the generation of meaningful personal narratives. This document details the v2.0 design, focusing on a simplified yet powerful core model, streamlined agent responsibilities, and clear implementation guidance for deployment on AWS (with Google AI) and Tencent Cloud (with DeepSeek API).

**Table of Contents:**

1.  **Introduction**
    1.1. What is 2dots1line?
    1.2. Vision & Value Proposition
    1.3. Key Design Principles for v2.0
2.  **Core Knowledge Model**
    2.1. Node Types
    2.2. Relationship Types
    2.3. Emergent Pillars of Understanding (SELF, LIFE EVENTS, RELATIONSHIPS, FUTURE ORIENTATION)
3.  **System Architecture**
    3.1. Overview
    3.2. Tech Stack & Deployment Considerations
        3.2.1. U.S. Deployment (AWS & Google AI)
        3.2.2. China Deployment (Tencent Cloud & DeepSeek)
        3.2.3. Common Components
    3.3. Database Schema Details
        3.3.1. PostgreSQL (Primary Data & Metadata)
        3.3.2. Weaviate (Vector Embeddings)
        3.3.3. Neo4j (Knowledge Graph Relationships)
        3.3.4. Redis (Caching & Message Queuing)
4.  **AI-Driven Agent Architecture**
    4.1. Overview of Agent Responsibilities
    4.2. Agent 1: Ingestion & Primary Processing Agent (IPPA)
        4.2.1. Responsibilities & Logic Flow
        4.2.2. LLM Interaction (Prompt Engineering, Model Choice)
        4.2.3. Data Interaction
    4.3. Agent 2: Contextual Structuring & Enrichment Agent (CSEA)
        4.3.1. Responsibilities & Logic Flow
        4.3.2. LLM Interaction (Prompt Engineering, Model Choice)
        4.3.3. Data Interaction
    4.4. Agent 3: Retrieval & Synthesis Agent (RSA)
        4.4.1. Responsibilities & Logic Flow (Reactive & Proactive)
        4.3.2. LLM Interaction (Prompt Engineering, Model Choice)
        4.3.3. Data Interaction
    4.5. Agent 4: User Feedback & Annotation Agent (UFAA)
        4.5.1. Responsibilities & Logic Flow
        4.5.2. Data Interaction
5.  **Key Features & User Interactions**
    5.1. Memory Capture (Journaling, Chat, Import)
    5.2. Semantic Search & Exploration
    5.3. Narrative Generation
    5.4. Proactive Insights & Reflection Prompts
    5.5. Knowledge Graph Curation & Annotation
    5.6. Third-Party Perspective Modeling (Future v2.x)
6.  **Implementation Plan**
    6.1. Phased Rollout
    6.2. Key Technical Challenges
    6.3. Team Structure (Conceptual)
7.  **Evaluation Criteria & Success Metrics**
    7.1. System Performance
    7.2. Accuracy of AI Processing
    7.3. User Engagement & Satisfaction
    7.4. Scalability & Cost-Effectiveness
8.  **Appendix**
    8.1. Parameterization Table (LLM Models, API Endpoints, etc.)
    8.2. Glossary of Terms

---

### 1. Introduction

#### 1.1. What is 2dots1line?
2dots1line (pronounced "Two Dots, One Line") is a digital companion designed to help individuals capture the moments and thoughts that make up their lives, connect disparate experiences to uncover deeper patterns, and ultimately craft meaningful narratives that foster self-understanding and growth. It acts as an intelligent, evolving personal memory graph.

#### 1.2. Vision & Value Proposition
The vision for 2dots1line is to provide a private, secure, and insightful space where users can not only store their memories but actively engage with them to understand their past, navigate their present, and shape their future.
*   **Value:**
    *   **Enhanced Self-Awareness:** Discover recurring themes, values, and behavioral patterns.
    *   **Meaning-Making:** Connect experiences to form coherent life narratives.
    *   **Personal Growth:** Identify areas for development and track progress towards goals.
    *   **Emotional Processing:** Reflect on and understand emotional responses to life events.
    *   **Preservation of Legacy:** Create a rich, explorable tapestry of one's life journey.

#### 1.3. Key Design Principles for v2.0
This v2.0 design prioritizes:
*   **Simplicity & Power:** A streamlined core data model that is expressive yet manageable.
*   **AI-Driven Enrichment:** Leveraging state-of-the-art LLMs for deep semantic understanding and inference, while providing mechanisms for user correction.
*   **User Agency:** Ensuring users have control over their data, its interpretation, and how they interact with the system.
*   **Proactive Engagement:** Moving beyond a passive repository to a companion that offers timely insights and reflections.
*   **Scalability & Adaptability:** A modular architecture designed to grow and evolve.
*   **Implementation Readiness:** Clear specifications for databases, agents, and interactions.

---

### 2. Core Knowledge Model

**Rationale for this model:** Compared to v1's highly granular schema, v2.0 opts for fewer, more abstract core node types. Specificity is achieved through `type` properties on `Concept` nodes and descriptive `relationship_label` properties on `RELATED_TO` edges. This significantly simplifies graph queries, makes the schema easier to maintain and evolve, and reduces the classification burden on AI agents. It allows for greater flexibility in how concepts are defined and interconnected.

#### 2.1. Node Types
*(As detailed in the previous response: `User`, `MemoryUnit`, `Chunk`, `Concept`, `Annotation`)*
*   **`Concept` Node Detail:** The `type` property for `Concept` nodes will draw from an extensible ontology (e.g., "value", "emotion", "person", "organization", "topic", "activity", "artwork", "life_event_theme", "personal_trait", "goal_theme", "abstract_idea", "relationship_dynamic_theme", "future_concern_theme", "plan_element"). This ontology itself can be represented within the graph using `(Concept)-[:RELATED_TO {relationship_label:"is_a_type_of"}]->(Concept)` links for hierarchical structuring if needed.

#### 2.2. Relationship Types
*(As detailed in the previous response: `AUTHORED`, `CONTAINS_CHUNK`, `HIGHLIGHTS_CONCEPT`, `MENTIONS_CONCEPT`, `RELATED_TO`, `PERCEIVES_CONCEPT`, `SEQUEL_TO`/`PRECEDES`/`ELABORATES_ON`, `ANNOTATES`)*
*   **`RELATED_TO` Edge Detail:** The `relationship_label` property is crucial. Examples: "is_type_of", "is_part_of", "causes", "influences", "is_exemplified_by", "is_opposite_of", "contributes_to_goal", "is_motivated_by_value", "is_response_to", "shares_mechanism_with", "is_metaphor_for", "provides_perspective_on", "is_required_for", "is_enabled_by", "associated_emotion". This vocabulary will be developed and refined by CSEA and can be augmented by users via UFAA.

#### 2.3. Emergent Pillars of Understanding
The four pillars (SELF, LIFE EVENTS, RELATIONSHIPS, FUTURE ORIENTATION) are not explicit graph structures but powerful perspectives achieved by querying the graph based on `Concept.type` and the nature of relationships involving the `User` node and their `MemoryUnit`s. This approach is superior to rigid pillar nodes because it allows for fluidity and acknowledges that memories and concepts often span multiple pillars.

---

### 3. System Architecture

#### 3.1. Overview
A microservices-oriented architecture is recommended, where each Agent can be deployed and scaled independently. Data flows between databases orchestrated by these agents, often via message queues for asynchronous processing.

#### 3.2. Tech Stack & Deployment Considerations

| Component             | U.S. Deployment (AWS)                                  | China Deployment (Tencent Cloud)                          | Rationale & Common Aspects                                                                                                |
| :-------------------- | :----------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Compute**           | AWS EC2, Lambda, EKS (Kubernetes)                      | Tencent CVM, SCF (Serverless), TKE (Kubernetes)           | Containerization (Docker/Kubernetes) recommended for agent deployment and scalability. Serverless for event-driven tasks (IPPA). |
| **LLM API**           | Google AI (Gemini models via Vertex AI or API directly) | DeepSeek API (e.g., DeepSeek-V2)                          | API interactions will be parameterized. Need robust error handling & retries for API calls. LLM choice affects prompt engineering. |
| **Relational DB**     | AWS RDS for PostgreSQL / Aurora PostgreSQL             | TencentDB for PostgreSQL                                  | PostgreSQL chosen for its robustness, JSONB support, extensibility, and open-source nature.                               |
| **Vector DB**         | Weaviate (self-hosted on EC2/EKS or Cloud-native options if available) | Weaviate (self-hosted on CVM/TKE)                       | Weaviate chosen for its hybrid search capabilities, GraphQL API, and open-source nature. Parameterize connection details.       |
| **Graph DB**          | Neo4j (self-hosted on EC2 or AuraDB if budget allows)   | Neo4j (self-hosted on CVM)                                | Neo4j is a leading graph database. AuraDB simplifies management but has cost implications.                                |
| **Caching**           | AWS ElastiCache (Redis)                                | Tencent Cloud Memory Cache (Redis)                        | Redis for LLM response caching (for identical, high-frequency internal system queries), session management, rate limiting.    |
| **Message Queue**     | AWS SQS / SNS                                          | Tencent TDMQ (Pulsar/RabbitMQ/Kafka compatible options) | For decoupling agents (e.g., IPPA queues tasks for CSEA, embedding jobs). Ensures resilience and scalability.           |
| **Object Storage**    | AWS S3                                                 | Tencent COS                                               | For storing large binaries, backups, logs, potentially raw imported data before processing.                               |
| **API Gateway**       | AWS API Gateway                                        | Tencent API Gateway                                       | Securely exposes agent functionalities or user-facing APIs.                                                              |
| **Monitoring/Logging**| AWS CloudWatch, CloudTrail                             | Tencent Cloud Monitor, CLS (Cloud Log Service)            | Essential for operational health.                                                                                         |

**Parameterization:** All external service endpoints (LLM APIs, DB connection strings), model names, API keys, and cloud-specific configurations will be managed via environment variables or a configuration service (e.g., AWS Systems Manager Parameter Store, Tencent Cloud Parameter Store). See Appendix 8.1.

#### 3.3. Database Schema Details

*(Refer to the detailed PostgreSQL, Weaviate, and Neo4j schema descriptions from the previous response. The key is that PostgreSQL holds the primary structured data, Weaviate manages embeddings for semantic search, and Neo4j stores the rich relational graph for complex queries and pattern discovery. Redis is for ephemeral data.)*

**Rationale for Polyglot Persistence:**
*   **PostgreSQL:** Best for structured, transactional data, and as the "source of truth" for core entities before graph enrichment.
*   **Weaviate:** Specialized and highly optimized for vector similarity search, which is crucial for semantic retrieval. Trying to do this efficiently in PostgreSQL or Neo4j is suboptimal at scale.
*   **Neo4j:** Unmatched for traversing complex relationships, finding paths, identifying community structures, and graph-native algorithms essential for deep pattern discovery that relational or vector DBs can't easily provide.
*   **Redis:** Standard for high-performance caching and managing transient state or message queues, reducing load on primary databases and LLMs.

This combination, while adding architectural complexity, ensures each data type and query pattern is handled by the most appropriate and performant tool.

---

### 4. AI-Driven Agent Architecture

#### 4.1. Overview of Agent Responsibilities
The system employs four key agents: IPPA (Ingestion), CSEA (Structuring & Enrichment), RSA (Retrieval & Synthesis), and UFAA (User Feedback). This is a streamlined version compared to earlier multi-agent proposals, consolidating responsibilities for clarity and efficiency.

#### 4.2. Agent 1: Ingestion & Primary Processing Agent (IPPA)
*(Detailed logic, prompt engineering, and data interaction as described in the previous IPPA-specific document.)*
*   **LLM Model Choice (parameterized):**
    *   U.S.: Google Gemini Flash (or smallest/fastest Gemini Pro variant) for capture decision/basic NER if LLM-assisted.
    *   China: A smaller, faster variant of DeepSeek if available, or rely more on heuristics/non-LLM NER.
*   **Key Implementation Consideration:** Prioritize speed and low cost. Asynchronous embedding is critical.

#### 4.3. Agent 2: Contextual Structuring & Enrichment Agent (CSEA)
*(Detailed logic, prompt engineering, and data interaction as described in the previous CSEA-specific document, including the holistic update across all four emergent pillars.)*
*   **LLM Model Choice (parameterized):**
    *   U.S.: Google Gemini Pro (current general-purpose model) or Gemini Advanced if complex reasoning tasks require it and budget allows.
    *   China: DeepSeek-V2 (or most capable variant) for its strong reasoning capabilities.
*   **Key Implementation Consideration:** Designed for asynchronous, batch processing. Idempotency is vital. LLM prompts will be complex and require careful iteration. CSEA's quality directly impacts the depth of the knowledge graph.

#### 4.4. Agent 3: Retrieval & Synthesis Agent (RSA)
*(Detailed logic, prompt engineering, and data interaction for both reactive queries and proactive engagement, as described in the previous RSA-specific document.)*
*   **LLM Model Choice (parameterized):** Same as CSEA, as it requires strong NLU and NLG.
*   **Key Implementation Consideration:** Balancing retrieval depth/breadth with LLM context window limits. Optimizing the "Data Bundle" passed to the LLM is crucial. Proactive engagement logic needs careful tuning to be helpful, not annoying.

#### 4.5. Agent 4: User Feedback & Annotation Agent (UFAA)
*(Detailed logic and data interaction as described in the previous RSA/UFAA combined section, focusing on CRUD for `Annotation`s and user-driven graph edits.)*
*   **LLM Model Choice:** Minimal/None. If LLMs are used (e.g., to suggest `Concept.type` based on user's free-text input for a new concept), a smaller model like IPPA's would suffice.
*   **Key Implementation Consideration:** Robust API endpoints for UI interaction. Changes made via UFAA must correctly update PostgreSQL and Neo4j, and potentially trigger CSEA for re-processing affected `MemoryUnit`s or `Concept`s.

---

### 5. Key Features & User Interactions

*(This section would elaborate on the user-facing aspects, drawing from earlier discussions but framed within the v2.0 model.)*
*   **Memory Capture:** How users input data (text, potentially voice-to-text via OS/browser APIs).
*   **Semantic Search & Exploration:** UI for natural language queries, filtering by `Concept.type`, date ranges. Visualizing search results (e.g., `MemoryUnit` snippets with highlighted `Concept`s).
*   **Narrative Generation:** User requests (e.g., "Tell me a story about my journey with [Concept:Patience]").
*   **Proactive Insights & Reflection Prompts:** How these are delivered (notifications, in-app suggestions).
*   **Knowledge Graph Curation & Annotation:** UI for users to interact with `Concept`s, `Annotation`s, and relationships (confirming/rejecting AI suggestions, adding their own).
*   **Third-Party Perspective Modeling:** Slated for a future v2.x release, building upon the `User` and `Concept {type:"person"}` nodes.

---

### 6. Implementation Plan

#### 6.1. Phased Rollout
*   **Phase 1 (Core Capture & Basic Retrieval - MVP):**
    *   IPPA (heuristic capture, basic NER, embedding).
    *   PostgreSQL for `MemoryUnit`, `Chunk`, basic `Concept`. Weaviate for embeddings.
    *   RSA (basic query understanding, semantic search on `Chunk`s, simple display of retrieved `Chunk`s).
    *   Minimal UFAA for manual annotation.
    *   Focus: Prove core data pipeline and basic search value.
*   **Phase 2 (Graph Structuring & Deeper Insights):**
    *   Neo4j integration.
    *   CSEA (initial version focusing on `Concept` refinement and linking `MemoryUnit`s to `Concept`s).
    *   RSA enhanced with basic graph traversal for context.
    *   Focus: Demonstrate value of interconnected knowledge.
*   **Phase 3 (Advanced AI Enrichment & Proactivity):**
    *   Full CSEA capabilities (inter-concept relationships, SELF model updates, conversational arc recognition).
    *   RSA with advanced synthesis and proactive engagement features.
    *   Full UFAA for graph curation.
    *   Focus: Deliver on the promise of an intelligent, insightful companion.
*   **Phase 4 (Narrative Generation & Advanced Features):**
    *   RSA focus on high-quality narrative generation.
    *   UI for visualizing graph elements.
    *   Ongoing refinement and feature additions (e.g., import/export, third-party modeling).

#### 6.2. Key Technical Challenges
*   **LLM Prompt Engineering:** Iterative refinement for each agent and task.
*   **Data Synchronization & Consistency:** Across PostgreSQL, Neo4j, and Weaviate, especially with asynchronous agent processing.
*   **Scalability:** Handling large volumes of `Chunk`s, `Concept`s, and graph relationships.
*   **Cost Optimization:** LLM API calls and cloud infrastructure.
*   **Ontology Management:** Developing and maintaining the `Concept.type` and `relationship_label` vocabulary.
*   **Cold Start for Personalization:** Making RSA and CSEA effective for new users with sparse graphs.

#### 6.3. Team Structure (Conceptual)
*   **Backend/Platform Team:** Manages infrastructure, databases, agent orchestration framework, core APIs.
*   **AI/ML Team:** Focuses on LLM integration, prompt engineering, embedding strategies, CSEA/RSA core logic.
*   **Frontend/UX Team:** Develops user interfaces for capture, exploration, and interaction.
*   **Product Management:** Defines features, prioritizes roadmap, gathers user feedback.

---

### 7. Evaluation Criteria & Success Metrics

#### 7.1. System Performance
*   IPPA ingestion latency (< X seconds).
*   RSA query response time for typical queries (< Y seconds).
*   CSEA processing throughput (MemoryUnits processed per hour).
*   Database query performance under load.

#### 7.2. Accuracy of AI Processing
*   **Concept Extraction:** Precision/Recall for `Concept` identification and typing (evaluated against human-annotated datasets).
*   **Relationship Inference:** Accuracy of `RELATED_TO` links (human evaluation).
*   **SELF Model Relevance:** User ratings on the relevance of `PERCEIVES_CONCEPT` insights.
*   **Summarization Quality:** Coherence, completeness, and conciseness of AI-generated `Annotation`s or RSA summaries.

#### 7.3. User Engagement & Satisfaction
*   Daily/Monthly Active Users (DAU/MAU).
*   Average session duration.
*   Number of `MemoryUnit`s created per user.
*   Number of annotations/curations made per user (via UFAA).
*   User retention rate.
*   Qualitative feedback (surveys, interviews) on insightfulness, ease of use, perceived value.
*   Adoption rate of proactive features.

#### 7.4. Scalability & Cost-Effectiveness
*   Cost per active user (cloud infrastructure + LLM API costs).
*   Ability of the system to maintain performance as data volume and user load grow.
*   Efficiency of asynchronous processing and batch operations.

---

### 8. Appendix

#### 8.1. Parameterization Table (Example)

| Parameter Name                  | U.S. Value (AWS/Google)                  | China Value (Tencent/DeepSeek)        | Notes                                               |
| :------------------------------ | :--------------------------------------- | :------------------------------------ | :-------------------------------------------------- |
| `LLM_API_ENDPOINT_IPPA`         | `https://us-central1-aiplatform.googleapis.com/v1/.../gemini-flash:generateContent` | `https://api.deepseek.com/v1/chat/completions` | Specific model endpoint.                            |
| `LLM_MODEL_NAME_IPPA`           | `gemini-1.0-flash`                       | `deepseek-chat` (or specific smaller model) | Model identifier for API.                          |
| `LLM_API_KEY_IPPA`              | `env_var:GOOGLE_API_KEY`                 | `env_var:DEEPSEEK_API_KEY`            | Securely stored.                                   |
| `LLM_API_ENDPOINT_CSEA_RSA`     | `https://us-central1-aiplatform.googleapis.com/v1/.../gemini-pro:generateContent` | `https://api.deepseek.com/v1/chat/completions` |                                                     |
| `LLM_MODEL_NAME_CSEA_RSA`       | `gemini-1.0-pro`                         | `deepseek-coder` / `deepseek-chat`    | Or most capable DeepSeek model.                   |
| `EMBEDDING_MODEL_ENDPOINT`      | `https://us-central1-aiplatform.googleapis.com/v1/.../textembedding-gecko:predict` | `(To be determined - DeepSeek or other)`  |                                                     |
| `EMBEDDING_MODEL_NAME`          | `textembedding-gecko@003`                | `(To be determined)`                  |                                                     |
| `POSTGRES_HOST`                 | `env_var:RDS_POSTGRES_HOST`              | `env_var:TENCENTDB_POSTGRES_HOST`     |                                                     |
| `POSTGRES_PORT`                 | `5432`                                   | `5432`                                |                                                     |
| `POSTGRES_USER`                 | `env_var:DB_USER`                        | `env_var:DB_USER`                     |                                                     |
| `POSTGRES_PASSWORD`             | `env_var:DB_PASSWORD`                    | `env_var:DB_PASSWORD`                 |                                                     |
| `POSTGRES_DBNAME`               | `2dots1line_prod_us`                     | `2dots1line_prod_cn`                  |                                                     |
| `WEAVIATE_HOST`                 | `http://weaviate.internal.us:8080`       | `http://weaviate.internal.cn:8080`    | Internal endpoint.                                 |
| `NEO4J_URI`                     | `bolt://neo4j.internal.us:7687`          | `bolt://neo4j.internal.cn:7687`       |                                                     |
| `NEO4J_USER`                    | `env_var:NEO4J_USER`                     | `env_var:NEO4J_USER`                  |                                                     |
| `NEO4J_PASSWORD`                | `env_var:NEO4J_PASSWORD`                 | `env_var:NEO4J_PASSWORD`              |                                                     |
| `REDIS_HOST`                    | `env_var:ELASTICACHE_REDIS_HOST`         | `env_var:TENCENT_REDIS_HOST`          |                                                     |
| `REDIS_PORT`                    | `6379`                                   | `6379`                                |                                                     |
| `MESSAGE_QUEUE_IPPA_CSEA`       | `arn:aws:sqs:us-east-1:...:ippa_csea_queue`| `(TDMQ queue name/endpoint)`          | Queue for IPPA to send MU IDs to CSEA.             |
| `MESSAGE_QUEUE_EMBEDDING_JOBS`  | `arn:aws:sqs:us-east-1:...:embedding_jobs`| `(TDMQ queue name/endpoint)`          | Queue for chunk IDs needing embedding.             |
| `S3_BUCKET_LOGS`                | `2dots1line-logs-prod-us`                | `2dots1line-logs-prod-cn-<appid>`     | For application/agent logs.                        |
| `CAPTURE_DECISION_LLM_THRESHOLD`| `0.7` (if LLM returns confidence)        | `0.7`                                 | Heuristic if LLM doesn't give confidence.        |
| `CSEA_BATCH_SIZE`               | `50` (MemoryUnits)                       | `50`                                  | Number of MUs processed by CSEA in one batch.    |
| `CSEA_RUN_INTERVAL_MINUTES`     | `60`                                     | `60`                                  | How often CSEA batch job runs if not event-driven. |

#### 8.2. Glossary of Terms
*(Key terms like IPPA, CSEA, RSA, UFAA, MemoryUnit, Chunk, Concept, Annotation, Emergent Pillars, RAG, etc., would be defined here for clarity.)*

---

This comprehensive design document provides a solid foundation for building 2dots1line v2.0. It emphasizes a robust, flexible, and AI-driven architecture tailored to the specific deployment environments while aiming for a rich and insightful user experience. The next steps would involve detailed API design for inter-agent communication, UI/UX mockups, and iterative development following the phased rollout plan.