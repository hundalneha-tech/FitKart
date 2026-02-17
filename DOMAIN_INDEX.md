# Domain Configuration Index

**Domain**: www.fitkart.club  
**Status**: Configuration Ready  
**Date**: February 17, 2026

---

## 📋 Documentation Files

All domain configuration files are in the root of your FitKart repository:

```
c:\Users\woof\FitKart_repo\
├── DOMAIN_SETUP_GUIDE.md                (← Comprehensive setup guide - START HERE)
├── DOMAIN_CONFIGURATION_CHECKLIST.md    (← Step-by-step checklist)
├── DOMAIN_QUICK_REFERENCE.md            (← Quick commands & troubleshooting)
├── domain-setup.sh                       (← Automated setup script)
├── nginx.conf.example                   (← Nginx configuration file)
└── DOMAIN_INDEX.md                      (← This file)
```

---

## 📖 Which File to Read?

### 🎯 **I just want to get started quickly**
→ Read: [DOMAIN_QUICK_REFERENCE.md](DOMAIN_QUICK_REFERENCE.md)  
Time: 5 minutes  
Learn: Quick commands, testing, troubleshooting

### 🔧 **I need step-by-step instructions**
→ Read: [DOMAIN_CONFIGURATION_CHECKLIST.md](DOMAIN_CONFIGURATION_CHECKLIST.md)  
Time: 15 minutes  
Learn: Each step with checkboxes

### 📚 **I need complete detailed documentation**
→ Read: [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md)  
Time: 30 minutes  
Learn: Everything - DNS, SSL, Nginx, deployment, troubleshooting

### 🤖 **I want to automate everything**
→ Download & Run: [domain-setup.sh](domain-setup.sh)  
Time: 10 minutes (plus DNS propagation wait)  
Learn: Fully automated setup

### ⚙️ **I need the Nginx configuration**
→ Copy: [nginx.conf.example](nginx.conf.example)  
To: `/etc/nginx/sites-available/fitkart.club` on your server

---

## 📊 Setup Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: DNS Configuration                                   │
│ • Register domain www.fitkart.club                          │
│ • Add DNS records (A records + CNAME)                       │
│ • Wait 1-48 hours for propagation                           │
├─────────────────────────────────────────────────────────────┤
│ Step 2: Server Setup (Choose one)                           │
│ Option A: Automated                                         │
│   • Run: sudo bash domain-setup.sh                          │
│   • Time: 10-15 minutes                                     │
│ Option B: Manual                                            │
│   • Follow DOMAIN_SETUP_GUIDE.md                            │
│   • Time: 20-30 minutes                                     │
├─────────────────────────────────────────────────────────────┤
│ Step 3: SSL Certificate                                      │
│ • Automatic with Let's Encrypt (Certbot)                   │
│ • Auto-renewal enabled                                      │
│ • Time: 2-3 minutes                                         │
├─────────────────────────────────────────────────────────────┤
│ Step 4: Nginx Configuration                                 │
│ • Reverse proxy to backend (port 3000)                      │
│ • Reverse proxy to admin (port 3001)                        │
│ • HTTPS redirect + security headers                         │
│ • Time: 2-3 minutes                                         │
├─────────────────────────────────────────────────────────────┤
│ Step 5: Testing & Verification                              │
│ • DNS resolution check                                      │
│ • HTTPS endpoint testing                                    │
│ • SSL certificate validation                                │
│ • Time: 5 minutes                                           │
└─────────────────────────────────────────────────────────────┘
        TOTAL TIME: 1-2 hours (mostly DNS wait time)
```

---

## 🎯 Three Ways to Configure Domain

### 1️⃣ Quickest Way (Automated)

```bash
# 1. Download setup script
curl -O https://your-repo/domain-setup.sh

# 2. Run it
sudo bash domain-setup.sh

