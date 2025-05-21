# 2dots1line Monorepo Design

## Overview

This document details the monorepo structure for the 2dots1line Memory System V4 implementation. The structure is designed to:

1. **Support Incremental Migration** from legacy codebase to V4 architecture
2. **Enable Team Collaboration** across different components
3. **Promote Code Reuse** through shared packages
4. **Ensure Clean Architecture** with separation of concerns
5. **Facilitate Regional Deployment** for both US and China markets

## Package Management

We'll use **Turborepo** for our monorepo management due to its:
- Superior caching capabilities
- Simplified configuration compared to Nx
- Better support for incremental adoption
- Compatibility with our existing npm-based workflow

### Root Package.json

```json
{
  "name": "2dots1line-monorepo",
  "version": "4.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*",
    "workers/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.2",
    "prettier": "^3.2.5",
    "turbo": "^2.1.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "packageManager": "npm@10.5.0"
}
```

### Turbo Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Directory Structure

```
/2dots1line-v4-monorepo/                # Root directory
├── .github/                            # GitHub-specific settings
│   ├── ISSUE_TEMPLATE/                 # Templates for GitHub issues
│   ├── PULL_REQUEST_TEMPLATE.md        # PR template
│   └── workflows/                      # CI/CD workflows
│       ├── ci-main.yml                 # Main branch CI
│       ├── ci-pr.yml                   # PR validation
│       └── deployment.yml              # Deployment workflow
│
├── apps/                               # Application implementations
│   ├── web-app/                        # Next.js web application
│   │   ├── public/                     # Static assets
│   │   ├── src/
│   │   │   ├── app/                    # Next.js App Router pages
│   │   │   │   ├── (auth)/             # Auth-related routes
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── (main)/             # Main app routes
│   │   │   │   │   ├── chat/           # Dot chat interface
│   │   │   │   │   ├── today/          # Today dashboard 
│   │   │   │   │   ├── lifeweb/        # Knowledge graph exploration
│   │   │   │   │   └── settings/       # User settings
│   │   │   │   └── layout.tsx          # Root layout
│   │   │   ├── components/             # React components
│   │   │   │   ├── common/             # Generic UI components
│   │   │   │   ├── layout/             # Layout components
│   │   │   │   ├── memory/             # Memory-related components
│   │   │   │   ├── chat/               # Chat interface components
│   │   │   │   └── viz/                # Visualization components
│   │   │   ├── contexts/               # React context providers
│   │   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── lib/                    # Client-side utilities
│   │   │   │   ├── api/                # API client
│   │   │   │   └── utils/              # Utility functions
│   │   │   ├── styles/                 # Global styles
│   │   │   └── types/                  # Web-specific types
│   │   ├── next.config.js              # Next.js configuration
│   │   ├── package.json                # Web app dependencies
│   │   ├── tsconfig.json               # TypeScript config
│   │   └── README.md                   # Web app documentation
│   │
│   ├── mobile-app/                     # React Native mobile app
│   │   ├── src/                        # Mobile app source code
│   │   │   ├── screens/                # App screens
│   │   │   ├── components/             # Mobile UI components
│   │   │   ├── navigation/             # Navigation setup
│   │   │   ├── hooks/                  # Mobile-specific hooks
│   │   │   ├── services/               # Mobile services
│   │   │   └── utils/                  # Mobile utilities
│   │   ├── ios/                        # iOS-specific files
│   │   ├── android/                    # Android-specific files
│   │   ├── package.json                # Mobile dependencies
│   │   └── README.md                   # Mobile app documentation
│   │
│   ├── backend-api/                    # Express.js API server
│   │   ├── src/
│   │   │   ├── config/                 # Backend configuration
│   │   │   │   ├── database.ts         # Database connections
│   │   │   │   ├── queue.ts            # Queue configuration
│   │   │   │   ├── cache.ts            # Redis configuration
│   │   │   │   ├── llm.ts              # LLM provider config
│   │   │   │   └── logging.ts          # Logging configuration
│   │   │   ├── controllers/            # API endpoint handlers
│   │   │   │   ├── auth.controller.ts  # Authentication endpoints
│   │   │   │   ├── chat.controller.ts  # Chat endpoints
│   │   │   │   ├── memory.controller.ts # Memory endpoints
│   │   │   │   └── ...                 # Other controllers
│   │   │   ├── middleware/             # Express middleware
│   │   │   │   ├── auth.middleware.ts  # Authentication
│   │   │   │   ├── errorHandler.ts     # Error handling
│   │   │   │   ├── validation.ts       # Request validation
│   │   │   │   └── ...                 # Other middleware
│   │   │   ├── routes/                 # API route definitions
│   │   │   │   ├── auth.routes.ts      # Auth routes
│   │   │   │   ├── chat.routes.ts      # Chat routes
│   │   │   │   ├── memory.routes.ts    # Memory routes
│   │   │   │   └── ...                 # Other routes
│   │   │   ├── services/               # Business logic services
│   │   │   │   ├── auth.service.ts     # Authentication logic
│   │   │   │   ├── chat.service.ts     # Chat orchestration
│   │   │   │   └── ...                 # Other services
│   │   │   ├── utils/                  # Backend utilities
│   │   │   └── server.ts               # Express server setup
│   │   ├── prisma/                     # Prisma ORM
│   │   │   ├── schema.prisma           # Database schema
│   │   │   ├── migrations/             # Database migrations
│   │   │   └── seed.ts                 # Seed data
│   │   ├── package.json                # Backend dependencies
│   │   ├── Dockerfile                  # Container definition
│   │   └── README.md                   # Backend documentation
│   │
│   └── legacy-adapter/                 # MIGRATION: Legacy compatibility layer
│       ├── src/                        # Legacy adapter source code
│       │   ├── adapters/               # V3->V4 adapters
│       │   ├── mappings/               # Schema mappings
│       │   └── services/               # Compatibility services
│       ├── package.json                # Legacy adapter dependencies
│       └── README.md                   # Legacy adapter documentation
│
├── packages/                           # Shared code libraries
│   ├── shared-types/                   # Common TypeScript types
│   │   ├── src/
│   │   │   ├── entities/               # Core entity type definitions
│   │   │   │   ├── user.types.ts       # User types
│   │   │   │   ├── memory.types.ts     # Memory types
│   │   │   │   ├── concept.types.ts    # Concept types
│   │   │   │   └── ...                 # Other entity types
│   │   │   ├── api/                    # API request/response types
│   │   │   ├── ai/                     # AI-related types
│   │   │   │   ├── agent.types.ts      # Cognitive agent I/O types
│   │   │   │   └── tool.types.ts       # Deterministic tool I/O types
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Types dependencies
│   │   └── tsconfig.json               # TypeScript config
│   │
│   ├── database/                       # Database access layer
│   │   ├── src/
│   │   │   ├── prisma/                 # Prisma client wrapper
│   │   │   ├── neo4j/                  # Neo4j client wrapper
│   │   │   ├── weaviate/               # Weaviate client wrapper
│   │   │   ├── redis/                  # Redis client wrapper
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Database dependencies
│   │   └── README.md                   # Database documentation
│   │
│   ├── ai-clients/                     # LLM provider clients
│   │   ├── src/
│   │   │   ├── google/                 # Google AI client
│   │   │   ├── deepseek/               # DeepSeek client
│   │   │   ├── models/                 # Model selection logic
│   │   │   ├── interfaces/             # Common interfaces
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # AI client dependencies
│   │   └── README.md                   # AI client documentation
│   │
│   ├── ui-components/                  # Shared UI components
│   │   ├── src/
│   │   │   ├── components/             # React components
│   │   │   ├── hooks/                  # UI-related hooks
│   │   │   ├── theme/                  # Shared theme
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # UI dependencies
│   │   └── README.md                   # UI documentation
│   │
│   └── utils/                          # Shared utilities
│       ├── src/
│       │   ├── formatting/             # Date, text formatters
│       │   ├── validation/             # Validation helpers
│       │   ├── security/               # Security utilities
│       │   └── index.ts                # Exports
│       ├── package.json                # Utils dependencies
│       └── README.md                   # Utils documentation
│
├── services/                           # Cognitive agents & tools
│   ├── dialogue-agent/                 # Dialogue Agent (Dot)
│   │   ├── src/
│   │   │   ├── agent/                  # Agent implementation
│   │   │   ├── prompts/                # LLM prompts
│   │   │   ├── utils/                  # Agent-specific utilities
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Agent dependencies
│   │   ├── README.md                   # Agent documentation
│   │   └── __tests__/                  # Agent tests
│   │
│   ├── ingestion-analyst/              # Ingestion Analyst
│   │   ├── src/
│   │   │   ├── tiers/                  # Tiered processing implementations
│   │   │   ├── chunking/               # Content chunking logic
│   │   │   ├── extraction/             # Entity extraction
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Dependencies
│   │   └── __tests__/                  # Tests
│   │
│   ├── retrieval-planner/              # Retrieval Planner
│   │   ├── src/
│   │   │   ├── strategies/             # Retrieval strategies
│   │   │   ├── reranking/              # Result reranking
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Dependencies
│   │   └── __tests__/                  # Tests
│   │
│   ├── insight-engine/                 # Insight Engine
│   │   ├── src/
│   │   │   ├── algorithms/             # Pattern detection algorithms
│   │   │   ├── hypothesis/             # Hypothesis generation
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Dependencies
│   │   └── __tests__/                  # Tests
│   │
│   ├── ontology-steward/               # Ontology Steward
│   │   ├── src/
│   │   │   ├── schema/                 # Schema management
│   │   │   ├── mapping/                # Term mapping logic
│   │   │   └── index.ts                # Exports
│   │   ├── package.json                # Dependencies
│   │   └── __tests__/                  # Tests
│   │
│   └── tools/                          # Deterministic Tools
│       ├── text-tools/                 # Text processing tools
│       ├── vision-tools/               # Vision processing tools
│       ├── embedding-tools/            # Embedding generation tools
│       ├── vector-tools/               # Vector search tools
│       ├── graph-tools/                # Graph operation tools
│       ├── registry/                   # Tool registry
│       └── README.md                   # Tools documentation
│
├── workers/                            # Background workers
│   ├── ingestion-worker/               # Ingestion queue processor
│   │   ├── src/
│   │   │   ├── processor.ts            # Job processor
│   │   │   └── index.ts                # Worker setup
│   │   ├── package.json                # Worker dependencies
│   │   └── Dockerfile                  # Container definition
│   │
│   ├── embedding-worker/               # Embedding generation worker
│   │   ├── src/
│   │   │   ├── processor.ts            # Job processor
│   │   │   └── index.ts                # Worker setup
│   │   ├── package.json                # Worker dependencies
│   │   └── Dockerfile                  # Container definition
│   │
│   ├── insight-worker/                 # Insight generation worker
│   │   ├── src/
│   │   │   ├── processor.ts            # Job processor
│   │   │   └── index.ts                # Worker setup
│   │   ├── package.json                # Worker dependencies
│   │   └── Dockerfile                  # Container definition
│   │
│   └── scheduler/                      # Scheduled job processor
│       ├── src/
│       │   ├── jobs/                   # Job definitions
│       │   └── index.ts                # Scheduler setup
│       ├── package.json                # Scheduler dependencies
│       └── Dockerfile                  # Container definition
│
├── infrastructure/                     # IaC for deployment
│   ├── aws/                            # AWS deployment
│   │   ├── terraform/                  # Terraform modules
│   │   └── README.md                   # AWS documentation
│   │
│   ├── tencent/                        # Tencent Cloud deployment
│   │   ├── terraform/                  # Terraform modules
│   │   └── README.md                   # Tencent documentation
│   │
│   └── docker/                         # Docker Compose for local dev
│       ├── docker-compose.yml          # Main compose file
│       ├── docker-compose.dev.yml      # Development overrides
│       └── README.md                   # Docker documentation
│
├── docs/                               # Documentation
│   ├── V4TechSpec.md                   # Technical specification
│   ├── ImplementationRoadmap.md        # Implementation plan
│   ├── MonoRepoDesign.md               # This document
│   ├── architecture/                   # Architecture diagrams
│   ├── api/                            # API documentation
│   └── README.md                       # Docs overview
│
├── scripts/                            # Utility scripts
│   ├── setup/                          # Setup scripts
│   │   ├── setup-dev.sh                # Dev environment setup
│   │   └── setup-db.sh                 # Database setup
│   ├── migration/                      # Data migration scripts
│   │   ├── migrate-users.js            # User data migration
│   │   ├── migrate-memories.js         # Memory data migration
│   │   └── migrate-schema.js           # Schema migration
│   └── monitoring/                     # Monitoring scripts
│
├── config/                             # Global configuration
│   ├── eslint/                         # ESLint configuration
│   ├── prettier/                       # Prettier configuration
│   ├── jest/                           # Jest test configuration
│   └── tsconfig/                       # Base TypeScript configs
│
├── .gitignore                          # Git ignore file
├── .eslintrc.js                        # Root ESLint config
├── .prettierrc.js                      # Root Prettier config
├── jest.config.js                      # Root Jest config
├── tsconfig.json                       # Root TypeScript config
├── turbo.json                          # Turborepo configuration
├── package.json                        # Root package.json
└── README.md                           # Project overview
```

