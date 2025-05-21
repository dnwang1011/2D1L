This document outlines coding standards, architectural principles, and best practices for the V4 system. These guidelines ensure consistency, maintainability, and accessibility for both AI agents and human collaborators.

## I. Architecture & Component Organization

### Agent-Tool Paradigm Implementation

1. **Cognitive Agents:**
   * Each agent (`DialogueAgent`, `IngestionAnalyst`, `RetrievalPlanner`, etc.) MUST have a single, clearly d# 2dots1line V4 Coding Standards & Best Practices
efined responsibility.
   * Agents MUST define explicit input/output contracts using TypeScript interfaces.
   * Agents MUST NOT directly access databases; use the tools layer instead.
   * All agent prompts, system messages, and LLM configurations MUST be stored in separate configuration files, not hardcoded.

2. **Deterministic Tools Layer:**
   * Tools MUST be stateless, specialized functions with defined input/output contracts.
   * Tools MUST have comprehensive error handling and graceful degradation.
   * ALWAYS implement tool telemetry (timing, success rate, error tracking).
   * Tools handling sensitive operations MUST implement rate limiting and circuit breaking.
   * Tools operating in different regions MUST implement feature detection for region-specific services.

3. **Persistence Layer Access:**
   * NO direct database client usage outside of dedicated repository modules.
   * Each database (PostgreSQL, Neo4j, Weaviate, Redis) MUST have a dedicated client wrapper.
   * Implement clear transaction boundaries that account for polyglot persistence.
   * Handle cross-database consistency with explicit sync mechanisms.

4. **Module Organization:**
   * Follow the monorepo structure defined in `MonoRepoDesign.md`
   * Related functionality MUST be grouped in cohesive packages.
   * Respect the dependency hierarchy:
     - Shared packages → Services → Workers → Apps
   * AVOID circular dependencies at all costs.

### API & Service Design

1. **API Contracts:**
   * Design clear, consistent RESTful APIs using OpenAPI/Swagger specifications.
   * Implement consistent response structures across all endpoints.
   * Version all APIs explicitly (e.g., `/api/v4/memory-units`).
   * Handle long-running operations with `202 Accepted` responses and status endpoints.

2. **Service Boundaries:**
   * Services should have clear boundaries matching their domain responsibility.
   * Services MUST communicate via well-defined APIs or message queues, NOT direct function calls.
   * Implement proper error propagation between services.
   * Design services to be independently deployable and scalable.

## II. Code Readability & Accessibility

### Human-Friendly Code

1. **Clear Naming & Structure:**
   * Use descriptive, unambiguous names for variables, functions, classes, and files.
   * Break down complex logic into smaller, well-named functions - MAXIMUM 30 lines per function.
   * Maintain consistent naming patterns across the codebase.
   * Use meaningful prefixes for interfaces (`I`), types (`T`), enums (`E`), etc.

2. **Self-Documenting Code:**
   * Prioritize self-documented code over excessive comments.
   * Add meaningful comments for complex logic, explaining WHY, not WHAT.
   * Use TypeScript effectively - prefer explicit types over `any`.
   * AVOID overly clever or excessively terse code.

3. **Documentation for Non-Technical Collaborators:**
   * Every package MUST include a README.md with:
     - Purpose and responsibility of the package
     - Key components and their relationships
     - Setup instructions
     - Common debugging tips
   * Document key workflows with sequence diagrams in `/docs/workflows/`.
   * Create a "Decision Log" for important architectural choices in `/docs/decisions/`.
   * Maintain a glossary of domain-specific terms in `/docs/glossary.md`.

### Consistent Formatting & Style

1. **Automated Formatting:**
   * Use Prettier with a shared configuration for all code.
   * Use ESLint with TypeScript rules to enforce code quality.
   * All packages MUST share the same formatting rules.

