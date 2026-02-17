#!/bin/bash

################################################################################
# FitKart Domain Setup Script
################################################################################
# Usage: bash domain-setup.sh
# 
# This script automates the FitKart domain configuration including:
# - SSL certificate installation
# - Nginx configuration
# - Service setup
# 
# Prerequisites:
# - Ubuntu/Debian server
# - sudo access
# - Domain registered and DNS pointed to server IP
# - Backend running on localhost:3000
# - Admin dashboard running on localhost:3001
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="www.fitkart.club"
API_DOMAIN="api.fitkart.club"
ADMIN_DOMAIN="admin.fitkart.club"
EMAIL="admin@fitkart.club"
BACKEND_PORT=3000
ADMIN_PORT=3001
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    return 0
}

################################################################################
# 1. System Update & Dependencies
################################################################################

update_system() {
    log_info "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    log_success "System updated"
}

install_dependencies() {
    log_info "Installing required packages..."
    
    if ! check_command "nginx"; then
        apt-get install -y nginx
        log_success "Nginx installed"
    else
        log_info "Nginx already installed"
    fi
    
    if ! check_command "certbot"; then
        apt-get install -y certbot python3-certbot-nginx
        log_success "Certbot installed"
    else
        log_info "Certbot already installed"
    fi
    
    if ! check_command "curl"; then
        apt-get install -y curl
    fi
    
    log_success "All dependencies installed"
}

################################################################################
# 2. SSL Certificate Setup
################################################################################

setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    # Check if certificate already exists
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/cert.pem" ]; then
        log_warning "SSL certificate already exists for ${DOMAIN}"
        read -p "Do you want to renew it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping certificate renewal"
            return 0
        fi
    fi
    
    log_info "Stopping nginx temporarily..."
    systemctl stop nginx || true
    
    log_info "Requesting SSL certificate from Let's Encrypt..."
    sleep 2
    
    certbot certonly --standalone \
        -d ${DOMAIN} \
        -d ${API_DOMAIN} \
        -d ${ADMIN_DOMAIN} \
        --agree-tos \
        --non-interactive \
        --email ${EMAIL} || {
        log_error "Failed to obtain SSL certificate"
        return 1
    }
    
    log_success "SSL certificate obtained successfully"
    log_info "Certificate location: /etc/letsencrypt/live/${DOMAIN}/"
    
    # Start nginx again
    systemctl start nginx
}

################################################################################
# 3. Nginx Configuration
################################################################################

setup_nginx() {
    log_info "Configuring Nginx..."
    
    # Create nginx config file
    log_info "Creating Nginx configuration..."
    
    # Backup existing config if it exists
    if [ -f "${NGINX_AVAILABLE}/fitkart.club" ]; then
        log_warning "Backing up existing nginx config..."
        cp "${NGINX_AVAILABLE}/fitkart.club" "${NGINX_AVAILABLE}/fitkart.club.backup"
    fi
    
    # Create the nginx configuration
    cat > "${NGINX_AVAILABLE}/fitkart.club" << 'NGINX_CONFIG'
# HTTP to HTTPS Redirect
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

    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization' always;

    access_log /var/log/nginx/api.fitkart.club_access.log;
    error_log /var/log/nginx/api.fitkart.club_error.log;

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

    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/admin.fitkart.club_access.log;
    error_log /var/log/nginx/admin.fitkart.club_error.log;

    location /_next/static {
        proxy_pass http://127.0.0.1:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public {
        proxy_pass http://127.0.0.1:3001;
        expires 7d;
        add_header Cache-Control "public";
    }

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
}

# WWW redirect
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fitkart.club;

    ssl_certificate /etc/letsencrypt/live/www.fitkart.club/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.fitkart.club/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    return 301 https://www.fitkart.club$request_uri;
}
NGINX_CONFIG
    
    log_success "Nginx configuration created"
    
    # Enable site
    log_info "Enabling Nginx site..."
    if [ -L "${NGINX_ENABLED}/fitkart.club" ]; then
        rm "${NGINX_ENABLED}/fitkart.club"
    fi
    ln -s "${NGINX_AVAILABLE}/fitkart.club" "${NGINX_ENABLED}/fitkart.club"
    
    # Test configuration
    log_info "Testing Nginx configuration..."
    if nginx -t > /dev/null 2>&1; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration test failed"
        nginx -t
        return 1
    fi
    
    # Reload nginx
    log_info "Reloading Nginx..."
    systemctl reload nginx
    log_success "Nginx configured and reloaded"
}

