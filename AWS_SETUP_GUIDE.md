# AWS Setup & Deployment Guide

Complete step-by-step guide to deploy FitKart to AWS EC2.

**Domain**: www.fitkart.club  
**Time Required**: 30-45 minutes  
**Cost**: ~$15-30/month

---

## Table of Contents

- [AWS Account Setup](#aws-account-setup)
- [Launch EC2 Instance](#launch-ec2-instance)
- [Configure Security Groups](#configure-security-groups)
- [Connect to Server](#connect-to-server)
- [Initialize Server](#initialize-server)
- [Deploy Application](#deploy-application)
- [Domain Configuration](#domain-configuration)
- [SSL Certificate](#ssl-certificate)
- [Verify Deployment](#verify-deployment)

---

## AWS Account Setup

### Step 1: Create AWS Account

If you don't have one already:

```
1. Go to: https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email and password
4. Select "Personal" account type
5. Enter billing information
6. Verify phone number
7. Choose support plan (Free Tier is fine)
```

### Step 2: Create IAM User (Optional but Recommended)

```
1. Sign in to AWS Console: https://console.aws.amazon.com
2. Navigate to: IAM → Users → Create User
3. Username: fitkart-deployer
4. Enable console access
5. Assign policy: AdministratorAccess
6. Download credentials (CSV file)
7. Save in secure location
```

### Step 3: Verify Free Tier Eligibility

```
1. Click your name (top-right)
2. Select "Billing"
3. Look for "Free Tier" tab
4. Ensure eligible for EC2 t2.micro
```

**Free Tier Includes**:
- 750 hours/month of t2.micro EC2
- 20 GB EBS storage
- Several other services

---

## Launch EC2 Instance

### Step 1: Navigate to EC2 Dashboard

```
1. Go to: https://console.aws.amazon.com
2. Search for "EC2"
3. Click "Instances" in left menu
```

### Step 2: Launch Instance

```
1. Click "Launch Instances" (orange button)
2. Select "Ubuntu Server 20.04 LTS"
3. Choose "Free tier eligible" (t2.micro)
4. Continue through steps
```

### Step 3: Configure Instance Details

**Step 1: Choose an AMI**
- Select: `Ubuntu Server 20.04 LTS (HVM), SSD Volume Type`

**Step 2: Choose Instance Type**
- Select: `t2.micro` (Free tier)
- Click: "Review and Launch"

### Step 4: Review & Launch

```
1. Review all settings
2. Click "Launch"
3. Select key pair:
   - "Create a new key pair"
   - Name: `fitkart-prod`
   - Download the file (fitkart-prod.pem)
   - Save in safe location (you'll need this!)
4. Click "Launch Instances"
```

### Step 5: Wait for Instance to Start

```
1. Instance is starting (takes 1-2 minutes)
2. Once running, note the:
   - Public IP (e.g., 54.123.45.67)
   - Instance ID (e.g., i-0abc123def456)
```

---

## Configure Security Groups

### Step 1: Open Security Group Settings

```
1. In EC2 Dashboard, find your instance
2. Click on it
3. Under "Security" tab, find "Security groups"
4. Click on the security group link
```

### Step 2: Edit Inbound Rules

```
1. Click "Edit inbound rules"
2. Delete the default rule
3. Add new rules:
```

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| SSH | TCP | 22 | Your IP (or 0.0.0.0/0) | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Website traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Backend API |
| PostgreSQL | TCP | 5432 | Your IP only | Database |

```
4. Click "Save rules"
```

**⚠️ Security Note**: Only allow PostgreSQL from your IP or the app server

---

## Connect to Server

### From Windows (PowerShell)

```powershell
# 1. Navigate to key directory
cd C:\Users\YourUsername\Downloads

# 2. Set correct permissions on key
icacls "fitkart-prod.pem" /inheritance:r
icacls "fitkart-prod.pem" /grant:r "$env:USERNAME`:(F)"

# 3. SSH into server
ssh -i "fitkart-prod.pem" ubuntu@your-public-ip

# Example:
# ssh -i "fitkart-prod.pem" ubuntu@54.123.45.67
```

### From macOS/Linux

```bash
# 1. Set key permissions
chmod 400 fitkart-prod.pem

# 2. SSH into server
ssh -i fitkart-prod.pem ubuntu@your-public-ip

# Example:
# ssh -i fitkart-prod.pem ubuntu@54.123.45.67
```

### Verify Connection

```bash
# You should see Ubuntu login prompt
# Type 'yes' if asked about key fingerprint
# You're now connected to the server!
```

---

## Initialize Server

Once connected via SSH, run these commands:

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### Step 2: Install Docker

```bash
# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Apply group changes (logout and login or use:)
newgrp docker

# Verify Docker
docker --version
```

### Step 3: Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Step 4: Create Application Directory

```bash
# Create directory
sudo mkdir -p /opt/fitkart
sudo chown ubuntu:ubuntu /opt/fitkart

# Navigate to it
cd /opt/fitkart
```

### Step 5: Clone Repository

```bash
git clone https://github.com/yourusername/FitKart.git .

# Verify
ls -la
```

---

## Domain Configuration

### Step 1: Update DNS Records

If using www.fitkart.club:

```
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add/Update A record:
   - Name: @ (for fitkart.club) or www (for www.fitkart.club)
   - Type: A
   - Value: your-ec2-public-ip (e.g., 54.123.45.67)
   - TTL: 3600

4. Optional: Add CNAME record:
   - Name: www
   - Type: CNAME
   - Value: fitkart.club
   - TTL: 3600

5. Save changes (takes 5-30 minutes to propagate)
```

### Step 2: Verify DNS

```bash
# On your local computer
nslookup www.fitkart.club
# Should show your EC2 IP

# From server:
curl http://www.fitkart.club
# Should return Nginx default page once deployed
```

---

## Deploy Application

### Step 1: Create Environment File

On the server, create `.env.production`:

```bash
cd /opt/fitkart

cat > .env.production << 'EOF'
# Server
NODE_ENV=production
PORT=3000

# Database (local Docker)
DB_HOST=postgres
DB_PORT=5432
DB_USER=fitkart_user
DB_PASSWORD=generate-strong-password-here
DB_NAME=fitkart_prod
DB_LOGGING=false

# Redis (local Docker)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=generate-new-strong-secret-here-min-32-chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS - UPDATE WITH YOUR DOMAIN
CORS_ORIGIN=https://www.fitkart.club,https://fitkart.club

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@fitkart.club

# Admin
ADMIN_EMAIL=admin@fitkart.club
ADMIN_PASSWORD=change-to-strong-password

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/fitkart

# Monitoring
PROMETHEUS_ENABLED=true
EOF

# Set permissions
chmod 600 .env.production
```

### Step 2: Generate Secure Passwords

```bash
# Generate DB password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32

# Update the values in .env.production
nano .env.production
```

### Step 3: Start Services

```bash
# Pull latest images
docker-compose pull

# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps

# Should show:
# postgres - Up 2 minutes
# redis - Up 2 minutes
# backend - Up 1 minute
# nginx - Up 1 minute
```

### Step 4: Run Migrations

```bash
# Initialize database
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed

# Expected output:
# ✓ Migration: Initial schema
# ✓ Migration: Create users table
# ... (all migrations)
```

### Step 5: Health Check

```bash
# Check backend health
curl -s http://localhost:3000/health | jq

# Check API endpoint
curl -s http://localhost:3000/api/v1/leaderboard/weekly \
  -H "Authorization: Bearer dummy" | jq '.data' | head

# Check container logs
docker-compose logs backend     # Last 100 lines
docker-compose logs -f backend  # Follow logs
```

---

## SSL Certificate

### Step 1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Get SSL Certificate

```bash
# For www.fitkart.club and fitkart.club
sudo certbot certonly --standalone \
  -d www.fitkart.club \
  -d fitkart.club \
  --agree-tos \
  --email admin@fitkart.club

# Expected output:
# Congratulations! Your certificate has been issued.
# /etc/letsencrypt/live/www.fitkart.club/
```

### Step 3: Configure Nginx for SSL

```bash
# Nginx already configured in docker-compose.prod.yml
# Update SSL cert paths if needed
```

### Step 4: Auto-Renewal

```bash
# Enable automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## Verify Deployment

### Test 1: Backend Health

```bash
curl https://www.fitkart.club/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Test 2: API Endpoints

```bash
# Get leaderboard
curl https://www.fitkart.club/api/v1/leaderboard/weekly \
  -H "Authorization: Bearer token"

# Should return leaderboard data
```

### Test 3: Database Connection

```bash
docker-compose exec postgres psql -U fitkart_user fitkart_prod -c "SELECT COUNT(*) FROM users;"
# Should return user count
```

### Test 4: Monitoring Dashboards

```
Prometheus: https://www.fitkart.club:9090
Grafana: https://www.fitkart.club:3002
```

---

## Post-Deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Backend services running (`docker-compose ps`)
- [ ] Health endpoint responding
- [ ] API endpoints returning data
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Monitoring dashboards accessible
- [ ] Logs being collected

---

## Backup & Recovery

### Automated Daily Backups

```bash
# Create backup script
cat > /opt/fitkart/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/fitkart/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fitkart_backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U fitkart_user fitkart_prod | gzip > $BACKUP_FILE

# Keep last 7 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/fitkart/backup-db.sh
```

### Schedule Daily Backups

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM UTC:
0 2 * * * /opt/fitkart/backup-db.sh >> /var/log/fitkart/backup.log 2>&1
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Rebuild if needed
docker-compose up -d --build
```

### SSL certificate issues

```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Database connection errors

```bash
# Check if postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify password in .env.production
cat .env.production | grep DB_
```

### Domain not resolving

```bash
# Check DNS propagation
nslookup www.fitkart.club

# From server
dig www.fitkart.club
curl -I http://localhost
```

---

## Next Steps

1. **Monitor the Application**
   - View logs: `docker-compose logs -f`
   - Check metrics: Visit Grafana dashboard

2. **Setup Email Service**
   - Get SendGrid API key
   - Update `SENDGRID_API_KEY` in `.env.production`
   - Restart backend: `docker-compose restart backend`

3. **Mobile App Development**
   - Update API base URL to `https://www.fitkart.club/api/v1`
   - Test all endpoints with production backend

4. **Regular Maintenance**
   - Daily: Monitor logs and health
   - Weekly: Review security logs
   - Monthly: Update packages and SSL renewal verification

---

**Deployment Time**: ~30-45 minutes  
**Monthly Cost**: $5-15 (EC2 free tier) + ~$3-5 (domain)  
**Support**: Check deployment logs with `docker-compose logs`

---

**Last Updated**: February 17, 2026  
**Status**: Production Ready ✅
