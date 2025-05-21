# 2dots1line V7 Execution Roadmap

## Introduction

This document serves as the execution roadmap and prompt guide for the 2dots1line V7 system. It is designed for a development workflow using Cursor AI agents alongside a human coordinator, building upon the foundation already established in V4 (through task 2.3).

### Purpose

1. **Implementation GPS**: Provides step-by-step guidance for building each component
2. **Prompt Library**: Contains ready-to-use prompts for Cursor AI agents
3. **Testing Guide**: Details what to verify after each implementation step
4. **Decision Support**: Identifies decision points requiring human input

### How to Use This Document

1. **Read the upcoming step** to understand the context and objectives
2. **Copy the provided prompt** and paste it into a Cursor AI chat
3. **Review expected outcomes** while Cursor is generating code
4. **Test and verify** the implementation as suggested
5. **Advance to the next step** or adjust as needed

## Current Implementation Status

The following components have already been implemented from the V4 plan:

1. **Monorepo Initialization** (Task 1.1): Base directory structure with Turborepo configuration
2. **Database Package Setup** (Task 1.2): Client wrappers for PostgreSQL, Neo4j, Weaviate, and Redis
3. **Shared Types Package** (Task 1.3): Domain models and interfaces
4. **Tool Registry Implementation** (Task 2.1): Infrastructure for the agent-tool paradigm
5. **Dialogue Agent Implementation** (Task 2.2): Core conversation management
6. **Web App Shell Implementation** (Task 2.3): Basic Next.js web application with routing and layouts

## Implementation Tracks for V7

The V7 implementation builds upon the V4 foundation while incorporating the enhanced UI/UX design, Three.js 3D layers, and revised data schema with event-sourcing. The tracks below are organized to enable incremental, testable progress.

### Sprint 1: V7 Schema Migration & Event-Sourcing (Week 1)

#### 1.1 Implement Event-Sourcing Schema Updates

**Objective**: Refactor the database schema to implement the event-sourcing approach described in the V7 feedback, updating Prisma schema and migration scripts.

**Prompt**:
```
Update the database package to implement the event-sourcing approach for the Six-Dimensional Growth Model as described in V7DataSchemaDesign.md and v7TechSpec.md. Specifically:

1. Create the growth_events table schema in Prisma for storing append-only growth events
2. Set up materialized views (mv_entity_growth, v_card_state) that compute current states from event streams
3. Add JSONB growth_profile to the users table to store current growth state
4. Update the database methods in the package to work with this new schema
5. Create migration scripts to convert from the existing static tables (if any) to the new event-sourced approach
6. Implement helper functions for generating and consuming growth events

Focus on the PostgreSQL schema first, with consideration for how these changes affect Neo4j and Weaviate. The goal is to transition from static table-based growth tracking to the more flexible event-sourcing approach while maintaining backward compatibility during migration.
```

**Expected Output**:
- Updated Prisma schema with new tables and views
- Migration scripts for schema changes
- Updated database methods for the new schema
- Helper functions for event processing
- Documentation on the event-sourcing pattern implementation

**Verification Steps**:
- Run database migrations with `npx prisma migrate dev`
- Verify the new tables and views exist in the database
- Test event insertion and querying from materialized views
- Ensure backward compatibility with existing queries during transition

#### 1.2 Update Cognitive Agents for Event-Sourcing

**Objective**: Refactor the Dialogue Agent, Ingestion Analyst and other cognitive agents to use the new event-sourcing approach for tracking growth dimensions.

**Prompt**:
```
Update the cognitive agents (starting with the Dialogue Agent and Ingestion Analyst) to utilize the new event-sourcing approach for the Six-Dimensional Growth Model as implemented in the database package. Make the following changes:

1. For the Dialogue Agent:
   - Refactor any references to growth_dimensions or entity_growth_progress tables to use the new growth_events table
   - Update methods that check or modify card states to work with materialized views
   - Implement logic to emit growth events when meaningful interactions occur
   - **Integrate and utilize the specific "Orb's System Prompt (Gemini API)" detailed in OrbSystemPrompt.md.** This includes setting up the Dialogue Agent to use this system prompt for all LLM interactions, ensuring Orb's personality, tone, and boundaries are consistently applied.
   - Update prompts and templates to reflect the new approach

2. For the Ingestion Analyst:
   - Modify content analysis to generate growth events rather than direct dimension updates
   - Update entity extraction to align with the new schema
   - Ensure proper integration with the growth event stream

3. Create a new GrowthEventService:
   - Implement methods for creating standard growth events
   - Add functions for querying current growth state from materialized views
   - Include utilities for computing derived states (like card evolution state)

4. Update any relevant tools that interface with the growth model

Make sure to create unit tests that validate the new event-based workflow and verify that growth metrics are correctly computed from events.
```

**Expected Output**:
- Updated Dialogue Agent code
- Updated Ingestion Analyst code
- New GrowthEventService implementation
- Unit tests for the new event-based workflow
- Documentation on how agents interact with the event stream

**Verification Steps**:
- Run unit tests to verify event generation and processing
- Test conversation flows that should generate growth events
- Verify that growth metrics are correctly computed from events
- Check that card states are properly derived from the event stream

#### 1.3 Implement API Gateway and Backend-For-Frontend

**Objective**: Create the API Gateway implementation following the Backend-For-Frontend pattern to serve as a unified interface between frontend and backend services.

**Prompt**:
```
Implement the API Gateway (Backend-For-Frontend) service as described in V7MonoRepoDesign.md and v7TechSpec.md. This should provide a unified interface for the web and mobile clients to access backend services.

1. Set up the API Gateway foundation:
   - Create the api-gateway service using Express or Fastify
   - Implement request routing and validation
   - Set up GraphQL schema using Apollo Server or similar
   - Add authentication middleware and JWT validation
   - Implement CORS and security headers

2. Create core GraphQL resolvers:
   - Implement user authentication and profile resolvers
   - Create knowledge graph access resolvers (memory units, concepts)
   - Build growth event and progression resolvers
   - Add real-time subscription support for live updates

3. Develop client-specific optimizations:
   - Implement field filtering to reduce payload size
   - Create composite resolvers that batch multiple backend requests
   - Add device-specific response formatting
   - Implement caching strategies for common queries

4. Build integration with cognitive services:
   - Create conversation endpoints for Dialogue Agent
   - Implement file upload and processing for Ingestion Analyst
   - Add insight retrieval from Insight Engine
   - Create API for orb state management

5. Add monitoring and instrumentation:
   - Implement request logging and tracing
   - Add performance metrics collection
   - Create health check endpoints
   - Set up error monitoring and reporting

The API Gateway should abstract backend complexity and provide clients with exactly the data they need in the most efficient format, while also handling authentication and cross-cutting concerns.
```

**Expected Output**:
- Complete API Gateway service
- GraphQL schema and resolvers
- Authentication and authorization implementation
- Client-optimized response handling
- Monitoring and instrumentation
- Documentation on API usage

**Verification Steps**:
- Test GraphQL endpoints with sample queries
- Verify authentication works correctly
- Check performance and payload sizes
- Test real-time subscriptions
- Ensure proper error handling and validation
- Verify integration with cognitive services

#### 1.4 Implement Ingestion Analyst for V7

**Objective**: Implement or update the Ingestion Analyst agent to process raw user inputs into structured entities for the knowledge graph, using the new event-sourcing model.

**Prompt**:
```
Implement or update the Ingestion Analyst agent for the 2dots1line V7 monorepo, located in the `services/ingestion-analyst` package, to align with v7TechSpec.md and the event-sourcing approach. This agent is responsible for processing raw user inputs into structured knowledge graph entities.

Create or update the `ingestion-analyst` package with:
1. **Agent Core Implementation**:
   - Update input/output contracts from `shared-types` to align with V7 events model
   - Implement the tiered processing strategy (Tier 1, 2, and 3) for content analysis
   - Use the event-sourcing model for tracking processing and growth implications

2. **Content Processing**:
   - Implement content chunking functionality for various `source_type` values
   - Integrate with NER and embedding tools for entity extraction
   - Add relationship inference between entities
   - Generate appropriate growth events during processing

3. **Database Integration**:
   - Update database operations to work with the new event-sourcing schema
   - Add functions to emit events to the growth_events stream
   - Ensure correct creation of memory units, chunks, and concepts

4. **Media Processing**:
   - Add support for processing images, audio, and other media types
   - Extract text and entities from media files
   - Generate embeddings and relationships for media content

5. **Integration with Event System**:
   - Emit appropriate events during content processing
   - Subscribe to relevant events for updating materialized views
   - Update status tracking to use the event-sourcing approach

Ensure comprehensive error handling, logging, and unit tests. Focus on making the agent work efficiently with the new event-sourcing model while maintaining the tiered processing approach.
```

**Expected Output**:
- Updated Ingestion Analyst with V7 event-sourcing support
- Tiered processing implementation for different content types
- Media processing capabilities
- Integration with the event system
- Comprehensive unit tests

**Verification Steps**:
- Test processing of various content types
- Verify event generation during content analysis
- Check database integration with the new schema
- Test media file processing
- Verify tiered processing logic works correctly
- Confirm integration with other agents and the event system

#### 1.5 Create Backend API Shell & Initial Ingestion Endpoints

**Objective**: Establish the V7 backend API server (`apps/backend-api`) using Express.js and implement the first set of critical API endpoints for raw content ingestion, Memory Unit processing, and basic retrieval, leveraging the event-sourcing model and new services. This involves creating the server structure if not present from V4.

**Prompt**:
```
Implement the backend API shell and initial ingestion endpoints as described in v7TechSpec.md. This should include:

1. **Raw Content Ingestion**: Implement endpoints for ingesting raw content (text, images, audio) into the system.
2. **Memory Unit Processing**: Implement endpoints for processing memory units (e.g., summarizing, categorizing, tagging) based on the event-sourcing model.
3. **Basic Retrieval**: Implement endpoints for retrieving basic information about memory units and concepts.

Ensure these endpoints are properly documented and follow the V7 architecture principles of statelessness, clear contracts, and robust error handling.
```

**Expected Output**:
- Complete backend API shell
- Initial ingestion endpoints for raw content, memory units, and basic retrieval
- Documentation on API usage and endpoints
- Test suites for all APIs

**Verification Steps**:
- Test ingestion endpoints with sample data
- Verify data processing and retrieval endpoints
- Check error handling and response formats
- Ensure API documentation is up-to-date

### Sprint 2: Three-Layer UI Architecture & Backend Services (Week 2)

#### 2.1 Canvas Core Package Implementation

**Objective**: Create the canvas-core package to handle scene-agnostic 3D functionality like camera controls, lighting, and performance optimizations.

