# 2dots1line Docker Development Environment

This directory contains Docker Compose configurations for setting up the local development environment for 2dots1line V4.

## Included Services

- **PostgreSQL**: Primary relational database
- **Neo4j**: Graph database for concept relationships
- **Weaviate**: Vector database for semantic search
- **Redis**: Cache, message queues, and rate limiting
- **Redis Commander**: Web UI for Redis (dev only)
- **pgAdmin**: Web UI for PostgreSQL (dev only)

## Getting Started

### Prerequisites

- Docker Desktop (latest version)
- Docker Compose

### Setup

1. From the project root, run:

```bash
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml up -d
```

This will start all services in development mode.

### Accessing Services

- **PostgreSQL**: `localhost:5432` (Username: `2dots1line`, Password: `devpassword`)
- **Neo4j Browser**: `http://localhost:7474` (Username: `neo4j`, Password: `devpassword`)
- **Weaviate Console**: `http://localhost:8080`
- **Redis Commander**: `http://localhost:8081`
- **pgAdmin**: `http://localhost:5050` (Email: `dev@2dots1line.com`, Password: `devpassword`)

## Configuration

### Environment Variables

You can customize service configuration by setting environment variables before running docker-compose:

```bash
export POSTGRES_USER=customuser
export POSTGRES_PASSWORD=custompassword
export POSTGRES_DB=customdb
export NEO4J_AUTH=neo4j/custompassword
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml up -d
```

### Data Persistence

All data is stored in Docker volumes:

- `postgres_data`
- `neo4j_data`, `neo4j_logs`, `neo4j_import`
- `weaviate_data`
- `redis_data`

To reset all data, you can remove these volumes:

```bash
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml down -v
```

## Troubleshooting

### Service Health Checks

The docker-compose files include health checks for all services. To verify service health:

```bash
docker ps
```

Look for `healthy` in the STATUS column.

### Logs

To view logs for a specific service:

```bash
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml logs [service-name]
```

For example:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml logs postgres
```

## Production Use

These Docker configurations are intended for development use only. For production deployment, refer to the AWS and Tencent Cloud Terraform configurations in the sibling directories. 