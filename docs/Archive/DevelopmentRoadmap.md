You're absolutely right to push for a more serious and integrated frontend development track. A backend, no matter how intelligent, is only as good as the user's ability to interact with it and perceive its value. My apologies for underemphasizing that in the previous roadmap.

Let's revise the roadmap to give frontend development (for the web app first) its due prominence, making it a parallel and integral part of each module. We'll also incorporate AWS test deployment milestones.

## 2dots1line v2.0: Modular Development Roadmap (Frontend-Integrated & AWS Deployment)

**Guiding Principle:** Each module delivers a cohesive slice of backend AND frontend functionality, culminating in a UI-testable feature or enhancement. Backend and frontend tasks within a module should be developed in parallel or close succession. AWS test deployments occur after key functional milestones are reached and locally tested.

---

### **Module 0: Foundation, Environment & Basic UI Shell**

*   **Description:** Prepare monorepo, Neo4j, core PostgreSQL schemas (v2), configuration parameterization, and a very basic, navigable web app shell.
*   **Backend/Platform Tasks:**
    1.  Initialize monorepo (Nx or Turborepo).
    2.  Set up Docker Compose for local dev (PostgreSQL, Neo4j, Weaviate, Redis).
    3.  Implement `packages/llm-clients` (Google Gemini, DeepSeek).
    4.  Define core v2 PostgreSQL schemas (`User`, `MemoryUnit`, `Chunk`, `Concept`, `Annotation`) via Prisma; run migrations.
    5.  Define core Neo4j node labels.
    6.  Implement basic User authentication (JWT) endpoints in `apps/backend-api`.
*   **Frontend Tasks (`apps/web-app` using Next.js/React):**
    1.  Set up Next.js project.
    2.  Implement basic layout: persistent sidebar/header navigation, main content area.
    3.  Create placeholder pages for main sections (Today, Chat, My Lifeweb, Reflections, Goals, Settings).
    4.  Implement Login/Signup pages and basic client-side auth flow interacting with backend auth endpoints.
    5.  Set up global styling (e.g., TailwindCSS, Emotion, or CSS Modules) and theme (colors, typography from design spec).
*   **UI Testing Point:** User can navigate the basic app shell, log in, and log out. Pages are themed. Backend auth works.
*   **AWS Test Deployment Milestone 0:** After this module, consider a basic deployment of the `backend-api` (e.g., to Elastic Beanstalk or ECS Fargate) and the `web-app` (e.g., to Amplify or S3/CloudFront) to ensure basic cloud connectivity and build pipelines are working. Test authentication in the deployed environment.

*   **Example Cursor Prompt (Frontend - Basic Layout):**
    ```prompt
    CURSOR_AGENT_TASK: Create the basic application layout for `apps/web-app` using Next.js and React.
    Objective: Implement a persistent sidebar navigation and a main content area.

    Requirements:
    1.  Use Next.js App Router.
    2.  Create a root `layout.tsx` that includes:
        a. A `Sidebar` component (create a placeholder `components/Sidebar.tsx`).
        b. A main content area that will render child pages.
    3.  The `Sidebar` should contain placeholder navigation links for: "Today", "Chat with Dot", "My Lifeweb", "Reflections & Narratives", "Goals & Aspirations", "Settings".
    4.  Implement basic styling for the layout and sidebar using [Chosen CSS Solution - e.g., TailwindCSS].
    5.  Create placeholder page files (e.g., `app/today/page.tsx`, `app/chat/page.tsx`, etc.) that render simple "Welcome to [Page Name]" text.
    6.  Ensure navigation links in the `Sidebar` route to these placeholder pages.

    Success Criteria:
    - A persistent sidebar is visible across all placeholder pages.
    - Clicking navigation links correctly loads the respective placeholder page content.
    - Basic styling is applied, and the layout is responsive (rudimentary).
    - Code is organized into appropriate directories and follows React best practices.
    Adhere to Cursor Project Rule Document.
    ```

