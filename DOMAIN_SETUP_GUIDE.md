# FitKart Domain Configuration Guide

**Domain**: www.fitkart.club  
**Setup Date**: February 17, 2026  
**Status**: Configuration Guide

---

## Overview

This guide walks you through configuring the domain `www.fitkart.club` for the FitKart platform:

- **API**: `api.fitkart.club/api/v1` (Backend on port 3000)
- **Admin**: `admin.fitkart.club` (Admin Dashboard on port 3001)
- **WWW**: `www.fitkart.club` (Landing page/redirect)
- **SSL/TLS**: Let's Encrypt free certificates

---

## Prerequisites

- ✅ Domain registered (www.fitkart.club)
- ✅ Server with public IP (AWS EC2 or similar)
- ✅ SSH access to server
- ✅ Backend API running on `localhost:3000`
- ✅ Admin dashboard running on `localhost:3001`
- ✅ Web server (nginx) installed
- ✅ sudo/root access

---

## Step 1: DNS Configuration

### 1.1 Point Domain to Your Server

Contact your domain registrar (GoDaddy, Namecheap, etc.) and update DNS records:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | www | YOUR_SERVER_IP | Redirect to server |
| A | api | YOUR_SERVER_IP | API endpoint |
| A | admin | YOUR_SERVER_IP | Admin dashboard |
| CNAME | @ | www.fitkart.club | Root domain |

**Example** (if your server IP is `13.201.45.123`):

```
Type    Name                Value               TTL
A       www.fitkart.club    13.201.45.123       3600
A       api.fitkart.club    13.201.45.123       3600
A       admin.fitkart.club  13.201.45.123       3600
CNAME   fitkart.club        www.fitkart.club    3600
```

### 1.2 Verify DNS Propagation

```bash
# Check DNS propagation (wait 5-30 minutes)
nslookup www.fitkart.club
nslookup api.fitkart.club
nslookup admin.fitkart.club

# Should return your server IP:
# Answer Section:
# www.fitkart.club.   3600    IN  A   13.201.45.123
```

### 1.3 Common DNS Providers

- **GoDaddy**: https://www.godaddy.com
- **Namecheap**: https://www.namecheap.com
- **Route 53 (AWS)**: https://aws.amazon.com/route53/
- **CloudFlare**: https://www.cloudflare.com

---

## Step 2: Server Setup

### 2.1 Connect to Server

```bash
# SSH into your server
ssh -i your-key.pem ec2-user@13.201.45.123
# or
ssh ubuntu@13.201.45.123
```

### 2.2 Update System

```bash
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx curl wget git
```

### 2.3 Verify Services Running

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check if admin dashboard is running
curl http://localhost:3001

# Check nginx
sudo systemctl status nginx
```

---

## Step 3: SSL/TLS Certificate Setup

### 3.1 Install Let's Encrypt Certificate

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Request certificate for all domains
sudo certbot certonly --standalone \
  -d www.fitkart.club \
  -d api.fitkart.club \
  -d admin.fitkart.club \
  --agree-tos \
  --email admin@fitkart.club

# Certificate will be saved to:
# /etc/letsencrypt/live/www.fitkart.club/
```

### 3.2 Certificate Files

```bash
# View certificate files
sudo ls -la /etc/letsencrypt/live/www.fitkart.club/

# Files:
# - cert.pem        (Public certificate)
# - chain.pem       (Certificate chain)
# - fullchain.pem   (Full certificate chain)
# - privkey.pem     (Private key)
```

### 3.3 Auto-Renewal Setup

```bash
# Enable auto-renewal
sudo systemctl enable certbot.timer

# Test renewal
sudo certbot renew --dry-run

# Check status
sudo systemctl status certbot.timer
```

---

## Step 4: Nginx Configuration

### 4.1 Create Nginx Configuration

Create file `/etc/nginx/sites-available/fitkart.club`:

```bash
sudo nano /etc/nginx/sites-available/fitkart.club
```

