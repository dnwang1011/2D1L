## 2dots1line V7 Ultimate Technical Specification - Implementation Roadmap (AI Agent Collaboration)

**Overall Goal:** Build the 2dots1line V7 product as specified in `@V7UltimateSpec`.

**Workstreams (Concurrent):**

*   **W1: Core Backend & Data Models:** PostgreSQL, Neo4j, Weaviate schemas, repositories, core API entities.
*   **W2: Cognitive Agents & Tools:** Implementation of the 5 core agents and their deterministic tools.
*   **W3: API Gateway & Auth:** BFF implementation, authentication, authorization logic.
*   **W4: UI Foundation & 3D Canvas Core:** Next.js app setup, shared UI components, R3F canvas setup, `canvas-core`, `shader-lib`.
*   **W5: Orb Implementation (UI & Backend Link):** 3D Orb visuals, animations, and state synchronization with Dialogue Agent.
*   **W6: Card System (UI & Backend Link):** Card Gallery UI, Card components, backend Card Service, Growth Model integration.
*   **W7: GraphScene & Knowledge Visualization (UI & Backend Link):** GraphScene UI, data fetching from Neo4j, interaction logic.
*   **W8: DevOps & Infrastructure:** Monorepo setup, CI/CD, Docker, Terraform for AWS/Tencent.

---

### Sprint 5: Growth Model Backend, Insight Engine MVP & Enhanced UI Cards (3 AI-Weeks)

*Goal: Implement the backend for the Six-Dimensional Growth Model, including event sourcing and challenge system. Develop an MVP of the Insight Engine. Enhance UI cards to display growth and evolution state. Implement basic Orb state changes related to growth.*

*   **W1: Core Backend & Data Models**
    *   **S5.T1: Implement Growth and Challenge System Tables (PostgreSQL)**
        *   **Cursor Prompt:** "In `packages/database/src/prisma/schema.prisma`, implement the `GrowthEvent` table, `ChallengeTemplate` table, and `UserChallenge` table as defined in `@V7UltimateSpec Section 2.2` (specifically sections 2.2.2 and 2.2.5, referencing `V7DataSchemaDesign.md`). Ensure all fields, types, relations, and constraints are correctly implemented. Generate and apply the migration."
        *   **Expected Outcome:** `GrowthEvent`, `ChallengeTemplate`, `UserChallenge` tables are created in PostgreSQL. Prisma client is updated.
        *   **AI Tests:** `npx prisma migrate dev --name add_growth_challenge_models`, `npx prisma generate`.
        *   **Human Verification:** Review the generated migration SQL. In Prisma Studio, verify the new tables exist with correct columns, types, and foreign key relationships.
        *   **Dependencies:** S1.T1
    *   **S5.T2: Implement Growth Model Views (PostgreSQL)**
        *   **Cursor Prompt:** "Create the materialized view `mv_entity_growth_progress` and the view `v_card_evolution_state` in PostgreSQL as specified in `@V7UltimateSpec Section 2.2.3 and 2.2.4` (referencing `V7DataSchemaDesign.md`). For `v_card_evolution_state`, if `entity_graph_connections_summary` table doesn't exist, use a placeholder value (e.g., 0) for `connection_count` for now. Create a SQL script (`packages/database/src/prisma/views.sql`) for these view definitions and document how to apply it."
        *   **Expected Outcome:** SQL script created with definitions for `mv_entity_growth_progress` and `v_card_evolution_state`. The views can be created in the database.
        *   **AI Tests:** (Manual execution for now) Apply the SQL script to the PostgreSQL database. Query both views after inserting some sample `growth_events` to ensure they return data and basic logic works (e.g., `SUM(delta)`).
        *   **Human Verification:** Review the SQL definitions. Manually apply to the DB. Insert sample `growth_events` (e.g., `INSERT INTO growth_events (user_id, entity_id, entity_type, dim_key, delta, source) VALUES ('uuid_user', 'uuid_entity', 'concept', 'self_know', 0.1, 'test_source');`) and refresh the MV. Query views.
        *   **Dependencies:** S1.T1, S5.T1
    *   **S5.T8: Implement Challenge Repositories**
        *   **Cursor Prompt:** "Implement `ChallengeTemplateRepository` and `UserChallengeRepository` in `packages/database/src/repositories/`. These should use the Prisma client from `DatabaseService`. Implement CRUD operations for `ChallengeTemplate` (admin-only, can be seeded directly in DB for now) and methods to create, update (progress, status), and list `UserChallenge`s for a user, as per `@V7UltimateSpec Section 4.2.5`."
        *   **Expected Outcome:** Repositories for managing challenge templates and user challenges are functional.
        *   **AI Tests:** Unit tests for repository methods (Jest, mock Prisma).
        *   **Human Verification:** Manually seed a `ChallengeTemplate` in the DB. Use a test script to create a `UserChallenge` for a user via the repository method. Verify DB entries.
        *   **Dependencies:** S1.T3, S5.T1