**Prompt**:
```
Implement the canvas-core package to serve as the foundation for the 3-layer UI architecture described in V7TechSpec.md and V7FullStackPRD.md. This package should:

1. Set up the base structure for a React Three Fiber (R3F) application:
   - Create a base Canvas component with configurable parameters
   - Implement camera setup with proper defaults for different scenes
   - Add basic lighting utilities (ambient, directional, etc.)
   - Set up performance monitoring and optimization hooks

2. Implement core controls:
   - Create a CameraControls component with support for both orbit and fly controls
   - Add support for touch input on mobile devices
   - Implement inertia and damping for smooth camera movement
   - Add camera constraints to prevent going below ground or too far from the center

3. Create a post-processing system:
   - Set up the R3F post-processing pipeline
   - Implement basic effects (bloom, ambient occlusion, etc.)
   - Create a performance-aware effects manager that can reduce quality on lower-end devices

4. Add a scene transition system:
   - Create utilities for smooth transitions between scenes
   - Implement cross-fade and camera animation helpers
   - Add hooks for scene lifecycle events (beforeEnter, afterExit, etc.)

5. Build performance optimization tools:
   - Create a LOD (Level of Detail) system for complex scenes
   - Implement frustum culling helpers
   - Add utilities for GPU instancing

This package should be thoroughly documented and include examples of basic usage. Focus on creating a solid foundation that all scenes (CloudScene, AscensionScene, GraphScene) can build upon.
```

**Expected Output**:
- Complete canvas-core package with R3F integration
- Base Canvas component with configuration options
- Camera controls with proper touch support
- Post-processing system with performance considerations
- Scene transition utilities
- Performance optimization tools
- Documentation and usage examples

**Verification Steps**:
- Create a simple test scene to verify basic functionality
- Test camera controls on both desktop and mobile
- Verify post-processing effects render correctly
- Test scene transitions
- Benchmark performance on various devices
- Verify touch input works correctly on mobile

#### 2.2 3D Cloud Scene Implementation

**Objective**: Implement the CloudScene component that serves as the home environment for the 3D Canvas Layer.

**Prompt**:
```
Implement the CloudScene component for the 3D Canvas Layer as described in V7TechSpec.md and V7FullStackPRD.md. This scene serves as the home or start state, depicting a serene flying-over-clouds environment with mountains. Use the canvas-core package as the foundation.

1. Set up the CloudScene component:
   - Create a scene component with proper structure and lifecycle hooks
   - Configure appropriate camera position and controls
   - Set up scene-specific lighting (soft directional light, ambient)

2. Implement volumetric clouds:
   - Create a shader-based cloud system using Three.js and GLSL
   - Implement realistic cloud movement and lighting
   - Add parameters for cloud density, speed, and color
   - Ensure clouds are performant (using instancing or other optimization techniques)

3. Add distant mountains:
   - Create a mountain horizon using displacement maps or low-poly models
   - Implement parallax effect for depth as the camera moves
   - Add subtle fog/atmospheric perspective

4. Create atmospheric effects:
   - Implement a sky gradient or skybox
   - Add subtle particles for atmospheric feeling (light rays, floating dust, etc.)
   - Create time-of-day variations (morning, midday, sunset) that can be controlled

5. Set up the Orb position and behavior:
   - Define a default Orb position near the horizon
   - Create a gentle floating animation for the idle state
   - Set up loading and transition states

Ensure all implementations are responsive and performant across devices, with graceful degradation for lower-end hardware. Include comments explaining shader code and performance considerations.
```

**Expected Output**:
- Complete CloudScene component
- Shader-based volumetric cloud system
- Mountain horizon with parallax effect
- Atmospheric effects and sky
- Default Orb positioning and animation
- Responsive performance across devices

**Verification Steps**:
- Render the scene in a test environment
- Verify clouds render correctly and move naturally
- Test camera movement through the scene
- Check performance on both high and low-end devices
- Verify scene appearance at different viewport sizes
- Test transitions into and out of the scene

#### 2.3 Orb Core Implementation

**Objective**: Create the orb-core package that handles the 3D Orb visualization and behavior across the application.

**Prompt**:
```
Implement the orb-core package that will power the 3D Orb Layer as described in V7TechSpec.md. The Orb is the visual representation of the Dialogue Agent (Dot) and should change appearance based on its state and context.

1. Create the base Orb component:
   - Implement a Three.js/R3F-based component for the Orb
   - **Design the Orb's 3D model based on the V7FullStackPRD.md description, incorporating a distinct core, shell, and halo structure.** The form should be non-anthropomorphic and abstract, allowing for complex visual expressions through light, color, and movement rather than facial features.
   - Implement realistic materials with subsurface scattering or similar effects, paying attention to how light interacts with the core, shell, and halo.
   - Create a component API that accepts state and animation parameters

2. Implement visual states from the specification:
   - Create different visual states for the Orb (e.g., idle, listening, processing, speaking, insight) **as detailed in V7FullStackPRD.md, including specific animations like inner core pulsing, sparkles for "engaged", or dimmer/slower for "Deep Reflection".**
   - **Implement color variations based on the Orb state mapping table provided or referenced in V7FullStackPRD.md (e.g., Journey Gold, Reflection Amethyst, Amethyst for listening, etc.).**
   - Create smooth transitions between states using animation
   - Use shader effects for glow, particles, or other visual feedback, ensuring these effects can be dynamically controlled to represent different states and intensities.

3. Build an animation system:
   - Create a base animation loop for the idle state (gentle floating/pulsing)
   - Implement reaction animations for state changes
   - Add subtle continuous movement to maintain visual interest
   - Ensure animations are synchronized with the application state

4. Add interaction capabilities:
   - Implement hover and click/touch interactions
   - Create visual feedback for user interaction
   - Add ripple or pulse effects for emphasis
   - Ensure the Orb is properly ray-castable for interaction

5. Optimize for performance:
   - Create different detail levels for various devices
   - Implement efficient shader techniques
   - Ensure the Orb renders well on mobile devices
   - Add options to reduce visual complexity on lower-end hardware

This package should expose a clean API that allows the application to easily control the Orb's state and appearance. Document the state machine and animation system thoroughly.
```

**Expected Output**:
- Complete orb-core package
- Base Orb component with realistic materials
- Multiple visual states with smooth transitions
- Animation system for continuous and reactive movement
- Interaction capabilities with visual feedback
- Performance optimizations for various devices
- Documentation of the Orb API and state machine

**Verification Steps**:
- Create a test environment to visualize the Orb
- Test transitions between all visual states
- Verify interactions work correctly
- Check performance on both desktop and mobile
- Verify the Orb appears correctly at different scales
- Test integration with the application state

#### 2.4 Backend Services Implementation

**Objective**: Implement and enhance backend services to support the updated architecture, focusing on event processing, graph operations, and vector services.

**Prompt**:
```
Implement and enhance backend services to support the V7 architecture as described in v7TechSpec.md, focusing on event processing, graph operations, and vector search capabilities.

1. Create the EventProcessor service:
   - **Implement event stream processing. For V7 MVP, this could leverage Redis streams or be built on top of the existing BullMQ (Redis) infrastructure mentioned in V7FullStackPRD.md for job queues, to manage and process events emitted by various services.** Consider if a more robust system like Kafka is needed for future scale, but prioritize integration with the established stack for now.
   - Create event handlers for different event types (growth, user activity, system)
   - Implement materialized view update logic
   - Add retry mechanisms and error handling
   - Set up monitoring and alerting for event processing

2. Enhance the GraphOperations service:
   - Implement advanced Neo4j graph query operations
   - Create community detection algorithms for constellation identification
   - Add path finding and graph traversal methods
   - Implement centrality and importance calculations
   - Create graph visualization data preparation functions

3. Update the VectorService:
   - Enhance Weaviate integration with hybrid search capabilities
   - Implement batched vector operations for performance
   - Add support for multimodal embeddings (text, image, audio)
   - Create cross-reference mechanisms between vector results and primary data
   - Implement vector clustering and categorization

4. Build the CacheService:
   - Implement Redis caching strategies for frequent operations
   - Create cache invalidation mechanisms
   - Add cache warming for common queries
   - Implement distributed locking for concurrent operations
   - Set up cache analytics and performance monitoring

Create comprehensive test suites for each service and ensure they work together seamlessly to support the event-sourcing and graph operations required by the frontend components.
```

**Expected Output**:
- Complete EventProcessor service
- Enhanced GraphOperations service
- Updated VectorService with multimodal support
- CacheService implementation
- Test suites for all services
- Documentation on service usage and interaction

**Verification Steps**:
- Run unit and integration tests for all services
- Test event processing with sample event streams
- Verify graph operations with test data
- Check vector search performance and accuracy
- Test caching efficiency and invalidation
- Verify services work together as expected

#### 2.5 Advanced Tool Implementation

**Objective**: Implement specialized deterministic tools covering vision processing, advanced graph operations, and statistical analysis to support the V7 system's cognitive capabilities.

**Prompt**:
```
Implement specialized deterministic tools within the appropriate `services/tools/` sub-packages as outlined in v7TechSpec.md. These tools will support the enhanced capabilities of the V7 system, particularly for the 3D visualization and event-sourcing model.

For each tool:
1. Define clear input/output contracts using shared-types
2. Implement stateless functionality with comprehensive error handling
3. Add telemetry for performance monitoring
4. Create region-specific versions where needed (US/China)
5. Register with the tool registry service

Implement the following tools:

1. Vision Tools:
   - `vision.analyze_image`: Extract entities, captions, and objects from images
   - `vision.generate_embedding`: Create visual embeddings for similarity search
   - `vision.classify_content`: Categorize image content for the growth model

2. Graph Tools:
   - `graph.community_detect`: Find constellations and communities in knowledge graph
   - `graph.spatial_layout`: Generate 3D positioning data for graph visualization
   - `graph.path_find`: Discover connections between entities

3. Statistical Tools:
   - `stats.correlate`: Find correlations between growth dimensions
   - `stats.trend_detect`: Identify patterns in growth event streams
   - `stats.cluster`: Group similar entities or events

4. Event Tools:
   - `events.filter`: Query and filter event streams
   - `events.aggregate`: Compute derived values from event streams
   - `events.project`: Generate projections based on event history

Ensure each tool is properly documented, tested, and follows the V7 architecture principles of statelessness, clear contracts, and robust error handling.
```

**Expected Output**:
- Comprehensive tool implementations for vision, graph, statistical, and event processing
- Clear input/output contracts for each tool
- Unit tests for all tools
- Integration with the tool registry
- Documentation on tool usage and configuration

**Verification Steps**:
- Test each tool with sample inputs
- Verify error handling with invalid inputs
- Check performance characteristics
- Test regional variants where applicable
- Verify tool discovery through the registry
- Test integration with cognitive agents

