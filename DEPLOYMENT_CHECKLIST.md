# FitKart AWS Deployment Checklist

Use this checklist to track your production deployment progress.

**Domain**: www.fitkart.club  
**Target**: AWS EC2  
**Estimated Time**: 1-2 hours

---

## Pre-Deployment ✓

### AWS Account Setup
- [ ] AWS account created
- [ ] Billing configured
- [ ] Free tier verified
- [ ] IAM user created (optional)

### Repository
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Documentation complete
- [ ] Environment variables template ready

### Domain
- [ ] Domain registered
- [ ] Domain access credentials saved
- [ ] DNS provider identified
- [ ] Admin email confirmed

---

## EC2 Instance Setup ✓

### Launch Instance
- [ ] Instance launched (t2.micro free tier)
- [ ] OS: Ubuntu 20.04 LTS selected
- [ ] Instance running (green status)
- [ ] Public IP obtained: `_______________`

### Key Pair
- [ ] Key pair created: `fitkart-prod.pem`
- [ ] Key file downloaded
- [ ] Key file saved securely
- [ ] Key permissions set (400): `chmod 400 fitkart-prod.pem`

### Security Group
- [ ] SSH (22) allowed
- [ ] HTTP (80) allowed
- [ ] HTTPS (443) allowed
- [ ] Custom TCP 3000 (API) allowed
- [ ] PostgreSQL (5432) restricted to your IP
- [ ] All other ports closed

---

## Server Initialization ✓

### SSH Connection
- [ ] SSH connection tested
- [ ] Command: `ssh -i fitkart-prod.pem ubuntu@<PUBLIC_IP>`
- [ ] Successfully connected to server
- [ ] Ubuntu prompt visible

### System Update
- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Essential tools installed: `build-essential`, `curl`, `wget`, `git`
- [ ] No errors during update

### Docker Installation
- [ ] Docker installed
- [ ] Docker version verified: `docker --version`
- [ ] User added to docker group: `sudo usermod -aG docker ubuntu`
- [ ] Docker service started and enabled

### Docker Compose
- [ ] Docker Compose installed
- [ ] Version verified: `docker-compose --version`
- [ ] Executable and in PATH

### Application Directory
- [ ] Directory created: `/opt/fitkart`
- [ ] Ownership set: `sudo chown ubuntu:ubuntu /opt/fitkart`
- [ ] Repository cloned
- [ ] All files present: `ls -la /opt/fitkart`

### Log Directory
- [ ] Log directory created: `/var/log/fitkart`
- [ ] Ownership set correctly
- [ ] Firewall enabled: `sudo ufw enable`
- [ ] UFW rules configured

---

## Environment Configuration ✓

### Environment File
- [ ] `.env.production` created
- [ ] Location: `/opt/fitkart/.env.production`
- [ ] Permissions set: `chmod 600 .env.production`

### Database Configuration
- [ ] `DB_HOST`: `postgres`
- [ ] `DB_PORT`: `5432`
- [ ] `DB_USER`: `fitkart_user`
- [ ] `DB_PASSWORD`: Strong password generated
- [ ] `DB_NAME`: `fitkart_prod`

### Redis Configuration
- [ ] `REDIS_HOST`: `redis`
- [ ] `REDIS_PORT`: `6379`
- [ ] `REDIS_PASSWORD`: Configured if needed

### Security
- [ ] `JWT_SECRET`: Generated (32+ chars min)
- [ ] `NODE_ENV`: `production`
- [ ] `CORS_ORIGIN`: Updated with domain

### Email Service
- [ ] `SENDGRID_API_KEY`: Obtained
- [ ] `SENDGRID_FROM_EMAIL`: Set to your domain
- [ ] SendGrid account created (optional)

### Admin Account
- [ ] `ADMIN_EMAIL`: Set
- [ ] `ADMIN_PASSWORD`: Strong password set
- [ ] Credentials saved securely

---

## Application Deployment ✓

### Docker Services
- [ ] `docker-compose pull` executed
- [ ] Images downloaded successfully
- [ ] `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d` executed
- [ ] All services started

### Service Verification
- [ ] PostgreSQL running: `docker-compose ps postgres`
- [ ] Redis running: `docker-compose ps redis`
- [ ] Backend running: `docker-compose ps backend`
- [ ] Nginx running: `docker-compose ps nginx`