*   **W2: Cognitive Agents & Tools**
    *   **S5.T3: Enhance Ingestion Analyst for Growth Event Creation**
        *   **Cursor Prompt:** "Enhance the `IngestionAnalyst` in `services/cognitive-hub/src/agents/ingestion/ingestion-analyst.ts`. When processing text and identifying concepts (even with stubbed NER), implement logic to determine if a 'Know Self' (`self_know`) growth dimension is activated based on simple keyword presence (e.g., 'I feel', 'I think', 'my value'). If activated, create a `GrowthEvent` record with `delta = 0.1` for the associated `MemoryUnit` and `Concept`. Use `DatabaseService`. Refer to `@V7UltimateSpec Section 4.3.1` for activation logic examples."
        *   **Expected Outcome:** `IngestionAnalyst` now creates `GrowthEvent` records in PostgreSQL when ingesting text containing reflective keywords, linking to the `MemoryUnit` and extracted `Concept`.
        *   **AI Tests:** Unit tests for the new dimension activation logic. Integration test: Ingest text with keywords, verify `GrowthEvent` is created with correct `dim_key`, `entity_id` (MemoryUnit), `entity_type`, and `delta`.
        *   **Human Verification:** Ingest a journal entry like "I feel happy today because I learned a new skill." Verify a `GrowthEvent` is created for `self_know` associated with the new `MemoryUnit` and the `Concept` 'happy' or 'skill'. Check `mv_entity_growth_progress`.
        *   **Dependencies:** S3.T1, S4.T1, S5.T1
    *   **S5.T6: Implement Insight Engine MVP**
        *   **Cursor Prompt:** "Create a stub for the `InsightEngine` in `services/cognitive-hub/src/agents/insight/insight-engine.ts`. Implement a basic `discoverPatterns(userId)` method. For now, this method should randomly select two `Concept` nodes from Neo4j for the given user. Then, create a `DerivedArtifact` record in PostgreSQL with `artifact_type = 'potential_connection'`, `title` reflecting the connected concepts, and `source_entities` containing the IDs and types of the two concepts. Use `DatabaseService`."
        *   **Expected Outcome:** `InsightEngine` stub created. `discoverPatterns` method can generate a simple `DerivedArtifact` representing a potential connection between two concepts.
        *   **AI Tests:** Unit test for `discoverPatterns` (mock DB calls). Run it manually and verify a `DerivedArtifact` is created in PostgreSQL.
        *   **Human Verification:** Manually trigger `discoverPatterns` (e.g., via a test script or temporary API endpoint if created). Check the `derived_artifacts` table in PostgreSQL for a new entry of type 'potential_connection' linking two concept IDs for the specified user.
        *   **Dependencies:** S2.T3, S1.T1, S4.T1

*   **W5: Orb Implementation (UI & Backend Link)**
    *   **S5.T7: Implement Orb 'Celebrating' State**
        *   **Cursor Prompt:** "Enhance `OrbStateManager` in `services/dialogue-agent/src/agent/orb-state-manager.ts` and `Orb.tsx` in `apps/web-app/src/orb/`. Add a new Orb visual state 'celebrating' as described in `@V7UltimateSpec Section 5.6.4` (e.g., emits `GrowthAurora` colored particles - use `OrbEffect` system). The `DialogueAgent` (or `CardService` via an event bus if `CardService` is separate) should be able to trigger this state. For now, create a mechanism in `DialogueAgent` or a test endpoint to manually trigger this state for a specific user."
        *   **Expected Outcome:** Orb can enter a 'celebrating' visual state, potentially with particle effects. This state can be triggered from the backend.
        *   **AI Tests:** In the UI, manually trigger the 'celebrating' state via a dev tool or test endpoint. Observe if the Orb changes to the 'celebrating' state.
        *   **Human Verification:** Trigger the 'celebrating' state (e.g., by having `CardService.completeGrowthChallenge` emit an event that `DialogueAgent` listens to, or a direct test endpoint for `OrbStateManager`). Observe the Orb in the UI. It should display the 'celebrating' animation/visuals. Check `OrbStore` state if applicable.
        *   **Dependencies:** S2.T6 (Orb MVP), S3.T5 (Card Evolution Logic)

*   **W6: Card System (UI & Backend Link)**
    *   **S5.T4: Enhance CardService with Growth Data**
        *   **Cursor Prompt:** "Enhance `CardService` (`services/card-service/src/services/card.service.ts`) and its `CardRepository`. The `getCards` and `getCardDetails` methods should now fetch and include `growthDimensions` (from `mv_entity_growth_progress`) and `evolutionState` (from `v_card_evolution_state`) for each card. Update the `Card` model in `packages/shared-types/src/ui/index.ts` (or similar path from monorepo structure) to reflect these new properties as defined in `@V7UltimateSpec Section 6.5.1`."
        *   **Expected Outcome:** `CardService` methods return cards populated with their current growth scores for each dimension and their computed evolution state. `Card` type in `shared-types` updated.
        *   **AI Tests:** Unit tests for `CardService` methods, mocking repository calls that return growth/evolution data. Ensure the data is correctly mapped to the `Card` model.
        *   **Human Verification:** After ingesting data and ensuring `growth_events` are created (S5.T3) and MVs are refreshed, call the `/api/cards` endpoint. Verify the response includes `growthDimensions` arrays and `evolutionState` for each card. Compare with DB view data.
        *   **Dependencies:** S3.T3, S3.T6 (previous CardService), S5.T2
    *   **S5.T5: Enhance UI Card with Growth Display**
        *   **Cursor Prompt:** "Update `Card.tsx` in `apps/web-app/src/components/cards/Card.tsx`. Display the `evolutionState` (e.g., 'Seed', 'Sprout') as text. Implement the `GrowthDimensionIndicator.tsx` component as per `@V7UltimateSpec Section 5.3.4`. Use it within `Card.tsx` to visually represent `growthDimensions` progress (e.g., small bars or icons based on score/status). Use colors from design tokens specified in `@V7UltimateSpec Section 7.1` (e.g., `color.growthAurora`)."
        *   **Expected Outcome:** UI cards now display their evolution state and a visual representation of their progress across the six growth dimensions.
        *   **AI Tests:** Component tests for `GrowthDimensionIndicator`. In Storybook or the app, verify cards show the new state and dimension indicators. Test with various scores to see different progress visualizations.
        *   **Human Verification:** In the web app's Card Gallery, verify cards show their evolution state text (e.g., "Sprout"). Check that each card displays 6 dimension indicators, reflecting their scores (e.g., a partially filled bar or colored icon using correct theme colors).
        *   **Dependencies:** S3.T4, S5.T4
    *   **S5.T9: Implement Challenge Service Logic**
        *   **Cursor Prompt:** "Create `ChallengeService` (e.g., in `services/card-service/src/services/challenge.service.ts` or as a new microservice if preferred, but for now, integrate into `card-service`). Implement methods:
            1.  `startChallenge(userId: string, templateId: string): Promise<UserChallenge>`: Creates a `UserChallenge` record using `UserChallengeRepository`.
            2.  `updateChallengeProgress(userId: string, challengeInstanceId: string, progressData: object): Promise<UserChallenge>`: Updates `UserChallenge.progress` JSONB field.
            3.  `completeChallenge(userId: string, challengeInstanceId: string): Promise<{ challenge: UserChallenge, reward?: DerivedArtifact }>`: Sets status to 'completed', creates relevant `GrowthEvent`s based on `ChallengeTemplate.dim_keys` and `delta` (e.g., +0.5 per dimension for completing a challenge), and creates a `DerivedArtifact` (type 'trophy' or 'poster') using `DerivedArtifactRepository`. Refer to `@V7UltimateSpec Section 4.2.5` and `@V7DataSchemaDesign.md` for reward logic."
        *   **Expected Outcome:** `ChallengeService` can manage the lifecycle of user challenges, including awarding growth events and trophies upon completion.
        *   **AI Tests:** Unit tests for `ChallengeService` methods (mocking repositories). Integration test: Start a challenge, update progress, complete it. Verify `UserChallenge` status, `GrowthEvent` creation, and `DerivedArtifact` (trophy) creation.
        *   **Human Verification:** Seed a `ChallengeTemplate`. Use API calls (to be built in S6) or test scripts to call service methods: start, progress, and complete a challenge. Verify DB states: `user_challenges` status and progress, `growth_events` generated for correct dimensions, and a 'trophy' `DerivedArtifact` created with appropriate `source_entities` linking to the completed challenge.
        *   **Dependencies:** S5.T1, S5.T8

