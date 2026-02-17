# Domain Configuration Quick Reference

**Domain**: www.fitkart.club  
**Quick Setup Time**: 10 minutes (automated) to 30 minutes (manual)

---

## 🚀 Quick Start (Automated)

```bash
# 1. SSH into your server
ssh -i your-key.pem ec2-user@YOUR_SERVER_IP

# 2. Run automated setup
sudo bash domain-setup.sh

# 3. Wait for certificate (2-3 minutes)
# 4. Done! All configured
```

---

## 📋 Endpoints After Setup

| Endpoint | URL | Purpose |
|----------|-----|---------|
| API | https://api.fitkart.club/api/v1 | Backend API |
| Admin | https://admin.fitkart.club | Admin Dashboard |
| WWW | https://www.fitkart.club | Main domain |
| Health | https://api.fitkart.club/health | Health check |

---

## 🔍 Testing Commands

```bash
# Test DNS (wait for propagation first)
nslookup www.fitkart.club
dig api.fitkart.club

# Test HTTPS endpoints
curl -I https://api.fitkart.club/health
curl -I https://admin.fitkart.club

# Test SSL certificate
openssl s_client -connect api.fitkart.club:443

# Check nginx
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/api.fitkart.club_access.log
```

---

## 🔧 Troubleshooting

### DNS Not Working Yet?

**Expected**: 5 minutes to 48 hours for DNS propagation

```bash
# Check DNS status
nslookup www.fitkart.club

# Still pending?
# 1. Verify DNS records in registrar
# 2. Wait longer (DNS caching)
# 3. Check with: https://www.whatsmydns.net/
# 4. Flush local DNS:
#    - Windows: ipconfig /flushdns
#    - Mac: sudo dscacheutil -flushcache
#    - Linux: sudo systemctl restart systemd-resolved
```

### SSL Certificate Error?

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Verify in nginx config
sudo nano /etc/nginx/sites-available/fitkart.club
# Should show:
# ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;

# Restart nginx
sudo systemctl restart nginx
```

### Services Not Running?

```bash
# Check backend on port 3000
curl http://localhost:3000/health

# Check admin on port 3001
curl http://localhost:3001

# Start services if needed
sudo systemctl restart fitkart-api
sudo systemctl restart fitkart-admin

# Or with PM2
pm2 start npm --name "fitkart-api" -- start
pm2 start npm --name "fitkart-admin" -- start
```

### Nginx Not Working?

```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# View error log
sudo tail -f /var/log/nginx/error.log

# Check if ports 80/443 are in use
sudo lsof -i :80
sudo lsof -i :443
```

---

## 🔐 Verify Security

```bash
# Check SSL rating (from browser)
https://www.ssllabs.com/ssltest/analyze.html?d=api.fitkart.club

# Verify certificate expiry
echo | openssl s_client -servername api.fitkart.club -connect api.fitkart.club:443 2>/dev/null | openssl x509 -noout -dates

# Check HTTPS redirect
curl -I http://api.fitkart.club/health
# Should return: 301 Moved Permanently / Location: https://

# Verify security headers
curl -I https://api.fitkart.club/health | grep -i "Strict-Transport"
```

---

## 🔄 DNS Configuration (In Registrar)

Add these DNS records in your domain registrar (GoDaddy, Namecheap, etc.):

```
Type    Name                    Value                   TTL
─────────────────────────────────────────────────────────────
A       www.fitkart.club        YOUR_SERVER_IP          3600
A       api.fitkart.club        YOUR_SERVER_IP          3600
A       admin.fitkart.club      YOUR_SERVER_IP          3600
CNAME   fitkart.club            www.fitkart.club        3600
```

**Replace** `YOUR_SERVER_IP` with your EC2 instance IP (e.g., 13.201.45.123)

---

## 📁 File Locations

```
Nginx Config:        /etc/nginx/sites-available/fitkart.club
SSL Certificate:     /etc/letsencrypt/live/www.fitkart.club/
API Logs:            /var/log/nginx/api.fitkart.club_access.log
Admin Logs:          /var/log/nginx/admin.fitkart.club_access.log
Nginx Error Logs:    /var/log/nginx/error.log
Backend Code:        /home/ec2-user/fitkart/backend/
Admin Code:          /home/ec2-user/fitkart/admin-dashboard/
```

---

## 🎯 Verification Steps (After DNS Propagation)

1. **DNS Resolution**
   ```bash
   nslookup www.fitkart.club
   # Should return your server IP
   ```

2. **HTTP → HTTPS Redirect**
   ```bash
   curl -I http://api.fitkart.club/health
   # Should return 301 with Location: https://
   ```

3. **HTTPS Connection**
   ```bash
   curl -I https://api.fitkart.club/health
   # Should return 200 OK
   ```

4. **Certificate Validity**
   ```bash
   openssl s_client -connect api.fitkart.club:443 -servername api.fitkart.club < /dev/null 2>/dev/null | grep "return code"
   # Should show: return code: 0 (ok)
   ```

5. **Browser Test**
   - Open https://api.fitkart.club/health
   - Open https://admin.fitkart.club
   - Should show green lock icon ✅

---

## 📋 Checklist

- [ ] DNS records configured in registrar
- [ ] Domain setup script run successfully
- [ ] SSL certificate obtained from Let's Encrypt
- [ ] Nginx configuration applied
- [ ] Services verified running (backend, admin, nginx)
- [ ] DNS propagation complete (nslookup works)
- [ ] HTTPS endpoints responding (curl test passes)
- [ ] Browser shows green lock icon
- [ ] Certificate auto-renewal enabled
- [ ] Logs monitoring set up

---

## 🆘 Emergency Commands

```bash
# Stop everything
sudo systemctl stop nginx
sudo systemctl stop fitkart-api
sudo systemctl stop fitkart-admin

# Start everything
sudo systemctl start nginx
sudo systemctl start fitkart-api
sudo systemctl start fitkart-admin

# Restart everything
sudo systemctl restart nginx
sudo systemctl restart fitkart-api
sudo systemctl restart fitkart-admin

# Check all status
sudo systemctl status nginx
sudo systemctl status fitkart-api
sudo systemctl status fitkart-admin

# View all logs
sudo journalctl -u nginx -f
sudo journalctl -u fitkart-api -f
sudo journalctl -u fitkart-admin -f
```

---

## 📞 Support Resources

| Issue | Solution |
|-------|----------|
| DNS not resolving | Check registrar, wait 1-48 hours, use https://www.whatsmydns.net |
| SSL certificate error | Run `sudo certbot renew --force-renewal` |
| Port in use | Run `sudo lsof -i :80` to find process, then `sudo kill -9 PID` |
| Backend not accessible | Check `curl http://localhost:3000/health` |
| Admin not accessible | Check `curl http://localhost:3001` |
| Nginx errors | Run `sudo nginx -t` to validate config |
| Certificate expiry | Configure auto-renewal: `sudo systemctl enable certbot.timer` |

---

## 🎓 Full Documentation

For detailed setup instructions, see:
- [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md) - Complete setup guide
- [DOMAIN_CONFIGURATION_CHECKLIST.md](DOMAIN_CONFIGURATION_CHECKLIST.md) - Step-by-step checklist
- [nginx.conf.example](nginx.conf.example) - Full nginx configuration
- [domain-setup.sh](domain-setup.sh) - Automated setup script

---

**Status**: ✅ Ready to Deploy  
**Setup Time**: 10-30 minutes  
**Domain**: www.fitkart.club  
**Last Updated**: February 17, 2026