################################################################################
# 4. Services Check
################################################################################

check_services() {
    log_info "Checking services..."
    
    # Check backend API
    log_info "Checking backend API on port ${BACKEND_PORT}..."
    if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
        log_success "Backend API is running"
    else
        log_warning "Backend API not responding on port ${BACKEND_PORT}"
    fi
    
    # Check admin dashboard
    log_info "Checking admin dashboard on port ${ADMIN_PORT}..."
    if curl -s http://localhost:${ADMIN_PORT} > /dev/null 2>&1; then
        log_success "Admin dashboard is running"
    else
        log_warning "Admin dashboard not responding on port ${ADMIN_PORT}"
    fi
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
        return 1
    fi
}

################################################################################
# 5. Auto-Renewal Setup
################################################################################

setup_auto_renewal() {
    log_info "Setting up certificate auto-renewal..."
    
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    if systemctl is-active --quiet certbot.timer; then
        log_success "Certificate auto-renewal enabled"
    else
        log_error "Failed to enable certificate auto-renewal"
        return 1
    fi
}

################################################################################
# 6. Testing
################################################################################

test_domain() {
    log_info "Testing domain configuration..."
    
    # Wait a moment for DNS propagation
    sleep 2
    
    # Test HTTPS API
    log_info "Testing API endpoint..."
    if curl -s -I https://${API_DOMAIN}/health | grep -q "HTTP/"; then
        log_success "API HTTPS endpoint is working"
    else
        log_warning "Could not verify API endpoint (DNS might not be propagated yet)"
    fi
    
    # Test HTTPS Admin
    log_info "Testing Admin Dashboard endpoint..."
    if curl -s -I https://${ADMIN_DOMAIN}/ | grep -q "HTTP/"; then
        log_success "Admin Dashboard HTTPS endpoint is working"
    else
        log_warning "Could not verify Admin Dashboard endpoint (DNS might not be propagated yet)"
    fi
    
    # Test certificate
    log_info "Testing SSL certificate..."
    openssl s_client -connect ${API_DOMAIN}:443 -servername ${API_DOMAIN} < /dev/null 2>/dev/null | openssl x509 -noout -text | grep -A 2 "Subject:"
}

################################################################################
# 7. Summary & Next Steps
################################################################################

print_summary() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}Domain Configuration Complete!${NC}"
    echo "=========================================="
    echo ""
    echo "Configuration Summary:"
    echo "  Domain: ${DOMAIN}"
    echo "  API: https://${API_DOMAIN}/api/v1"
    echo "  Admin: https://${ADMIN_DOMAIN}"
    echo ""
    echo "Certificate:"
    echo "  Location: /etc/letsencrypt/live/${DOMAIN}/"
    echo "  Auto-renewal: ${GREEN}Enabled${NC}"
    echo ""
    echo "Services:"
    echo "  Nginx: $(systemctl is-active nginx)"
    echo "  Backend: Running on localhost:${BACKEND_PORT}"
    echo "  Admin: Running on localhost:${ADMIN_PORT}"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: sudo tail -f /var/log/nginx/api.fitkart.club_access.log"
    echo "  Check cert: sudo certbot certificates"
    echo "  Renew cert: sudo certbot renew --force-renewal"
    echo "  Restart nginx: sudo systemctl restart nginx"
    echo ""
    echo "Next Steps:"
    echo "  1. Verify DNS propagation has completed"
    echo "  2. Test endpoints in browser:"
    echo "     - https://${API_DOMAIN}/health"
    echo "     - https://${ADMIN_DOMAIN}"
    echo "  3. Configure environment variables for production"
    echo "  4. Set up monitoring and backups"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    echo "=========================================="
    echo "FitKart Domain Setup Script"
    echo "=========================================="
    echo ""
    
    check_root
    
    # Update system
    read -p "Update system packages? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        update_system
    fi
    
    # Install dependencies
    install_dependencies
    
    # Setup SSL
    setup_ssl || exit 1
    
    # Configure nginx
    setup_nginx || exit 1
    
    # Check services
    check_services
    
    # Setup auto-renewal
    setup_auto_renewal
    
    # Test domain
    log_info "Waiting for DNS propagation (this may take a few minutes)..."
    sleep 5
    test_domain
    
    # Print summary
    print_summary
}

# Run main function
main
