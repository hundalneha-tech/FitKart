# Docker Setup - FitKart Backend

## 📦 Overview

This guide covers setting up and running FitKart backend using Docker and Docker Compose. The setup includes:

- **PostgreSQL 14** - Database
- **Redis 7** - Cache and session store
- **Node.js Backend** - Express API
- **Nginx** - Reverse proxy
- **Development Tools** - pgAdmin, Redis Commander
- **Monitoring Stack** - Prometheus, Grafana, Loki (Production)

## 🚀 Quick Start

### Prerequisites

- Docker (20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose (2.0+) - [Install Docker Compose](https://docs.docker.com/compose/install/)
- Git

### Development Setup (Linux/Mac)

```bash
# Navigate to project root
cd ~/FitKart_repo

# Run setup script
bash scripts/docker-setup.sh setup development

# Or manually:
cp .env.example .env
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Development Setup (Windows)

```cmd
cd FitKart_repo

REM Run setup script
scripts\docker-setup.bat setup development

REM Or manually:
copy .env.example .env
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Production Setup

```bash
# Setup with production configuration
bash scripts/docker-setup.sh setup production

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📋 Docker Compose Files

### `docker-compose.yml` (Base Configuration)
Main configuration file with all core services:
- PostgreSQL Database
- Redis Cache
- Backend API
- Nginx Reverse Proxy

**Environment Variables** (via `.env`):
```bash
DATABASE_NAME=fitkart
DATABASE_USER=postgres
DATABASE_PASSWORD=secure_password_here
REDIS_PASSWORD=
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3000
```

### `docker-compose.dev.yml` (Development Overrides)
Additional services and configurations for development:
- Source code volumes (hot reload)
- Debug port (9229)
- pgAdmin (PostgreSQL GUI)
- Redis Commander (Redis GUI)
- Debug logging

**Start Development:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### `docker-compose.prod.yml` (Production Overrides)
Production-ready configuration with:
- Resource limits and reservations
- Service replicas (3 backend instances)
- Health checks
- Monitoring stack (Prometheus, Grafana, Loki)
- Log aggregation

**Start Production:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🛠️ Common Commands

### Start Services

**Development:**
```bash
docker-compose up -d
# with hot reload and debug tools
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Production:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
docker-compose down
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed database
docker-compose exec backend npm run seed

# Run tests
docker-compose exec backend npm test

# Access database shell
docker-compose exec postgres psql -U postgres -d fitkart

# Access Redis CLI
docker-compose exec redis redis-cli
```

### Service Status
```bash
docker-compose ps
```

### Rebuild Images
```bash
# Rebuild with cache
docker-compose build

# Rebuild without cache
docker-compose build --no-cache
```

## 🖥️ Service URLs

### Development Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:3000 | - |
| Health Check | http://localhost:3000/health | - |
| API Documentation | http://localhost:3000/api-docs | - |
| **pgAdmin** | http://localhost:5050 | admin@fitkart.local / admin |
| **Redis Commander** | http://localhost:8081 | - |
| **PostgreSQL** | localhost:5432 | postgres / postgres |
| **Redis** | localhost:6379 | (no password) |

### Production Monitoring

| Service | URL | Credentials |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3002 | admin / (from .env) |
| **Loki** | http://localhost:3100 | - |

## 📁 Volume Mapping

### Development Volumes
```yaml
backend:
  volumes:
    - ./backend/src:/app/src:ro          # Read-only source
    - ./backend/dist:/app/dist           # Writable build output
    - /app/node_modules                  # Anonymous volume to avoid overwrites
```

### Production Volumes
```yaml
postgres_data:    # PostgreSQL data persistence
postgres_backups: # Database backups
redis_data:       # Redis data persistence
prometheus_data:  # Metrics storage
grafana_data:     # Dashboard configuration
loki_data:        # Log storage
```

## 🔐 Security Configuration

### Environment Variables (Production)

Create `.env` file with secure values:

```bash
# Critical - Change these in production!
DATABASE_PASSWORD=secure_password_generate_strong_password
JWT_SECRET=generate_cryptographically_secure_random_string
REDIS_PASSWORD=generate_strong_password

# CORS
CORS_ORIGINS=https://your-domain.com,https://app.your-domain.com

# Monitoring
GRAFANA_PASSWORD=secure_password
GRAFANA_URL=https://grafana.your-domain.com
```

### Network Security

- Services communicate via private Docker network `fitkart-network`
- Only exposed ports: 80, 443, 3000, 3001, 3002, 5050, 8081, 9090
- Use Nginx as reverse proxy in front of backend

### Database Security

- PostgreSQL runs with password authentication
- Redis password protection (production)
- Volume backups for disaster recovery

## 📊 Resource Limits (Production)

```yaml
backend:
  limits:
    cpus: '2'
    memory: 2G
  reservations:
    cpus: '1'
    memory: 1G

postgres:
  limits:
    cpus: '2'
    memory: 4G
  reservations:
    cpus: '1'
    memory: 2G

redis:
  limits:
    cpus: '1'
    memory: 2G
  reservations:
    cpus: '0.5'
    memory: 1G
```

## 🔄 Upgrade & Migration Strategy

### Zero-Downtime Deployment

1. **Update image** (new version available)
```bash
docker-compose build --no-cache backend
```

2. **Run migrations** (if needed)
```bash
docker-compose exec backend npm run migrate
```

3. **Rolling update** (with 3 replicas, updates one at a time)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Verify** new instances are healthy
```bash
docker-compose ps
```

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres fitkart > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres fitkart < backup.sql
```

## 🧹 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Check resource availability
docker system df

# Remove dangling resources
docker system prune -a
```

### Database connection issues

```bash
# Check database health
docker-compose exec postgres pg_isready

# View PostgreSQL logs
docker-compose logs postgres
```

### High memory usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose restart

# Clear build cache
docker builder prune
```

### Port conflicts

```bash
# Check port usage
lsof -i :3000

# Use different port (update .env)
PORT=3001 docker-compose up -d
```

## 📖 Advanced Configuration

### Custom Database Initialization

Edit `scripts/init-db.sql`:
```sql
-- Add custom initialization scripts here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Nginx Configuration

Edit `nginx.conf` for:
- SSL/TLS certificates
- Rate limiting
- Custom headers
- Load balancing

### Prometheus Monitoring

Edit `monitoring/prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'fitkart-backend'
    static_configs:
      - targets: ['backend:3000']
```

### Grafana Dashboards

Add custom dashboards in `monitoring/grafana-provisioning/dashboards/`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
- [Redis in Docker](https://hub.docker.com/_/redis)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## ✅ Pre-Deployment Checklist

- [ ] `.env` file created with production values
- [ ] Database password is strong and unique
- [ ] JWT_SECRET is cryptographically secure
- [ ] CORS_ORIGINS configured for your domain
- [ ] SSL certificates configured in Nginx
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Resource limits appropriate for your infrastructure
- [ ] Health checks configured and passing
- [ ] Load testing completed

## 🚀 Deployment Instructions

### Deploy to Production Server

1. **SSH to server**
```bash
ssh user@production-server
```

2. **Clone repository**
```bash
git clone https://github.com/yourusername/FitKart.git
cd FitKart
```

3. **Create environment file**
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

4. **Start services**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

5. **Verify deployment**
```bash
curl http://localhost:3000/health
docker-compose ps
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Push Docker Image
  run: |
    docker build -t fitkart-backend:latest ./backend
    docker push your-registry/fitkart-backend:latest

- name: Deploy to Production
  run: |
    ssh user@prod-server 'cd FitKart && docker-compose pull && docker-compose up -d'
```

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review [Docker troubleshooting](https://docs.docker.com/config/containers/logging/)
3. Create GitHub issue with error details
4. Consult team documentation