# ✅ Done in 10-15 minutes!
```

**Files Used**: `domain-setup.sh`  
**Manual Setup Needed**: Only DNS records in registrar  
**Perfect For**: Quick deployment

---

### 2️⃣ Guided Way (Checklist)

Follow each step in:
→ [DOMAIN_CONFIGURATION_CHECKLIST.md](DOMAIN_CONFIGURATION_CHECKLIST.md)

Check off each item as you complete it.

**Files Used**: All documentation + manual commands  
**Manual Setup Needed**: DNS + Certificate + Nginx  
**Perfect For**: Learning all steps

---

### 3️⃣ Deep Learning Way (Full Guide)

Study complete setup guide section by section:
→ [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md)

Understand every system component.

**Files Used**: DOMAIN_SETUP_GUIDE.md + nginx.conf.example  
**Manual Setup Needed**: Everything, step by step  
**Perfect For**: Full understanding

---

## 📝 DNS Records to Configure

Add these in your domain registrar (GoDaddy, Namecheap, Route 53, etc.):

```
Record Type    Hostname           Value              TTL
─────────────────────────────────────────────────────────────
A              www.fitkart.club   YOUR_SERVER_IP     3600
A              api.fitkart.club   YOUR_SERVER_IP     3600
A              admin.fitkart.club YOUR_SERVER_IP     3600
CNAME          fitkart.club       www.fitkart.club   3600
```

Replace `YOUR_SERVER_IP` with your actual server IP address.

---

## 🔐 What Gets Configured

### Endpoints After Setup

| URL | Purpose | Port |
|-----|---------|------|
| https://www.fitkart.club | Main domain | 443 |
| https://api.fitkart.club | REST API | 443 |
| https://admin.fitkart.club | Admin Dashboard | 443 |
| https://api.fitkart.club/health | Health check | 443 |

### Security Features

- ✅ HTTPS/TLS 1.2+ encryption
- ✅ HTTP → HTTPS redirect
- ✅ Let's Encrypt SSL certificate
- ✅ Auto-renewal every 90 days
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ CORS configured
- ✅ Reverse proxy with timeout controls

---

## 🛠️ Key Files Explained

### 1. DOMAIN_SETUP_GUIDE.md
**Purpose**: Comprehensive reference  
**Contains**:
- Step-by-step DNS configuration
- Server setup instructions (manual & automated)
- SSL certificate setup with Let's Encrypt
- Complete Nginx configuration guide
- Testing & verification procedures
- Troubleshooting for common issues
- Performance optimization tips
- Security checklist

**When to Use**: Need complete understanding or troubleshooting complex issues

### 2. DOMAIN_CONFIGURATION_CHECKLIST.md
**Purpose**: Action-oriented checklist  
**Contains**:
- Pre-requirements checklist
- DNS records table (copy-paste ready)
- Registrar-specific instructions
- Step-by-step configuration checkboxes
- Testing and verification checklist
- Environment variable configuration
- Troubleshooting section
- Commands quick reference

**When to Use**: Following along with setup, checking off each step

### 3. DOMAIN_QUICK_REFERENCE.md
**Purpose**: Quick lookup for commands  
**Contains**:
- Quick start (automated setup)
- Testing commands
- Troubleshooting quick fixes
- DNS configuration table
- File locations
- Verification steps
- Emergency commands

**When to Use**: Need quick answers or commands during deployment

### 4. domain-setup.sh
**Purpose**: Automated setup script  
**Does**:
- Updates system packages
- Installs dependencies (Nginx, Certbot)
- Generates SSL certificate with Let's Encrypt
- Creates Nginx configuration
- Enables auto-renewal
- Tests services
- Provides summary

**When to Use**: Want fastest deployment (one command)

### 5. nginx.conf.example
**Purpose**: Nginx configuration template  
**Configures**:
- HTTP → HTTPS redirect (all subdomains)
- API server (api.fitkart.club → localhost:3000)
- Admin server (admin.fitkart.club → localhost:3001)
- WWW redirect (fitkart.club → www.fitkart.club)
- SSL/TLS setup
- Security headers
- CORS configuration
- Logging
- Caching for static assets

**When to Use**: Manual Nginx setup or understanding reverse proxy config

---

## 🚀 Quick Start Commands

### Best Method: One Command Setup

```bash
# 1. SSH to your server
ssh -i your-key.pem ec2-user@YOUR_SERVER_IP

# 2. Make script executable and run
chmod +x domain-setup.sh
sudo ./domain-setup.sh

# 3. Wait for completion (10-15 minutes)
# ✅ All done!
```

### Verify Setup

```bash
# After DNS propagates (1-48 hours)
curl -I https://api.fitkart.club/health
curl -I https://admin.fitkart.club
```

---

## 📞 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| DNS not working | See "[Troubleshooting DNS](DOMAIN_SETUP_GUIDE.md#troubleshooting)" |
| SSL certificate error | See "[SSL Certificate Section](DOMAIN_SETUP_GUIDE.md#step-3-ssltls-certificate-setup)" |
| Nginx not starting | See "[Nginx Troubleshooting](DOMAIN_QUICK_REFERENCE.md#nginx-not-working)" |
| Backend not accessible | See "[Service Troubleshooting](DOMAIN_QUICK_REFERENCE.md#services-not-running)" |
| Performance issues | See "[Performance Tips](DOMAIN_SETUP_GUIDE.md#performance-tips)" |

---

## 💾 File Locations After Setup

**On Your Server:**

```bash
# Configuration
/etc/nginx/sites-available/fitkart.club        # Nginx config
/etc/letsencrypt/live/www.fitkart.club/        # SSL certificates
/etc/letsencrypt/renewal/www.fitkart.club.conf # Auto-renewal config

