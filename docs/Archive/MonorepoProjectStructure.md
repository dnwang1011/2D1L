Okay, let's design a robust and scalable repository structure for the 2dots1line full-stack project. This structure aims for clarity, separation of concerns, and ease of development for different parts of the application (frontend, backend, AI agents, mobile).

We'll assume a monorepo structure using a tool like **Nx (Nrwl Extensions)** or **Turborepo**. A monorepo is highly recommended for a project of this complexity because it simplifies dependency management, code sharing between frontend/backend/mobile, and coordinated releases. If not using a monorepo tool, careful manual setup of shared packages will be needed.

## 2dots1line: Monorepo Project Structure

```
/2dots1line-monorepo/
├── apps/
│   ├── web-app/                      # Next.js (React) Frontend for PWA/Web App
│   │   ├── public/                   # Static assets (images, fonts, manifest.json)
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router (pages, layouts, components)
│   │   │   ├── components/           # Shared UI components for web
│   │   │   ├── contexts/             # React Context API providers
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utility functions, API client for web
│   │   │   ├── styles/               # Global styles, theme
│   │   │   └── types/                # TypeScript type definitions for web
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json              # Specific to web-app
│   │
│   ├── mobile-app/                   # React Native App (iOS & Android)
│   │   ├── ios/
│   │   ├── android/
│   │   ├── src/
│   │   │   ├── screens/              # App screens
│   │   │   ├── components/           # Shared UI components for mobile
│   │   │   ├── navigation/           # React Navigation setup
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── services/             # Mobile-specific services (e.g., native module bridges)
│   │   │   └── assets/               # Images, fonts for mobile
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   └── package.json              # Specific to mobile-app
│   │
│   └── backend-api/                  # Express.js Backend API Server
│       ├── src/
│       │   ├── config/               # Environment config, logging, DB connections
│       │   ├── controllers/          # API request handlers (Chat, User, MemoryUnit, etc.)
│       │   ├── middlewares/          # Auth, error handling, validation
│       │   ├── routes/               # API route definitions
│       │   ├── services/             # Business logic (AI interaction, core app logic)
│       │   │   ├── ippa.service.ts   # Logic for IPPA (can be called by worker or API)
│       │   │   ├── csea.service.ts   # Logic for CSEA (called by worker)
│       │   │   ├── rsa.service.ts    # Logic for RSA (called by API for chat, proactive triggers)
│       │   │   └── ufaa.service.ts   # Logic for UFAA (called by API)
│       │   ├── utils/                # General utilities for backend
│       │   └── types/                # Shared backend TypeScript types
│       ├── prisma/                   # Prisma schema, migrations, client generation
│       ├── Dockerfile
│       └── package.json              # Specific to backend-api
│
├── packages/                         # Shared code/libraries across apps
│   ├── shared-types/                 # TypeScript types shared between frontend & backend
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── shared-utils/                 # Utility functions shared across apps
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── ui-components/                # Shared React components (if using RN for Web or a common design system)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── llm-clients/                  # Abstracted LLM API clients (Google, DeepSeek)
│       ├── src/
│       │   ├── google.client.ts
│       │   ├── deepseek.client.ts
│       │   └── index.ts
│       └── package.json
│
├── workers/                          # BullMQ Worker Processes (run as separate Node.js services)
│   ├── ippa-worker/                  # Worker for IPPA tasks (heavy lifting, async embedding)
│   │   ├── src/
│   │   │   └── processor.ts          # BullMQ job processor logic for IPPA
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── csea-worker/                  # Worker for CSEA tasks (deep analysis, graph building)
│   │   ├── src/
│   │   │   └── processor.ts          # BullMQ job processor logic for CSEA
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── embedding-worker/             # (Optional) Dedicated worker for generating embeddings if IPPA offloads it
│       ├── src/
│       │   └── processor.ts
│       ├── Dockerfile
│       └── package.json
│
├── docs/                             # Project documentation
│   ├── architecture/                 # System architecture, ADRs (Architecture Decision Records)
│   ├── api/                          # API documentation (e.g., OpenAPI specs)
│   ├── database/                     # Database schemas, migration guides
│   ├── design/                       # UI/UX design specs, branding guidelines
│   ├── deployment/                   # Deployment guides for AWS & Tencent
│   └── STARTUP_INSTRUCTIONS.md
│   └── MEMORY_SYSTEM.md
│
├── scripts/                          # Utility, build, deployment, and maintenance scripts
│   ├── db/                           # Database migration, seeding, backup scripts
│   ├── deployment/                   # CI/CD deployment scripts
│   ├── llm/                          # Scripts for testing LLM prompts
│   ├── monitoring/
│   └── test-data/
│
├── config/                           # Root level configurations
│   ├── eslintrc.js
│   ├── prettierrc.js
│   ├── jest.config.base.js           # Base Jest config for the monorepo
│   └── .env.example                  # Example environment file
│
├── .env                              # Local environment variables (gitignored)
├── .gitignore
├── package.json                      # Root package.json for monorepo workspace
├── nx.json                           # (If using Nx) Nx workspace configuration
├── turbo.json                        # (If using Turborepo) Turborepo configuration
└── README.md
```

