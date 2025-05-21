# @2dots1line/database

Database access layer for 2dots1line V4 that provides client wrappers for PostgreSQL (via Prisma), Neo4j, Weaviate, and Redis.

## Features

- **Singleton client patterns** for consistent database access
- **Connection management** with automatic retries
- **Telemetry** for query monitoring and performance tracking
- **Health checks** for all database connections
- **Error handling** and graceful degradation
- **Circuit breaking** for preventing cascade failures
- **Type safety** with TypeScript interfaces

## Installation

```bash
npm install @2dots1line/database
```

## Usage

### Initialize all databases

```typescript
import { initializeDatabases } from '@2dots1line/database';

// Initialize with default config (from environment variables)
await initializeDatabases();

// Or with custom configuration
await initializeDatabases({
  prisma: {
    url: 'postgresql://user:password@localhost:5432/mydb',
  },
  neo4j: {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: 'password',
    database: 'mydatabase',
  },
  weaviate: {
    scheme: 'http',
    host: 'localhost:8080',
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
});
```

### PostgreSQL (via Prisma)

```typescript
import { prisma } from '@2dots1line/database';

// Use Prisma client as usual
const users = await prisma.users.findMany();

// Disconnect when done
import { disconnectPrisma } from '@2dots1line/database';
await disconnectPrisma();

// Health check
import { prismaHealthCheck } from '@2dots1line/database';
const health = await prismaHealthCheck();
console.log(health);
```

### Neo4j

```typescript
import { neo4jDriver, recordToObject } from '@2dots1line/database';

// Execute a read query
const result = await neo4jDriver.executeRead(
  'MATCH (u:User {userId: $userId}) RETURN u',
  { userId: '123' }
);

// Convert Neo4j records to plain objects
const users = result.records.map(record => recordToObject(record));

// Execute a write query
await neo4jDriver.executeWrite(
  'CREATE (n:Concept {name: $name, type: $type})',
  { name: 'Patience', type: 'value' }
);
```

### Weaviate

```typescript
import { weaviateClient } from '@2dots1line/database';

// Perform a vector search
const results = await weaviateClient.vectorSearch(
  'ChunkEmbeddings', 
  vectorQuery, // Your vector array
  {
    limit: 10,
    fields: ['cid', 'text_preview', 'creation_ts'],
    withDistance: true,
  }
);

// Create a schema class
await weaviateClient.createSchemaClass({
  class: 'ConceptEmbeddings',
  properties: [
    { name: 'concept_id', dataType: ['string'] },
    { name: 'name', dataType: ['string'] },
    { name: 'type', dataType: ['string'] },
  ],
});

// Batch import objects
await weaviateClient.batchImport(
  'ChunkEmbeddings',
  objectsWithVectors,
  { batchSize: 100 }
);
```

### Redis

```typescript
import { redisClient, TTL } from '@2dots1line/database';

// Cache a value
await redisClient.set('my-key', { data: 'my-value' }, { ttl: TTL.MEDIUM });

// Retrieve a value
const value = await redisClient.get('my-key');

// Implement rate limiting
const rateLimitResult = await redisClient.rateLimit('user:123:api', {
  maxRequests: 100,
  windowSizeInSeconds: 60,
});

if (rateLimitResult.allowed) {
  // Handle the request
} else {
  // Return rate limit error
}

// Use distributed lock
const lockToken = await redisClient.acquireLock('my-resource', 30000);
if (lockToken) {
  try {
    // Perform exclusive operation
  } finally {
    await redisClient.releaseLock('my-resource', lockToken);
  }
}
```

## Health Checks

```typescript
import { checkDatabasesHealth } from '@2dots1line/database';

// Check the health of all database connections
const healthStatus = await checkDatabasesHealth();
console.log(healthStatus);
```

## Graceful Shutdown

```typescript
import { closeDatabases } from '@2dots1line/database';

// Close all database connections
await closeDatabases();
```

## Environment Variables

The package uses the following environment variables for configuration:

### PostgreSQL (Prisma)
- `DATABASE_URL`: PostgreSQL connection string
- `PRISMA_LOG_LEVEL`: Log level for Prisma (info, query, warn, error)

### Neo4j
- `NEO4J_URI`: Neo4j server URI
- `NEO4J_USERNAME`: Neo4j username
- `NEO4J_PASSWORD`: Neo4j password
- `NEO4J_DATABASE`: Neo4j database name

### Weaviate
- `WEAVIATE_SCHEME`: Weaviate connection scheme (http or https)
- `WEAVIATE_HOST`: Weaviate host and port
- `WEAVIATE_API_KEY`: Weaviate API key (if required)

### Redis
- `REDIS_URI`: Redis connection URI
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password
- `REDIS_DB`: Redis database number
- `REDIS_KEY_PREFIX`: Prefix for Redis keys
- `REDIS_CLUSTER_NODES`: Comma-separated list of cluster nodes (host:port) 