## Key Improvements from Initial Design

1. **Migration Support**: Added `legacy-adapter` package to facilitate migration from V3 to V4 architecture
2. **Testing Structure**: Added specific test directories to ensure proper test organization
3. **Database Package**: Created a dedicated database package for shared database access
4. **Tool Organization**: Better organization of deterministic tools into specific tool packages
5. **Docker Support**: Added Docker configuration for local development
6. **Migration Scripts**: Added specific migration scripts for transitioning from legacy data structures
7. **Configuration Management**: Improved configuration structure with explicit files

## Package Dependencies

Here's a diagram of key package dependencies to ensure proper layer separation:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Web App     │     │   Mobile App    │     │   Backend API   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Shared Packages                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │ shared-types│  │ui-components│  │  database   │  │ utils  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cognitive Services                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │dialog-agent │  │  ingestion  │  │  retrieval  │  │insight │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Worker Processes                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐  │
│  │  ingestion  │  │  embedding  │  │   insight   │  │scheduler│  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Development Environment Setup

### Prerequisites

- Node.js (v18+)
- Docker Desktop
- Git
- npm (v10+)

### Initial Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/2dots1line-v4-monorepo.git
cd 2dots1line-v4-monorepo
```

2. Install dependencies
```bash
npm install
```

3. Start infrastructure services
```bash
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml up -d
```

4. Generate Prisma client
```bash
cd packages/database
npx prisma generate
```

5. Run database migrations
```bash
npx prisma migrate dev
```

6. Start development servers
```bash
npm run dev
```

## Migration Strategy

To facilitate the migration from Legacy to V4 architecture, we'll follow these steps:

1. **Dual-Mode Operation**: Legacy and V4 components will coexist during migration
2. **Adapter Pattern**: We'll use adapters to translate between Legacy and V4 data models
3. **Feature Flags**: Control which components use Legacy vs V4 implementations
4. **Data Migration**: Gradually migrate data from Legacy to V4 schema
5. **Incremental Replacement**: Replace Legacy components one by one

### Migration Bridge Files

For each major component, create adapter files in the `legacy-adapter` package:

```typescript
// Example: legacy-adapter/src/adapters/memory.adapter.ts
import { LegacyChunkEmbedding } from '../types/legacy.types';
import { MemoryUnit, Chunk } from '@2dots1line/shared-types';