---

### **Module 1: Basic Ingestion & Display (IPPA Core + UI)**

*   **Description:** Implement core IPPA for capturing `MemoryUnit`s/`Chunk`s, and display them in the web UI.
*   **Backend Tasks:**
    1.  API endpoint (`POST /api/memory-units`) for IPPA service.
    2.  IPPA service: memory-worthy decision (heuristic), `MemoryUnit`/`Chunk` creation in PostgreSQL.
    3.  API endpoint (`GET /api/memory-units`) to list `MemoryUnit`s/`Chunk`s.
*   **Frontend Tasks (`apps/web-app`):**
    1.  **"Today" Page / Quick Capture:**
        *   Implement a prominent text area and "Save Memory" button.
        *   On save, call the `POST /api/memory-units` endpoint. Show success/error toast.
    2.  **"My Lifeweb" - Memory Timeline (Initial Version):**
        *   Create a component to display a list of `MemoryUnit` cards.
        *   Fetch data from `GET /api/memory-units`.
        *   Each card shows `MemoryUnit.user_title` (or `ai_title`) and date.
        *   Clicking a card expands it to show its `Chunk`s.
        *   Implement basic styling for cards and chunk display according to the design spec (colors, typography).
*   **UI Testing Point:** User can type text, save it. The saved memory (with chunks) appears on the "Memory Timeline" view. Data verified in PostgreSQL. The UI elements should reflect the initial branding (colors, fonts).
*   **Example Cursor Prompt (Frontend - Memory Input Form):**
    ```prompt
    CURSOR_AGENT_TASK: Implement the Memory Input Form component in `apps/web-app`.
    Objective: Allow users to input text and save it as a new MemoryUnit.

    Location: `apps/web-app/src/components/memory/MemoryInputForm.tsx` (or similar)
    This component will likely be used on the 'Today' page.

    Requirements:
    1.  Create a React component `MemoryInputForm`.
    2.  It should contain a multi-line `textarea` for text input and a "Save Memory" button.
    3.  Style the textarea and button according to the project's design spec (Alabaster White background for textarea, Rose Gold accent for button, primary/secondary fonts).
    4.  On "Save Memory" click:
        a. Get text from textarea.
        b. Call an API client function (assume `api.memory.create({ textInput, sourceType: 'journal_entry' })` - you will define this API client later or as part of this task if simple) which makes a POST request to `/api/memory-units`.
        c. Handle success: Clear the textarea, show a success toast/notification (e.g., "Memory saved!").
        d. Handle error: Show an error toast/notification.
    5.  Implement basic form validation (e.g., input should not be empty).

    Success Criteria:
    - Component renders correctly with specified styling.
    - User can type text and submit.
    - API call is made on submit.
    - Success/error feedback is provided to the user.
    - Textarea clears on successful submission.
    Adhere to Cursor Project Rule Document.
    ```

---

### **Module 2: Embedding, Semantic Search & UI Integration (IPPA + RSA Core + UI)**

*   **Description:** Integrate embedding generation and implement semantic search with UI.
*   **Backend Tasks:**
    1.  IPPA: Trigger async embedding for `Chunk`s (via BullMQ `embedding-worker`), store in Weaviate.
    2.  RSA: `semanticSearchChunks` function (embeds query, queries Weaviate, fetches Chunks from PostgreSQL).
    3.  API: `GET /api/search` endpoint for RSA search.
*   **Frontend Tasks (`apps/web-app`):**
    1.  **Search Interface:**
        *   Add a dedicated search bar (e.g., in the header or on the "My Lifeweb" page).
        *   Style according to design spec.
    2.  **Search Results Page/Component:**
        *   When user searches, call `GET /api/search`.
        *   Display results as a list of `Chunk` cards. Each card should show:
            *   The `Chunk.text` (highlight matching query terms if possible - client-side).
            *   Context: Parent `MemoryUnit.user_title` (or `ai_title`) and date, clickable to navigate to the full `MemoryUnit` view.
            *   Similarity score (optional, for debugging initially).
        *   Style search result cards beautifully.
