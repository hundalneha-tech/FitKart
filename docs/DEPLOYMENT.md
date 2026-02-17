# FitKart Deployment Guide

## Prerequisites
- Docker and Docker Compose
- AWS or GCP account
- Heroku account (optional)
- Domain name
- SSL certificate

## Deployment Options

## Option 1: Docker on AWS EC2

### 1. Launch EC2 Instance
```bash
# 1. Go to AWS EC2 Console
# 2. Launch new instance
# 3. Select Ubuntu 20.04 LTS
# 4. Instance type: t3.medium or larger
# 5. Security groups: Allow ports 80, 443, 3000, 3001
```

### 2. Connect and Setup
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd FitKart
```

### 3. Configure Environment
```bash
# Create .env files
cp backend/.env.example backend/.env
cp admin-panel/.env.example admin-panel/.env

# Edit .env files with production values
nano backend/.env
```

### 4. Deploy
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## Option 2: AWS ECS with RDS

### 1. Create RDS Database
```bash
# AWS Console > RDS > Create Database
# - Engine: PostgreSQL 12+
# - DB instance class: db.t3.small
# - Multi-AZ: Enabled for production
# - Storage: 20GB GP2
# - Backup retention: 30 days
```

### 2. Create ElastiCache for Redis
```bash
# AWS Console > ElastiCache > Create Cluster
# - Engine: Redis 6+
# - Node type: cache.t3.micro
# - Number of nodes: 1
# - Automatic failover: Enabled for production
```

### 3. Deploy with ECS
```bash
# Push Docker image to ECR
aws ecr create-repository --repository-name fitkart-backend

# Build and push
docker build -t fitkart-backend ./backend
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag fitkart-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/fitkart-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/fitkart-backend:latest

# Create ECS task definition using the pushed image
# Create ECS service from task definition
```

## Option 3: Heroku Deployment

### Backend
```bash
# Create Heroku app
heroku create fitkart-backend

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0 -a fitkart-backend

# Add Redis add-on
heroku addons:create heroku-redis:premium-0 -a fitkart-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret -a fitkart-backend
heroku config:set SHOPIFY_ACCESS_TOKEN=your_token -a fitkart-backend

# Deploy
git push heroku main:main
```

### Admin Panel
```bash
# Create Heroku app
heroku create fitkart-admin

# Set environment variables
heroku config:set NEXT_PUBLIC_API_URL=https://fitkart-backend.herokuapp.com/api

# Deploy
git push heroku main:main
```

## Production Configuration

### Environment Variables
```bash
# backend/.env
NODE_ENV=production
DATABASE_URL=<RDS-URL>
REDIS_URL=<ElastiCache-URL>
JWT_SECRET=<strong-random-secret>
SHOPIFY_ACCESS_TOKEN=<token>
```

### SSL Certificate
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d fitkart.com

# Configure nginx for HTTPS
sudo nano /etc/nginx/sites-available/fitkart
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name fitkart.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fitkart.com;

    ssl_certificate /etc/letsencrypt/live/fitkart.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitkart.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3001;
    }
}
```

## Monitoring and Logging

### CloudWatch (AWS)
```bash
# Configure CloudWatch agent on EC2
# View logs in AWS Console > CloudWatch > Log Groups
```

### Application Monitoring
```bash
# Set up error tracking
# - Sentry for error monitoring
# - DataDog for performance monitoring
# - New Relic for APM
```

## Backup Strategy

### Database
```bash
# Automated backups via RDS (30 days retention)
# Manual backup
pg_dump fitkart > backup_$(date +%Y%m%d).sql
```

### Disaster Recovery
```bash
# Test restore procedures regularly
# Keep backups in multiple regions
# Document runbooks for manual restoration
```

## Performance Optimization

### Caching
- Configure Redis for session storage
- Cache API responses
- Implement CDN for static assets

### Database
- Add indexes on frequently queried columns
- Monitor slow queries
- Implement connection pooling

### Load Balancing
- Use AWS ELB or ALB
- Configure auto-scaling
- Monitor CPU and memory metrics

## Rollback Procedure

```bash
# If deployment fails
docker-compose down
git checkout previous-version
docker-compose up -d

# Or use ECS/ECR to rollback to previous image
```

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] WAF configured
- [ ] Database backed up
- [ ] Secrets stored in secure manager
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Regular security audits
- [ ] Penetration testing completed

## Support

For deployment issues, refer to:
1. [Setup Guide](./SETUP.md)
2. Cloud provider documentation
3. Docker documentation
