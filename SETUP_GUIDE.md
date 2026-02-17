# 🔧 Local Development Setup Guide

Complete guide to setting up FitKart for local development.

**Time to Complete**: 30-45 minutes  
**OS Support**: Windows, macOS, Linux

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Install Dependencies](#step-1-install-dependencies)
- [Step 2: Clone Repository](#step-2-clone-repository)
- [Step 3: Database Setup](#step-3-database-setup)
- [Step 4: Install NPM Packages](#step-4-install-npm-packages)
- [Step 5: Redis Setup](#step-5-redis-setup)
- [Step 6: Environment Configuration](#step-6-environment-configuration)
- [Step 7: Start Development Server](#step-7-start-development-server)
- [Troubleshooting](#troubleshooting)
- [Development Tools](#development-tools)
- [Project-Specific Commands](#project-specific-commands)

---

## Prerequisites

### Required Software

#### Node.js & npm
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher

**Check your versions**:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

**Install Node.js**:
- **Windows/macOS**: Download from [nodejs.org](https://nodejs.org)
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```
- **macOS (Homebrew)**:
  ```bash
  brew install node
  ```

#### PostgreSQL
- **Version**: 14.0 or higher
- **Must be running** on localhost:5432

**Install PostgreSQL**:

**Windows**:
- Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- Run installer, remember password for `postgres` user

**macOS**:
```bash
# Homebrew
brew install postgresql@14
brew services start postgresql@14

# Verify
postgres --version
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
postgres --version
```

#### Redis
- **Version**: 7.0 or higher
- **Must be running** on localhost:6379

**Install Redis**:

**Windows**:
- Option 1: Download Docker Desktop (easier)
- Option 2: Use Windows Subsystem for Linux (WSL) 2
- Option 3: Download from [redis.io](http://redis.io/download)

**macOS**:
```bash
brew install redis
brew services start redis

# Verify
redis-cli ping    # Should return PONG
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping    # Should return PONG
```

### Recommended Tools

- **Git**: Version control
- **VS Code**: Code editor with extensions
- **Postman/Insomnia**: API testing
- **pgAdmin**: PostgreSQL GUI

---

## Step 1: Install Dependencies

### Verify Installations

```bash
# Node.js
node --version

# npm
npm --version

# PostgreSQL
postgres --version

# Redis
redis-cli --version
```

### All commands should succeed without errors

---

## Step 2: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/FitKart.git

# Navigate to project
cd FitKart

# Verify structure
ls -la    # macOS/Linux
dir       # Windows
```

Expected structure:
```
FitKart/
├── backend/
├── docker-compose.yml
├── SETUP_GUIDE.md
└── README.md
```

---

## Step 3: Database Setup

### Create Database

#### Using PostgreSQL Command Line (All Platforms)

```bash
# Connect to PostgreSQL (Windows users may need to use psql.exe)
psql -U postgres

# Inside psql prompt, create database
postgres=# CREATE DATABASE fitkart;
postgres=# CREATE DATABASE fitkart_test;
postgres=# \q
```

**On Windows, if `psql` not found**:
- Open Command Prompt as Administrator
- Navigate to PostgreSQL bin directory: `C:\Program Files\PostgreSQL\14\bin`
- Run: `psql -U postgres`

**Using pgAdmin (GUI)**:
- Open pgAdmin
- Right-click "Databases" → "Create" → "Database"
- Name: `fitkart`
- Click "Save"
- Repeat for `fitkart_test`

### Verify Database Creation

```bash
# List databases
psql -U postgres -l | grep fitkart

# Should show:
# fitkart     | postgres | UTF8   | ...
# fitkart_test| postgres | UTF8   | ...
```

---

## Step 4: Install NPM Packages

### Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

**This will install**:
- Express 4.18+
- TypeScript 4.9+
- TypeORM 0.3+
- PostgreSQL driver
- Redis client
- JWT libraries
- Joi validation
- Testing libraries (Jest)
- And 30+ other packages

### Verify Installation

```bash
npm list | head -20    # Show first 20 packages

# Should see versions like:
# ├── express@4.18.2
# ├── typescript@4.9.5
# ├── typeorm@0.3.12
```

### Install Global Tools (Optional)

```bash
# TypeScript compiler (for tsc command)
npm install -g typescript

# ts-node (for running TypeScript directly)
npm install -g ts-node

# Verify
tsc --version
ts-node --version
```

---

## Step 5: Redis Setup

### Start Redis Server

#### macOS (Homebrew)

```bash
# Already started with brew services start
# Verify it's running:
redis-cli ping    # Should return PONG
```

#### Linux

```bash
# Check if running
sudo systemctl status redis-server

# If not running, start it
sudo systemctl start redis-server
```

#### Windows (Docker Method - Easiest)

```bash
# Install Docker Desktop first
# Then run:
docker run -d -p 6379:6379 redis:7-alpine

# Verify
redis-cli ping    # Should return PONG
```

#### Windows (WSL 2 Method)

```bash
# Open WSL 2 terminal
wsl

# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
redis-server

# In another terminal, verify
redis-cli ping
```

### Redis CLI Commands

```bash
# Test connection
redis-cli ping

# Get Redis info
redis-cli info

# View all keys (development only, don't use in production)
redis-cli keys '*'

# Flush all data (only when needed)
redis-cli FLUSHALL
```

---

## Step 6: Environment Configuration

### Create .env File

```bash
# From backend directory
cp .env.example .env
```

### Edit .env File

Open `backend/.env` in your editor and configure:

```env
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fitkart
DB_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production-min-32-chars-long!
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (for OTP)
SENDGRID_API_KEY=your-sendgrid-key-here
SENDGRID_FROM_EMAIL=noreply@fitkart.com

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
HASH_ROUNDS=10

# Admin
ADMIN_EMAIL=admin@fitkart.com
ADMIN_PASSWORD=SecurePass123!

# Logging
LOG_FORMAT=combined
LOG_DIR=./logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Key Environment Variables

| Variable | Example | Notes |
|----------|---------|-------|
| JWT_SECRET | min 32 chars | Generate: `openssl rand -base64 32` |
| DB_PASSWORD | postgres | Must match your PostgreSQL password |
| SENDGRID_API_KEY | sg_xxx | Optional for local testing |

### Generate JWT Secret

```bash
# Securely generate a random key
# On macOS/Linux:
openssl rand -base64 32

# On Windows PowerShell:
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## Step 7: Start Development Server

### Run Database Migrations

```bash
# From backend directory
npm run migrate

# Expected output:
# ✓ migration_xxxx_initial_setup.ts
# ✓ migration_xxxx_create_users.ts
# ✓ migration_xxxx_create_coins.ts
# ✓ migration_xxxx_create_steps.ts
# ...
```

### Seed Test Data (Optional)

```bash
npm run seed

# This will populate the database with:
# - Sample users
# - Sample products
# - Initial leaderboard data
```

### Start Development Server

```bash
npm run dev

# Expected output:
# ✓ TypeScript compiled successfully
# ✓ Express server listening on port 3000
# ✓ Database connected
# ✓ Redis connected
```

### Health Check

```bash
# In another terminal, test the API
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2024-02-17T10:30:00Z"}
```

---

## Troubleshooting

### Issue: "Port 3000 already in use"

```bash
# Find process using port 3000
# macOS/Linux:
lsof -i :3000

# Windows PowerShell:
netstat -ano | findstr :3000

# Kill the process
# macOS/Linux:
kill -9 <PID>

# Windows PowerShell:
Stop-Process -Id <PID>
```

### Issue: "ECONNREFUSED - Cannot connect to PostgreSQL"

```bash
# Check PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Windows:
# Open Services.msc and find PostgreSQL
```

**Restart PostgreSQL**:
```bash
# macOS:
brew services restart postgresql@14

# Linux:
sudo systemctl restart postgresql

# Windows:
# Services.msc → PostgreSQL → Restart
```

### Issue: "Redis connection refused"

```bash
# Check Redis is running
redis-cli ping

# If not running, start it:
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis-server

# Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

### Issue: "Database fitkart does not exist"

```bash
# Recreate database
psql -U postgres

postgres=# CREATE DATABASE fitkart;
postgres=# \q

# Run migrations again
npm run migrate
```

### Issue: "Module not found" or "Cannot find module"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json    # macOS/Linux
rmdir /s /q node_modules & del package-lock.json    # Windows

npm install
```

### Issue: TypeScript compilation errors

```bash
# Check TypeScript version
npx tsc --version

# Should be 4.9.5 or higher
# Update if needed:
npm install typescript@latest --save-dev
```

---

## Development Tools

### Recommended VS Code Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`

2. **ESLint**
   - ID: `dbaeumer.vscode-eslint`

3. **Thunder Client** (API testing)
   - ID: `rangav.vscode-thunder-client`

4. **PostgreSQL**
   - ID: `ckolkman.vscode-postgres`

5. **REST Client**
   - ID: `humao.rest-client`

### Useful API Testing Tools

**Postman**
```bash
# Download from https://www.postman.com/downloads/
# Import collection from backend/postman/
```

**Thunder Client (VS Code)**
- Built into VS Code
- Import tests from `backend/tests/api.requests`

**cURL (Command Line)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "phone": "+1234567890",
    "country": "US"
  }'
```

---

## Project-Specific Commands

### Development

```bash
# Start with hot reload
npm run dev

# Just compile TypeScript
npm run build

# Start compiled version
npm start

# Watch for changes and rebuild
npm run watch
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:services
npm run test:controllers
npm run test:integration

# Watch mode (re-run on file change)
npm run test:watch
```

### Database

```bash
# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Create new migration
npm run migrate:create --name="create_new_table"

# Seed database
npm run seed

# Drop and recreate database
npm run db:reset
```

### Code Quality

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck

# Format code
npm run format
```

### Documentation

```bash
# Generate API docs
npm run docs:generate

# Serve docs locally
npm run docs:serve
```

---

## Daily Development Workflow

### Morning Setup (First Time)

```bash
# Terminal 1: Start PostgreSQL
# (usually already running, verify:)
psql -U postgres -c "SELECT 1"

# Terminal 2: Start Redis
redis-server    # or: brew services start redis

# Terminal 3: Start backend server
cd backend && npm run dev
```

### Working on Features

```bash
# Create feature branch
git checkout -b feature/awesome-feature

# Make changes, then test
npm run test

# Run specific tests if needed
npm test -- path/to/test.spec.ts

# Run linter
npm run lint:fix

# Commit changes
git add .
git commit -m "feat: add awesome feature"

# Push and create PR
git push origin feature/awesome-feature
```

### Running Tests During Development

```bash
# Terminal 1: Keep dev server running
npm run dev

# Terminal 2: Run tests in watch mode
npm run test:watch

# Tests re-run automatically when you save files
```

---

## Next Steps

1. **Test the API**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Run Tests**: `npm test`
3. **Review Code Structure**: See [backend/README.md](./backend/README.md)
4. **Read Contributing Guide**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Time Estimate for First-Time Setup**: 30-45 minutes  
**Support**: Check [Troubleshooting](#troubleshooting) or open an issue on GitHub

---

**Last Updated**: February 17, 2026  
**Windows Support**: ✅ Full  
**macOS Support**: ✅ Full  
**Linux Support**: ✅ Full