### Database Initialization
- [ ] Migrations executed: `docker-compose exec backend npm run migrate`
- [ ] All migrations applied successfully
- [ ] Initial data seeded: `docker-compose exec backend npm run seed`
- [ ] Products added to store
- [ ] Achievements initialized
- [ ] Admin user created

### Health Checks
- [ ] Backend responding: `curl http://localhost:3000/health`
- [ ] HTTP response received
- [ ] Status: OK
- [ ] Port 3000 accessible from local

---

## DNS & Domain Configuration ✓

### DNS Records
- [ ] Go to domain registrar
- [ ] Access DNS settings
- [ ] Add A record:
  - [ ] Name: `@` or blank
  - [ ] Type: `A`
  - [ ] Value: EC2 public IP
  - [ ] TTL: 3600
- [ ] Add A/CNAME for `www`:
  - [ ] Name: `www`
  - [ ] Type: `A` or `CNAME`
  - [ ] Value: public IP or domain
  - [ ] TTL: 3600

### DNS Propagation
- [ ] Applied changes
- [ ] Waited 5-30 minutes for propagation
- [ ] DNS propagation verified: `nslookup www.fitkart.club`
- [ ] IP address matches EC2 public IP

### Domain Resolution
- [ ] From local: `ping www.fitkart.club`
- [ ] Resolves to correct IP
- [ ] DNS lookup successful

---

## SSL Certificate Setup ✓

### Certbot Installation
- [ ] Certbot installed: `sudo apt install -y certbot`
- [ ] Verified: `certbot --version`

### Certificate Generation
- [ ] Certificate requested:
  ```bash
  sudo certbot certonly --standalone \
    -d www.fitkart.club \
    -d fitkart.club
  ```
- [ ] Certificate issued successfully
- [ ] Certificate location noted: `/etc/letsencrypt/live/www.fitkart.club/`

### Certificate Validation
- [ ] Certificate expires checked
- [ ] Chain complete: `fullchain.pem`
- [ ] Private key present: `privkey.pem`

### Auto-Renewal
- [ ] Certbot timer enabled: `sudo systemctl enable certbot.timer`
- [ ] Certbot timer started: `sudo systemctl start certbot.timer`
- [ ] Renewal tested: `sudo certbot renew --dry-run`
- [ ] Auto-renewal configured

### Nginx Configuration
- [ ] Nginx updated for HTTPS
- [ ] SSL paths configured in docker-compose
- [ ] Certificates mounted correctly

---

## HTTPS Access ✓

### Website Access
- [ ] Browser: `https://www.fitkart.club`
- [ ] Page loads without SSL warnings
- [ ] SSL certificate valid
- [ ] "Secure" indicator visible

### API Access
- [ ] Health endpoint: `https://www.fitkart.club/health`
- [ ] Returns expected JSON
- [ ] HTTPS working correctly

### Redirect HTTP to HTTPS
- [ ] HTTP: `http://www.fitkart.club`
- [ ] Redirects to HTTPS
- [ ] No mixed content warnings

---

## Application Testing ✓

### Health Check
- [ ] URL: `https://www.fitkart.club/health`
- [ ] Response: `{"status":"ok"}`
- [ ] Status code: 200

### API Endpoints
- [ ] List leaderboard: `/api/v1/leaderboard/weekly`
- [ ] Check health: `/health`
- [ ] Get products: `/api/v1/store`
- [ ] All endpoints responding

### Database Connection
- [ ] Connect to DB from container
- [ ] Query users: `SELECT COUNT(*) FROM users;`
- [ ] Query works, returns count
- [ ] Data integrity verified

### Performance
- [ ] Response time acceptable (<500ms)
- [ ] No timeout errors
- [ ] No database connection errors
- [ ] Logs show normal operation

---

## Monitoring & Dashboards ✓

### Prometheus
- [ ] Accessible: `http://instance-ip:9090`
- [ ] Targets showing green
- [ ] Metrics being collected
- [ ] No scrape errors

### Grafana
- [ ] Accessible: `http://instance-ip:3002`
- [ ] Default login successful
- [ ] Prometheus data source added
- [ ] Dashboard imported

### Loki (Logs)
- [ ] Service running
- [ ] Logs being collected
- [ ] Queryable in Grafana

---