**Paste this configuration:**

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name www.fitkart.club api.fitkart.club admin.fitkart.club fitkart.club;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# API Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.fitkart.club;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization' always;

    # Logging
    access_log /var/log/nginx/api.fitkart.club_access.log;
    error_log /var/log/nginx/api.fitkart.club_error.log;

    # Proxy to backend API
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
    }
}

# Admin Dashboard Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.fitkart.club;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/admin.fitkart.club_access.log;
    error_log /var/log/nginx/admin.fitkart.club_error.log;

    # Proxy to admin dashboard
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static files caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Public files caching
    location /public {
        proxy_pass http://127.0.0.1:3001;
        expires 7d;
        add_header Cache-Control "public";
    }
}

# WWW redirect to www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fitkart.club;

    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    return 301 https://www.fitkart.club$request_uri;
}
```

### 4.2 Enable Configuration

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/fitkart.club /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Output should be:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Step 5: Testing

### 5.1 Test HTTPS Connection

```bash
# Test API endpoint
curl -k https://api.fitkart.club/health

# Test Admin Dashboard
curl -k https://admin.fitkart.club

# Test certificate
curl -I https://www.fitkart.club
```

### 5.2 Verify Certificate

```bash
# Check SSL certificate
openssl s_client -connect www.fitkart.club:443

# Should show:
# Verify return code: 0 (ok)

# Check expiration
sudo certbot certificates
```

### 5.3 Browser Testing

Open in browser:
```
https://www.fitkart.club
https://api.fitkart.club/health
https://admin.fitkart.club
```

---

## Step 6: Environment Variables

### 6.1 Backend API

Update backend `.env.production`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fitkart

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://www.fitkart.club,https://admin.fitkart.club

# JWT
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRY=7d

# Domain
APP_URL=https://api.fitkart.club

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

### 6.2 Admin Dashboard

Update admin-dashboard `.env.production`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.fitkart.club/api/v1

# Authentication
NEXTAUTH_URL=https://admin.fitkart.club
NEXTAUTH_SECRET=your-strong-secret-key-min-32-chars

# Application
NEXT_PUBLIC_APP_NAME=FitKart Admin
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

---

## Step 7: Deployment

### 7.1 Deploy Backend API

```bash
# SSH into server
ssh -i your-key.pem ec2-user@your-ip

# Clone or update repo
cd /home/ec2-user
git clone https://github.com/yourrepo/fitkart.git
cd fitkart/backend

# Install and build
npm install
npm run build

# Start with PM2 (recommended)
pm2 start npm --name "fitkart-api" -- start
pm2 save
pm2 startup

# Or use systemd service (see Step 8)
```

### 7.2 Deploy Admin Dashboard

```bash
# Navigate to admin dashboard
cd /home/ec2-user/fitkart/admin-dashboard

# Install and build
npm install
npm run build

# Start with PM2
pm2 start npm --name "fitkart-admin" -- start
pm2 save

# Or use systemd service (see Step 8)
```

---

## Step 8: Systemd Services (Optional)

### 8.1 Backend API Service

Create `/etc/systemd/system/fitkart-api.service`:

```bash
sudo nano /etc/systemd/system/fitkart-api.service
```

```ini
[Unit]
Description=FitKart Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/fitkart/backend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fitkart-api
sudo systemctl start fitkart-api
sudo systemctl status fitkart-api
```

### 8.2 Admin Dashboard Service

Create `/etc/systemd/system/fitkart-admin.service`:

```bash
sudo nano /etc/systemd/system/fitkart-admin.service
```

```ini
[Unit]
Description=FitKart Admin Dashboard
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/fitkart/admin-dashboard
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fitkart-admin
sudo systemctl start fitkart-admin
sudo systemctl status fitkart-admin
```

---

## Step 9: Monitoring & Logs

### 9.1 Check Nginx Logs

```bash
# API logs
sudo tail -f /var/log/nginx/api.fitkart.club_access.log
sudo tail -f /var/log/nginx/api.fitkart.club_error.log

# Admin logs
sudo tail -f /var/log/nginx/admin.fitkart.club_access.log
sudo tail -f /var/log/nginx/admin.fitkart.club_error.log

