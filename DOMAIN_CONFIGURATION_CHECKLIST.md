# FitKart Domain Configuration Checklist

**Domain**: www.fitkart.club  
**Status**: Ready for Configuration  
**Date**: February 17, 2026

---

## Pre-Configuration Requirements

- [ ] Domain registered (www.fitkart.club)
- [ ] Domain registrar account access
- [ ] Server with public IP address
- [ ] SSH access to server
- [ ] Backend API running on port 3000
- [ ] Admin dashboard running on port 3001
- [ ] Sudo/root access on server

---

## DNS Configuration (Registrar)

**Timeline**: 5 minutes setup, 1-48 hours propagation

### DNS Records to Add

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | www.fitkart.club | `YOUR_SERVER_IP` | 3600 |
| A | api.fitkart.club | `YOUR_SERVER_IP` | 3600 |
| A | admin.fitkart.club | `YOUR_SERVER_IP` | 3600 |
| CNAME | fitkart.club | www.fitkart.club | 3600 |

**Replace**: `YOUR_SERVER_IP` with your actual server IP (e.g., 13.201.45.123)

### Registrar Steps

- [ ] Log into domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Navigate to DNS settings for fitkart.club
- [ ] Add A record for www → YOUR_SERVER_IP
- [ ] Add A record for api → YOUR_SERVER_IP
- [ ] Add A record for admin → YOUR_SERVER_IP
- [ ] Add CNAME record for @ (root) → www.fitkart.club
- [ ] Save changes
- [ ] Wait for propagation (5 minutes to 48 hours)

### Verify DNS Propagation

```bash
# From your local machine:
nslookup www.fitkart.club
nslookup api.fitkart.club
nslookup admin.fitkart.club

# Should return your server IP
```

---

## Server Configuration

### Option A: Automated Setup (Recommended)

**Timeline**: 10-15 minutes

```bash
# 1. Copy setup script to server
scp -i your-key.pem domain-setup.sh ec2-user@YOUR_SERVER_IP:/tmp/

# 2. SSH into server
ssh -i your-key.pem ec2-user@YOUR_SERVER_IP

# 3. Make script executable
chmod +x /tmp/domain-setup.sh

# 4. Run setup script
sudo /tmp/domain-setup.sh

# Follow prompts and verify outputs
```

**Checklist**:
- [ ] DNS records created in registrar
- [ ] setup script downloaded to server
- [ ] Script executed successfully
- [ ] SSL certificate obtained
- [ ] Nginx configured
- [ ] Services verified

---

### Option B: Manual Setup

**Timeline**: 20-30 minutes

#### Step 1: Connect to Server

```bash
# [ ] SSH into server
ssh -i your-key.pem ec2-user@YOUR_SERVER_IP

# [ ] Update system
sudo apt update && sudo apt upgrade -y

# [ ] Install packages
sudo apt install -y nginx certbot python3-certbot-nginx curl
```

#### Step 2: Generate SSL Certificate

```bash
# [ ] Stop nginx temporarily
sudo systemctl stop nginx

# [ ] Generate certificate
sudo certbot certonly --standalone \
  -d www.fitkart.club \
  -d api.fitkart.club \
  -d admin.fitkart.club \
  --agree-tos \
  --email admin@fitkart.club

# [ ] Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Step 3: Configure Nginx

```bash
# [ ] Copy nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/fitkart.club

# [ ] Or create manually with curl/scp from repo

# [ ] Enable site
sudo ln -s /etc/nginx/sites-available/fitkart.club /etc/nginx/sites-enabled/

# [ ] Test configuration
sudo nginx -t

# [ ] Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Step 4: Verify Services

```bash
# [ ] Check backend API
curl http://localhost:3000/health

# [ ] Check admin dashboard
curl http://localhost:3001

# [ ] Check nginx
sudo systemctl status nginx

# [ ] Check certificate renewal
sudo certbot certificates
```

---

## Testing & Verification

### Phase 1: Internal Testing (from server)

```bash
# [ ] Test API endpoint (internal)
curl -I https://api.fitkart.club/health

# [ ] Test Admin Dashboard (internal)
curl -I https://admin.fitkart.club

# [ ] View nginx logs
sudo tail -f /var/log/nginx/api.fitkart.club_access.log
```