---

### Explanation of Key Directories:

*   **`apps/`**: Contains the actual runnable applications.
    *   **`web-app/`**: The Next.js frontend. This will serve the PWA and primary web interface. Its `src/app/` follows the Next.js App Router convention.
    *   **`mobile-app/`**: The React Native application for iOS and Android.
    *   **`backend-api/`**: The Express.js server providing the REST API. Agent *logic* might reside here in `services/` but the *execution* of long-running agent tasks (CSEA, some IPPA parts) happens in dedicated workers.
*   **`packages/`**: Shared libraries used by different `apps/`. This is a key benefit of a monorepo.
    *   **`shared-types/`**: Crucial for type safety between frontend, backend, and workers. Defines common interfaces for data structures (e.g., `MemoryUnit`, `Concept`).
    *   **`shared-utils/`**: Common utility functions (e.g., date formatting, string manipulation) that don't fit specifically into frontend or backend.
    *   **`ui-components/`**: (Optional but recommended) If you aim for high UI consistency between web and mobile (especially if using React Native for Web), a shared component library can be built here.
    *   **`llm-clients/`**: Abstracted clients for interacting with Google AI and DeepSeek. This allows agents to call a generic `llm.generateText()` function, with the specific API call handled by the client based on configuration. This is vital for the dual US/China deployment.
*   **`workers/`**: Dedicated Node.js applications for running background jobs via BullMQ.
    *   Each worker (e.g., `ippa-worker`, `csea-worker`) listens to specific queues and processes jobs. This offloads heavy computation from the main API server, ensuring responsiveness.
    *   They would import service logic from `apps/backend-api/src/services/` or have their own specialized service modules if the logic is purely worker-specific.
*   **`docs/`**: All project documentation, including design specifications, API docs, architecture decisions, etc. Keeping this within the repo ensures it stays versioned with the code.
*   **`scripts/`**: Helper scripts for various tasks (database operations, deployment, testing utilities).
*   **`config/` (root level):** Global configuration files for linting, formatting, base test configurations.
*   **`prisma/` (inside `apps/backend-api/`):** Prisma schema and migrations are best co-located with the backend API that primarily uses it.

### Rationale for this Structure:

1.  **Clear Separation:** Distinct separation between frontend applications (`web-app`, `mobile-app`), the backend API (`backend-api`), shared libraries (`packages`), and background workers (`workers`).
2.  **Scalability:**
    *   Frontend and backend can be scaled independently.
    *   Workers can be scaled independently based on queue load (e.g., if CSEA tasks are heavy, you can run more `csea-worker` instances).
3.  **Maintainability:** Easier to understand where different types of code live. Teams can focus on specific parts of the monorepo.
4.  **Code Reusability:** The `packages/` directory is key for sharing types, utilities, and potentially UI components or LLM clients, reducing duplication.
5.  **Monorepo Tooling (Nx/Turborepo):**
    *   **Simplified Dependency Management:** Manage dependencies across the entire workspace.
    *   **Cached Builds & Tests:** Speed up CI/CD by only rebuilding/retesting what has changed.
    *   **Code Generation:** Scaffolding for new apps, libraries, components.
    *   **Task Orchestration:** Define complex build/test/deploy scripts.