---
My apologies for that! You're right, it looks like I got tangled up and didn't maintain the hierarchical bulleted format as requested for the later sprints. Let's correct that and continue from Sprint 6 onwards, ensuring the information is presented clearly and consistently.

Here is the corrected section of the roadmap, starting from Sprint 6:



**Sprint 6: Insight Display, Advanced Card Features & Chat Enhancements (3 AI-Weeks)**

*Goal: Display insights on the Dashboard, implement card flipping and detailed views, enhance chat with context and suggestions, implement basic challenge UI.*

*   **W1: Core Backend & Data Models**
    *   **S6.T1: Implement `DerivedArtifactRepository`**
        *   **Cursor Prompt:** "In `packages/database/src/repositories/artifact.repository.ts`, implement `DerivedArtifactRepository`. It should use Prisma and provide methods like `createArtifact(data: CreateDerivedArtifactDto)`, `getArtifactById(id: string, userId: string)`, `getArtifactsByUser(userId: string, type?: string)`, `updateArtifact(id: string, data: UpdateDerivedArtifactDto)`. Refer to the `derived_artifacts` table schema in `@V7UltimateSpec Section 2.1.1 & 4.1.1`."
        *   **Expected Outcome:** A functional `DerivedArtifactRepository` for managing derived artifacts in PostgreSQL.
        *   **AI Tests:** Unit tests for all repository methods (Jest, mock Prisma).
        *   **Human Verification:** Review code. Use a test script to create, read, update, and list artifacts. Verify data in Prisma Studio.
        *   **Dependencies:** S1.T1

*   **W2: Cognitive Agents & Tools**
    *   **S6.T2: Enhance Insight Engine for Dashboard**
        *   **Cursor Prompt:** "Modify `InsightEngine.discoverPatterns` in `services/cognitive-hub/src/agents/insight/insight-engine.ts`. Instead of random concepts, implement a simple co-occurrence logic: find pairs of `Concept`s that are frequently `HIGHLIGHTS`'d together in `MemoryUnit`s for a user (query Neo4j). Create `DerivedArtifact`s (type 'co_occurrence_insight') for the top 3 pairs. Ensure insights are user-specific. Refer to `@V7UltimateSpec Section 3.4` for output payload and `DerivedArtifact` structure from `@V7DataSchemaDesign.md`."
        *   **Expected Outcome:** `InsightEngine` generates more meaningful `DerivedArtifacts` based on concept co-occurrence and stores them in PostgreSQL.
        *   **AI Tests:** Unit tests for co-occurrence logic (mock Neo4j calls). Integration test: Ingest data with co-occurring concepts, run `discoverPatterns`, verify `DerivedArtifact` creation in PostgreSQL.
        *   **Human Verification:** Ingest several memories linking specific concept pairs. Run `discoverPatterns`. Check the `derived_artifacts` table in PostgreSQL for new 'co_occurrence_insight' entries for the correct user, linking the co-occurring concepts.
        *   **Dependencies:** S5.T6, S4.T1, S6.T1 (for `DerivedArtifactRepository`)

*   **W3: API Gateway & Auth**
    *   **S6.T3: Create API Endpoints for Insights & Challenges**
        *   **Cursor Prompt:** "In `apps/api-gateway`, add new protected routes as specified in `@V7UltimateSpec Section 7.2.1` and `@V7TechSpec.md Section 6.2.1`:
            1.  `GET /api/dashboard/insights`: Proxies to a new method in `InsightEngine` (or a dedicated `InsightService`) to fetch recent `DerivedArtifact`s of type 'potential_connection' or 'co_occurrence_insight' for the user.
            2.  `GET /api/challenges/active`: Proxies to `ChallengeService.getActiveChallenges(userId)`. (Assume `getActiveChallenges` needs to be implemented in `ChallengeService` to fetch from `UserChallengeRepository`).
            3.  `POST /api/challenges/:templateId/start`: Proxies to `ChallengeService.startChallenge(userId, templateId)`.
            4.  `POST /api/challenges/instances/:challengeInstanceId/complete`: Proxies to `ChallengeService.completeChallenge(userId, challengeInstanceId)`.
            Ensure appropriate request validation and user authorization."
        *   **Expected Outcome:** API endpoints for insights and challenges are functional and secured via `authMiddleware`.
        *   **AI Tests:** API tests for each endpoint (e.g., using Jest with supertest, or stubs for Postman/Newman): test with/without auth, test valid/invalid inputs, verify correct responses and underlying service calls (mocked).
        *   **Human Verification:** Use Postman to test each endpoint. Verify insights (after running S6.T2). Start a challenge, complete it, and verify DB changes (`user_challenges`, `growth_events`, `derived_artifacts` if applicable).
        *   **Dependencies:** S1.T2, S5.T9 (ChallengeService), S6.T2 (InsightEngine logic)