### Sprint 3: Card System & Dashboard (Week 3)

#### 3.1 Card Gallery Implementation

**Objective**: Implement the Card Gallery component for displaying and interacting with memory and concept cards, using the new event-sourced card state system.

**Prompt**:
```
Implement the Card Gallery component for the 2D Modal Layer as described in V7TechSpec.md and V7FullStackPRD.md. This component should display memory units and concepts as cards with support for the evolution states derived from the event-sourcing growth model.

1. Create the base CardGallery component:
   - Implement a responsive grid/field layout for cards
   - Add support for filtering and sorting cards by various criteria
   - Implement virtualized rendering for performance with many cards
   - Create smooth animations for card appearance and transitions

2. Implement the Card component:
   - Create a base Card component with glassmorphic styling
   - Implement visual variations for different card evolution states (Seed, Sprout, Bloom, Constellation, Supernova)
   - Add micro-interactions for hover, selection, and focus
   - Include placeholders for content loading

3. Build card content display:
   - Implement templates for different card types (memory, concept, derived artifact)
   - Create components for media previews (images, audio snippets)
   - Add support for growth dimension badges/indicators
   - Include relationship indicators (connected concepts, part of constellation)

4. Add interactions:
   - Implement card selection and detail view opening
   - Add support for basic card actions (edit, delete, share)
   - Create drag interactions for organizing cards if applicable
   - Implement card expansion/collapse animation

5. Connect to the backend:
   - Create hooks for fetching card data from the API
   - Implement real-time updates for card state changes
   - Add pagination/infinite scrolling for large collections
   - Ensure proper error handling and loading states

Focus on creating a visually appealing, performant implementation that accurately reflects the card evolution states derived from the event-sourcing model. Ensure the gallery works well on both desktop and mobile devices.
```

**Expected Output**:
- Complete CardGallery component
- Card component with evolution state visualizations
- Content display templates for different card types
- Interactive elements for card manipulation
- Backend integration with API hooks
- Responsive layout for various devices
- Documentation on how to use and extend the component

**Verification Steps**:
- Render the gallery with sample cards of different types
- Test filtering and sorting functionality
- Verify card appearance in different evolution states
- Test interactions (selection, detail view, actions)
- Check performance with a large number of cards
- Verify responsive layout on different screen sizes
- Test integration with the backend API

#### 3.2 Dashboard Modal Implementation

**Objective**: Create the Dashboard modal component that serves as the user's control center, displaying growth dimensions, insights, and suggestions.

**Prompt**:
```
Implement the Dashboard Modal component for the 2D Modal Layer as described in V7TechSpec.md and V7FullStackPRD.md. This should serve as the user's control center, summarizing their activity, growth progress, and providing personalized insights and suggestions.

1. Create the base DashboardModal component:
   - Implement a responsive modal container with glassmorphic styling
   - Create a scrollable layout with distinct sections
   - Add an animated entrance/exit for the modal
   - Implement responsive behavior for different screen sizes

2. Build the user summary section:
   - Create a greeting component that can display personalized messages from Orb
   - Implement activity statistics display (recent memories, interactions)
   - Add a timestamp or last activity indicator
   - Include user profile information if applicable

3. Implement the six-dimensional growth visualization:
   - Create a radar chart or alternative visualization for the six growth dimensions
   - Build progress bars or indicators for each dimension
   - Add tooltips or information displays explaining each dimension
   - Implement animations for dimension updates

4. Create the insights and suggestions section:
   - Build a component for displaying Orb's insights/observations
   - Implement suggestion cards with call-to-action buttons
   - Add a carousel or pagination for multiple insights
   - Create visual distinctions between different types of insights

5. Add to-do and challenge components:
   - Implement a challenges display aligned with growth dimensions
   - Create action items or to-do suggestions from Orb
   - Add completion tracking and feedback mechanisms
   - Include reward visualization for completed challenges

6. Connect to the backend:
   - Create hooks for fetching dashboard data
   - Implement data refreshing and real-time updates
   - Add proper loading states and error handling
   - Ensure efficient data fetching with batching or pagination

Ensure the dashboard is visually engaging while being informative and actionable. Focus on creating a personalized experience that reflects the user's unique journey and growth.
```

**Expected Output**:
- Complete DashboardModal component
- User summary section with greeting and statistics
- Six-dimensional growth visualization
- Insights and suggestions display
- Challenges and to-do components
- Backend integration with data fetching
- Responsive design for different devices
- Documentation on customizing and extending the dashboard

**Verification Steps**:
- Render the dashboard with sample data
- Verify growth dimension visualization appears correctly
- Test insights and suggestions display
- Check responsive behavior on different screen sizes
- Verify animations and transitions work smoothly
- Test integration with the backend API
- Verify real-time updates work correctly

#### 3.3 Card and Dashboard API Implementation

**Objective**: Develop the backend API endpoints and services to support Card and Dashboard functionality, ensuring efficient data retrieval and update mechanisms.

**Prompt**:
```
Develop the backend API endpoints and services to support the Card Gallery and Dashboard functionality as described in v7TechSpec.md. Ensure these endpoints efficiently retrieve and update data based on the event-sourcing model.

1. Implement Card API endpoints:
   - Create GraphQL queries and mutations for card operations
   - Implement pagination, filtering, and sorting for card listing
   - Add real-time subscriptions for card state changes
   - Create card detail endpoints with relationship data
   - Implement card creation, editing, and deletion endpoints

2. Build Dashboard API endpoints:
   - Create endpoints for six-dimensional growth visualization data
   - Implement user activity summary endpoints
   - Add insight recommendation API
   - Create challenge and to-do list endpoints
   - Implement notification and alert endpoints

3. Develop the CardService:
   - Create methods for retrieving cards with computed evolution states
   - Implement card categorization and tagging
   - Add relationship mapping between cards
   - Create card state transition processing
   - Implement card search and discovery algorithms

4. Build the DashboardService:
   - Implement growth dimension aggregation from event streams
   - Create insight selection and prioritization algorithms
   - Add challenge generation and tracking
   - Implement personalized dashboard content creation
   - Create notification generation and management

5. Enhance the Insight Engine integration:
   - Implement insightful connection discovery between cards
   - Create constellation completion recommendations
   - Add growth opportunity detection
   - Implement challenge suggestion based on growth profile
   - Create personalized insight delivery mechanisms

Ensure all implementations support the event-sourcing model and efficiently compute state from event streams rather than using static tables.
```

**Expected Output**:
- Complete Card API endpoints
- Dashboard API endpoints
- CardService implementation
- DashboardService implementation
- Enhanced Insight Engine integration
- Test suites for all APIs and services
- Documentation on API usage

**Verification Steps**:
- Test Card API endpoints with sample data
- Verify Dashboard API returns correct growth data
- Check CardService methods for computing card states
- Test DashboardService personalization features
- Verify Insight Engine integrations
- Test performance with large numbers of events
- Ensure real-time updates work correctly

#### 3.4 Worker Implementation

**Objective**: Implement necessary background worker processes for handling asynchronous tasks like embedding generation, event processing, and insight generation.

**Prompt**:
```
Implement the background worker processes needed for the V7 system as described in v7TechSpec.md. These workers will process jobs asynchronously to support the event-sourcing model and advanced features.

1. Create the Embedding Worker:
   - Process generation of embeddings for text, images, and other media
   - Implement storage of embeddings in Weaviate
   - Add status updates to the PostgreSQL database
   - Create batching for efficient processing
   - Implement retry logic and error handling

2. Develop the Event Processing Worker:
   - Process event streams to update materialized views
   - Implement aggregation of events for dashboard metrics
   - Add support for event replay and history tracking
   - Create efficient batch processing of events
   - Implement monitoring and alerting

3. Build the Insight Generation Worker:
   - Process scheduled and triggered insight generation
   - Implement pattern detection across event streams
   - Add community detection for constellations
   - Create hypothesis generation and testing
   - Implement priority-based job processing

4. Implement the Media Processing Worker:
   - Process uploaded images, audio, and video files
   - Extract text and entities from media
   - Generate captions and descriptions
   - Create thumbnails and previews
   - Implement format conversion and optimization

5. Create the Scheduler Service:
   - Implement cron-based scheduling of recurring jobs
   - Add support for dynamic schedule adjustments
   - Create job definition management
   - Implement monitoring of job performance
   - Add failure detection and recovery

Ensure all workers have comprehensive error handling, retries with backoff, monitoring, and proper integration with the message queue system **(e.g., BullMQ with Redis, as suggested in V7FullStackPRD.md).**
```

**Expected Output**:
- Complete set of worker implementations
- Integration with message queue system
- Error handling and retry logic
- Monitoring and alerting setup
- Documentation on worker configuration and operation

**Verification Steps**:
- Test each worker with sample jobs
- Verify error handling and retry behavior
- Check monitoring and logging functionality
- Test performance under load
- Verify integration with other system components
- Ensure workers can be scaled horizontally

### Sprint 4: 3D Graph Visualization & Knowledge Graph Services (Week 4)

#### 4.1 Graph Visualization Core

**Objective**: Create the core infrastructure for visualizing the knowledge graph in 3D space as the GraphScene.

**Prompt**:
```
Implement the core infrastructure for the 3D knowledge graph visualization (GraphScene) as described in V7TechSpec.md and V7FullStackPRD.md. This should create the foundation for visualizing the user's memories and concepts as celestial objects in 3D space.

1. Build the graph data structure:
   - Create TypeScript interfaces for graph nodes and edges
   - Implement a graph manager class to handle nodes, edges, and operations
   - Add support for node types (memory stars, concept nebulae, etc.)
   - Build spatial organization algorithms (force-directed layout or similar)

2. Create the base visualization components:
   - Implement a Three.js/R3F setup for the graph visualization
   - Create a dark space background with distant stars
   - Build camera controls optimized for graph navigation
   - Add basic lighting suitable for a cosmic environment

3. Implement the node visualization:
   - Create base classes for different node types (memory stars, concept nebulae)
   - Implement shader-based glow and pulsing effects
   - Add size, color, and intensity variation based on metadata
   - Create hover and selection states for nodes

4. Build edge visualization:
   - Implement curved connections between nodes
   - Create animated flow effects along connections
   - Add edge types with different visual styles
   - Optimize for many connections using instancing or similar techniques

5. Implement level-of-detail:
   - Create a system for dynamically loading/unloading nodes based on camera
   - Implement simplified representations for distant nodes
   - Add clustering for groups of related nodes when zoomed out
   - Create smooth transitions between detail levels

6. Add interaction capabilities:
   - Implement node selection and focus
   - Create camera animation to focus on selected nodes
   - Add zooming to reveal more detail
   - Implement drag operations for node organization if applicable

Use the canvas-core package as the foundation and ensure the implementation is performant with potentially hundreds of nodes.
```