6.  **Agent Implementation:**
    *   **Agent Logic in Services:** The *business logic* of IPPA, CSEA, RSA, UFAA can reside within `apps/backend-api/src/services/`. This allows API endpoints to trigger parts of this logic synchronously if needed (e.g., RSA for a chat response).
    *   **Heavy Lifting in Workers:** Long-running, resource-intensive parts of IPPA (e.g., batch embedding if not fully offloaded to an external service) and the entirety of CSEA's deep analysis cycles are executed by the dedicated `workers/`. These workers pick up jobs from BullMQ queues that are typically enqueued by the `backend-api` services.

### Deployment Considerations:

*   **`apps/web-app`:** Deployed to a static hosting provider (AWS S3/CloudFront, Vercel, Netlify) or a Node.js server environment if using Next.js SSR extensively.
*   **`apps/mobile-app`:** Built and submitted to Apple App Store and Google Play Store.
*   **`apps/backend-api`:** Deployed as a Node.js application (e.g., AWS Elastic Beanstalk, ECS/EKS, Lambda with API Gateway, Tencent TCB/SCF).
*   **`workers/*`:** Each worker type deployed as a separate Node.js application (e.g., ECS/EKS tasks, dedicated EC2/CVM instances, or long-running Lambda/SCF functions if suitable for their workload). They need connectivity to Redis and the databases.

This repository structure provides a comprehensive framework for building 2dots1line, balancing separation of concerns with the ability to share code and manage a complex full-stack, AI-driven application effectively.

Okay, let's update the monorepo project structure to align perfectly with the **v3 Agent Network Design**, which emphasizes a clear distinction between a few core "Cognitive Agents" and a larger set of "Deterministic Tools." This revised structure will also better accommodate the phased development and distinct responsibilities.

The key changes involve:
1.  More explicit separation of "Cognitive Agent" logic.
2.  A dedicated top-level directory for "Deterministic Tools" if they become numerous or complex enough to warrant their own packaging, otherwise they can start within `packages/shared-utils` or `apps/backend-api/src/tools`.
3.  Clearer distinction for worker processes aligned with the cognitive agents that might orchestrate long-running tasks.

## 2dots1line v3: Revised Monorepo Project Structure (Agent Network Focused)