### Phase 2: External Testing (wait for DNS propagation)

```bash
# [ ] DNS check complete
nslookup www.fitkart.club

# [ ] HTTPS API endpoint
curl -I https://api.fitkart.club/health
# Should return: HTTP/2 200

# [ ] HTTPS Admin endpoint
curl -I https://admin.fitkart.club
# Should return: HTTP/2 200 (or 301 redirect)

# [ ] SSL certificate verification
curl -v https://api.fitkart.club/health 2>&1 | grep "X509"
# Should show: "verify return:1 (ok)"
```

### Phase 3: Browser Testing

- [ ] Open https://www.fitkart.club in browser
- [ ] Open https://api.fitkart.club/health in browser
- [ ] Open https://admin.fitkart.club in browser
- [ ] Check for SSL certificate validity (green lock icon)
- [ ] Verify no security warnings
- [ ] Test API calls from admin dashboard

---

## Environment Configuration

### Backend API (.env.production)

```bash
# [ ] Copy file to server
scp -i key.pem .env.production ec2-user@server:/app/backend/

# [ ] Update environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/fitkart
CORS_ORIGIN=https://www.fitkart.club,https://admin.fitkart.club
JWT_SECRET=your-secret-key
APP_URL=https://api.fitkart.club
```

### Admin Dashboard (.env.production)

```bash
# [ ] Create file on server
NEXT_PUBLIC_API_URL=https://api.fitkart.club/api/v1
NEXTAUTH_URL=https://admin.fitkart.club
NEXTAUTH_SECRET=your-secret-key-min-32-chars
```

---

## Troubleshooting

### Issue: DNS Not Resolving

**Checklist**:
- [ ] DNS records added in registrar
- [ ] TTL values correct (3600)
- [ ] Waiting sufficient time (1-48 hours)
- [ ] Flushing local DNS cache: `ipconfig /flushdns` (Windows) or `sudo systemctl restart systemd-resolved` (Linux)

**Solution**:
```bash
# Check propagation status
nslookup www.fitkart.club
dig www.fitkart.club

# Use DNS checker online
# https://mxtoolbox.com/nslookup.aspx
# https://www.whatsmydns.net/
```

### Issue: SSL Certificate Not Matching

**Checklist**:
- [ ] Certificate path correct: `/etc/letsencrypt/live/www.fitkart.club/`
- [ ] Nginx config pointing to fullchain.pem and privkey.pem
- [ ] Restarted nginx after config changes

**Solution**:
```bash
# Check certificate details
sudo certbot certificates

# View certificate info
sudo openssl x509 -in /etc/letsencrypt/live/www.fitkart.club/cert.pem -text -noout

# Force renewal if needed
sudo certbot renew --force-renewal
```

### Issue: Nginx Port Conflict

**Checklist**:
- [ ] Ports 80/443 available
- [ ] No other web server running
- [ ] Firewall allowing traffic

**Solution**:
```bash
# Check what's using ports 80/443
sudo lsof -i :80
sudo lsof -i :443

# Kill conflicting process if needed
sudo kill -9 <PID>

# Restart nginx
sudo systemctl restart nginx
```

### Issue: Backend API Not Accessible

**Checklist**:
- [ ] Backend running on port 3000
- [ ] Nginx knows about port 3000
- [ ] Backend logs show no errors

**Solution**:
```bash
# Test backend internally
curl http://localhost:3000/health

# Check if process running
ps aux | grep node

# Check listening ports
sudo netstat -tulpn | grep 3000

# View backend logs
sudo journalctl -u fitkart-api -f
```

### Issue: Admin Dashboard Blank Page

**Checklist**:
- [ ] Next.js build completed
- [ ] Admin running on port 3001
- [ ] Browser cache cleared
- [ ] Nginx log shows no errors

**Solution**:
```bash
# Check if admin is running
curl http://localhost:3001

# Check admin logs
sudo journalctl -u fitkart-admin -f

# Rebuild if needed
cd /app/admin-dashboard
npm run build
pm2 restart fitkart-admin
```

---

## Commands Reference

### DNS & Testing

