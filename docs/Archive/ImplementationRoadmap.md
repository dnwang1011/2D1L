# 2dots1line V4 Implementation Roadmap

## Overview

This document outlines the strategy for implementing the V4 Technical Specification while leveraging existing code from the Legacy codebase where appropriate. The migration will be executed in phases, with an emphasis on incremental progress and maintaining system stability throughout the transition.

## Legacy System Analysis

### Existing Components to Leverage

1. **Database Infrastructure**
   - PostgreSQL integration via Prisma ORM
   - Weaviate vector database setup and basic operations
   - Neo4j graph database integration

2. **Memory Processing Pipeline**
   - Text chunking and embedding generation
   - Memory importance scoring
   - Basic entity extraction

3. **Queue Management**
   - BullMQ for asynchronous processing
   - Worker architecture for background tasks

4. **API Framework**
   - Express server and middleware
   - Authentication system
   - File upload handling

5. **AI Integration**
   - Gemini API integration
   - Existing prompt templates

## Phase 1: Foundation (Weeks 1-8)

### 1.1 Project Structure Setup (Week 1)

- [x] **Create Monorepo Structure**
  - Convert existing codebase to monorepo using Nx or Turborepo
  - Organize according to V4 specifications
  - Move shared types and utilities to packages

- [x] **Database Schema Migration**
  - Modify Prisma schema to support V4 data model
  - Create migration scripts for User, MemoryUnit, Chunk tables
  - Set up Neo4j schema for knowledge graph components
  - Configure Weaviate schema for new embedding models

**Approach:** Maintain legacy tables during transition and create new V4 tables in parallel.

### 1.2 Core Services Implementation (Weeks 2-3)

- [ ] **Persistence Layer**
  - Set up PostgreSQL repositories for new data model
  - Implement Neo4j client wrapper for graph operations
  - Enhance Weaviate client for V4 embedding requirements
  - Configure Redis for caching, queues, and state management

**Legacy Code Reuse:** 
- Extend `prisma.js` module for PostgreSQL integration
- Leverage existing Weaviate client setup from `test-weaviate.js`
- Adapt embedded Neo4j client logic from the existing codebase

- [ ] **Tool Layer Foundation**
  - Implement Tool Registry infrastructure
  - Build basic text processing tools (NER, chunking)
  - Create embedding generation tools

**Legacy Code Reuse:**
- Adapt existing chunking logic from `memoryManager.service.js`
- Leverage entity extraction from `episodeAgent.js`
- Reuse embedding generation from `GeminiProvider.js`

### 1.3 Ingestion Pipeline (Weeks 4-5)

- [ ] **Ingestion Analyst Agent**
  - Implement Tier 1 processing capabilities
  - Build chunking and basic entity extraction
  - Set up embedding queue system

**Legacy Code Reuse:**
- Adapt worker architecture from `memoryProcessor.worker.js`
- Leverage chunking logic from `memoryManager.service.js`
- Reuse queue setup from existing BullMQ implementation

- [ ] **Basic Memory Storage**
  - Implement storage of MemoryUnits and Chunks
  - Set up vector storage in Weaviate
  - Configure basic relationship tracking in Neo4j

**Legacy Code Reuse:**
- Adapt repository pattern from `chunk.repository.js`
- Leverage vector storage from existing Weaviate integration

### 1.4 Simple Dialogue Agent (Weeks 6-8)

- [ ] **Dialogue Agent (Basic Version)**
  - Implement chat functionality with minimal context
  - Create simple context retrieval mechanism
  - Integrate with Gemini/DeepSeek based on region

**Legacy Code Reuse:**
- Adapt `chat.service.js` and `ai.service.js`
- Leverage `GeminiProvider.js` integration
- Reuse conversation handling logic

- [ ] **Basic API Layer**
  - Create REST endpoints for chat functionality
  - Implement user authentication
  - Set up conversation history storage

**Legacy Code Reuse:**
- Adapt Express routes and controllers
- Reuse authentication middleware
- Leverage existing API patterns

## Phase 2: Core Capabilities (Weeks 9-16)

### 2.1 Enhanced Retrieval (Weeks 9-10)

- [ ] **Retrieval Planner Agent**
  - Implement hybrid search strategy
  - Build graph traversal capabilities
  - Create reranking mechanism
  
**Legacy Code Reuse:**
- Enhance vector search from existing memory retrieval
- Adapt context assembly logic

- [ ] **Advanced Tool Layer**
  - Implement cross-encoder reranking
  - Build graph query tools
  - Create summarization utilities

### 2.2 Knowledge Graph Evolution (Weeks 11-12)

- [ ] **Graph Storage Enhancement**
  - Implement the full V4 graph schema in Neo4j
  - Create concept and relationship persistence
  - Build graph traversal utilities

**Legacy Code Reuse:**
- Adapt any existing knowledge graph logic from legacy system

- [ ] **Basic Ontology Steward**
  - Implement initial vocabulary management
  - Create schema validation tools
  - Build term proposal flow

### 2.3 Visualization Infrastructure (Weeks 13-14)

- [ ] **2D Knowledge Graph Visualization**
  - Implement concept and relationship extraction APIs
  - Create visualization data formatting logic
  - Build frontend components for graph display

