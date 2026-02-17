# Docker Configuration - FitKart Backend

## 📦 Overview

Complete Docker setup for FitKart backend with development and production configurations.

## 📁 Docker Files Structure

```
├── Dockerfile                    # Production-ready multi-stage build
├── .dockerignore                 # Files excluded from Docker context
├── docker-compose.yml            # Base configuration
├── docker-compose.dev.yml        # Development overrides
├── docker-compose.prod.yml       # Production overrides
├── scripts/
│   ├── docker-setup.sh           # Linux/Mac setup script
│   ├── docker-setup.bat          # Windows setup script
│   └── init-db.sql              # Database initialization
├── monitoring/
│   ├── prometheus.yml            # Prometheus configuration
│   ├── loki-config.yml          # Loki log aggregation config
│   └── promtail-config.yml      # Log shipper configuration
├── nginx.conf                    # Nginx reverse proxy config
└── .env.example                  # Environment variables template
```

## 🚀 Quick Start

### Linux/Mac

```bash
# Make script executable
chmod +x scripts/docker-setup.sh

# Run setup
bash scripts/docker-setup.sh setup development
```

### Windows

```cmd
# Run setup
scripts\docker-setup.bat setup development
```

### Manual Setup

```bash
# Copy environment file
cp .env.example .env

# Start services (development)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or start services (production)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐳 Dockerfile Explained

The Dockerfile uses a **multi-stage build** for production optimization:

1. **Builder Stage** (node:18-alpine)
   - Installs all dependencies
   - Compiles TypeScript to JavaScript
   - Creates optimized build output

2. **Runtime Stage** (node:18-alpine)
   - Uses only production dependencies
   - Runs as non-root user (nodejs)
   - Includes health check
   - Uses dumb-init for proper signal handling

**Key Features:**
- ✅ Minimal final image size (~150MB)
- ✅ Security: Non-root user, proper signal handling
- ✅ Health checks for orchestrators
- ✅ Build metadata labels

## 🔧 Common Tasks

### Start/Stop Services

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed database
docker-compose exec backend npm run seed

# Database shell
docker-compose exec postgres psql -U postgres -d fitkart

# Backup database
docker-compose exec postgres pg_dump -U postgres fitkart > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres fitkart < backup.sql
```

### Service Management

```bash
# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Remove all resources
docker-compose down -v

# Service status
docker-compose ps
```

## 📊 Service Details

### Services Running

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| Backend | Custom Node.js | 3000 | Express API |
| PostgreSQL | postgres:14-alpine | 5432 | Database |
| Redis | redis:7-alpine | 6379 | Cache/Session |
| Nginx | nginx:alpine | 80, 443 | Reverse Proxy |
| pgAdmin | dpage/pgadmin4 | 5050 | Database GUI (Dev) |
| Redis Commander | rediscommander | 8081 | Redis GUI (Dev) |
| Prometheus | prom/prometheus | 9090 | Metrics (Prod) |
| Grafana | grafana/grafana | 3002 | Dashboards (Prod) |
| Loki | grafana/loki | 3100 | Logs (Prod) |

## 🌐 Environment Configuration

### Development (.env)

```bash
NODE_ENV=development
DATABASE_PASSWORD=postgres
REDIS_PASSWORD=
JWT_SECRET=dev_key
LOG_LEVEL=debug
```

### Production (.env)

```bash
NODE_ENV=production
DATABASE_PASSWORD=<secure_password>
REDIS_PASSWORD=<secure_password>
JWT_SECRET=<cryptographically_secure_key>
CORS_ORIGINS=https://your-domain.com
LOG_LEVEL=info
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` as template
   - Rotate secrets regularly

2. **Docker Security**
   - Run as non-root user
   - Use read-only volumes where possible
   - Enable security scanning
   - Keep images updated

3. **Network Security**
   - Services on private network
   - Nginx as reverse proxy
   - HTTPS/TLS in production
   - VPN for database access

4. **Data Protection**
   - Volume backups
   - Database encryption
   - Access controls
   - Audit logging

## 📈 Monitoring & Logging

### Development Tools

- **pgAdmin** (http://localhost:5050)
  - Database GUI
  - Credentials: admin@fitkart.local / admin

- **Redis Commander** (http://localhost:8081)
  - Redis GUI
  - Monitor caches and sessions

### Production Monitoring

- **Prometheus** (http://localhost:9090)
  - Metrics collection
  - Query metrics

- **Grafana** (http://localhost:3002)
  - Dashboard creation
  - Alert setup

- **Loki** (http://localhost:3100)
  - Log aggregation
  - Log queries

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Check what's using a port
lsof -i :3000

# Use different port
PORT=3001 docker-compose up -d
```

### Out of Memory

```bash
# Check container stats
docker stats

# Clean up Docker
docker system prune -a --volumes

# Increase Docker memory (Desktop)
# Settings > Resources > Memory Slider
```

### Database Connection Failed

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check if database is ready
docker-compose exec postgres pg_isready

# Restart database
docker-compose restart postgres
```

### Services Won't Start

```bash
# Check all logs
docker-compose logs

# Check Docker daemon
docker info

# Rebuild images
docker-compose build --no-cache
```

## 📚 Documentation

- **Main Guide**: See [DOCKER_GUIDE.md](../DOCKER_GUIDE.md)
- **Backend README**: See [backend/README.md](../backend/README.md)
- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/

## ✅ Pre-Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Database backups tested
- [ ] Monitoring alerts configured
- [ ] Resource limits appropriate
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Security scanning passed
- [ ] Logs configured and flowing
- [ ] Automation ready (CI/CD)

## 🔄 Deployment Workflow

1. **Build Image**
   ```bash
   docker build -t fitkart-backend:latest ./backend
   ```

2. **Push to Registry**
   ```bash
   docker push your-registry/fitkart-backend:latest
   ```

3. **Deploy to Production**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **Verify Deployment**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

## 🔗 Related Commands

```bash
# View container resource usage
docker stats

# Inspect container
docker inspect fitkart-backend

# View image layers
docker history fitkart-backend

# Push to registry
docker push your-registry/fitkart-backend

# Pull from registry
docker pull your-registry/fitkart-backend

# Clean up
docker system prune -a --volumes
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs`
2. Check Docker setup: `docker info`
3. Verify resources: `docker stats`
4. Check file permissions: `ls -alh volumes/`
5. Review Docker documentation