## Backup Configuration ✓

### Backup Script
- [ ] Script created: `/opt/fitkart/backup-db.sh`
- [ ] Script executable: `chmod +x backup-db.sh`
- [ ] Test run successful: `./backup-db.sh`

### Cron Scheduling
- [ ] Crontab edited: `crontab -e`
- [ ] Backup job added: `0 2 * * * /opt/fitkart/backup-db.sh`
- [ ] Job scheduled for 2 AM daily
- [ ] Cron syntax verified

### Backup Verification
- [ ] Backup file created: `/opt/fitkart/backups/`
- [ ] File size reasonable
- [ ] Compression working (`.sql.gz`)
- [ ] Retention policy set (7 days kept)

### Restore Test
- [ ] Backup downloaded to local
- [ ] Restore command tested
- [ ] Data verified after restore
- [ ] Procedure documented

---

## Security Hardening ✓

### SSH Security
- [ ] Only key-based auth (password disabled)
- [ ] SSH config: `PasswordAuthentication no`
- [ ] UFW rules: SSH from specific IPs only (if possible)
- [ ] Key permissions: 400

### Firewall
- [ ] UFW enabled: `sudo ufw status`
- [ ] Port 22 (SSH) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 443 (HTTPS) allowed
- [ ] Port 3000 (API) restricted or allowed
- [ ] All other ports closed

### File Permissions
- [ ] Application directory: 750
- [ ] `.env.production`: 600 (no world-readable)
- [ ] SSH keys: 400
- [ ] Log directory: 750

### Environment Secrets
- [ ] JWT secret: Strong (32+ chars)
- [ ] Database password: Strong (32+ chars)
- [ ] Admin password: Strong (16+ chars)
- [ ] All secrets in `.env.production`, not in code
- [ ] No secrets in git repository

---

## Monitoring & Logging ✓

### Container Logs
- [ ] Backend logs accessible: `docker-compose logs backend`
- [ ] No error messages
- [ ] Application starting successfully
- [ ] Connections established

### System Monitoring
- [ ] CPU usage normal (<30%)
- [ ] Memory usage normal (<50%)
- [ ] Disk space adequate (>10GB free)
- [ ] Network connectivity stable

### Log Files
- [ ] Logs written to `/var/log/fitkart/`
- [ ] Log rotation configured (if applicable)
- [ ] Old logs kept (7+ days)

---

## Post-Deployment Tasks ✓

### Documentation
- [ ] Deployment instructions saved
- [ ] Admin credentials stored securely
- [ ] Backup procedures documented
- [ ] Team informed of deployment

### Mobile App Configuration
- [ ] API base URL updated to production
- [ ] Environment configuration updated
- [ ] Mobile app tested against production API
- [ ] All endpoints working

### Client Notification
- [ ] Production URL shared: `https://www.fitkart.club`
- [ ] Health check endpoint test provided
- [ ] API documentation link shared
- [ ] Contact for issues provided

### Ongoing Maintenance
- [ ] Daily: Check health endpoint
- [ ] Daily: Monitor error logs
- [ ] Weekly: Review metrics dashboard
- [ ] Monthly: Update system packages
- [ ] Monthly: Test backup restore

---

## Launch Confirmation ✓

### All Systems Go
- [ ] All checkboxes completed
- [ ] No critical issues outstanding
- [ ] Deployment successful
- [ ] Ready for users

### Sign-off
- [ ] Deployment team: _______________
- [ ] Date completed: _______________
- [ ] Time to deployment: _______________

---

## Critical Information

**Production URL**: https://www.fitkart.club  
**API Base**: https://www.fitkart.club/api/v1  
**Health Check**: https://www.fitkart.club/health  

**Server Credentials**:
- Instance IP: `_______________`
- SSH User: `ubuntu`
- Key File: `fitkart-prod.pem`

**Database Access**:
- Host: `postgres`
- Database: `fitkart_prod`
- User: `fitkart_user`

**Admin Account**:
- Email: `_______________`
- Password: `***stored securely***`

---

## Support Contacts

- **AWS Support**: https://aws.amazon.com/support/
- **Documentation**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Reference**: See [AWS_QUICK_REFERENCE.md](./AWS_QUICK_REFERENCE.md)

---

**Status**: Ready for Production Deployment  
**Last Updated**: February 17, 2026