**Legacy Code Reuse:**
- Leverage any existing visualization utilities

- [ ] **Memory Exploration UI**
  - Implement memory browsing components
  - Create concept exploration interface
  - Build timeline view

### 2.4 Mobile App Foundation (Weeks 15-16)

- [ ] **React Native Implementation**
  - Set up mobile app structure
  - Create core screens
  - Implement chat interface

- [ ] **Offline Capabilities**
  - Build journal entry caching
  - Implement sync mechanism
  - Create offline queue system

## Phase 3: Intelligence Layer (Weeks 17-24)

### 3.1 Insight Engine (Weeks 17-19)

- [ ] **Pattern Detection**
  - Implement community detection algorithms
  - Build co-occurrence analysis
  - Create temporal pattern detection

- [ ] **Hypothesis Generation**
  - Build insight generation algorithms
  - Implement confidence scoring
  - Create insight delivery system

### 3.2 Full Ontology Management (Weeks 20-21)

- [ ] **Ontology Steward Enhancement**
  - Implement full schema evolution
  - Build term comparison and mapping
  - Create user review workflow

**Legacy Code Reuse:**
- Leverage existing ontology models if available

### 3.3 Advanced UI Features (Weeks 22-24)

- [ ] **Personalized Experience**
  - Implement user preference system
  - Build adaptive UI components
  - Create style customization options

- [ ] **Insight Integration**
  - Implement insight cards
  - Create feedback mechanism
  - Build proactive delivery system

## Phase 4: Advanced Features (Weeks 25-32)

### 4.1 3D Knowledge Visualization (Weeks 25-27)

- [ ] **WebGL Implementation**
  - Build Three.js/React Three Fiber integration
  - Create graph physics simulation
  - Implement interaction models

- [ ] **Performance Optimization**
  - Create tiered rendering system
  - Implement level-of-detail mechanism
  - Build filtering controls

### 4.2 Metaphorical Connections (Weeks 28-29)

- [ ] **Advanced Insight Algorithms**
  - Implement cross-domain pattern matching
  - Build structural similarity detection
  - Create metaphor generation system

### 4.3 Performance Optimization (Weeks 30-31)

- [ ] **System Tuning**
  - Optimize database queries
  - Enhance caching strategy
  - Improve embedding performance

- [ ] **Scale Testing**
  - Implement load testing framework
  - Perform scaling tests
  - Optimize resource usage

### 4.4 Cross-Region Deployment (Week 32)

- [ ] **Regional Infrastructure**
  - Set up US deployment on AWS
  - Configure China deployment on Tencent
  - Implement region-specific routing

- [ ] **Compliance Features**
  - Implement data residency controls
  - Create region-specific model routing
  - Build data export/import tools

## Integration Strategy

### Database Migration Approach

1. **Incremental Schema Evolution**
   - Start with core tables (Users, MemoryUnits, Chunks)
   - Add new tables one at a time
   - Create mapping functions between legacy and V4 models

2. **Dual-Write Period**
   - Initially write to both legacy and V4 schemas
   - Gradually transition reads to V4 schema
   - Validate data consistency during transition

3. **Data Backfill**
   - Create scripts to migrate historical data
   - Perform incremental backfills during low-usage periods
   - Validate migrated data integrity

### Code Refactoring Strategy

1. **Strangler Pattern**
   - Encapsulate legacy code
   - Gradually replace with V4 implementations
   - Maintain adapters for interoperability

2. **Service Isolation**
   - Separate concerns into distinct services
   - Replace one service at a time
   - Use feature flags to control rollout

3. **Test-Driven Migration**
   - Create comprehensive tests for legacy behavior
   - Ensure new implementations pass legacy tests
   - Add tests for V4-specific features

## Testing Strategy

- **Unit Testing:** Each component thoroughly tested in isolation
- **Integration Testing:** Verify component interactions
- **End-to-End Testing:** Full system validation
- **Migration Testing:** Verify data consistency during transitions
- **Performance Testing:** Ensure system meets performance requirements
- **Semantic Testing:** Validate AI and vector search quality

## Risk Management

| Risk | Mitigation |
|------|------------|
| Data migration errors | Comprehensive validation, rollback capability |
| Performance degradation | Regular benchmarking, incremental rollout |
| API incompatibility | Versioned APIs, backwards compatibility |
| Embedding quality issues | A/B testing, quality metrics monitoring |
| Regional compliance | Regular audits, separated development environments |

## Success Metrics

- **Functional Completeness:** All V4 features implemented
- **Performance:** Response times < 500ms for interactive queries
- **Retrieval Quality:** >90% precision/recall for memory retrieval
- **Data Integrity:** 100% consistency between legacy and V4 data
- **User Experience:** Positive feedback on new features

## Conclusion

This roadmap provides a structured approach to implementing the V4 Technical Specification while leveraging valuable components from the legacy codebase. By following this incremental approach, we can maintain system stability while evolving towards the more sophisticated architecture outlined in the V4 specification.

The 2dots1line Memory System V4 represents a significant advancement in personal knowledge management, combining the strengths of multiple AI techniques to create a system that not only remembers but also understands and generates insights from user data. 