*   **W4: UI Foundation & 3D Canvas Core**
    *   **S6.T4: Implement Dashboard Modal Structure**
        *   **Cursor Prompt:** "In `apps/web-app/src/components/dashboard/Dashboard.tsx`, implement the basic structure of the Dashboard modal as per `@V7UltimateSpec Section 4.2`. Include sections for 'Greeting & Status', 'Cosmic Metrics', 'Active Journeys', 'Insight Discoveries', and 'Growth Invitations'. Use the `GlassmorphicPanel` component. For now, fetch and display basic data: user's display name (from a user context/store), and use stub data or placeholder text for metrics and lists. Ensure the modal can be opened/closed via `ModalStore`."
        *   **Expected Outcome:** A Dashboard modal with placeholder sections is visible in the UI and can be toggled.
        *   **AI Tests:** Component tests (React Testing Library) for the `Dashboard` component structure and basic data display. Test modal opening/closing via store actions.
        *   **Human Verification:** Review component structure. Open the dashboard in the UI; it should show the defined sections with placeholder content and have the correct glassmorphic styling.
        *   **Dependencies:** S2.T2 (GlassmorphicPanel), UI State Management (ModalStore, UserStore - stubs if not fully implemented)
    *   **S6.T9: Implement Chat Interface Component**
        *   **Cursor Prompt:** "Implement the `ChatInterface.tsx` component in `apps/web-app/src/components/chat/ChatInterface.tsx` as per `@V7UltimateSpec Section 5.3.5`. It should include:
            1. A message display area (scrollable, rendering messages with different styles for 'user' and 'assistant').
            2. A text input area with a send button.
            3. Connect to `ChatStore` (create if not yet implemented in `apps/web-app/src/stores/chatStore.ts`) to manage messages, input state, and chat status (e.g., 'thinking').
            4. When a message is sent, it should call the `/api/dialogue/message` endpoint (via an API client function).
            5. Display responses from the Dialogue Agent (received via WebSocket or by updating `ChatStore` after API response).
            Integrate this into the `ModalLayer.tsx` so it can be toggled."
        *   **Expected Outcome:** A functional chat interface where users can send messages to Dot and receive responses. Messages are displayed in the UI.
        *   **AI Tests:** Component tests for message rendering and input. E2E stub: Send a message, mock backend response, verify UI updates in `ChatStore` and on screen.
        *   **Human Verification:** Open the chat modal. Send a message. Verify the message appears, Dot responds (using the `DialogueAgent` logic from S3.T7/S4.T3), and the conversation history is displayed.
        *   **Dependencies:** S3.T8 (API endpoint), `ModalLayer.tsx` (from S5), `OrbAvatar` (if used, can be a placeholder initially).

*   **W6: Card System (UI & Backend Link)**
    *   **S6.T5: Implement Card Flipping Animation & Detail View**
        *   **Cursor Prompt:** "In `Card.tsx` (`apps/web-app/src/components/cards/Card.tsx`), implement the two-sided card design with a flip animation as described in `@V7UltimateSpec Section 4.1 & 5.3.3`. The front side should show `title`, `preview`, and `GrowthDimensionIndicator`s. The back (Information Side) should show `description`, `metadata` (placeholder for now), and more detailed `GrowthDimension` information (e.g., name, score, `nextStepSuggestion` if available). Clicking the card should trigger the flip animation. Fetch full card details from the `CardService.getCardDetails` method (via `/api/cards/:cardId` endpoint, which needs to be created) when a card is focused or flipped for the first time."
        *   **Expected Outcome:** Cards in the gallery are flippable using CSS transitions or Framer Motion. The front shows summary information, and the back shows detailed information. Data for the back is loaded on demand.
        *   **AI Tests:** Component tests for flip animation and data display on both sides (mocking data). In UI, click cards to verify flip and content. Check network tab for API call on flip/focus.
        *   **Human Verification:** In Card Gallery, click a card. It should flip smoothly. The front should show title, preview, and growth indicators. The back should show detailed text and dimension details. Verify data is fetched correctly when flipping.
        *   **Dependencies:** S5.T5 (Card UI), S3.T3 (CardService - needs `getCardDetails` method and API endpoint), S5.T4 (Card model update)
    *   **S6.T6: Implement Basic Challenge UI in Dashboard**
        *   **Cursor Prompt:** "In `Dashboard.tsx` (`apps/web-app/src/components/dashboard/Dashboard.tsx`), in the 'Growth Invitations' or 'Active Journeys' section, fetch active `UserChallenge`s for the user by calling the `/api/challenges/active` endpoint. For each challenge, display its `name` (from `ChallengeTemplate`), `description`, and a 'Complete Challenge' button. Clicking 'Complete' should call the `/api/challenges/instances/:challengeInstanceId/complete` endpoint. Update the UI optimistically or re-fetch on success."
        *   **Expected Outcome:** Active challenges are listed on the dashboard. Users can click a button to mark a challenge as complete, triggering backend logic and UI updates.
        *   **AI Tests:** Component tests for challenge list display and button interaction (mock API calls). Integration test: Start a challenge via API/DB, verify it shows on dashboard. Click 'Complete', verify API call is made.
        *   **Human Verification:** Start a challenge via backend/Postman. Open dashboard, verify challenge is listed with its name and description. Click "Complete". Verify `user_challenges` status updates in DB, `growth_events` and 'trophy' `DerivedArtifact` are created. Orb might celebrate (S5.T7). The UI should reflect completion.
        *   **Dependencies:** S6.T3 (API endpoints for challenges), S6.T4 (Dashboard structure)
    *   **S6.T7: Display Insights on Dashboard**
        *   **Cursor Prompt:** "In `Dashboard.tsx`, in the 'Insight Discoveries' section, fetch and display recent insights (DerivedArtifacts of type 'potential_connection' or 'co_occurrence_insight') by calling the `/api/dashboard/insights` endpoint. For each insight, display its `title` and `description`. Refer to `@V7UltimateSpec Section 4.2 (Dashboard)` for content ideas."
        *   **Expected Outcome:** Recent insights generated by the Insight Engine are displayed on the dashboard.
        *   **AI Tests:** Component tests for insight display (mocking API response). Ensure API call is made and data is rendered correctly.
        *   **Human Verification:** After `InsightEngine` (S6.T2) generates some insights, open the dashboard. Verify the insights are listed with their titles and descriptions.
        *   **Dependencies:** S6.T2 (Insight Engine generating artifacts), S6.T3 (API endpoint for insights), S6.T4 (Dashboard structure)