```bash
# Test DNS
nslookup www.fitkart.club
dig www.fitkart.club

# Test HTTPS (external)
curl -I https://api.fitkart.club/health
curl -I https://admin.fitkart.club

# Test SSL certificate
openssl s_client -connect api.fitkart.club:443 -servername api.fitkart.club
```

### Nginx Management

```bash
# Test config
sudo nginx -t

# Start/stop/restart
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# View status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/api.fitkart.club_access.log
sudo tail -f /var/log/nginx/admin.fitkart.club_access.log
sudo tail -f /var/log/nginx/error.log

# Edit config
sudo nano /etc/nginx/sites-available/fitkart.club
```

### Certificate Management

```bash
# View certificates
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Test renewal (dry-run)
sudo certbot renew --dry-run

# View certificate details
sudo openssl x509 -in /etc/letsencrypt/live/www.fitkart.club/cert.pem -text -noout
```

### Service Management

```bash
# Backend API
sudo systemctl status fitkart-api
sudo systemctl restart fitkart-api
sudo journalctl -u fitkart-api -f

# Admin Dashboard
sudo systemctl status fitkart-admin
sudo systemctl restart fitkart-admin
sudo journalctl -u fitkart-admin -f
```

---

## Security Verification

- [ ] HTTPS working on both endpoints
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (green lock in browser)
- [ ] SSL Labs rating: A or higher
- [ ] Security headers present:
  - [ ] Strict-Transport-Security
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
  - [ ] X-XSS-Protection
- [ ] CORS configured correctly
- [ ] Certificate auto-renewal enabled

---

## Performance Verification

- [ ] API response time < 1 second
- [ ] Admin dashboard loads < 3 seconds
- [ ] Static assets cached
- [ ] Gzip compression enabled
- [ ] HTTP/2 working
- [ ] SSL session caching enabled

---

## Post-Configuration Tasks

- [ ] [ ] SSL Labs A+ rating achieved
- [ ] [ ] Performance optimized
- [ ] [ ] Monitoring set up
- [ ] [ ] Log rotation configured
- [ ] [ ] Backups configured
- [ ] [ ] CI/CD pipeline set up
- [ ] [ ] Analytics configured
- [ ] [ ] Error tracking configured

---

## Final Verification Checklist

**Pre-Launch Requirements**:
- [ ] DNS fully propagated globally
- [ ] SSL certificate valid and installed
- [ ] Nginx reverse proxy working
- [ ] Backend API responding to HTTPS requests
- [ ] Admin dashboard loading over HTTPS
- [ ] Static assets cached properly
- [ ] No security warnings/errors
- [ ] Certificate auto-renewal configured
- [ ] Logs being written correctly
- [ ] Services configured to auto-start

**Launch Ready**: All items checked ✅

---

## Rollback Plan

If issues occur:

1. **DNS Issue**: Revert DNS changes in registrar (instant effect)
2. **Certificate Issue**: Revert nginx config to backup: `sudo cp /etc/nginx/sites-available/fitkart.club.backup /etc/nginx/sites-available/fitkart.club`
3. **Nginx Issue**: Restart with: `sudo systemctl restart nginx`
4. **Service Issue**: Restart individual service
5. **Complete Rollback**: Use server snapshot/backup to restore previous state

---

## Support & Resources

| Resource | URL |
|----------|-----|
| Let's Encrypt | https://letsencrypt.org |
| Nginx Docs | https://nginx.org/en/docs/ |
| Certbot Guide | https://certbot.eff.org/instructions |
| SSL Labs | https://www.ssllabs.com/ssltest/ |
| Domain Registrar | Check your provider |
| DNS Checker | https://www.whatsmydns.net/ |

---

## Timeline Estimate

| Phase | Task | Duration |
|-------|------|----------|
| 1 | DNS configuration | 5 min |
| 1 | Wait for propagation | 1-48 hours |
| 2 | Server setup (manual) | 20-30 min |
| 2 | Server setup (automated) | 10-15 min |
| 3 | Testing & verification | 5-10 min |
| **Total** | **End-to-end** | **1-48 hours** |

---

**Status**: ✅ Ready to Configure  
**Last Updated**: February 17, 2026  
**Version**: 1.0.0