*   **UI Testing Point:** User searches. Relevant chunks appear, styled correctly, with context. User can click to view the full memory. Embeddings verified in Weaviate.
*   **AWS Test Deployment Milestone 1:** Deploy Module 0, 1, 2 functionality. Test end-to-end flow: saving memories, embeddings generated, semantic search works in the deployed AWS environment.

---

### **Module 3: Initial Concept Structuring & Basic Concept UI (CSEA Core Iteration 1 + UI)**

*   **Description:** CSEA's first pass: deep concept analysis, linking `MemoryUnit`s to `Concept`s. Basic UI to see these concepts.
*   **Backend Tasks:**
    1.  CSEA Worker & Service: Deep Concept Analysis (LLM), `Concept` creation (PostgreSQL & Neo4j), linking `MemoryUnit`/`Chunk`s to `Concept`s (Neo4j & PostgreSQL junction tables).
    2.  API: New endpoint `GET /api/memory-units/:muid/concepts` to fetch `Concept`s linked to a `MemoryUnit`.
*   **Frontend Tasks (`apps/web-app`):**
    1.  **MemoryUnit Detail View Enhancement:**
        *   On the page displaying a full `MemoryUnit` (when a user clicks a card from the timeline or search result):
            *   Fetch and display a list of `Concept`s linked to this `MemoryUnit` (using the new API endpoint).
            *   Style these `Concept` tags according to the design spec (e.g., small lozenge shapes with `Concept.name`, perhaps color-coded by a preliminary `Concept.type` if available).
    2.  **Placeholder Concept Detail Popover/Modal:**
        *   Clicking a `Concept` tag opens a simple modal/popover showing the `Concept.name`, its AI-assigned `detailed_type`, and `description` (if CSEA generated one).
*   **UI Testing Point:** After a `MemoryUnit` is processed by CSEA (allow some time for async worker), user can view the memory and see AI-identified `Concept` tags. Clicking a tag shows basic concept info. Verify graph in Neo4j.

---

### **Module 4: Inter-Concept Relationships, SELF Model & Enhanced Concept UI (CSEA Core Iteration 2/3 + UI)**

*   **Description:** CSEA infers inter-concept relations and builds initial SELF model. UI for exploring concepts.
*   **Backend Tasks:**
    1.  CSEA: Implement Inter-Concept Relationship Inference (`RELATED_TO`) and SELF Model Update (`PERCEIVES_CONCEPT`). Store in Neo4j & PostgreSQL.
    2.  API:
        *   `GET /api/concepts/:conceptId` to fetch details of a `Concept`, including its direct `RELATED_TO` concepts and linked `MemoryUnit`s.
        *   `GET /api/user/self-model` to fetch the user's `PERCEIVES_CONCEPT` list.
*   **Frontend Tasks (`apps/web-app`):**
    1.  **"My Lifeweb" - Concept Explorer (Initial Version):**
        *   A new page/section.
        *   Ability to search/list all `Concept`s.
        *   Implement the **Concept Detail View**:
            *   Displays `Concept.name`, `type`, `description`.
            *   Lists `MemoryUnit`s that highlight this concept (clickable).
            *   Lists directly `RELATED_TO` other `Concept`s (clickable, navigating to their detail view).
            *   Style this view elegantly, perhaps with the `Concept.name` as a prominent header. Use accent colors for `Concept.type` indicators.
    2.  **"My Lifeweb" - SELF Model View (Initial Version under "My SELF" Pillar Filter):**
        *   Display lists of user's `Concept`s categorized by `perception_type` (Values, Interests, Skills, etc.) fetched from `/api/user/self-model`.
        *   Style this to be reflective and personal.