*   **W5: Orb Implementation (UI & Backend Link)**
    *   **S6.T8: Implement Orb Contextual Prompts for Cards**
        *   **Cursor Prompt:** "Enhance `DialogueAgent`. Implement a mechanism where the frontend, upon focusing a card in the `CardGallery.tsx` or `Card.tsx`, sends a `card_focused` event (e.g., via WebSocket or a new API endpoint `/api/dialogue/card-focus`) with `cardId` and `cardType` to the `DialogueAgentService`. The `DialogueAgent` should then:
            1.  Call `CardService.getCardDetails(userId, cardId, cardType)`.
            2.  Analyze the `growthDimensions` and `evolutionState`.
            3.  If a dimension is 'unactivated' or 'in_progress', formulate a simple textual prompt (e.g., 'This card is a Seed. How about exploring its "Know Self" dimension by reflecting on...?').
            4.  Update the `OrbStateManager` to a 'suggesting' or 'prompting' visual state (define this new state in `OrbStateManager` and `Orb.tsx` with distinct visual cues, e.g., Journey Gold highlights).
            5.  Send the prompt text back to the UI (e.g., via WebSocket or as part of the `OrbState` update) to be displayed near the Orb or in the chat."
        *   **Expected Outcome:** When a user focuses on a card, the Orb changes state and the UI displays a contextual prompt related to that card's growth potential.
        *   **AI Tests:** Simulate `card_focused` event/API call. Verify `DialogueAgent` fetches card data, `OrbStateManager` updates correctly, and a prompt is generated. Mock `CardService` calls.
        *   **Human Verification:** Focus on different cards in the UI. Observe if the Orb changes state (e.g., to a 'prompting' visual) and if the chat interface or a dedicated UI element shows a relevant prompt. The prompt should reflect the card's current state and suggest interaction with an underdeveloped dimension.
        *   **Dependencies:** S4.T3 (Dialogue Agent), S5.T4 (CardService providing detailed card data), S5.T7 (Orb state mechanism)

---

**Sprint 7: Full Scene Implementation & Advanced Orb Behavior (4 AI-Weeks)**

*Goal: Complete implementations for CloudScene, AscensionScene, and GraphScene. Implement advanced Orb shaders and behaviors. Refine UI interactions.*

*   **W4: UI Foundation & 3D Canvas Core**
    *   **S7.T1: Implement CloudScene Visuals**
        *   **Cursor Prompt:** "Implement `CloudScene.tsx` in `apps/web-app/src/canvas/scenes/CloudScene/` as per `@V7UltimateSpec Section 3.2.1 & 5.2.2.1`. Focus on:
            1.  Volumetric clouds (using shaders or `three-volumetric-clouds`).
            2.  Dynamic sky using `Sky` from `drei`.
            3.  Distant mountain meshes with parallax.
            4.  Atmospheric fog.
            5.  Camera path for slow, continuous drift.
            Refer to `v7UIUXDesign.md` for visual composition and `v7TechSpec.md` for technical details."
        *   **Expected Outcome:** A visually appealing CloudScene with dynamic clouds, sky, and subtle camera movement.
        *   **AI Tests:** Visual inspection in Storybook or dev environment. Check for performance (FPS).
        *   **Human Verification:** Launch the app, switch to CloudScene. Verify the look and feel matches the V7 UI/UX description (Epyréan Skyscape, layered clouds, distant peaks, gentle drift). Check for performance on target devices.
        *   **Dependencies:** S2.T1

    *   **S7.T2: Implement AscensionScene Visuals & Transition Logic**
        *   **Cursor Prompt:** "Implement `AscensionScene.tsx` in `apps/web-app/src/canvas/scenes/AscensionScene/` as per `@V7UltimateSpec Section 3.2.2 & 5.2.2.2`. Focus on:
            1.  Transition phases: Atmospheric Acceleration, Tunneling & Shear, Boundary Break / Flash, Arrival into Cosmic Layer.
            2.  Camera movement path with specified easing.
            3.  Use of layered clouds, particle effects, and lens distortion.
            4.  Implement scene transition logic in `SceneStore` (Zustand) to manage `activeScene` and `sceneTransitioning` states, triggered from UI (e.g., a button)."
        *   **Expected Outcome:** A smooth, visually compelling transition from an atmospheric scene to a cosmic space. `SceneStore` manages transition state.
        *   **AI Tests:** Unit tests for `SceneStore` transition logic. Visual inspection of the animation sequence.
        *   **Human Verification:** Trigger the AscensionScene transition from the UI. Observe the visual phases and camera movement. Ensure it feels like a journey from earth's atmosphere to space.
        *   **Dependencies:** S2.T1, S7.T1 (elements might be reused/adapted)

    *   **S7.T3: Implement GraphScene Basic Rendering**
        *   **Cursor Prompt:** "In `GraphScene.tsx` (`apps/web-app/src/canvas/scenes/GraphScene/`), enhance node rendering. Instead of simple spheres, implement 'Memory Stars' (spherical orbs with glow aura and inner pulsing core) and 'Concept Nebulae/Nodes' (volumetric cloud-like structures with internal light sources) as described in `@V7UltimateSpec Section 3.2.3`. Use placeholders for data-driven visual properties for now. Implement basic Connection Pathways as simple lines between currently rendered nodes."
        *   **Expected Outcome:** GraphScene displays distinct visual representations for Memory and Concept nodes, and basic lines for connections.
        *   **AI Tests:** Visual inspection. Ensure different node types are distinguishable.
        *   **Human Verification:** Switch to GraphScene. Verify that nodes (fetched in S4.T5) are rendered with more distinct visual styles (stars vs. nebulae). Basic lines should connect them if link data is available (S7.T4).
        *   **Dependencies:** S4.T4, S4.T5

