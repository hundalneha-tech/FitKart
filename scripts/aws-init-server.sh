#!/bin/bash
# FitKart AWS EC2 Server Initialization Script
# Run this on your EC2 instance after SSH connection
# Usage: bash /tmp/init-server.sh

set -e  # Exit on error

echo "================================"
echo "FitKart EC2 Server Initialization"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Update System
echo -e "\n${BLUE}[1/7] Updating system...${NC}"
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Step 2: Install Docker
echo -e "\n${BLUE}[2/7] Installing Docker...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify Docker
echo -e "${GREEN}✓ Docker installed$(docker --version)${NC}"

# Step 3: Install Docker Compose
echo -e "\n${BLUE}[3/7] Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo -e "${GREEN}✓ Docker Compose installed: $(docker-compose --version)${NC}"

# Step 4: Create application directory
echo -e "\n${BLUE}[4/7] Creating application directory...${NC}"
sudo mkdir -p /opt/fitkart
sudo chown ubuntu:ubuntu /opt/fitkart
cd /opt/fitkart
echo -e "${GREEN}✓ Directory created: /opt/fitkart${NC}"

# Step 5: Clone repository
echo -e "\n${BLUE}[5/7] Cloning repository...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/yourusername/FitKart.git temp
    cp -r temp/* .
    rm -rf temp
fi
echo -e "${GREEN}✓ Repository cloned${NC}"

# Step 6: Create log directory
echo -e "\n${BLUE}[6/7] Creating log directory...${NC}"
sudo mkdir -p /var/log/fitkart
sudo chown ubuntu:ubuntu /var/log/fitkart
echo -e "${GREEN}✓ Log directory created${NC}"

# Step 7: Configure firewall
echo -e "\n${BLUE}[7/7] Configuring firewall...${NC}"
sudo ufw enable -y
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${GREEN}✓ Firewall configured${NC}"

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Server initialization complete!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Create .env.production file"
echo "2. Run: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo "3. Run: docker-compose exec backend npm run migrate"
echo "4. Run: docker-compose exec backend npm run seed"
echo "5. Verify: curl http://localhost:3000/health"