**Expected Output**:
- Graph data structure and manager
- Base visualization setup with space background
- Node visualization components for different types
- Edge visualization with animated effects
- Level-of-detail system for performance
- Interaction capabilities
- Documentation on extending the visualization

**Verification Steps**:
- Render a sample graph with different node types
- Test navigation and camera controls
- Verify nodes and edges appear correctly
- Check level-of-detail system works as the camera moves
- Test performance with a large number of nodes
- Verify interactions (selection, focus, etc.) work correctly
- Test on both high and low-end devices

#### 4.2 Community Visualization

**Objective**: Extend the graph visualization to support communities and constellations, visualizing clusters of related concepts.

**Prompt**:
```
Extend the graph visualization to support communities (constellations) as described in V7TechSpec.md and V7FullStackPRD.md. This should allow the visualization of clusters of related concepts as constellations within the cosmic graph.

1. Implement community visualization:
   - Create visual representation for communities as halos or outlines
   - Implement shader effects for constellation boundaries
   - Add visual distinction between different communities
   - Create smooth animations for community appearance

2. Build community detection integration:
   - Connect with Neo4j community detection results from the backend
   - Implement methods to assign nodes to communities
   - Create visual grouping and placement algorithms
   - Add support for overlapping community membership

3. Implement constellation effects:
   - Create special visual effects for completed constellations
   - Add particles or glow effects to highlight achievements
   - Implement animations for constellation activation
   - Create interactive elements for constellation details

4. Add community navigation:
   - Implement methods to focus on an entire community
   - Create smooth camera transitions between communities
   - Add UI elements to select communities
   - Implement filtering by community

5. Build community details presentation:
   - Create an information display for community metadata
   - Implement statistics and summary for constellations
   - Add related challenges or insights
   - Create visual storytelling for the community theme

6. Optimize for performance:
   - Implement efficient rendering for community effects
   - Add level-of-detail for community visualization
   - Create fallbacks for lower-end devices
   - Ensure smooth transitions and animations

Ensure the community visualization enhances the graph experience without overwhelming the user, balancing visual impact with clarity and performance.
```

**Expected Output**:
- Community visualization with boundary effects
- Backend integration with community detection
- Constellation achievement effects
- Community navigation and focus
- Information display for communities
- Performance optimizations
- Documentation on community visualization

**Verification Steps**:
- Render a graph with multiple communities
- Verify community boundaries are visible and distinct
- Test navigation between communities
- Check constellation effects for completed communities
- Verify performance with multiple communities
- Test community details display
- Ensure consistent appearance across devices

#### 4.3 Knowledge Graph Service Enhancement

**Objective**: Enhance the backend Knowledge Graph service to support the advanced visualization and graph operations needed for the 3D graph view.

**Prompt**:
```
Enhance the Knowledge Graph service to support the advanced visualization and graph operations needed for the 3D graph view as described in v7TechSpec.md. Focus on efficient data retrieval, community detection, and real-time updates.

1. Implement Graph API endpoints:
   - Create GraphQL queries for graph structure and metadata
   - Implement node and edge retrieval with pagination
   - Add filtering by node types, relationships, and properties
   - Create viewport-based graph retrieval (only nodes in view)
   - Implement real-time subscriptions for graph updates

2. Enhance Neo4j integration:
   - Implement advanced Cypher queries for community detection
   - Create efficient traversal algorithms for large graphs
   - Add spatial indexing for 3D visualization
   - Implement graph metrics calculation (centrality, clustering)
   - Create graph summarization algorithms for overview visualization

3. Build graph layout services:
   - Implement force-directed layout algorithms
   - Create hierarchical layout options
   - Add clustering and grouping mechanisms
   - Implement layout persistence and restoration
   - Create progressive loading algorithms for large graphs

4. Develop constellation management:
   - Implement constellation detection and naming
   - Create constellation metadata management
   - Add achievement tracking for constellation completion
   - Implement constellation suggestion algorithms
   - Create visual styling data for constellations

5. Build graph synchronization systems:
   - Implement efficient delta updates for graph changes
   - Create background synchronization processes
   - Add conflict resolution for concurrent edits
   - Implement graph versioning and history
   - Create performance monitoring for graph operations

The Knowledge Graph service should provide all the data needed for the 3D visualization while ensuring performance and scalability for large knowledge graphs.
```

**Expected Output**:
- Enhanced Graph API endpoints
- Advanced Neo4j integration
- Graph layout services
- Constellation management implementation
- Graph synchronization systems
- Test suites for all components
- Documentation on service usage

**Verification Steps**:
- Test Graph API endpoints with sample data
- Verify community detection algorithms
- Check graph layout algorithms for visual quality
- Test constellation management functions
- Verify real-time updates and synchronization
- Performance test with large graphs
- Ensure integration with frontend visualization

#### 4.4 Retrieval Planner Implementation

**Objective**: Implement the Retrieval Planner agent to orchestrate hybrid retrieval strategies for context gathering, with support for V7's event-sourcing and 3D visualization.

**Prompt**:
```
Implement the Retrieval Planner agent as described in v7TechSpec.md. This agent will orchestrate hybrid retrieval strategies combining vector search, graph traversal, and traditional queries to gather context for user queries and visualization needs.

1. Create the core agent structure:
   - Implement input/output contracts from shared-types
   - Build the query analysis, planning, and execution pipeline
   - Create strategy selection logic based on query type and constraints
   - Add context bundling and response formatting

2. Implement vector search integration:
   - Create semantic retrieval methods using Weaviate
   - Build hybrid vector-filtering queries
   - Add multimodal embedding support (text, image)
   - Implement relevance scoring and ranking

3. Develop graph traversal capabilities:
   - Create graph query builders for Neo4j
   - Implement path finding and network expansion algorithms
   - Add community-aware traversal
   - Create relevance scoring for graph results

4. Build event stream integration:
   - Implement retrieval from growth event history
   - Create temporal filtering and relevance scoring
   - Add materialized view query optimization
   - Build result merging from events and graph data

5. Create real-time and visualization support:
   - Implement viewport-based retrieval for 3D visualization
   - Add detail level control based on zoom/focus
   - Create progressive loading strategies
   - Build caching mechanisms for frequent queries

6. Implement result post-processing:
   - Create reranking and deduplication logic
   - Add contextual enhancement of results
   - Build summarization for large result sets
   - Implement response size optimization

Ensure the Retrieval Planner can efficiently support both user conversation context needs and 3D visualization data requirements with appropriate caching and optimization.
```

**Expected Output**:
- Complete Retrieval Planner agent implementation
- Hybrid search strategies combining vector, graph, and traditional queries
- Support for visualization-specific retrieval patterns
- Efficient context bundling for conversation and UI needs
- Comprehensive test suite and documentation

**Verification Steps**:
- Test different query types and strategies
- Verify hybrid vector-graph search results
- Check performance with large knowledge graphs
- Test visualization-specific retrieval patterns
- Verify caching effectiveness
- Ensure integration with Dialogue Agent and visualization systems

#### 4.5 Insight Engine Enhancement

**Objective**: Enhance the Insight Engine to work with the event-sourcing system and generate meaningful patterns and observations from the knowledge graph.

**Prompt**:
```
Enhance the Insight Engine to work with the event-sourcing system as described in v7TechSpec.md and V7FullStackPRD.md. The Insight Engine should analyze the knowledge graph to find patterns, connections, and hypotheses that provide value to the user.

1. Update the Insight Engine core:
   - Refactor the Insight Engine to work with the event-sourcing model
   - Implement analysis of growth events for pattern detection
   - Create algorithms for finding correlations and anomalies
   - Build a prioritization system for insights based on relevance

2. Generate V7 Specific Insight Types:
   - **Implement the generation of "Orb's Dream Cards" as described in V7FullStackPRD.md, using LLMs for creative content.**
   - **Implement the generation of "Mystery Challenges" aligned with user growth areas, also described in V7FullStackPRD.md.**
   - Ensure these specific artifact types are stored as `DerivedArtifacts` and can be surfaced to the user.

3. Implement community detection:
   - Enhance the graph community detection algorithms
   - Create meaningful naming and theme extraction for communities
   - Implement metrics for community cohesion and significance
   - Add detection of emerging communities and growing connections

4. Build the metaphorical connection system:
   - Implement LLM-based metaphor generation
   - Create relevance scoring for potential metaphors
   - Add context-aware filtering to ensure appropriateness
   - Implement presentation formatting for metaphorical insights

5. Create the hypothesis generation and testing:
   - Implement hypothesis formation from observed patterns
   - Create verification mechanisms against existing data
   - Add confidence scoring for hypotheses
   - Implement storage and tracking of hypothesis evolution

6. Enhance the insight delivery system:
   - Create an insight queue management system
   - Implement contextual triggering of insight presentation
   - Add formatting for different insight types (pattern, connection, hypothesis)
   - Create interactive elements for user feedback on insights

7. Integrate with the event-sourcing system:
   - Implement listeners for relevant growth events
   - Create insight-specific events when insights are generated
   - Build processing for insight interaction events
   - Add impact tracking of insights on user growth

Focus on creating a system that delivers genuinely valuable insights that feel personal and meaningful, avoiding obvious or trivial observations.
```

**Expected Output**:
- Updated Insight Engine core that works with event-sourcing
- Enhanced community detection algorithms
- Metaphorical connection generation system
- Hypothesis generation and testing
- Insight delivery and presentation system
- Event-sourcing integration
- Documentation on the insight generation process

**Verification Steps**:
- Test pattern detection with sample data
- Verify community detection produces meaningful results
- Check metaphorical connections for relevance
- Test hypothesis generation and confidence scoring
- Verify insight delivery in different contexts
- Test integration with the event-sourcing system
- Assess insight quality and usefulness with test users

#### 4.6 End-to-End Integration

**Objective**: Complete the integration of all components into a cohesive system, ensuring seamless data flow and user experience.