*   **UI Testing Point:** User can explore concepts, see their descriptions, related memories, and direct conceptual links. User can view their initial SELF model. Verify complex relationships in Neo4j.

---

### **Module 5: Enhanced RSA, Basic Proactivity & UFAA Annotation UI**

*   **Description:** RSA leverages the richer graph. Implement first proactive insight and basic UI for user annotations.
*   **Backend Tasks:**
    1.  RSA: Enhance retrieval with Neo4j graph traversals.
    2.  RSA: Implement one type of proactive insight logic (triggered by CSEA flags or time).
    3.  UFAA & API: Allow users to add text `Annotation`s to `MemoryUnit`s (`POST /api/annotations`). API to fetch `Annotation`s for a `MemoryUnit`.
*   **Frontend Tasks (`apps/web-app`):**
    1.  **Chat Interface:** Observe if Dot's responses (from RSA) are becoming more contextually rich and insightful due to graph-aware retrieval.
    2.  **"Today with Dot" Dashboard:**
        *   Implement a dedicated section/card to display proactive insights from Dot. Style it to be noticeable but gentle (e.g., using Insight Gold accent).
    3.  **MemoryUnit Detail View:**
        *   Display existing `Annotation`s (AI & user).
        *   Add a form (textarea + save button, styled with Reflection Amethyst) for users to add their own `Annotation`s ("Add your reflection...").
*   **UI Testing Point:** Chat responses are improved. User sees a proactive insight. User can add and view their notes on memories.
*   **AWS Test Deployment Milestone 2:** Deploy Modules 3, 4, 5. Test deep concept structuring, concept exploration UI, SELF model display, proactive insights, and user annotations in the AWS environment.

---

### **Subsequent Modules (Frontend tasks become more prominent):**

*   **Module 6: Conversational Arc & Advanced Annotation UI (CSEA, RSA, UFAA + UI)**
    *   **Frontend:** UI to visualize conversational structure within a `MemoryUnit` (e.g., highlighting Q&A turns). Advanced UFAA interfaces for users to correct/refine `Concept.type`, `Concept.name`, `relationship_label`s between concepts, and elements of their SELF model. This will require thoughtful modal dialogs or dedicated editing views.
*   **Module 7: Narrative Generation & "Create & Share" Hub UI (RSA + UI)**
    *   **Frontend:** Design and implement the entire "Create & Share" Hub. This includes:
        *   "Content Sparks" feed (card-based).
        *   "Platform Shaper" templates: Interactive, guided editors for Twitter, LinkedIn, etc., that pull data from the user's Lifeweb. This is a major UI/UX challenge, requiring dynamic content suggestions and editing tools.
        *   UI for managing drafts.
*   **Module 8: Goals & Aspirations Module UI (CSEA, RSA + UI)**
    *   **Frontend:** Dedicated "Goals & Aspirations" section with UI for defining goals (`Concept`s of type `goal_theme`), linking `MemoryUnit`s as evidence of progress/reflection, and visualizing progress (abstractly, as per design spec).
*   **Module 9: Full Proactive Engagement & Settings UI (RSA + UI)**
    *   **Frontend:** Implement UI for all types of proactive insights. Develop the "Settings" page for users to control notification preferences, Dot's humor level, data import/export, account management.
*   **Module 10: Mobile App Development (React Native) - UI Focus**
    *   **Frontend:** Implement all core UI views and interactions from the web app, adapting them for mobile patterns and navigation. Significant UI/UX work.
*   **Module 11: Advanced Visualizations (3D Lifeweb UI - Future)**
    *   **Frontend:** Design and implement the 3D visualization interface using Three.js/R3F (web) or Expo GL/Three.js (mobile). This is a highly specialized UI/UX task.

This frontend-integrated roadmap ensures that user-facing value is delivered and tested at each stage. The prompts to Cursor agents should always specify *both* backend logic and the corresponding frontend components or changes required for that module, including adherence to the visual design language. Regular AWS test deployments will help catch integration issues early.