export function adaptLegacyChunkToV4Chunk(legacyChunk: LegacyChunkEmbedding): Chunk {
  return {
    cid: legacyChunk.id,
    muid: generateMuidFromLegacy(legacyChunk),
    text: legacyChunk.text,
    sequence_order: legacyChunk.index,
    role: mapLegacyRoleToV4Role(legacyChunk),
    embedding_id: legacyChunk.id,
  };
}

// Other adapter functions...
```

## Testing Standards

Each package should follow these testing standards:

1. **Unit Tests**: Test individual functions and classes
   - Located in `__tests__/unit/` directory
   - Run with `npm test`

2. **Integration Tests**: Test interactions between components
   - Located in `__tests__/integration/` directory
   - Run with `npm run test:integration`

3. **E2E Tests**: Test full user flows
   - Located in `__tests__/e2e/` directory
   - Run with `npm run test:e2e`

### Test Utilities

Common test utilities should be placed in the `packages/test-utils` package:

```typescript
// Example: packages/test-utils/src/mockData.ts
export function generateMockUser() {
  return {
    userId: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };
}

// Other test helpers...
```

## Continuous Integration

The CI pipeline should include:

1. **Linting**: Run ESLint and Prettier checks
2. **TypeScript Checks**: Verify type compatibility
3. **Unit Tests**: Run all unit tests
4. **Integration Tests**: Run integration tests
5. **Build Verification**: Ensure all packages build correctly
6. **Dependency Check**: Verify dependency consistency

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-main.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx turbo typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

## Conclusion

This monorepo structure provides a solid foundation for implementing the 2dots1line Memory System V4. It enables:

1. **Incremental Migration**: Gradually transition from Legacy to V4 architecture
2. **Team Collaboration**: Different teams can work on separate parts of the system
3. **Code Reuse**: Shared packages promote consistency and reduce duplication
4. **Testing**: Comprehensive testing at all levels
5. **CI/CD**: Automated testing and deployment
6. **Scalability**: Easy addition of new components as the system grows

The structure is designed to be robust and adaptable, allowing different teams to work on different parts of 2dots1line simultaneously while ensuring everything fits together into a cohesive and powerful whole.