# General nginx
sudo tail -f /var/log/nginx/error.log
```

### 9.2 Check Application Logs

```bash
# Backend API
sudo journalctl -u fitkart-api -f

# Admin Dashboard
sudo journalctl -u fitkart-admin -f

# Or with PM2
pm2 logs fitkart-api
pm2 logs fitkart-admin
```

### 9.3 Restart Services

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Backend
sudo systemctl restart fitkart-api
# or
pm2 restart fitkart-api

# Restart Admin
sudo systemctl restart fitkart-admin
# or
pm2 restart fitkart-admin
```

---

## Step 10: Troubleshooting

### Issue: DNS Not Resolving

```bash
# Flush DNS cache
sudo systemctl restart systemd-resolved

# Check DNS
nslookup www.fitkart.club
dig www.fitkart.club

# Wait for propagation (can take 24-48 hours)
```

### Issue: SSL Certificate Error

```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# View certificate details
sudo openssl x509 -in /etc/letsencrypt/live/www.fitkart.club/cert.pem -text -noout
```

### Issue: Nginx Port Already in Use

```bash
# Check what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Kill process if needed
sudo kill -9 <PID>

# Restart nginx
sudo systemctl restart nginx
```

### Issue: Cannot Connect to Backend

```bash
# Check if backend is running
ps aux | grep "node\|npm"

# Check if port 3000 is listening
sudo lsof -i :3000

# Check if it's bound to localhost only
sudo netstat -tulpn | grep 3000

# Restart backend
sudo systemctl restart fitkart-api
```

### Issue: Admin Dashboard Shows Blank Page

```bash
# Check build was successful
ls -la /home/ec2-user/fitkart/admin-dashboard/.next/

# Check admin logs
sudo journalctl -u fitkart-admin -n 50

# Rebuild if needed
cd /home/ec2-user/fitkart/admin-dashboard
npm run build
sudo systemctl restart fitkart-admin
```

---

## Security Checklist

- ✅ SSL/TLS certificate installed
- ✅ HTTP redirects to HTTPS
- ✅ Security headers configured
- ✅ CORS properly configured
- ✅ Firewall rules configured (if needed)
- ✅ SSH key-based authentication
- ✅ Fail2ban or similar protection (optional)
- ✅ Regular certificate renewal
- ✅ Environment variables secured
- ✅ Logs monitored

---

## Performance Tips

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
   ```

2. **Cache Static Files**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Enable HTTP/2**
   - Already configured in nginx config above

4. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
   limit_req zone=api_limit burst=200 nodelay;
   ```

---

## Monitoring Services

### Option 1: PM2 Monitoring Dashboard

```bash
# Install PM2 monitoring
pm2 install pm2-monitoring
pm2 web

# View dashboard at http://localhost:9615
```

### Option 2: Prometheus + Grafana (Advanced)

- Prometheus: Metrics collection
- Grafana: Visualization
- See infrastructure/monitoring for config

### Option 3: DataDog / New Relic (Cloud)

- Real-time monitoring
- Error tracking
- Performance analytics

---

## Next Steps

1. ✅ Configure DNS records
2. ✅ Wait for DNS propagation
3. ✅ Install SSL certificates
4. ✅ Configure nginx
5. ✅ Deploy backend and admin dashboard
6. ✅ Test HTTPS endpoints
7. ✅ Monitor logs and performance
8. 📋 Set up automated backups
9. 📋 Configure monitoring/alerts
10. 📋 Set up CI/CD pipeline

---

## Quick Command Reference

```bash
# Verify DNS
nslookup www.fitkart.club

# Check SSL cert
curl -I https://api.fitkart.club
curl -I https://admin.fitkart.club

# View nginx config
sudo nginx -t

# Tail logs
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
sudo systemctl restart fitkart-api
sudo systemctl restart fitkart-admin

# Check certificate expiry
sudo certbot certificates
```

---

## Support & Resources

- **Let's Encrypt**: https://letsencrypt.org
- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org
- **SSL Labs**: https://www.ssllabs.com/ssltest/

---

**Status**: ✅ Configuration Guide Ready  
**Last Updated**: February 17, 2026  
**Version**: 1.0.0
