#!/bin/bash

# FitKart Database Initialization Script
# Usage: ./init-database.sh

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fitkart}
DB_USER=${DB_USER:-fitkart_user}
DB_PASSWORD=${DB_PASSWORD:-fitkart_password}

echo "🗄️  FitKart Database Initialization"
echo "=================================="

# Create database user if not exists
echo "Creating database user..."
psql -h $DB_HOST -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
psql -h $DB_HOST -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' CREATEDB;"

# Create database if not exists
echo "Creating database..."
psql -h $DB_HOST -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Run migrations
echo "Running migrations..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅  Schema created successfully"
else
    echo "❌  Failed to create schema"
    exit 1
fi

# Run seeds
echo "Seeding database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f seeds/001_initial_seed.sql

if [ $? -eq 0 ]; then
    echo "✅  Database seeded successfully"
else
    echo "❌  Failed to seed database"
    exit 1
fi

echo ""
echo "✅  Database initialization complete!"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "To connect:"
echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