*   **W7: GraphScene & Knowledge Visualization (UI & Backend Link)**
    *   **S7.T4: Implement GraphService Endpoint for Links**
        *   **Cursor Prompt:** "In `GraphService` (or cog-hub module), create a new API endpoint `/api/graph/links` (via API Gateway). This endpoint should query Neo4j for relationships (`RELATED_TO`, `HIGHLIGHTS`, etc.) between the nodes visible to the user (can initially fetch all relationships for a user). Return data in a format suitable for `GraphScene.tsx` (e.g., `{ source: 'nodeId1', target: 'nodeId2', type: 'RELATIONSHIP_TYPE' }`)."
        *   **Expected Outcome:** `/api/graph/links` endpoint returns relationship data for the graph.
        *   **AI Tests:** API test: Call endpoint after ingesting data with relationships (S4.T1). Verify link data is returned.
        *   **Human Verification:** After ingesting data with relationships (S4.T1), call `/api/graph/links` via Postman. Verify it returns relationship data. In GraphScene (after S7.T3), these links should now connect the rendered nodes.
        *   **Dependencies:** S4.T1, S4.T5
    *   **S7.T5: GraphScene - Data-Driven Visuals & Basic Layout**
        *   **Cursor Prompt:** "In `GraphScene.tsx`, connect node and link rendering to data fetched from `/api/graph/nodes` and `/api/graph/links`. Map node properties (`type`, `importance_score`, `recency`) to visual attributes (e.g., color, size, glow intensity) as generally described in `@V7UltimateSpec Section 3.2.3`. Implement a basic force-directed layout (e.g., using `d3-force-3d` or a simple R3F physics engine like `use-cannon`) to position nodes."
        *   **Expected Outcome:** GraphScene nodes and links are rendered based on actual data. Node appearance varies based on properties. Nodes are arranged by a force-directed layout.
        *   **AI Tests:** Visual inspection. Verify different node types/states have different appearances. Check for basic layout distribution.
        *   **Human Verification:** Ingest diverse data. View GraphScene. Nodes should be visually distinct (e.g., important nodes larger/brighter). They should be spatially arranged, not just overlapping.
        *   **Dependencies:** S7.T3, S7.T4

*   **W5: Orb Implementation (UI & Backend Link)**
    *   **S7.T6: Implement Advanced Orb Shaders & Material Layers**
        *   **Cursor Prompt:** "Implement the advanced Orb visual appearance in `Orb.tsx` and its shaders, as detailed in `@V7UltimateSpec Section 5.6.1 & 5.6.2` (referencing `v7UIUXDesign.md Section 5.1`). This includes:
            1.  Core Layer (subsurface glowing center, volumetric light).
            2.  Outer Shell (transparent glassy skin, Fresnel edge glow, optional iridescence).
            3.  Aura/Halo (bloom/glow, optional animated particles/shimmer).
            Implement shader uniforms for `uTime`, `uEnergyLevel`, `uPulse`, `uBaseColor`, `uAccentColor`, etc."
        *   **Expected Outcome:** Orb has a rich, layered, and dynamic visual appearance according to the spec.
        *   **AI Tests:** Visual inspection in Storybook or dev environment. Check for shader compilation errors.
        *   **Human Verification:** Observe the Orb in the UI. It should have the described core, shell, and aura. Subtle animations (pulsing, shimmering) should be present. Test how `energyLevel` affects visuals (can be stubbed in `OrbStore` for now).
        *   **Dependencies:** S2.T6
    *   **S7.T7: Implement Orb State-Driven Visual Changes**
        *   **Cursor Prompt:** "In `Orb.tsx` and `OrbStateManager.ts`, implement the visual changes for Orb states (Idle, Listening, Insight, Emotional Moment, Progress/Growth) as defined in `@V7UltimateSpec Section 5.6.3` (referencing `v7UIUXDesign.md Section 5.2`). This involves mapping these states to specific shader uniform values (colors, intensities, animation parameters). The `DialogueAgent` should trigger these state changes via `OrbStateManager`."
        *   **Expected Outcome:** Orb's appearance (color, glow, motion) changes distinctly based on its current state as driven by the backend.
        *   **AI Tests:** Unit tests for `OrbStateManager` state transitions. In UI, manually trigger different Orb states (via dev tools modifying `OrbStore` or test API calls to `DialogueAgent`) and verify visual changes.
        *   **Human Verification:** Trigger different interaction flows (e.g., asking a question, receiving an insight - if insight display is ready). Observe if the Orb's color and animation change according to the spec (e.g., Reflection Amethyst for listening, Journey Gold for insight).
        *   **Dependencies:** S7.T6, `DialogueAgent` capable of setting these states (from previous sprints or enhanced now).

*   **W4: UI Foundation & 3D Canvas Core**
    *   **S7.T8: Implement HUD Component**
        *   **Cursor Prompt:** "Implement the `HUD.tsx` component as per `@V7UltimateSpec Section 5.3.6` (referencing `v7UIUXDesign.md Section 4.3`). Include placeholder buttons/icons for: Scene Toggle, Ascension Trigger, Card Gallery, Journal Mode, Dashboard Expansion, Quest Log, Celebration Marker. Position it as an overlay on the 3D canvas."
        *   **Expected Outcome:** A functional HUD with placeholder controls is displayed over the 3D canvas.
        *   **AI Tests:** Component tests for HUD structure and button presence.
        *   **Human Verification:** Verify HUD appears correctly in the UI. Buttons are present (though may not be fully functional yet).
        *   **Dependencies:** S2.T1

---

**Sprint 6 (Re-iteration for clarity and focus): Six-Dimensional Growth Model Backend & UI Integration**

*Goal: Fully implement the backend for the Six-Dimensional Growth Model, including event sourcing, challenge system, and derived artifacts for rewards. Integrate this data into the Card and Dashboard UI components, and enable Orb state changes reflecting growth.*

