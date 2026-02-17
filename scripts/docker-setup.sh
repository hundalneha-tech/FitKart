#!/bin/bash

# ============================================
# FitKart Docker Setup Script
# ============================================
# Initializes Docker environment and starts containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_info "Docker found: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_info "Docker Compose found: $(docker-compose --version)"
}

# Create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        cat > .env << EOF
# ============================================
# Environment Configuration
# ============================================

# Environment
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=fitkart
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fitkart

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Logging
LOG_LEVEL=info

# Monitoring (Production)
GRAFANA_PASSWORD=admin
GRAFANA_URL=https://grafana.example.com

EOF
        print_info ".env file created successfully"
    else
        print_warning ".env file already exists"
    fi
}

# Build images
build_images() {
    print_info "Building Docker images..."
    docker-compose build --no-cache
    print_info "Images built successfully"
}

# Start services
start_services() {
    local environment=$1
    
    if [ "$environment" = "production" ]; then
        print_info "Starting services in production mode..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        print_info "Starting services in development mode..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    fi
    
    print_info "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_info "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker ps | grep -q fitkart-backend && \
           docker ps | grep -q fitkart-postgres && \
           docker ps | grep -q fitkart-redis; then
            print_info "All services are running"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    print_error "Services did not start properly"
    return 1
}

# Initialize database
init_database() {
    print_info "Running database migrations..."
    docker-compose exec -T backend npm run migrate
    print_info "Database initialized successfully"
}

# Seed database
seed_database() {
    print_info "Seeding database..."
    docker-compose exec -T backend npm run seed
    print_info "Database seeded successfully"
}

# Display service URLs
show_service_urls() {
    echo ""
    echo "═══════════════════════════════════════════"
    print_info "FitKart Services are running!"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "📡 Backend API:       http://localhost:3000"
    echo "   Health Check:      http://localhost:3000/health"
    echo "   API Docs:          http://localhost:3000/api-docs"
    echo ""
    echo "🗄️  PostgreSQL:        localhost:5432"
    echo "   User:              postgres"
    echo "   Password:          postgres (from .env)"
    echo "   Database:          fitkart"
    echo ""
    echo "⚡ Redis:             localhost:6379"
    echo ""
    echo "🖥️  Development Tools:"
    echo "   pgAdmin:           http://localhost:5050"
    echo "   Redis Commander:   http://localhost:8081"
    echo ""
    echo "📊 Monitoring (Production):"
    echo "   Prometheus:        http://localhost:9090"
    echo "   Grafana:           http://localhost:3002"
    echo ""
    echo "═══════════════════════════════════════════"
    echo ""
}

# Main script logic
main() {
    echo "🐳 FitKart Docker Setup"
    echo "═══════════════════════════════════════════"
    echo ""
    
    # Parse arguments
    local command=${1:-setup}
    local environment=${2:-development}
    
    case $command in
        setup)
            print_info "Running setup..."
            check_docker
            create_env_file
            build_images
            start_services "$environment"
            wait_for_services
            init_database
            show_service_urls
            ;;
        start)
            print_info "Starting services..."
            start_services "$environment"
            wait_for_services
            show_service_urls
            ;;
        stop)
            print_info "Stopping services..."
            docker-compose down
            print_info "Services stopped"
            ;;
        restart)
            print_info "Restarting services..."
            docker-compose restart
            wait_for_services
            show_service_urls
            ;;
        logs)
            print_info "Showing logs..."
            docker-compose logs -f
            ;;
        seed)
            print_info "Seeding database..."
            seed_database
            ;;
        clean)
            print_warning "Removing all Docker resources..."
            docker-compose down -v
            print_info "All resources removed"
            ;;
        status)
            print_info "Service status:"
            docker-compose ps
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|restart|logs|seed|clean|status} [development|production]"
            exit 1
            ;;
    esac
}

main "$@"