**Prompt**:
```
Integrate all V7 components into a cohesive system as described in V7TechSpec.md and V7FullStackPRD.md, ensuring seamless data flow and user experience across the frontend and backend.

1. Complete the UI layer integration:
   - Finalize integration between the 3D Canvas, 2D Modal, and Orb layers
   - Implement state synchronization across all UI components
   - Create a unified loading and error handling system
   - Add final polish to transitions and animations

2. Integrate the cognitive agents:
   - Finalize the communication between all cognitive agents
   - Implement end-to-end workflows for key user journeys
   - Optimize performance for critical paths
   - Add telemetry and logging for system monitoring

3. Implement real-time updates:
   - Set up WebSocket connections for live updates
   - Create event handling for real-time UI updates
   - Implement efficient data synchronization
   - Add offline capability where appropriate

4. Complete the event-sourcing integration:
   - Finalize all event types and processors
   - Implement comprehensive event logging and replay
   - Create monitoring for event processing
   - Add tools for debugging event flows

5. Build the user onboarding experience:
   - **Implement the detailed 10-minute onboarding journey as scripted in the "Sample onboarding script" section of V7FullStackPRD.md.** This includes:
     - The initial cinematic flight scene responsive to scrolling.
     - Orb's appearance, initial dialogue, and the low-friction reflection sliders/choices.
     - The "Cosmic Reveal" with the first insight and constellation.
     - The first memory entry flow (text, voice, image options) and its visualization as a star.
     - The "Create account to save" prompt integrated seamlessly.
     - The instant personalized dashboard post-signup.
     - The "Viral Moment" with the auto-generated postcard.
   - **Ensure Orb's behavior, text, visual cues (color, glow, animation), and emotional tone strictly follow the "ONBOARDING ORB SCRIPT: 'The First Flight'" detailed in V7FullStackPRD.md.**
   - Implement the necessary scene transitions (e.g., scroll-driven ascension, zoom-outs) and UI elements described in the onboarding script.
   - The goal is to replicate the specified emotional and narrative journey for the new user.

6. Perform system-wide optimization:
   - Conduct performance profiling across all components
   - Implement critical path optimizations
   - Add caching strategies for common operations
   - Create performance monitoring for production

Ensure the integrated system creates a cohesive, magical experience that aligns with the V7 design vision while maintaining performance and reliability.
```

**Expected Output**:
- Fully integrated UI with synchronized state
- Complete cognitive agent workflows
- Real-time update system
- Comprehensive event-sourcing implementation
- User onboarding experience
- Performance optimizations
- Documentation on the integrated system

**Verification Steps**:
- Test end-to-end user journeys
- Verify real-time updates work correctly
- Check performance across all components
- Test the onboarding experience
- Verify event processing and synchronization
- Conduct usability testing with target users
- Perform load testing and stress testing

#### 4.7 Security Implementation & Hardening

**Objective**: Implement comprehensive security measures across the V7 system, focusing on authentication, authorization, data protection, and input validation.

**Prompt**:
```
Implement and enhance security measures across the V7 system as described in v7TechSpec.md. Focus on ensuring robust authentication, authorization, data protection, and input validation for all components.

1. Enhance authentication and authorization:
   - Implement JWT-based authentication for API Gateway
   - Create role-based access control systems
   - Add user session management with secure token handling
   - Implement strong password policies and account recovery
   - Create audit logging for authentication events

2. Implement data protection measures:
   - Add encryption at rest for sensitive database fields
   - Implement encryption in transit using TLS 1.3
   - Create data residency enforcement for multi-region deployment
   - Add personal data management for compliance (e.g., GDPR)
   - Implement secure data deletion workflows

3. Enhance input validation and sanitization:
   - Add comprehensive API request validation
   - Implement output encoding to prevent XSS
   - Create rate limiting and throttling for API endpoints
   - Add protection against common attacks (SQL injection, CSRF)
   - Implement file upload validation and scanning

4. Secure the cognitive agent system:
   - Add prompt injection protection for LLMs
   - Implement usage limits and monitoring
   - Create data access restrictions for agents
   - Add output filtering for sensitive information
   - Implement agent action auditing

5. Develop security monitoring and incident response:
   - Create security event logging across all components
   - Implement intrusion detection mechanisms
   - Add automated threat monitoring
   - Create incident response workflows
   - Implement regular security scanning

Ensure all security measures are implemented consistently across US and China deployments while respecting regional requirements.
```

**Expected Output**:
- Enhanced authentication and authorization system
- Data protection mechanisms for sensitive information
- Comprehensive input validation and sanitization
- Secure cognitive agent implementation
- Security monitoring and incident response procedures
- Documentation on security measures and practices

**Verification Steps**:
- Test authentication and authorization flows
- Verify data protection mechanisms (encryption, access controls)
- Conduct security testing (penetration testing, vulnerability scanning)
- Test cognitive agent security measures
- Verify security monitoring and alerting
- Review security documentation and incident response procedures

#### 4.8 Implement Chat Interface (`ChatModal`)

**Objective**: Implement the primary chat interface (`ChatModal`) within the web application as a 2D modal, enabling users to interact with the Dialogue Agent. This involves building the UI components, integrating with the Dialogue Agent API endpoints, and ensuring a responsive and accessible user experience as per `v7TechSpec.md` (Sections 2.4.2, 4.3.5, 4.5, 4.8) and `v7UIUXDesign.md` (Sections 3.2.4, 4.2, 6.2, 6.4).

**Prompt**:
```
Implement the primary chat interface (`ChatModal`) within the web application as a 2D modal, enabling users to interact with the Dialogue Agent. This involves building the UI components, integrating with the Dialogue Agent API endpoints, and ensuring a responsive and accessible user experience as per `v7TechSpec.md` (Sections 2.4.2, 4.3.5, 4.5, 4.8) and `v7UIUXDesign.md` (Sections 3.2.4, 4.2, 6.2, 6.4).

1. Create the ChatModal component:
   - Implement a responsive modal layout with input fields for user input and response display.
   - Add a send button for submitting messages.
   - Implement real-time messaging functionality using WebSocket.
   - Ensure the ChatModal is accessible and keyboard navigable.
   - Add a close button for closing the modal.

2. Integrate with the Dialogue Agent API:
   - Create an API endpoint for chat messages.
   - Implement the Dialogue Agent's response generation logic.
   - Ensure the Dialogue Agent's state is preserved across sessions.
   - Implement error handling for API communication failures.

3. Implement accessibility features:
   - Add ARIA attributes for screen reader support.
   - Ensure focus management is clear and predictable.
   - Implement keyboard navigation for input fields.
   - Add alt text to images for screen readers.

4. Test the ChatModal in different scenarios:
   - Ensure the ChatModal is responsive and accessible on different devices (desktop, tablet, mobile).
   - Test the input field's character limit and response length.
   - Verify the ChatModal's focus management and tab order.
   - Check the ChatModal's error handling and user messaging.

5. Conduct usability testing:
   - Test the ChatModal with different user input types (text, voice, image) and modalities (keyboard, voice command, gesture).
   - Gather feedback on the ChatModal's usability and accessibility.
   - Make adjustments based on user testing results.

6. Implement localization:
   - Add language-specific content to the ChatModal.
   - Ensure the ChatModal's text is translatable.
   - Test the ChatModal's localization in different languages.

Ensure the ChatModal is a seamless and intuitive part of the web application, providing a clear and consistent user experience.
```

**Expected Output**:
- Complete ChatModal component
- Real-time messaging functionality
- Accessibility features implemented
- Usability testing conducted
- Localization support added
- Integration with Dialogue Agent API
- Documentation on ChatModal implementation

**Verification Steps**:
- Test ChatModal on different devices and screen sizes
- Verify real-time messaging works correctly
- Check accessibility features (keyboard navigation, screen reader support)
- Test error handling and user messaging
- Verify localization support
- Conduct usability testing with target users

### Sprint 5: Animation & Transition System (Week 5)

#### 5.1 Scene Transition System

**Objective**: Implement the system for transitioning between different 3D scenes, particularly the Ascension Scene for moving between Cloud and Graph scenes, ensuring a smooth, cinematic, and emotionally resonant experience as detailed in `v7TechSpec.md` (Sections 2.4.1, 4.2.1, 4.2.2, 4.2.4) and `v7UIUXDesign.md` (Sections 3.1, 3.2.1, 3.2.2, 3.2.3, 5.4).

**Prompt**:
```
Implement the scene transition system and the Ascension Scene as described in V7TechSpec.md (Sections 2.4.1 - User Interface Layer, 4.2.1 - Canvas Architecture, 4.2.2 - Scene Implementations, particularly AscensionScene, 4.2.4 - Performance Optimization Strategy) and V7FullStackPRD.md. Refer to v7UIUXDesign.md (Sections 3.1 - Canvas Structure, 3.2.1 - CloudScene, 3.2.2 - AscensionScene, 3.2.3 - GraphScene, and 5.4 - Orb Scene-Specific Behavior for AscensionScene) for detailed visual and experiential requirements. This should create smooth, cinematic transitions between the CloudScene and GraphScene, emphasizing the journey metaphor and the narrative intent of "crossing from outer landscape into inner meaning space."

1. Build the scene transition framework:
   - Create a `SceneManager` component (as per `v7TechSpec.md` 4.2.1 and `v7UIUXDesign.md` 3.1) to handle scene switching between `CloudScene`, `AscensionScene`, and `GraphScene`.
   - Implement transition timing, easing (e.g., `easeInOutExpo` for ascent, `easeOutCirc` for deceleration as per `v7UIUXDesign.md` 3.2.2), and sequencing for a choreographed experience.
   - Add event hooks for transition stages (start, atmospheric acceleration, tunneling & shear, boundary break/flash, arrival, complete) aligned with `v7UIUXDesign.md` 3.2.2.
   - Create a cross-fade or other appropriate blending system for scene elements to ensure visual continuity.
   - Ensure the framework supports the "Warp & Glide" motion pattern (`v7UIUXDesign.md` Motion Patterns).

2. Implement the Ascension Scene:
   - Build the `AscensionScene` as a transitional scene representing the journey from clouds to space, following `v7TechSpec.md` 4.2.2.2 and `v7UIUXDesign.md` 3.2.2.
   - Create atmospheric effects that gradually shift from clouds (layered, alpha-blended, scrolling) to stars (faint, expanding parallax starfield).
   - Implement camera animation for the ascent (vertical diagonal vector, speed phases: slow drift → increasing acceleration → sudden stillness).
   - Add particle effects for movement sensation (subtle turbulence, speed lines, particle sparkles fading in).
   - Implement the "Boundary Break / Flash" effect (cloud veil tears, flash bloom white → immediate dark silence) as a key moment.
   - Ensure the scene conveys the narrative intent of a "threshold moment" and "spiritual slingshot".

3. Create the Orb transformation during Ascension:
   - Implement the Orb's transformation into a stream of light particles or an elongated comet shape, as per `v7UIUXDesign.md` 5.4 (AscensionScene behavior).
   - Ensure the Orb stays just ahead of the camera, leading the viewer upward.
   - Synchronize Orb's acceleration and deceleration with the scene's camera movement.
   - Implement lighting changes on the Orb that reflect the environmental shift from atmospheric to cosmic.
   - Coordinate timing precisely with scene transition phases.

4. Add audio and haptic feedback:
   - Implement audio cue support for transitions, including wind sounds fading and low-frequency sounds building during "Tunneling & Shear" (`v7UIUXDesign.md` 3.2.2).
   - Integrate subtle haptic feedback for mobile devices, if applicable, to enhance the sensation of movement and impact.
   - Implement smooth ambient sound changes between scenes (e.g., wind in `CloudScene` to silence/subtle hum in `GraphScene`).
   - Ensure all audio transitions are synchronized with visual cues and transition phases.

5. Implement interactive elements (referencing `v7UIUXDesign.md` 6.2 Navigation Paradigms):
   - Add gesture support for triggering transitions (e.g., Two-Finger Swipe Down for Ascension from `CloudScene`/`GraphScene` to `GraphScene`/`CloudScene` respectively on mobile/tablet).
   - Create abort/reverse capabilities for transitions if feasible and aligned with UX.
   - Consider transition speed control based on input, if it enhances user experience without breaking the narrative.
   - Add fallback UI buttons (e.g., in HUD as per `v7UIUXDesign.md` 4.3) for accessibility and alternative navigation.

6. Optimize the transition experience (referencing `v7TechSpec.md` 4.2.4):
   - Implement preloading mechanisms for the destination scene's assets (`GraphScene` or `CloudScene`).
   - Utilize progressive loading for detailed elements to maintain smoothness.
   - Display placeholder or simplified versions of complex objects during the transition if necessary.
   - Ensure smooth frame rates (target 60fps) throughout transitions on target devices.
   - Implement adaptive transition duration or detail based on device performance if required.

The transition system should feel cinematic and emotionally resonant, aligning with the "purposeful choreography" principle from `v7UIUXDesign.md`, while maintaining performance across devices.
```

