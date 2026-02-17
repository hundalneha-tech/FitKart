# AWS Deployment Quick Reference

**Domain**: www.fitkart.club  
**Region**: us-east-1 (recommended)  
**Instance Type**: t2.micro (Free Tier)

---

## ⚡ Quick Start (Terraform)

```bash
# 1. Install Terraform
# https://www.terraform.io/downloads.html

# 2. Configure AWS
aws configure

# 3. Navigate to infrastructure folder
cd infrastructure/terraform

# 4. Initialize Terraform
terraform init

# 5. Review changes
terraform plan

# 6. Apply configuration
terraform apply

# 7. Get outputs
terraform output
```

---

## 🖥️ Manual EC2 Setup

### Console (No code required)

```
1. URL: https://console.aws.amazon.com/ec2
2. Click "Launch Instances"
3. Select: Ubuntu Server 20.04 LTS
4. Instance type: t2.micro (Free tier)
5. Review security groups (allow 22, 80, 443, 3000)
6. Launch
7. Download .pem key file
```

### SSH Connection

**Windows (PowerShell)**:
```powershell
# Run included script
.\scripts\aws-connect.ps1 -InstanceIP "54.123.45.67" -KeyFile "C:\path\to\fitkart-prod.pem"
```

**macOS/Linux**:
```bash
# Set permissions
chmod 400 fitkart-prod.pem

# Connect
ssh -i fitkart-prod.pem ubuntu@54.123.45.67
```

---

## 📋 Server Initialization

### Automated (Recommended)

```bash
# Download and run init script
curl -O https://raw.githubusercontent.com/yourusername/FitKart/main/scripts/aws-init-server.sh
bash aws-init-server.sh
```

### Manual Steps

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 🚀 Application Deployment

```bash
# 1. Clone repository
cd /opt/fitkart
git clone https://github.com/yourusername/FitKart.git .

# 2. Create environment file
cp .env.example .env.production
nano .env.production  # Add your values

# 3. Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose exec backend npm run migrate

# 5. Seed data
docker-compose exec backend npm run seed

# 6. Verify
curl http://localhost:3000/health
```

---

## 🔐 SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot

# Get certificate
sudo certbot certonly --standalone \
  -d www.fitkart.club \
  -d fitkart.club

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🌐 DNS Configuration

### At your domain registrar (GoDaddy, Namecheap, etc.)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 54.123.45.67 | 3600 |
| A | www | 54.123.45.67 | 3600 |

**Propagation**: 5-30 minutes

---

## 📊 Monitoring Access

| Service | URL | Default Port |
|---------|-----|--------------|
| Backend API | https://www.fitkart.club | 443 |
| Prometheus | http://instance-ip:9090 | 9090 |
| Grafana | http://instance-ip:3002 | 3002 |
| Health | https://www.fitkart.club/health | 443 |

---

## 🔍 Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs backend      # Last 100 lines
docker-compose logs -f backend   # Follow logs

# SSH to container
docker-compose exec backend sh

# Database backup
docker-compose exec postgres pg_dump -U fitkart_user fitkart_prod > backup.sql

# Restart services
docker-compose restart

# Stop services
docker-compose down

# View metrics
docker stats
```

---

## 🐛 Troubleshooting

### Can't connect via SSH

```bash
# Check key permissions
ls -la fitkart-prod.pem  # Should show: -rw------- or -r--r-----
chmod 400 fitkart-prod.pem

# Verify instance is running
# AWS Console → EC2 → Instances → Check Status
```

### Port already in use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or use different port (update .env.production)
```

### Docker not running

```bash
# Check status
sudo systemctl status docker

# Start Docker
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker
```

### Database won't start

```bash
# Check logs
docker-compose logs postgres

# Verify password in .env.production
grep DB_PASSWORD .env.production

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U fitkart_user fitkart_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore backup
gunzip backup_20260217_020000.sql.gz
psql -h localhost -U fitkart_user fitkart_prod < backup_20260217_020000.sql
```

### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add backup job (daily at 2 AM)
0 2 * * * docker-compose -f /opt/fitkart/docker-compose.yml -f /opt/fitkart/docker-compose.prod.yml exec -T postgres pg_dump -U fitkart_user fitkart_prod | gzip > /opt/fitkart/backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

---

## 🛡️ Security Checklist

- [ ] SSH key secured (permissions 400)
- [ ] Security group configured (only necessary ports)
- [ ] SSH password disabled
- [ ] Firewall enabled (ufw)
- [ ] SSL certificate installed
- [ ] Strong database password
- [ ] JWT secret configured (32+ chars)
- [ ] Admin password changed
- [ ] Backups scheduled
- [ ] Monitoring enabled

---

## 📈 Cost Estimation

| Component | Cost/Month | Notes |
|-----------|----------|-------|
| EC2 t2.micro | $0-8 | Free tier 750 hrs/month |
| Domain | $3-15 | Varies by registrar |
| Storage | $0-5 | 30GB included |
| Bandwidth | $0-2 | First 1GB free |
| **TOTAL** | **$3-30** | Usually $5-10 |

---

## 📞 Support Resources

- **AWS Support**: https://aws.amazon.com/support/
- **Docker Docs**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **Terraform**: https://www.terraform.io/docs/

---

## Next Steps After Deployment

1. **Verify Health**
   - Check backend: `curl https://www.fitkart.club/health`
   - Check API: `curl https://www.fitkart.club/api/v1/leaderboard/weekly`

2. **Setup Monitoring**
   - Access Grafana: `http://instance-ip:3002`
   - Import dashboards
   - Configure alerts

3. **Mobile App Setup**
   - Update API base URL: `https://www.fitkart.club/api/v1`
   - Test endpoints with production backend

4. **Establish Backup Schedule**
   - Configure automated daily backups
   - Test restore procedure

5. **Monitor Regularly**
   - Daily: Check logs and health
   - Weekly: Review metrics
   - Monthly: Update packages

---

**Last Updated**: February 17, 2026  
**Status**: ✅ Production Ready