# Logs
/var/log/nginx/api.fitkart.club_access.log     # API access logs
/var/log/nginx/admin.fitkart.club_access.log   # Admin access logs
/var/log/nginx/error.log                        # Nginx errors

# Application Code
/home/ec2-user/fitkart/backend/                # Backend API
/home/ec2-user/fitkart/admin-dashboard/        # Admin panel
```

---

## 📋 Pre-Setup Checklist

Before starting configuration:

- [ ] Domain registered (www.fitkart.club)
- [ ] Server has public IP address
- [ ] SSH access to server works
- [ ] Backend running on port 3000 (test: `curl http://localhost:3000/health`)
- [ ] Admin dashboard running on port 3001 (test: `curl http://localhost:3001`)
- [ ] Sudo/root access available
- [ ] Domain registrar account accessible
- [ ] Email address ready for Let's Encrypt

---

## ⏱️ Time Estimates

| Method | Setup Time | DNS Wait | Total |
|--------|-----------|----------|-------|
| Automated (./domain-setup.sh) | 10-15 min | 1-48 hrs | 1-48 hrs |
| Manual (from guide) | 20-30 min | 1-48 hrs | 1-48 hrs |
| Checklist (guided) | 25-40 min | 1-48 hrs | 1-48 hrs |

**Note**: Most time is waiting for DNS propagation, not setup itself

---

## 🎓 Learning Path

```
Start Here
    ↓
├─ Quick Overview → DOMAIN_QUICK_REFERENCE.md (5 min)
├─ Full Guide → DOMAIN_SETUP_GUIDE.md (30 min)
└─ Implementation
    ├─ Automated → Run domain-setup.sh (10 min + DNS wait)
    └─ Manual → Follow DOMAIN_CONFIGURATION_CHECKLIST.md (20-30 min + DNS wait)
```

---

## ✅ Success Criteria

Domain is successfully configured when:

- ✅ DNS records resolve correctly
- ✅ HTTPS endpoint accessible (https://api.fitkart.club/health returns 200)
- ✅ Admin dashboard loads (https://admin.fitkart.club shows dashboard)
- ✅ SSL certificate valid (green lock in browser)
- ✅ Certificate auto-renewal enabled
- ✅ Security headers present
- ✅ CORS working (API accessible from admin dashboard)

---

## 🔗 Related Documentation

Other important FitKart documentation:

- **Backend API**: See `backend/README.md`
- **Admin Dashboard**: See `admin-dashboard/README.md`
- **AWS Infrastructure**: See `infrastructure/AWS_SETUP_GUIDE.md`
- **Deployment**: See `DEPLOYMENT.md`

---

## 📞 Support

For issues not covered in documentation:

1. Check [DOMAIN_QUICK_REFERENCE.md](DOMAIN_QUICK_REFERENCE.md#-troubleshooting)
2. Search [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md#step-10-troubleshooting)
3. Review DNS setup: [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md#step-1-dns-configuration)
4. Check SSL setup: [DOMAIN_SETUP_GUIDE.md](DOMAIN_SETUP_GUIDE.md#step-3-ssltls-certificate-setup)

---

## 📊 Configuration Overview

```
┌──────────────────────────────────────────────────────────┐
│ Domain: www.fitkart.club                                 │
│                                                           │
│ HTTPS Endpoints:                                          │
│  • https://api.fitkart.club          → localhost:3000   │
│  • https://admin.fitkart.club        → localhost:3001   │
│  • https://www.fitkart.club          → www redirect     │
│                                                           │
│ Security:                                                 │
│  • SSL Certificate: Let's Encrypt                         │
│  • Auto Renewal: Enabled                                  │
│  • HSTS: max-age=31536000                                │
│  • CORS: Configured                                       │
│                                                           │
│ Server: Nginx (Reverse Proxy)                            │
│  • HTTP → HTTPS redirect                                  │
│  • Security headers enabled                               │
│  • Static caching configured                              │
│  • Gzip compression enabled                               │
│                                                           │
│ Status: ✅ Ready to Configure                             │
└──────────────────────────────────────────────────────────┘
```

---

**Status**: ✅ Configuration Ready  
**Last Updated**: February 17, 2026  
**Version**: 1.0.0

---

**Next Step**: 👉 Choose your setup method above and get started!