**Expected Output**:
- A fully functional `SceneManager` component integrated into the `Canvas3D` architecture.
- A complete `AscensionScene` implementation with all specified visual effects (volumetric clouds, starfields, particle effects, boundary break flash), camera choreography, and atmospheric shifts, as per `v7TechSpec.md` and `v7UIUXDesign.md`.
- Orb transformation effects specific to `AscensionScene` (e.g., light stream/comet) synchronized with the transition.
- Integrated audio and haptic feedback enhancing the transition's immersiveness.
- Functional interactive elements for triggering transitions (gestures, fallback buttons).
- Optimized transition performance with asset preloading and adaptive strategies.
- Comprehensive documentation on the scene transition system, including its architecture, how to trigger transitions, and customization options.
- Adherence to `v7UIUXDesign.md` visual and motion specifications for `CloudScene` (3.2.1), `AscensionScene` (3.2.2), and initial `GraphScene` (3.2.3) elements visible during transition.

**Verification Steps**:
- Test transitions between `CloudScene` and `GraphScene` via the `AscensionScene` in both directions.
- Verify all visual effects (clouds, stars, particles, flash, Orb transformation) appear correctly and are synchronized with the transition phases as per `v7UIUXDesign.md`.
- Confirm camera movement, speed changes, and easing match the specifications in `v7UIUXDesign.md` (3.2.2).
- Test gesture-based transition triggering on relevant devices and fallback UI buttons.
- Measure and verify performance (frame rates, load times) during transitions on target desktop and mobile environments.
- Ensure transitions are smooth and without visual stutters or artifacts.
- Test accessibility features for transitions, ensuring they can be initiated and understood by users with disabilities.
- Verify that the `AscensionScene` effectively serves as a "meaningful loading/transition metaphor" (`v7TechSpec.md` 2.5).
- Confirm ambient audio transitions smoothly and haptics (if implemented) are appropriate.
- Review code for adherence to `SceneManager` architecture and `AscensionScene` component structure from `v7TechSpec.md` (4.2.1, 4.2.2.2).

#### 5.2 Orb Animation System

**Objective**: Enhance the Orb's animation system to support complex emotional states and interactive behaviors, as defined in `v7TechSpec.md` (Sections 2.4.1 - 3D Orb Layer, 4.6 - 3D Orb Implementation) and `v7UIUXDesign.md` (Section 5 - The Orb).

**Prompt**:
```
Enhance the Orb's animation system as described in V7TechSpec.md (Sections 2.4.1 - 3D Orb Layer, 4.6 - 3D Orb Implementation, including 4.6.1 Orb Architecture, 4.6.2 Orb Shader, 4.6.3 Emotional States, 4.6.4 Visual States, 4.6.5 Orb Effects System) and V7FullStackPRD.md. Refer to v7UIUXDesign.md (Section 5 - The Orb, including 5.1 Visual Anatomy, 5.2 State Changes & Color Behavior, 5.3 Motion Specification, 5.4 Scene-Specific Behavior) and the OrbSystemPrompt.md for detailed persona and behavioral requirements. This should make the Orb feel alive, emotionally resonant, and responsive to user interactions and context.

1. Expand the Orb's state machine:
   - Implement a comprehensive state machine for Orb behaviors, reflecting `v7TechSpec.md` 4.6.4 (Visual States) and `v7UIUXDesign.md` 5.2 (State Changes & Color Behavior) and 5.3 (Motion Specification). Examples: Idle, Listening, Thinking, Speaking, Insight, Celebration, Dormant.
   - Create smooth transitions between emotional (`v7TechSpec.md` 4.6.3) and functional states, utilizing color and motion as per `v7UIUXDesign.md` 5.2 & 5.3.
   - Implement intermediate/blending states for smooth visual transitions (e.g., using `orbStore` transitionToState).
   - Ensure the state machine can be driven by the Dialogue Agent and reflects Orb's persona in `OrbSystemPrompt.md`.

2. Create advanced visual effects and shaders:
   - Enhance the Orb shader (`v7TechSpec.md` 4.6.2) to support dynamic changes in base color, accent color, noise scale/intensity, glow, and Voronoi patterns based on `v7UIUXDesign.md` 5.1, 5.2 and `v7TechSpec.md` 4.6.3.
   - Implement particle systems for expressive moments (e.g., "spark pulse outward" for Insight/Prompt, "particle emissions" for Celebration, trailing mist in `CloudScene` - `v7UIUXDesign.md` 5.2, 5.4).
   - Add ripple, wave, and pulse effects for emphasis (e.g., rhythmic pulsing for Speaking, `v7TechSpec.md` 4.6.4).
   - Implement color blending for mixed emotional states, ensuring visual coherence.
   - Develop the `OrbEffect` system (`v7TechSpec.md` 4.6.5) for temporary effects like pulse rings and energy trails.

3. Build an animation sequencing and blending system:
   - Implement animation clips or procedural animations for different behaviors (e.g., Idle: floating, slow rotation; Hovered: scale up, glow pulse; Engaged: color transition, core pulse - `v7UIUXDesign.md` 5.3).
   - Create a blending system for smoothly transitioning between these animation states.
   - Add procedural modifications (e.g., using simplex noise for slight position changes - `v7TechSpec.md` 4.6.1) to prevent robotic repetition and enhance liveliness.
   - Implement timing controls for synchronization with conversation rhythm and Dialogue Agent cues.

4. Add reactive behaviors:
   - Create immediate visual responses to user actions (e.g., Orb scaling up on hover/focus - `v7UIUXDesign.md` 5.3).
   - Implement attention-directing movements (e.g., Orb sending sparkles to nearby memory nodes in `GraphScene` - `v7UIUXDesign.md` 5.4).
   - Develop varied idle behaviors based on context and scene (`v7UIUXDesign.md` 5.4 - e.g., gentle pulsing in `CloudScene`, orbiting in `GraphScene`).
   - Implement "breathing" or pulsing for passive states (e.g., sine wave oscillation, aura flicker - `v7UIUXDesign.md` 5.3 Idle State).

5. Implement conversation visualization:
   - Create visual patterns that match speech or text rhythm (e.g., rhythmic pulsing synchronized with voice - `v7TechSpec.md` 4.6.4 Speaking).
   - Implement "listening" visualizations (e.g., increased surface definition, subtle inward flow - `v7TechSpec.md` 4.6.4 Listening).
   - Add thinking/processing animations (e.g., internal swirling patterns, concentrated energy - `v7TechSpec.md` 4.6.4 Thinking).
   - Create emphasis effects for important points or when Orb shares insights (e.g., "Journey Gold" color, spark pulse outward - `v7UIUXDesign.md` 5.2 Insight/Prompt).

6. Integrate with the Dialogue Agent:
   - Create a robust API or event system for the Dialogue Agent to control Orb's emotional and visual state (`v7TechSpec.md` 4.7.1, `OrbStateManager` in 5.3.3).
   - Implement logic in the Dialogue Agent or `OrbStateManager` to parse emotional cues and state directives from agent responses.
   - Develop automatic state selection based on conversation context, aligning with `OrbSystemPrompt.md` (e.g., Orb's adaptive role modes).
   - Create debugging tools for visualizing Orb's current state and recent state transitions.

Ensure the animation system is efficient (`v7UIUXDesign.md` 5.5 Performance Consideration - mobile optimization, disabling effects when out of focus) and maintains consistent frame rates while creating an expressive, emotionally resonant experience true to Orb's character.
```

**Expected Output**:
- An expanded Orb state machine in `orbStore` or a dedicated manager, capable of handling various emotional and functional states defined in `v7TechSpec.md` (4.6.3, 4.6.4) and `v7UIUXDesign.md` (5.2, 5.3).
- Advanced Orb visual effects including dynamic shader properties, particle systems, and procedural animations as per `v7TechSpec.md` (4.6.1, 4.6.2, 4.6.5) and `v7UIUXDesign.md` (5.1, 5.3, 5.4).
- A flexible animation sequencing and blending system allowing smooth transitions and non-repetitive behaviors.
- Orb exhibiting reactive behaviors to user interactions (hover, click) and contextual cues (scene changes, specific data interactions).
- Clear visual cues from the Orb that indicate its current conversational activity (listening, thinking, speaking, prompting).
- Seamless integration with the Dialogue Agent, allowing the backend to drive Orb's expressive states.
- Comprehensive documentation on the Orb animation system, its states, effects, and how to extend them.
- Orb's behavior and appearance consistently reflect the persona described in `OrbSystemPrompt.md`.

**Verification Steps**:
- Test transitions between all defined Orb emotional and visual states, verifying correct color, motion, and shader effects as per `v7UIUXDesign.md` (5.2, 5.3).
- Confirm that advanced visual effects (particles, pulses, glows, trails) render correctly and are triggered appropriately.
- Evaluate animation sequencing and blending for smoothness and naturalness.
- Test reactive behaviors: Orb's response to hovering, clicking, and specific user actions within different scenes (`CloudScene`, `GraphScene`).
- Verify that conversation visualization patterns accurately reflect Orb's listening, thinking, and speaking states.
- Test the Dialogue Agent's ability to control Orb's state and trigger specific animations/effects.
- Assess performance (frame rates, shader compilation times) with complex animations and effects enabled, especially on target mobile devices.
- Ensure consistent Orb behavior and appearance across different scenes and devices.
- Review Orb's expressive range against the characteristics outlined in `OrbSystemPrompt.md` to ensure persona alignment.
- Verify scene-specific Orb behaviors as detailed in `v7UIUXDesign.md` (5.4) are implemented.