2. **Coding Style:**
   * Follow standard TypeScript conventions:
     - `camelCase` for variables, functions, methods
     - `PascalCase` for classes, interfaces, types, enums
     - `UPPER_CASE` for constants
   * Use named exports over default exports.
   * Prefer async/await over raw promises.
   * Prefer functional programming patterns when appropriate.

## III. Development Workflow & Testing

### When to Implement UI Testing

1. **Terminal vs. UI Testing Decision Tree:**
   * Use terminal tests for:
     - Individual tool functions
     - Database operations
     - Simple API behavior
   * REQUIRE real UI testing for:
     - Any user-facing feature (chat, memory visualization, search)
     - Complex interaction flows
     - Features involving real-time updates
     - Mobile-specific functionality

2. **UI Testing Guidelines:**
   * Define test scenarios BEFORE implementation.
   * Include both happy path and error state tests.
   * Involve non-technical team members in test design.
   * Document the expected behavior with screenshots/wireframes.
   * Create dedicated test accounts and datasets.

### End-to-End Development Process

1. **Feature Development Workflow:**
   * Start with clear requirements document
   * Design interfaces and contracts first
   * Implement tools and databases
   * Build services and APIs
   * Develop UI components
   * Integration and end-to-end testing

2. **Code Review Standards:**
   * PRs MUST include:
     - Clear description of changes
     - Test coverage evidence
     - Documentation updates
     - Consideration of region-specific concerns
   * AI-generated code MUST be reviewed by a human before merging.
   * Enforce the "Rule of Two" - at least two sets of eyes on every PR.

### Testing Strategy

1. **Test Types and Coverage:**
   * **Unit Tests:** All tools, repositories, and pure functions
   * **Integration Tests:** Service interactions, database operations
   * **E2E Tests:** Complete user workflows
   * **LLM Behavior Tests:** Prompt testing, response evaluation

2. **Testing Best Practices:**
   * Write tests alongside or before code (TDD encouraged).
   * Mock external dependencies and LLM calls.
   * Create test datasets that are representative but minimal.
   * For LLM-dependent code, test with multiple prompts and edge cases.
   * Performance tests MUST be included for critical paths.

### Monorepo Testing Configuration

1. **Jest Configuration Best Practices:**
   * Use package-specific Jest configurations for each workspace package.
   * Set proper `roots` to match source directory structure (e.g., `<rootDir>/src`).
   * Configure `moduleDirectories` to include both local and root node_modules: `['node_modules', '<rootDir>/../../node_modules']`.
   * Use `pathsToModuleNameMapper` from ts-jest to align with TypeScript path mappings:
     ```javascript
     const { pathsToModuleNameMapper } = require('ts-jest');
     const { compilerOptions } = require('../../tsconfig.base.json');
     
     moduleNameMapper: {
       ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
       // Additional mappings for specific packages
     }
     ```

2. **Import Path Conventions:**
   * Path references in test files MUST be relative to the package source structure.
   * INCORRECT: `import { Something } from '../src/module'` (duplicates source directory)
   * CORRECT: `import { Something } from '../module'` (respects package structure)
   * Code imports in tests should match the paths used in the actual code.

3. **Workspace Dependencies:**
   * Use npm-style workspace references (`npm:^x.y.z`) rather than `workspace:*` for npm compatibility.
   * Add a `.npmrc` file with `node-linker=hoisted` for improved module resolution in workspaces.
   * Set `isolatedModules: true` in TypeScript config for all test files.
   * Configure references in tsconfig.json for packages with cross-dependencies:
     ```json
     {
       "references": [
         { "path": "../package-dependency" }
       ]
     }
     ```

4. **Cross-Package Testing:**
   * For cross-package tests, leverage Turborepo's task dependencies.
   * Ensure build order is correctly defined in turbo.json:
     ```json
     {
       "tasks": {
         "test": {
           "dependsOn": ["^build"]
         }
       }
     }
     ```
   * Use unique import aliases for test utilities to avoid confusion with actual implementations.