*   **W1: Core Backend & Data Models**
    *   **S6.T1: Implement Growth Event Handling and User Profile Update**
        *   **Cursor Prompt:** "In `services/cognitive-hub/src/agents/ingestion-analyst.ts` (or a dedicated `GrowthService`), refine the logic for creating `GrowthEvent` records. Ensure `userId`, `entity_id` (for MemoryUnit, Concept, or DerivedArtifact), `entity_type`, `dim_key`, `delta`, and `source` are correctly populated. Implement a mechanism (e.g., a PostgreSQL trigger on `growth_events` table, or a scheduled job in `workers/scheduler`) to update the `users.growth_profile` JSONB column by aggregating scores from `mv_entity_growth_progress` for the respective user. Reference `@V7UltimateSpec Section 2.2.1, 2.2.2, 4.2.2`."
        *   **Expected Outcome:** `GrowthEvent`s are accurately created. `users.growth_profile` is updated to reflect the sum of deltas for each dimension.
        *   **AI Tests:** Unit tests for growth event creation logic. Integration test: Trigger actions that create growth events (e.g., ingest specific content), then verify `growth_events` table and `users.growth_profile` are updated correctly.
        *   **Human Verification:** Perform actions in the UI (e.g., add a reflective journal entry). Check the `growth_events` table for new entries. Verify the `users.growth_profile` for that user reflects the updated scores for relevant dimensions in Prisma Studio.
        *   **Dependencies:** S5.T1, S5.T2, S5.T3

    *   **S6.T2: Implement `DerivedArtifactRepository`**
        *   **Cursor Prompt:** "In `packages/database/src/repositories/artifact.repository.ts`, implement a `DerivedArtifactRepository`. It should use Prisma and provide methods like `createArtifact(data: CreateDerivedArtifactDto): Promise<DerivedArtifact>`, `getArtifactById(id: string, userId: string): Promise<DerivedArtifact | null>`, `getArtifactsByUser(userId: string, type?: string, limit?: number): Promise<DerivedArtifact[]>`, `updateArtifact(id: string, data: UpdateDerivedArtifactDto): Promise<DerivedArtifact>`. Refer to the `derived_artifacts` table schema in `@V7UltimateSpec Section 2.1.1 & 4.1.1`."
        *   **Expected Outcome:** A functional `DerivedArtifactRepository` for managing derived artifacts (like insights, trophies) in PostgreSQL.
        *   **AI Tests:** Unit tests for all repository methods (Jest, mock Prisma).
        *   **Human Verification:** Review code. Use a test script or temporary API endpoints to create, read, update, and list derived artifacts. Verify data integrity in Prisma Studio.
        *   **Dependencies:** S1.T1

*   **W2: Cognitive Agents & Tools**
    *   **S6.T3: Enhance Insight Engine for Dashboard Insights**
        *   **Cursor Prompt:** "Modify `InsightEngine.discoverPatterns(userId)` in `services/cognitive-hub/src/agents/insight/insight-engine.ts`. Implement a more meaningful pattern detection logic. For example, find pairs of `Concept`s frequently co-occurring in a user's `MemoryUnit`s (query Neo4j for `(MemoryUnit)-[:HIGHLIGHTS]->(Concept)`). For the top N co-occurring pairs, create `DerivedArtifact`s of type 'co_occurrence_insight' using the `DerivedArtifactRepository`. Ensure `source_entities` field correctly links to the involved concepts. Refer to `@V7UltimateSpec Section 3.4` for insight structure."
        *   **Expected Outcome:** `InsightEngine` generates `DerivedArtifacts` of type 'co_occurrence_insight' based on actual data patterns.
        *   **AI Tests:** Unit tests for co-occurrence logic (mock Neo4j and repository calls). Integration test: Ingest data with co-occurring concepts, run `discoverPatterns`, verify `DerivedArtifact` creation with correct `source_entities`.
        *   **Human Verification:** Ingest several memories linking specific concept pairs. Manually trigger `discoverPatterns`. Check the `derived_artifacts` table for new 'co_occurrence_insight' entries, ensuring `title`, `description`, and `source_entities` are accurate.
        *   **Dependencies:** S5.T6, S4.T1, S6.T2 (DerivedArtifactRepository)

*   **W3: API Gateway & Auth**
    *   **S6.T4: Implement API Endpoints for Insights and Challenges**
        *   **Cursor Prompt:** "In `apps/api-gateway`, implement or refine the following protected API endpoints:
            1.  `GET /api/dashboard/insights`: Calls a new method in `InsightService` (or `InsightEngine`) to fetch `DerivedArtifacts` (types: 'potential_connection', 'co_occurrence_insight', 'Orb_dream_card') for the authenticated user, ordered by `created_at` DESC, with pagination.
            2.  `GET /api/challenges/templates`: Calls `ChallengeTemplateRepository.getAllTemplates()`.
            3.  `GET /api/challenges/active`: Calls `ChallengeService.getActiveChallenges(userId)` (to be implemented in `ChallengeService`, should query `UserChallengeRepository` for status 'active').
            4.  `POST /api/challenges/:templateId/start`: Calls `ChallengeService.startChallenge(userId, templateId)`.
            5.  `POST /api/challenges/instances/:challengeInstanceId/progress`: Calls `ChallengeService.updateChallengeProgress(userId, challengeInstanceId, req.body.progressData)`.
            6.  `POST /api/challenges/instances/:challengeInstanceId/complete`: Calls `ChallengeService.completeChallenge(userId, challengeInstanceId)`.
            Ensure proper request validation (e.g., using Zod) for payloads and parameters."
        *   **Expected Outcome:** API endpoints for fetching insights, challenge templates, active user challenges, and managing challenge lifecycle are functional and secured.
        *   **AI Tests:** API tests for each endpoint: success cases, error cases (invalid input, unauthorized), and verify interaction with underlying services (mocked).
        *   **Human Verification:** Use Postman:
            *   Fetch challenge templates.
            *   Start a challenge for a user.
            *   Fetch active challenges for that user.
            *   Update progress for an active challenge.
            *   Complete a challenge and verify `growth_events` and 'trophy' `DerivedArtifact` creation.
            *   Fetch insights after running `InsightEngine`.
        *   **Dependencies:** S1.T2, S5.T9 (ChallengeService), S6.T3 (InsightEngine logic), S5.T8 (Challenge Repositories)

