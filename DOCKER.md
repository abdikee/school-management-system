# Docker Setup for School Management System

This document explains how to run the School Management System using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start (Production)

### 1. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your production values (IMPORTANT: Change JWT secrets!)
nano .env
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3000/api
- **API Documentation (Swagger)**: http://localhost:3000/api/docs
- **Database**: localhost:5432 (postgres/postgres)

### 4. Run Database Migrations (First Time Only)

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Optional: Seed the database
docker-compose exec backend npm run prisma:seed
```

## Development Setup (with Hot Reload)

### 1. Start Development Environment

```bash
# Start development services with hot reload
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. Access Development Services

- **Frontend (Vite)**: http://localhost:5173
- **Backend (NestJS)**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **Database**: localhost:5432

### 3. Run Migrations in Development

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Open Prisma Studio
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio
```

## Common Commands

### Production

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d school_management
```

### Development

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Execute commands
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec frontend sh
```

## Environment Variables

### Required for Production

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for JWT access tokens (min 32 chars) | Required |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens (min 32 chars) | Required |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email address | noreply@school.example.com |
| `REDIS_HOST` | Redis host (for caching) | - |
| `REDIS_PORT` | Redis port | 6379 |

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres school_management > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres school_management < backup_file.sql
```

### Run Migrations

```bash
# Production
docker-compose exec backend npx prisma migrate deploy

# Development
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
```

## Troubleshooting

### Port Conflicts

If ports 80, 3000, 5173, or 5432 are in use, modify the `ports` section in `docker-compose.yml` or `docker-compose.dev.yml`.

### Database Connection Issues

1. Ensure postgres container is healthy: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify DATABASE_URL in backend environment

### Frontend Not Loading

1. Check frontend logs: `docker-compose logs frontend`
2. Verify nginx config is correct
3. Ensure backend is accessible at `http://backend:3000` from frontend container

### Permission Issues

If you encounter permission errors with volumes:

```bash
# Fix permissions (Linux/macOS)
sudo chown -R $USER:$USER .
```

## Production Deployment Notes

1. **Change all default secrets** in `.env` before deploying
2. **Use a reverse proxy** (nginx, Traefik) for SSL termination
3. **Configure proper backup strategy** for PostgreSQL
4. **Set up monitoring** for container health
5. **Use Docker secrets** for sensitive values in Swarm/Kubernetes
6. **Configure resource limits** for containers in production

## File Structure

```
.
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── .env.example                # Environment template
├── .dockerignore               # Root docker ignore
├── backend/
│   ├── Dockerfile              # Production backend image
│   ├── Dockerfile.dev          # Development backend image
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Production frontend image (nginx)
    ├── Dockerfile.dev          # Development frontend image
    ├── nginx.conf              # Nginx configuration
    └── .dockerignore
```