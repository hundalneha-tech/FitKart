# 🚀 Production Deployment Guide

Complete guide to deploying FitKart to production with monitoring and scaling.

**Environment**: Linux (Ubuntu/Debian)  
**Estimated Time**: 1-2 hours  
**Difficulty**: Advanced

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring Stack](#monitoring-stack)
- [Backup Strategy](#backup-strategy)
- [Security Hardening](#security-hardening)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │   CloudFlare CDN   │ (DDoS Protection)
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────────┐
         │   Nginx Load Balancer  │ (Port 80, 443)
         └─────────┬──────────────┘
                   │
         ┌─────────▼──────────────────────────────────────────┐
         │         Docker Swarm / Kubernetes                   │
         ├────────────────────────────────────────────────────┤
         │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
         │  │Backend 1 │  │Backend 2 │  │Backend 3 │         │
         │  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
         │       │             │             │              │
         ├───────┴─────────────┴─────────────┴───────────────┤
         │   PostgreSQL 14 (Primary + Replicas)              │
         │   Redis 7 (Cluster Mode)                          │
         └──────────────────────────────────────────────────┘
         
    Monitoring Stack:
    ├─ Prometheus (Metrics)
    ├─ Grafana (Dashboards)
    └─ Loki (Logs)
```

---

## Prerequisites

### Cloud Provider Accounts

Choose one:
- **AWS**: EC2, RDS, ElastiCache
- **DigitalOcean**: Droplets, Managed Databases
- **Azure**: Virtual Machines, Database for PostgreSQL
- **Google Cloud**: Compute Engine, Cloud SQL

### Server Requirements

- **OS**: Ubuntu 20.04 LTS or Debian 11+
- **CPU**: 4+ cores (2 cores minimum for small deployments)
- **RAM**: 8GB+ (4GB minimum)
- **Storage**: 50GB+ (SSD recommended)
- **Bandwidth**: 10 Mbps+

### Software Required

- Docker & Docker Compose
- Git
- OpenSSL
- curl/wget

---

## Server Setup

### 1. Launch Server Instance

#### DigitalOcean (Simplest)

```bash
# 1. Create droplet at digitalocean.com
# - Select Ubuntu 20.04 LTS
# - Choose 4GB RAM / 2 vCPU plan
# - Add your SSH key
# - Create droplet

# 2. SSH into server
ssh root@your_server_ip
```

#### AWS EC2

```bash
# 1. Launch EC2 instance
# - AMI: Ubuntu Server 20.04 LTS
# - Instance type: t3.medium (2 vCPU, 4GB RAM)
# - Security group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your_instance_ip
```

### 2. Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Verify system
lsb_release -a
uname -m
```

### 3. Install Docker

```bash
# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker
docker --version
docker run hello-world
```

### 4. Install Docker Compose (Standalone)

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### 5. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Docker ports
sudo ufw allow 3000/tcp      # Backend API
sudo ufw allow 5432/tcp      # PostgreSQL
sudo ufw allow 6379/tcp      # Redis

# Verify rules
sudo ufw status
```

---

## SSL/TLS Configuration

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

# Or for standalone:
sudo apt install -y certbot
```

### 2. Generate SSL Certificate

#### Using Let's Encrypt (Free)

```bash
# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Expected output:
# Congratulations! Your certificate and chain have been saved at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

#### Certificate Paths

```
/etc/letsencrypt/live/yourdomain.com/
├── privkey.pem          # Private key
├── fullchain.pem        # Full certificate chain
├── cert.pem             # Certificate only
└── chain.pem            # Intermediate chain
```

### 3. Configure Docker to Use SSL

Update `docker-compose.prod.yml`:

```yaml
services:
  nginx:
    environment:
      - SSL_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
      - SSL_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 4. Auto-Renew SSL Certificate

```bash
# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## Docker Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/fitkart
sudo chown $USER:$USER /opt/fitkart
cd /opt/fitkart

# Clone repository
git clone https://github.com/yourusername/FitKart.git .

# Verify structure
ls -la
```

### 2. Prepare Docker Compose Files

```bash
# Copy production compose file
cp docker-compose.prod.yml docker-compose.yml

# Verify prod overrides
cat docker-compose.prod.yml | head -30
```

### 3. Create Production Environment File

```bash
# Copy example and edit
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Key variables for production**:

```env
NODE_ENV=production
PORT=3000

# Database (Managed Service or Container)
DB_HOST=postgres-prod.internal
DB_PORT=5432
DB_USER=fitkart_user
DB_PASSWORD=strong_random_password_here
DB_NAME=fitkart_prod
DB_LOGGING=false
DB_POOL_SIZE=20

# Redis (Managed Service or Container)
REDIS_HOST=redis-prod.internal
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password
REDIS_POOL_SIZE=30

# JWT & Security
JWT_SECRET=generate_new_strong_secret_32_chars_min
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS (Production domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_to_strong_password

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/fitkart

# Monitoring
PROMETHEUS_ENABLED=true
METRICS_PORT=9090
```

### 4. Generate Secure Passwords

```bash
# Generate PostgreSQL password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32

# Store securely in .env.production
```

### 5. Start Production Services

```bash
# Pull latest images
docker-compose pull

# Start services (detached)
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# NAME              COMMAND             STATUS
# fitkart-backend   "npm run start"      Up 2 minutes
# fitkart-postgres  "postgres"           Up 2 minutes
# fitkart-redis     "redis-server"       Up 2 minutes
# fitkart-nginx     "nginx -g ..."       Up 2 minutes
```

### 6. Health Check

```bash
# Check backend health
curl -s https://yourdomain.com/health | jq

# Expected response:
# {"status":"ok","timestamp":"2024-02-17T10:30:00Z"}

# Check container logs
docker-compose logs backend     # Last 100 lines
docker-compose logs -f backend  # Follow logs
```

---

## Database Setup

### 1. Initialize Production Database

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U fitkart_user fitkart_prod

# Or use external PostgreSQL service
psql -h postgres-prod.internal -U fitkart_user fitkart_prod
```

### 2. Run Migrations

```bash
# From inside backend container
docker-compose exec backend npm run migrate

# Expected output:
# ✓ Migration 1: Initial schema
# ✓ Migration 2: Create users table
# ✓ Migration 3: Create coins table
# ... (all migrations successful)
```

### 3. Seed Initial Data

```bash
# Seed database with products, achievements, etc.
docker-compose exec backend npm run seed

# This adds:
# - 42 store products
# - 14 achievements
# - Initial admin user
```

### 4. Verify Database

```bash
# Connect to database
psql -h localhost -U fitkart_user fitkart_prod

# Check tables
\dt

# Check users
SELECT COUNT(*) FROM users;

# Exit
\q
```

### 5. Setup Database Backups

#### Automated Daily Backups

```bash
# Create backup script
cat > /opt/fitkart/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/fitkart/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fitkart_backup_$TIMESTAMP.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U fitkart_user fitkart_prod | gzip > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_FILE s3://your-backup-bucket/

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/fitkart/backup-db.sh
```

#### Schedule Daily Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /opt/fitkart/backup-db.sh >> /var/log/fitkart/backup.log 2>&1
```

#### Restore from Backup

```bash
# Decompress backup
gunzip fitkart_backup_20240217_020000.sql.gz

# Restore database
psql -h localhost -U fitkart_user fitkart_prod < fitkart_backup_20240217_020000.sql

# Verify restoration
psql -h localhost -U fitkart_user fitkart_prod -c "SELECT COUNT(*) FROM users;"
```

---

## Monitoring Stack

### 1. Access Monitoring Dashboards

#### Prometheus
- **URL**: `http://yourdomain.com:9090`
- **Purpose**: Metrics collection
- **Scrape Interval**: 15 seconds

#### Grafana
- **URL**: `http://yourdomain.com:3002`
- **Username**: `admin`
- **Password**: Check `docker-compose.prod.yml`
- **Purpose**: Visualize metrics

#### Loki
- **URL**: `http://yourdomain.com:3100`
- **Purpose**: Log aggregation

### 2. Create Grafana Dashboards

```bash
# Connect to Prometheus data source
1. Go to Grafana dashboard
2. Add new data source → Prometheus
3. URL: http://prometheus:9090
4. Create dashboards for:
   - API Response Times
   - Error Rates
   - Server CPU/Memory
   - Database Connections
   - Redis Memory
```

### 3. Setup Alerts

```yaml
# Add to prometheus.yml
alert_rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate detected"
      
  - alert: HighMemoryUsage
    expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 7
    for: 5m
    annotations:
      summary: "Memory usage above 7GB"
```

---

## Security Hardening

### 1. Network Security

```bash
# Disable password-based SSH
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Only allow connections from specific IPs (optional)
sudo ufw allow from 203.0.113.0/24 to any port 22

# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Application Security

```bash
# In .env.production, ensure:
NODE_ENV=production
HELMET_ENABLED=true
RATE_LIMIT=enabled
```

### 3. Database Security

```bash
# Revoke public schema access
psql -h localhost -U fitkart_user fitkart_prod

fitkart_prod=# REVOKE ALL ON SCHEMA public FROM PUBLIC;
fitkart_prod=# GRANT USAGE ON SCHEMA public TO fitkart_user;
fitkart_prod=# \q
```

### 4. File Permissions

```bash
# Restrict application directory
sudo chmod 750 /opt/fitkart
sudo chmod 600 /opt/fitkart/.env.production
sudo chown root:docker /opt/fitkart

# Restrict logs
sudo chmod 750 /var/log/fitkart
```

### 5. Regular Security Updates

```bash
# Check for updates
sudo apt update
sudo apt list --upgradable

# Install updates
sudo apt upgrade -y

# Restart affected services
docker-compose restart
```

---

## Backup Strategy

### Backup Components

1. **Database**: Automated daily SQL backups
2. **Application**: Version controlled in Git
3. **SSL Certificates**: Auto-renewed by Certbot
4. **Configuration**: Encrypted .env files

### Storage Locations

```
Primary: /opt/fitkart/backups/
Secondary: S3 bucket for offsite backup
Tertiary: Local external drive (monthly)
```

### Recovery Procedure

```bash
# 1. Stop services
docker-compose down

# 2. Restore database
psql -h localhost -U fitkart_user fitkart_prod < backup.sql

# 3. Restore application code
git checkout <commit-hash>

# 4. Start services
docker-compose up -d

# 5. Verify
curl https://yourdomain.com/health
```

---

## Scaling

### Horizontal Scaling (Multiple Servers)

```yaml
# Update docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3  # 3 instances
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

```bash
# Deploy to Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.prod.yml fitkart
```

### Vertical Scaling (Bigger Server)

```bash
# Stop services
docker-compose down

# Upgrade server resources (in cloud provider console)

# Start services
docker-compose up -d

# No application changes needed
```

### Database Replication

```bash
# Setup PostgreSQL primary-replica
# In primary: /etc/postgresql/14/main/postgresql.conf
wal_level = replica
max_wal_senders = 5

# In replica: recovery.conf
standby_mode = 'on'
primary_conninfo = 'host=primary-ip ...'
```

---

## Troubleshooting

### Issue: Services won't start

```bash
# Check logs
docker-compose logs --tail=100

# Check port conflicts
sudo netstat -tulpn | grep LISTEN

# Check disk space
df -h

# Check memory
free -h

# Restart everything
docker-compose down -v
docker-compose up -d
```

### Issue: High memory usage

```bash
# Check container memory
docker stats

# Adjust limits in compose file
# services:
#   backend:
#     mem_limit: 512m

# Restart services
docker-compose restart
```

### Issue: Database connection errors

```bash
# Check database is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify credentials
docker-compose exec postgres psql -U fitkart_user fitkart_prod -c "SELECT 1"

# Check connection pool
docker-compose exec backend curl localhost:3000/health
```

### Issue: SSL certificate not working

```bash
# Check certificate
ssl_leaf_certificate=$(sudo certbot certificates | grep yourdomain.com -A 2 | grep "Expiry Date")
echo $ssl_leaf_certificate

# Renew certificate
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

---

## Monitoring Commands

### View Running Services

```bash
# Docker Compose
docker-compose ps

# Docker (all containers)
docker ps -a

# Services stats
docker stats

# Disk usage
docker system df
```

### Check Application Status

```bash
# Health endpoint
curl https://yourdomain.com/health

# API test
curl -X GET https://yourdomain.com/api/v1/leaderboard/weekly \
  -H "Authorization: Bearer token"

# Check response time
time curl -I https://yourdomain.com/
```

### Database Maintenance

```bash
# Backup
/opt/fitkart/backup-db.sh

# Analyze performance
docker-compose exec postgres psql -U fitkart_user fitkart_prod -c "ANALYZE"

# Vacuum (cleanup)
docker-compose exec postgres psql -U fitkart_user fitkart_prod -c "VACUUM"
```

---

## Maintenance Schedule

### Daily
- ✓ Monitor error logs
- ✓ Check CPU/Memory usage
- ✓ Verify backup completion

### Weekly
- ✓ Review security logs
- ✓ Check SSL certificate expiry
- ✓ Monitor database size

### Monthly
- ✓ Review and update dependencies
- ✓ Test disaster recovery
- ✓ Analyze performance metrics
- ✓ Backup to external storage

### Quarterly
- ✓ Security audit
- ✓ Capacity planning
- ✓ Update documentation

---

## Post-Deployment Checklist

- [ ] Domain DNS configured (A record pointing to server IP)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Database backups configured and tested
- [ ] Monitoring dashboards accessible
- [ ] Admin user created and secured
- [ ] Rate limiting configured
- [ ] CORS properly configured for frontend domain
- [ ] Email service (SendGrid) configured
- [ ] Firewall rules locked down
- [ ] Regular security updates enabled
- [ ] Load balancer configured (if multi-server)
- [ ] Health checks passing
- [ ] API responding on all endpoints

---

**Deployment Time**: 1-2 hours  
**Maintenance Time**: 30 minutes/month  
**Support**: See backend logs with `docker-compose logs -f`

---

**Last Updated**: February 17, 2026  
**Production Ready**: ✅ Yes