*   **W6: Card System (UI & Backend Link)**
    *   **S6.T5: Implement Card Detail View & Two-Sided Flip**
        *   **Cursor Prompt:** "In `apps/web-app/src/components/cards/Card.tsx`, fully implement the two-sided card:
            *   **Front:** `title`, `preview` (image or text), `GrowthDimensionIndicator`s (from S5.T5).
            *   **Back (Information Side):** Detailed `description`, `metadata` (e.g., creation date, source), full `GrowthDimension` details (name, score, `nextStepSuggestion` if available from `CardService`).
            *   Implement the flip animation on click (e.g., using `framer-motion` or CSS transforms) as per `@V7UltimateSpec Section 5.3.3`.
            *   When a card is focused or flipped to the back for the first time, fetch full card details from `/api/cards/:cardId` (endpoint needs to be created/refined in `CardService` and API Gateway) and update the `CardStore` or local component state."
        *   **Expected Outcome:** Cards in the gallery are flippable. Front shows summary, back shows details. Data for the back is loaded on demand from a dedicated `getCardDetails` endpoint.
        *   **AI Tests:** Component tests for flip animation and data display on both sides (mocking API calls). In UI, click cards to verify flip and content loading for the back. Check network tab for `/api/cards/:cardId` call.
        *   **Human Verification:** In Card Gallery, click a card. Verify smooth flip. Front: title, preview, growth indicators. Back: detailed description, dimension details (name, score, any suggestions). Ensure data for back is fetched dynamically.
        *   **Dependencies:** S5.T5, `CardService.getCardDetails` (and corresponding API endpoint via S3.T3 or new)
    *   **S6.T6: Implement Challenge Display and Interaction in Dashboard**
        *   **Cursor Prompt:** "In `apps/web-app/src/components/dashboard/Dashboard.tsx`, under 'Growth Invitations' or 'Active Journeys':
            1.  Fetch active `UserChallenge`s using the `/api/challenges/active` endpoint.
            2.  For each challenge, display `challenge_template.name`, `challenge_template.description`, and `user_challenge.progress`.
            3.  If a challenge is not yet completed, show a 'Mark Complete' or 'Log Progress' button. 'Mark Complete' calls `/api/challenges/instances/:challengeInstanceId/complete`. 'Log Progress' (if applicable based on `challenge_template.payload`) could open a small modal to input progress data and call `/api/challenges/instances/:challengeInstanceId/progress`.
            4.  Fetch and display available `ChallengeTemplate`s (from `/api/challenges/templates`) and allow users to start them (calls `/api/challenges/:templateId/start`)."
        *   **Expected Outcome:** Dashboard displays active challenges with progress, and available challenges. Users can start and complete challenges from the UI.
        *   **AI Tests:** Component tests for challenge list display and interactions (mock API calls). Test starting and completing challenges from the UI.
        *   **Human Verification:**
            *   Seed challenge templates.
            *   On dashboard, verify templates are listed and can be started.
            *   Verify active challenges show progress (if any).
            *   Complete a challenge from the UI. Verify status change, growth event creation, and trophy artifact. Orb should celebrate.
        *   **Dependencies:** S6.T3 (Challenge API endpoints), S6.T4 (Dashboard structure), S5.T7 (Orb celebration)
    *   **S6.T7: Display Insights on Dashboard UI**
        *   **Cursor Prompt:** "In `apps/web-app/src/components/dashboard/Dashboard.tsx`, in the 'Insight Discoveries' section, fetch insights by calling the `/api/dashboard/insights` endpoint. For each `DerivedArtifact` insight, display its `title` and `description`. Make each insight clickable, potentially opening a modal or navigating to a detailed view (stub navigation for now). Refer to `@V7UltimateSpec Section 4.2 (Dashboard)`."
        *   **Expected Outcome:** Recent insights (co-occurrence, potential connections) are fetched and displayed on the dashboard.
        *   **AI Tests:** Component tests for insight display, mocking API response.
        *   **Human Verification:** After the `InsightEngine` (S6.T3) has generated some insights, open the dashboard. Verify the insights are listed with their titles and descriptions. Clicking an insight (even if it does nothing yet) should be possible.
        *   **Dependencies:** S6.T3 (Insight API endpoint), S6.T4 (Dashboard structure)

*   **W5: Orb Implementation (UI & Backend Link)**
    *   **S6.T8: Implement Orb Contextual Prompts for Card Growth**
        *   **Cursor Prompt:** "In `apps/web-app/src/components/cards/Card.tsx` (or `CardGallery.tsx`), when a card receives focus (e.g., on hover or click), send an event/API call (e.g., `POST /api/dialogue/card-focus` with `cardId`, `cardType`) to the `DialogueAgentService`.
            In `DialogueAgent.ts`, handle this focus event:
            1.  Call `CardService.getCardDetails(userId, cardId, cardType)`.
            2.  Analyze the `growthDimensions`. If a dimension is 'unactivated' or 'in_progress', formulate a simple textual prompt (e.g., 'This card is a Seed. How about exploring its "Know Self" dimension by reflecting on...?').
            3.  Update the `OrbStateManager` to a 'suggesting' or 'prompting' visual state (define this new state if needed, e.g., using Journey Gold highlights, as per `@V7UltimateSpec Section 5.6.3 & 5.2.3`).
            4.  Send this prompt text and the Orb state update back to the UI (via WebSocket or API response). The UI (e.g., `ChatInterface.tsx` or a dedicated toast) should display the prompt."
        *   **Expected Outcome:** When a user focuses on a card, the Orb changes its visual state, and a contextual prompt related to the card's growth dimensions is displayed in the UI.
        *   **AI Tests:** Simulate `card_focused` event/API call. Mock `CardService` response. Verify `DialogueAgent` generates a prompt and updates `OrbStateManager`. In UI tests, verify prompt display and Orb state change.
        *   **Human Verification:** Focus on different cards in the UI. The Orb should visually change (e.g., glow Journey Gold). A relevant prompt related to an underdeveloped dimension of the card should appear (e.g., in a toast notification or temporarily in the chat area).
        *   **Dependencies:** S4.T3 (Dialogue Agent), S5.T4 (CardService), S6.T5 (Card details), S5.T7 (Orb state)

---

*This roadmap is designed to be iterative. Subsequent sprints will build upon these foundations, adding more complex agent logic, advanced UI features (like the 3D scenes), mobile app development, and thorough testing/optimization.*

This detailed, AI-agent-friendly roadmap should provide clear, actionable steps for building out the 2dots1line V7 product. Remember to adjust task granularity and dependencies based on the AI's capabilities and the chosen collaboration workflow.