```
/2dots1line-monorepo/
├── apps/
│   ├── web-app/                      # Next.js (React) Frontend for PWA/Web App
│   │   ├── ... (standard Next.js structure as before)
│   │   └── package.json
│   │
│   ├── mobile-app/                   # React Native App (iOS & Android)
│   │   ├── ... (standard React Native structure as before)
│   │   └── package.json
│   │
│   └── backend-api/                  # Express.js Backend API Server
│       ├── src/
│       │   ├── config/               # Environment config, logging, DB connections
│       │   ├── controllers/          # API request handlers (Chat, User, MemoryUnit, Annotations, etc.)
│       │   ├── middlewares/          # Auth, error handling, validation
│       │   ├── routes/               # API route definitions
│       │   ├── services/             # Core business logic, orchestrates Agent logic for API calls
│       │   │   ├── dialogue.service.ts # Handles direct interaction with Dialogue Agent "Dot"
│       │   │   ├── retrieval.service.ts# Handles requests that need Retrieval Planner
│       │   │   ├── feedback.service.ts # Handles UFAA related interactions (annotations, corrections)
│       │   │   └── ingestion_trigger.service.ts # Service to enqueue jobs for Ingestion Analyst
│       │   ├── agents/               # **NEW**: Core logic for COGNITIVE AGENTS
│       │   │   ├── ingestion-analyst/
│       │   │   │   └── ingestionAnalyst.logic.ts # Core decision-making, tool orchestration
│       │   │   ├── retrieval-planner/
│       │   │   │   └── retrievalPlanner.logic.ts
│       │   │   ├── dialogue-agent/     # "Dot"
│       │   │   │   └── dialogueAgent.logic.ts    # Persona, final reasoning, response generation
│       │   │   ├── insight-engine/
│       │   │   │   └── insightEngine.logic.ts
│       │   │   └── ontology-steward/
│       │   │       └── ontologySteward.logic.ts
│       │   ├── tools/                # **NEW/REFINED**: Implementations of DETERMINISTIC TOOLS (if not in packages)
│       │   │   ├── text_processing.tool.ts
│       │   │   ├── db_access.tool.ts
│       │   │   ├── vector_ops.tool.ts
│       │   │   └── vision.tool.ts
│       │   ├── utils/                # General backend utilities
│       │   └── types/                # Backend-specific TypeScript types (augments shared-types)
│       ├── prisma/                   # Prisma schema, migrations
│       ├── Dockerfile
│       └── package.json
│
├── packages/                         # Shared code/libraries
│   ├── shared-types/                 # Core TypeScript types/interfaces (MemoryUnit, Concept, Agent I/O schemas)
│   │   ├── src/
│   │   │   ├── common.types.ts
│   │   │   ├── agent.types.ts      # Schemas for Agent inputs/outputs
│   │   │   └── tool.types.ts       # Schemas for Tool inputs/outputs
│   │   └── package.json
│   │
│   ├── shared-utils/                 # Common utility functions (date, string, validation)
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── llm-clients/                  # Abstracted LLM API clients (Google, DeepSeek)
│   │   ├── ... (as before)
│   │   └── package.json
│   │
│   └── deterministic-tools/          # **ALTERNATIVE/EXPANSION**: If tools become very complex or numerous
│       ├── text-processing/
│       │   ├── src/index.ts
│       │   └── package.json
│       ├── data-access/              # Wrappers for DBs, Vector Stores
│       │   ├── src/index.ts
│       │   └── package.json
│       └── ... (other tool categories)
│
├── workers/                          # BullMQ Worker Processes (orchestrating COGNITIVE AGENTS for async tasks)
│   ├── ingestion-analyst-worker/     # Worker that executes Ingestion Analyst logic for batches
│   │   ├── src/
│   │   │   ├── processor.ts          # BullMQ job processor; calls IngestionAnalyst.logic
│   │   │   └── index.ts              # Worker setup
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── insight-engine-worker/        # Worker that executes Insight Engine logic (e.g., nightly batch)
│   │   ├── src/
│   │   │   ├── processor.ts          # Calls InsightEngine.logic
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── ontology-steward-worker/      # Worker for asynchronous Ontology Steward tasks
│   │   ├── src/
│   │   │   ├── processor.ts          # Calls OntologySteward.logic
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── embedding-worker/             # (Still relevant) Dedicated worker for the `text.generate_embedding` tool if it's a heavy/batch operation
│       ├── src/
│       │   ├── processor.ts          # Directly processes embedding jobs
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
│
├── docs/                             # Project documentation (as before)
│   ├── agent-protocols/              # **NEW**: Detailed prompt engineering docs & schemas for each Cognitive Agent
│   └── tool-registry/                # **NEW**: Documentation for all Deterministic Tools (signatures, purpose)
│   └── ... (other docs as before)
│
├── scripts/                          # Utility, build, deployment, maintenance scripts (as before)
│
├── config/                           # Root level configurations (as before)
│
├── .env                              # Local environment variables (gitignored)
├── .gitignore
├── package.json                      # Root package.json for monorepo workspace
├── nx.json                           # (If using Nx)
├── turbo.json                        # (If using Turborepo)
└── README.md
```

---

### Key Changes and Rationale for v3 Structure:

1.  **`apps/backend-api/src/agents/` (NEW):**
    *   **Purpose:** This is the central location for the *core logic* of the five **Cognitive Agents** (Ingestion Analyst, Retrieval Planner, Dialogue Agent, Insight Engine, Ontology Steward).
    *   Each agent gets its own subdirectory (e.g., `ingestion-analyst/`) containing its primary logic file (e.g., `ingestionAnalyst.logic.ts`).
    *   **Rationale:** This explicitly separates the "thinking" parts of the system, making them easy to find, develop, and test independently. These logic modules will primarily focus on orchestrating tools and interacting with LLMs based on their specific prompts and goals.

2.  **`apps/backend-api/src/tools/` (NEW or REFINED):**
    *   **Purpose:** Contains the implementations of the **Deterministic Tools** if they are closely tied to the backend API's domain or are simpler utilities.
    *   Examples: `text_processing.tool.ts` (for chunking, basic NER if not a separate package), `db_access.tool.ts` (higher-level wrappers around Prisma/Neo4j driver for common queries used by agents), `vector_ops.tool.ts`.
    *   **Rationale:** Co-locates tools directly used by backend services or agents if they don't warrant being full-fledged shared `packages`.