## IV. Multi-Region Development

### Cloud-Ready Implementation

1. **Region-Specific Considerations:**
   * ALWAYS use feature detection, not environment checks, for region-specific code.
   * Abstract all cloud provider-specific code behind interfaces.
   * Use dependency injection to provide region-specific implementations.
   * Design for graceful fallbacks when services differ between regions.

2. **Configuration Management:**
   * Store region-specific configuration in separate files.
   * Use environment variables for deployment-specific settings.
   * Never hardcode endpoints, API keys, or resource identifiers.
   * Implement runtime configuration validation.

3. **Early Deployment Testing:**
   * Each core module MUST be tested in both AWS and Tencent environments as it's completed.
   * Create deployment manifests (Terraform/CloudFormation) alongside implementation.
   * Include deployment tests in CI/CD pipeline.
   * Maintain a staging environment for each region.

### Infrastructure as Code

1. **IaC Standards:**
   * Use Terraform for cross-cloud infrastructure.
   * Define environment-specific variables in separate files.
   * Create reusable modules for common components.
   * Document resource naming conventions and access patterns.

2. **Deployment Automation:**
   * Implement CI/CD pipelines for all environments.
   * Automate database migrations and schema updates.
   * Include rollback procedures for all changes.
   * Test infrastructure changes in isolation before applying.

## V. Error Handling & Observability

### Robust Error Management

1. **Error Handling Patterns:**
   * Define custom error classes for different error categories.
   * Use consistent error structures across all components.
   * Include enough context in errors for debugging without revealing sensitive information.
   * Handle expected errors gracefully; let unexpected errors bubble up to global handlers.

2. **Retry and Circuit Breaking:**
   * Implement retries with exponential backoff for transient failures.
   * Use circuit breakers for dependent services.
   * Define fallback behavior when services are unavailable.
   * Document failure modes for each component.

### Monitoring & Logging

1. **Structured Logging:**
   * Use a consistent logging format across all components.
   * Include context with every log: `userId`, `requestId`, `region`, etc.
   * Use appropriate log levels (`debug`, `info`, `warn`, `error`).
   * NEVER log sensitive information (PII, tokens, credentials).

2. **Metrics Collection:**
   * Track key performance indicators for all components.
   * Monitor both technical metrics (latency, error rates) and business metrics (user engagement).
   * Set up alerts for critical thresholds.
   * Create dashboards for key workflows.

## VI. AI & Human Collaboration

### Guidelines for AI Development Agents

1. **Code Generation Standards:**
   * AI-generated code MUST follow all coding standards.
   * Break complex implementations into clear, logical steps.
   * ALWAYS include proper error handling and edge cases.
   * Generate appropriate tests for all code.
   * Document non-obvious design decisions and trade-offs.

2. **Explainability:**
   * AI agents MUST explain complex algorithms or patterns when introducing them.
   * When optimizing code, explain the performance benefits.
   * Highlight security considerations in proposed changes.
   * Reference industry standards or best practices when relevant.

### Supporting Human Collaborators

1. **Onboarding & Knowledge Sharing:**
   * Maintain up-to-date architectural diagrams in `/docs/architecture/`.
   * Create learning paths for different aspects of the system.
   * Document common debugging scenarios and solutions.
   * Build a comprehensive internal wiki for the project.

2. **Collaboration Tools:**
   * Use pull request templates that prompt for necessary information.
   * Create issue templates for different types of tasks.
   * Maintain a developer journal documenting progress and challenges.
   * Establish clear channels for technical discussions.

## VII. Security & Data Privacy

### Secure Development Practices

1. **Authentication & Authorization:**
   * Implement proper authentication for all APIs.
   * Use role-based or attribute-based access control.
   * NEVER trust client-side authorization checks alone.
   * Limit token lifetimes and implement proper refresh flows.