### Sprint 6: Deployment & Finalization (Week 6)

#### 6.1 Multi-Region Deployment

**Objective**: Prepare the V7 system for a production launch in the primary region (US AWS), including hardening all services and infrastructure. Concurrently, ensure the architecture and configurations are prepared for future multi-region expansion (e.g., to China/Tencent) as outlined in `V7FullStackPRD.md`, `v7TechSpec.md` (Sections 2.1, 2.2, 6.1), and `V7MonoRepoDesign.md` (Infrastructure section).

**Prompt**:
```
Prepare the V7 system for a production launch in the primary region (US AWS), including hardening all services and infrastructure. Concurrently, ensure the architecture and configurations are prepared for future multi-region expansion (e.g., to China/Tencent) as outlined in V7FullStackPRD.md. Reference v7TechSpec.md (Sections 2.1 - Regional Adaptability, 2.2 - High-Level Architecture, 6.1 - Cloud Infrastructure for backend, 4.2.4 - Performance Optimization Strategy for frontend) and V7MonoRepoDesign.md (Infrastructure section, particularly /env-aws and /env-tencent).

1. Finalize region-specific configuration (US AWS):
   - Complete the configuration management for the US AWS environment using tools and practices defined in `V7MonoRepoDesign.md` (e.g., environment-specific files in `/infrastructure/env-aws/variables/`).
   - Document how environment variables and configurations (e.g., in `/infrastructure/modules/`) would support additional regions like China/Tencent, including service endpoints and regional settings.
   - Define strategy for region-specific API endpoint management, potentially leveraging AWS API Gateway features for the US and planning equivalents for Tencent.
   - Document validation requirements for the China/Tencent region, considering local regulations and service availability.

2. Implement cloud provider abstraction (AWS focus, Tencent planning):
   - Finalize the abstraction layer for cloud provider services (e.g., storage, database, queuing, serverless functions), fully implementing and testing for AWS services (S3, RDS, SQS, Lambda/ECS/EKS) as detailed in `v7TechSpec.md` 6.1.
   - Document the interface for adapters for Tencent Cloud services (COS, TencentDB, TDMQ, SCF/TKE).
   - Identify potential feature differences in services (e.g., LLM availability, database performance characteristics, CDN capabilities) for the China/Tencent region and plan fallback or alternative strategies.

3. Complete LLM provider integration (Google AI for US, DeepSeek planning):
   - Finalize and harden the Google Gemini API client for the US region, ensuring it uses the `OrbSystemPrompt.md` correctly and handles context as per `v7TechSpec.md` (Section B. Capabilities & Resources in Orb prompt, LLM Interaction Tools).
   - Design the integration point and adapter interface for the DeepSeek API (for China region), considering prompt compatibility with `OrbSystemPrompt.md` (e.g., potential translation or rephrasing needs for DeepSeek).
   - Ensure current prompt templates used with Gemini are designed with adaptability in mind for different LLMs, potentially using a common structured prompt format.
   - Add comprehensive monitoring for Google Gemini API performance, cost, and error rates in the US AWS environment.
   - Document the plan for testing and fine-tuning `OrbSystemPrompt.md` with DeepSeek for the China region.

4. Set up database regionality (AWS focus, Tencent planning):
   - Implement robust data isolation for the US AWS region (PostgreSQL RDS, Neo4j, Weaviate, Redis on ElastiCache) and design the mechanisms for data residency enforcement for the China/Tencent region, referencing `v7TechSpec.md` (Persistence Layer) and `V7DataSchemaDesign.md`.
   - Create and test database connection management (e.g., connection pooling, secure credential management) for the US AWS regional instances.
   - Plan for region-specific query handling or data sharding strategies if necessary for performance or compliance in the China/Tencent region.

5. Build deployment pipelines (AWS focus, Tencent templating):
   - Solidify CI/CD workflows (e.g., GitHub Actions as per `V7MonoRepoDesign.md`) for the US AWS environment (staging, production), including automated testing, and artifact management for all services (`web-app`, `api-gateway`, `cognitive-hub`, `workers`).
   - Template these workflows for adaptation to Tencent Cloud, considering Tencent-specific deployment tools or APIs.
   - Implement thorough automated testing (unit, integration, end-to-end) against US AWS regional environments.
   - Add deployment safety checks (e.g., blue/green, canary) and robust rollback mechanisms for the US AWS deployment.
   - Create comprehensive monitoring dashboards (e.g., Grafana) for the US AWS deployment, covering application and infrastructure metrics.

6. Implement content delivery (AWS CloudFront focus, Tencent CDN planning):
   - Set up and optimize CDN configurations (AWS CloudFront) for the US AWS region, serving static assets for `web-app` and `mobile-app` (if applicable).
   - Implement asset delivery optimization (caching policies, compression, image optimization) for CloudFront.
   - Plan fallback mechanisms and content synchronization strategies if expanding CDN to Tencent Cloud CDN for the China region.
   - Add performance monitoring for CloudFront (latency, cache hit ratio, error rates) in US AWS.

Focus on a production-ready, reliable, and compliant US AWS deployment, while ensuring the system architecture and deployment strategies are well-documented and prepared for efficient expansion to other regions like China/Tencent post-V7 launch.
```

**Expected Output**:
- Finalized and tested region-specific configurations for US AWS.
- A well-documented cloud provider abstraction layer with a complete AWS implementation and a clear interface for Tencent Cloud adapters.
- Fully integrated and monitored Google Gemini API client for the US; a detailed design and integration plan for DeepSeek for China.
- Implemented and tested database regionality for US AWS, with a documented plan for China/Tencent data residency.
- Robust, automated CI/CD deployment pipelines for all services to US AWS (staging and production), with templates for Tencent Cloud adaptation.
- Optimized content delivery via AWS CloudFront for the US region, with a plan for Tencent Cloud CDN.
- Comprehensive documentation on multi-region deployment architecture, configurations, and procedures, referencing `V7MonoRepoDesign.md` and `v7TechSpec.md`.

**Verification Steps**:
- Successfully deploy all V7 services to staging and production environments in US AWS using the CI/CD pipelines.
- Verify all features are working as expected in the US AWS production environment.
- Conduct load and performance testing on the US AWS deployment to ensure it meets NFRs.
- Review documentation for clarity and completeness regarding US AWS setup and China/Tencent expansion plans.
- Validate data isolation and residency for US AWS.
- Confirm LLM integration with Google Gemini is functioning correctly and monitored in the US.
- Simulate deployment to a mock Tencent environment using the templated workflows (if feasible without actual Tencent resources).
- Review CDN configuration for optimal caching and performance in the US region.
- Conduct end-to-end testing in the US AWS production environment.

#### 6.2 Final Optimization & Documentation

**Objective**: Perform final system-wide optimizations and create comprehensive documentation for the V7 system, ensuring alignment with `v7TechSpec.md`, `v7UIUXDesign.md`, `V7DataSchemaDesign.md`, `V7MonoRepoDesign.md`, and `OrbSystemPrompt.md`.

**Prompt**:
```
Perform final system-wide optimizations and create comprehensive documentation for the V7 system as described in V7TechSpec.md, V7FullStackPRD.md, and other supporting design documents. Ensure all aspects of the system are covered, from user experience to backend architecture.

1. Conduct system-wide performance optimization:
   - Profile and optimize critical user journeys (e.g., onboarding, memory capture, graph exploration, chat interaction) on both desktop and mobile web, referencing `v7TechSpec.md` (4.2.4 - Frontend Performance, backend optimization principles like materialized views from 3.2.3).
   - Implement final database query optimizations for PostgreSQL, Neo4j, and Weaviate based on production-like load profiles (refer to `V7DataSchemaDesign.md` for query patterns).
   - Finalize and test caching strategies for common API responses and frequently accessed data in Redis (`v7TechSpec.md` 2.4.4).
   - Optimize asset loading and delivery for the 3D Canvas, 2D Modals, and Orb, including textures, models, and shaders (`v7TechSpec.md` 4.2.4, `V7MonoRepoDesign.md` asset processing).
   - Implement final UI rendering optimizations in React/R3F, ensuring efficient state updates and minimizing re-renders (`v7TechSpec.md` 4.4 State Management, 4.5 API Communication with TanStack Query).

2. Enhance error handling and resilience:
   - Implement comprehensive error recovery mechanisms across frontend (`web-app`), `api-gateway`, `cognitive-hub`, and `workers`.
   - Implement graceful degradation for component failures (e.g., if a 3D scene fails to load, provide a 2D fallback; if an agent is temporarily unavailable, inform the user politely).
   - Add retry strategies with exponential backoff for transient errors in API calls and background jobs.
   - Create user-friendly error messages and recovery options, guiding the user appropriately.
   - Implement robust monitoring and alerting for error patterns and critical system failures (e.g., via OpenTelemetry, Prometheus, Grafana as per `v7TechSpec.md` 6.1).

3. Create user documentation (aligning with `OrbSystemPrompt.md` and `v7UIUXDesign.md`):
   - Develop comprehensive user guides covering all features of the 3-layer UI (Canvas, Modals, Orb) and core functionalities (memory capture, graph exploration, chat, growth dimensions).
   - Create contextual help content (e.g., tooltips, in-app guides) for complex interactions.
   - Finalize onboarding materials for the First-Time User Experience (`v7UIUXDesign.md` 6.3).
   - Compile FAQ and troubleshooting guides based on testing and potential user queries.
   - Create quick reference materials for gestures, Orb states, and key features.
   - Ensure documentation reflects Orb's persona and the system's emotional design goals.

4. Build developer documentation (referencing `v7TechSpec.md`, `V7DataSchemaDesign.md`, `V7MonoRepoDesign.md`):
   - Create detailed API documentation for the `api-gateway` and internal service APIs.
   - Document the event-sourcing system comprehensively, including event types, schemas, and processing flows (`v7TechSpec.md` 3.2.2, 7.1, 7.2, 7.3, Section 9).
   - Finalize architectural diagrams (from `V7MonoRepoDesign.md`, `v7TechSpec.md`) and detailed explanations of each component and their interactions.
   - Add code examples for common operations, agent interactions, and extending UI components.
   - Document extension points, configuration options (`v7TechSpec.md` Section 9.1), and customization options for all services and shared packages.
   - Document the `V7MonoRepoDesign.md` structure, build processes, and development workflows.
   - Document the `V7DataSchemaDesign.md` for PostgreSQL, Neo4j, Weaviate, and Redis, including entity relationships and data flow.
   - Document the `OrbSystemPrompt.md` and its usage by the Dialogue Agent.

5. Implement analytics and monitoring:
   - Set up comprehensive application monitoring for all backend services and the frontend application (e.g., using OpenTelemetry, Prometheus, Grafana).
   - Create custom metrics for key performance indicators (KPIs) related to user engagement, agent performance, data processing, and system health.
   - Implement user journey tracking to understand how users interact with the system and identify pain points.
   - Finalize error tracking and alerting for critical issues.
   - Create performance dashboards for monitoring system health, resource utilization, and API latencies.

6. Conduct accessibility and internationalization (I18N):
   - Perform a final accessibility audit against WCAG 2.1 AA guidelines for the `web-app`, including keyboard navigation, screen reader compatibility, and contrast ratios, referencing `v7TechSpec.md` 4.8.
   - Implement any necessary improvements based on the audit.
   - Finalize the internationalization (I18N) infrastructure (e.g., using a library like `i18next`) for all user-facing strings in the `web-app`.
   - Add language-specific content (e.g., for UI text, Orb prompts if localized versions of `OrbSystemPrompt.md` are planned) where needed, starting with English.
   - Create accessibility documentation outlining implemented features and any known limitations.
   - Test thoroughly with screen readers and other assistive technologies.

Ensure the final system is performant, resilient, well-documented, and accessible to all users, providing a cohesive and emotionally resonant experience.
```