3.  **`packages/deterministic-tools/` (ALTERNATIVE/EXPANSION):**
    *   **Purpose:** If the deterministic tools become numerous, complex, or need to be versioned and used by multiple `apps/` or `workers/` independently, they can be extracted into their own shared packages here.
    *   Example categories: `text-processing/`, `data-access/` (could contain the Prisma client instance setup and common Neo4j/Weaviate client setups, shared by backend and workers), `vision-processing/`.
    *   **Rationale:** Promotes better modularity and reusability for tools that are truly independent and broadly applicable. Start with tools in `apps/backend-api/src/tools/` and migrate to `packages/` as they mature or if clear sharing needs arise.

4.  **`packages/shared-types/src/agent.types.ts` & `tool.types.ts` (NEW):**
    *   **Purpose:** Define the explicit JSON schemas or TypeScript interfaces for the inputs and outputs of each Cognitive Agent and each Deterministic Tool.
    *   **Rationale:** Enforces the "explicit contracts" principle. Crucial for robust inter-component communication and for LLM prompt engineering (telling the LLM what output schema to adhere to).

5.  **`workers/*` Alignment with Cognitive Agents:**
    *   The worker structure is now more clearly aligned with the agents that perform asynchronous, long-running, or batch-oriented tasks.
    *   `ingestion-analyst-worker/`: Orchestrates the `IngestionAnalyst.logic.ts` for processing batches of user input.
    *   `insight-engine-worker/`: Runs the `InsightEngine.logic.ts` periodically (e.g., nightly).
    *   `ontology-steward-worker/`: Handles asynchronous tasks for the `OntologySteward.logic.ts` (e.g., batch analysis of new concept types).
    *   The `Dialogue Agent` and `Retrieval Planner` logic are primarily invoked synchronously by API calls from the frontend, so they might not have dedicated long-running workers in the same way, but their logic resides in `apps/backend-api/src/agents/`.
    *   The `embedding-worker` remains relevant if embedding is a heavy, batched operation that the `Ingestion Analyst` offloads to a specialized tool/worker.

6.  **`docs/agent-protocols/` & `docs/tool-registry/` (NEW):**
    *   **Purpose:** Critical documentation.
        *   `agent-protocols/`: Contains detailed system prompts, few-shot examples, expected I/O schemas, and operational notes for *each* Cognitive Agent. This is the "constitution" for each agent.
        *   `tool-registry/`: A human-readable (and potentially machine-readable e.g., JSON/YAML) document listing all available Deterministic Tools, their signatures (input arguments, return types), purpose, and any known limitations or model dependencies. Agents will be "aware" of this registry (conceptually, by having parts of it injected into their context/prompts or by being programmed to query it).
    *   **Rationale:** Essential for development, debugging, onboarding new team members (human or AI!), and ensuring agents use tools correctly.

**How this Structure Supports the Agent Network Design:**

*   **Cognitive Core:** The `apps/backend-api/src/agents/` directory becomes the heart of the AI's "thinking."
*   **Tool Abstraction:** Tools in `apps/backend-api/src/tools/` or `packages/deterministic-tools/` are clearly separated and can be developed/tested independently. Agents call these tools by their defined interface/capability.
*   **Scalable Workers:** Workers are lean orchestrators that invoke the more complex agent logic modules for asynchronous tasks. They can be scaled based on queue depth for their specific agent function.
*   **Clear Contracts:** `shared-types` ensure that agents and tools communicate with well-defined data structures.
*   **Parameterized LLM Usage:** `packages/llm-clients` centralizes interaction with different LLM providers, making regional deployment and model swapping easier.
*   **Documentation Driven:** The new `docs/` subdirectories make the agent behaviors and tool capabilities explicit, which is vital for guiding Cursor and maintaining system sanity.

This refined structure provides a strong foundation for building and maintaining the sophisticated v3 agent network. It makes the roles and responsibilities clearer and separates the "what to do" (agent logic) from the "how to do it" (tool implementation).