2. **Data Protection:**
   * Follow data residency requirements for all storage.
   * Encrypt sensitive data at rest and in transit.
   * Implement proper data partitioning for multi-tenant deployments.
   * Follow the principle of least privilege for all database access.

3. **Input Validation:**
   * Validate ALL user inputs server-side.
   * Use parameterized queries for database operations.
   * Sanitize data before displaying in UI.
   * Implement rate limiting for public-facing APIs.

## VIII. Performance & Scalability

### Efficient Implementation

1. **Performance Considerations:**
   * Optimize database queries and indexing.
   * Use caching appropriately (Redis).
   * Implement pagination for large result sets.
   * Monitor and optimize LLM token usage.

2. **Scalability Patterns:**
   * Design services to scale horizontally.
   * Use message queues for asynchronous processing.
   * Implement proper database connection pooling.
   * Consider read replicas for high-traffic deployments.

## IX. Vector Database & Knowledge Graph Best Practices

### Vector Operations

1. **Embedding Generation:**
   * Document embedding model version with every vector.
   * Ensure consistent preprocessing for embedded text.
   * Verify vector dimensions match schema expectations.
   * Implement batch processing for large embedding jobs.

2. **Vector Search Optimization:**
   * Use appropriate HNSW parameters based on dataset size.
   * Balance recall and performance in search configurations.
   * Use hybrid search (vector + keyword) when appropriate.
   * Monitor and optimize vector cache hit rates.

### Knowledge Graph Construction

1. **Graph Modeling:**
   * Follow the ontology defined in V4TechSpec.md.
   * Use consistent relationship types and properties.
   * Balance graph complexity with query performance.
   * Document traversal patterns for common queries.

2. **Graph Operations:**
   * Use parameterized Cypher queries.
   * Implement batch operations for large graph updates.
   * Monitor query execution plans and optimize indexes.
   * Use graph algorithms library for complex analytics.

## X. Accessibility & Inclusivity

1. **UI Accessibility:**
   * Follow WCAG 2.1 AA standards for all user interfaces.
   * Implement proper screen reader support.
   * Support keyboard navigation throughout the application.
   * Test with accessibility tools and real users.

2. **Inclusive Language:**
   * Use inclusive language in code, documentation, and interfaces.
   * Avoid gendered terms or culturally specific references.
   * Support internationalization and localization.
   * Be mindful of regional differences in content and terminology.

## XI. Documentation Maintenance and Version Control

### Documentation as Code

1. **Documentation Responsibility:**
   * All AI agents MUST maintain documentation as part of their development tasks.
   * When implementing features, update relevant documentation to reflect changes.
   * Documentation updates should be included in the same PR as code changes.
   * Keep V4TechSpec.md, V4DataSchemaDesign.md, V4CodingStandards.md, and V4ImplementationPrompts.md in sync at all times.

2. **Implementation Prompts Management:**
   * AI agents MUST update the V4ImplementationPrompts.md document after completing tasks.
   * Record learnings, issues encountered, and decisions made in the development log section.
   * Update the task status in the workstream progress tracking table.
   * Refine future prompts based on experience with previous steps.

3. **Documentation Standards:**
   * Use consistent Markdown formatting across all documentation.
   * Include diagrams where they aid understanding (using PlantUML or Mermaid).
   * Keep code examples in documentation up to date with actual implementation.
   * Document both "how" and "why" for complex systems.

4. **Change Propagation:**
   * When a design change impacts multiple documents, update all affected documents.
   * Highlight cross-document dependencies when proposing changes.
   * During code reviews, verify documentation changes match code changes.
   * Flag documentation inconsistencies for immediate resolution.

## Conclusion

These coding standards are designed to create a robust, maintainable, and accessible codebase that can be effectively developed by both AI agents and human collaborators. All team members are expected to follow these guidelines and suggest improvements when necessary. Regular reviews of these standards will ensure they evolve with the project and incorporate emerging best practices.

For questions or clarifications about these standards, please reference the V4TechSpec or consult with the development team lead. 