**Expected Output**:
- Optimized system performance across all components (frontend, backend, databases).
- Enhanced error handling and system resilience with clear user feedback.
- Comprehensive user documentation (guides, FAQs, onboarding) aligned with Orb's persona.
- Detailed developer documentation (API, architecture, data schema, monorepo structure, event sourcing).
- Fully implemented analytics and monitoring system with dashboards and alerts.
- Verified accessibility compliance (WCAG 2.1 AA) and established I18N infrastructure.
- A complete set of final system documentation covering all aspects of V7.

**Verification Steps**:
- Conduct rigorous performance testing (load, stress, soak tests) across all components and critical user journeys.
- Simulate various error scenarios and verify recovery mechanisms and user messaging.
- Review all user and developer documentation for accuracy, completeness, and clarity by a separate team member or AI agent.
- Verify that analytics data is being collected correctly and that monitoring dashboards and alerts are functional.
- Conduct thorough accessibility testing with automated tools and manual checks (including screen reader testing).
- Test internationalization features by switching to a sample secondary language (if strings are prepared).
- Perform final, comprehensive end-to-end testing of all system features by a dedicated QA team or AI agents acting as users.
- Confirm all documentation (User, Developer, API, Architecture) is published and accessible.

#### 6.3 Mobile Web Responsiveness & Optimization

**Objective**: Ensure the existing V7 web application (`web-app`) delivers a high-quality, responsive, and performant experience on mobile device browsers, as detailed in `V7FullStackPRD.md`. This involves thorough testing and optimization of all features for mobile browsers, referencing `v7TechSpec.md` (esp. 4.2.4, 4.8) and `v7UIUXDesign.md` (esp. 6.2).

**Prompt**:
```
Ensure the existing V7 web application delivers a high-quality, responsive, and performant experience on mobile devices, as detailed in V7FullStackPRD.md. This involves thorough testing and optimization of all features for mobile browsers, referencing v7TechSpec.md (particularly 4.2.4 - Performance Optimization Strategy, 4.8 - Accessibility Implementation, and relevant frontend component sections like 4.3.2 Card Gallery, 4.3.5 Chat Interface, 4.3.6 HUD) and v7UIUXDesign.md (Section 6.2 Navigation Paradigms - Touch & Gesture, and UI component design details).

1. Verify Responsive Layout and Touch Interactions for 2D Modals & HUD:
   - Test all 2D Modals (Chat Interface - `v7TechSpec.md` 4.3.5, Card Gallery - `v7TechSpec.md` 4.3.2, Dashboard) on various mobile screen sizes (iOS/Android, different resolutions), ensuring they adapt correctly (e.g., full-screen or near full-screen layouts) and are touch-friendly as per PRD and `v7UIUXDesign.md`.
   - Confirm HUD (`v7TechSpec.md` 4.3.6) adapts correctly for mobile (e.g., bottom tab bar if designed, optimized button sizes).
   - Ensure all forms, buttons, and interactive elements within modals and HUD have large enough touch targets (e.g., min 44x44px) and support standard mobile gestures (e.g., swipe to close modals if designed, pinch to zoom in `GraphScene` if applicable to its 2D alternative view).
   - Verify text readability and image scaling within these components on small screens.

2. Test Core Feature Functionality on Mobile Web:
   - Verify chat interface (`v7TechSpec.md` 4.3.5) is fully functional and usable on mobile, including text input, message display, and suggestion buttons.
   - Test memory/card browsing (`v7TechSpec.md` 4.3.2) and creation workflows, including text, voice (if using Web Speech API as per `v7TechSpec.md` 4.3.5 note), and image input via browser capabilities.
   - Confirm dashboard (`v7TechSpec.md` 4.3.1) displays correctly, all metrics are readable, and interactive elements are responsive on mobile.
   - Test multi-modal ingestion workflows (e.g., uploading a photo with a voice note) initiated from a mobile browser.

3. Optimize 3D Visualizations for Mobile Web Performance:
   - Implement and rigorously test the "slimmed-down mode" or adaptive quality settings for 3D visuals on mobile phones, as described in PRD and `v7TechSpec.md` (4.2.4 Adaptive Quality, simplified shaders, LODs).
   - Ensure `CloudScene`, `AscensionScene`, and `GraphScene` are navigable and performant (target acceptable frame rates, e.g., 30fps+) on representative mobile devices. This includes optimizing shaders (`v7TechSpec.md` 4.2.3) and assets (`V7MonoRepoDesign.md` asset processing pipeline).
   - Test touch-based navigation for the 3D `GraphScene` (orbit, zoom, pan controls), ensuring intuitive and responsive interaction as per `v7UIUXDesign.md` 6.2.
   - Verify Orb visualization (`v7TechSpec.md` 4.6) and its animations perform well on mobile, with simplified effects if necessary (`v7UIUXDesign.md` 5.5 Performance Consideration).

4. Evaluate Advanced Mobile Web Interactions and Capabilities:
   - For features like voice input, thoroughly test reliance on browser Web Speech API across different mobile browsers and OS versions; ensure graceful degradation if not supported.
   - Test any specific multi-finger gestures defined in `v7UIUXDesign.md` (e.g., two-finger swipe down for Ascension) and ensure they don't conflict with browser default gestures or OS-level gestures.
   - Consider PWA (Progressive Web App) capabilities as a stretch goal if quick wins for app-like feel (e.g., add to home screen, basic offline caching for static assets) are desired and feasible within this scope, but prioritize core responsiveness and performance first.

5. Conduct Comprehensive Mobile Web Testing and Documentation:
   - Conduct thorough testing on major mobile browsers (Safari on iOS, Chrome on Android) and a range of device performances (low, mid, high-end).
   - Document any identified deviations, necessary compromises for the mobile web experience, or browser-specific issues and their workarounds.
   - Ensure mobile accessibility (`v7TechSpec.md` 4.8) by testing with mobile screen readers and keyboard (if applicable via connected hardware).

The goal is to ensure the single `web-app` provides a truly responsive, performant, accessible, and engaging experience on mobile browsers, fulfilling the "mobile-first" design philosophy where applicable for V7, as guided by the PRD and UI/UX specifications.
```

**Expected Output**:
- All 2D modals (Chat, Card Gallery, Dashboard) and the HUD are fully responsive and touch-friendly on a range of mobile devices and screen sizes.
- Core application features (chat, memory/card management, dashboard interaction, multi-modal ingestion) are functional and user-friendly on mobile browsers.
- 3D scenes (`CloudScene`, `AscensionScene`, `GraphScene`) and Orb visualization are optimized for mobile web performance, with adaptive quality settings implemented and verified.
- Touch-based navigation for 3D scenes is intuitive and performant.
- Advanced mobile web interactions (voice input, custom gestures) are tested, with graceful degradation for unsupported features.
- Comprehensive test report detailing mobile web performance, compatibility across major browsers/devices, and any identified issues or deviations.
- Documentation on mobile-specific optimizations, known limitations, and PWA considerations (if explored).

**Verification Steps**:
- Execute a test plan covering all UI components and user journeys on target iOS (Safari) and Android (Chrome) devices of varying performance tiers.
- Verify responsive layout breaks, touch target sizes, and gesture support against `v7UIUXDesign.md` specifications.
- Measure and confirm acceptable performance (load times, frame rates, input responsiveness) for 2D and 3D elements on mobile.
- Test functionality of all core features, including input methods (text, voice, image upload via browser APIs).
- Validate adaptive quality settings for 3D scenes: ensure visual fidelity scales appropriately with device capabilities.
- Confirm Orb animations and effects are smooth and visually acceptable on mobile.
- Test voice input functionality and reliability using Web Speech API on supported mobile browsers.
- Verify custom gestures work as intended and do not conflict with system gestures.
- Perform accessibility checks on mobile using screen readers and other assistive tools.
- Review test reports and documentation for completeness and clarity.

## Using This Roadmap

This roadmap is designed to be incremental and modular, with each task building on previous work. Tasks have been structured to provide clear verification steps and expected outcomes, making them ideal for implementation with Cursor AI assistance.

1. **Start with Schema Migration**: Begin by implementing the event-sourcing approach, as this forms the foundation for the enhanced growth model.

2. **Build Backend Services**: Implement the API Gateway and backend services to support the new data model and provide endpoints for the frontend.

3. **Progress Through UI Layers**: Build out the UI components in a logical sequence: canvas-core, scenes, Orb, cards, and dashboard.

4. **Add Intelligence**: Implement the graph visualization and insight engine to bring the knowledge model to life.

5. **Finalize Integration**: Complete the system with end-to-end integration, multi-region support, and final optimization.

For each task, review the expected outputs and verification steps to ensure quality before moving on to the next task.

## Decision Points Requiring Human Input

Throughout the implementation, these key decision points will require human judgment:

1. **Visual design decisions** for the Orb, cards, and scenes
2. **Performance thresholds** for different device targets
3. **LLM prompt engineering** for the cognitive agents
4. **Community detection parameters** for the graph visualization
5. **User experience flow** for critical journeys
6. **Insight quality assessment** for the Insight Engine
7. **Infrastructure choices** for regional deployments
8. **Data residency and compliance requirements** for different markets
9. **Security measures** and threat modeling priorities
10. **Mobile app feature prioritization** and experience design

Document these decisions in a separate decision log to maintain a record of architectural choices. 