# Database Configuration

This directory contains database migrations and seed data for FitKart.

## Migrations

Database migrations are stored in the `migrations/` folder. They define the schema for:

- Users table
- Step records table
- Coin transactions table
- Rewards/Products table
- Admin logs table

## Seeds

Database seed data is stored in the `seeds/` folder. This includes:

- Sample users
- Sample products
- Configuration data

## Running Migrations

```bash
# Run pending migrations
npm run migrate

# Revert last migration
npm run migrate:revert

# Create new migration
npm run migrate:create CreateUsersTable
```

## Database Schema

### Users
- id: UUID (primary key)
- email: VARCHAR (unique)
- password: VARCHAR (hashed)
- full_name: VARCHAR
- phone: VARCHAR
- country_code: VARCHAR
- profile_picture: VARCHAR
- total_steps: BIGINT
- total_coins: BIGINT
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### StepRecords
- id: UUID (primary key)
- user_id: UUID (foreign key)
- steps: BIGINT
- distance: DECIMAL
- calories: DECIMAL
- heart_points: INTEGER
- source: VARCHAR (e.g., 'google_fit', 'health_kit')
- recorded_at: TIMESTAMP
- created_at: TIMESTAMP

### CoinTransactions
- id: UUID (primary key)
- user_id: UUID (foreign key)
- amount: BIGINT
- transaction_type: VARCHAR (e.g., 'earned', 'spent', 'refund')
- reference_id: UUID
- description: TEXT
- created_at: TIMESTAMP

### RewardProducts
- id: UUID (primary key)
- shopify_product_id: VARCHAR
- name: VARCHAR
- description: TEXT
- coin_price: BIGINT
- stock_quantity: INTEGER
- image_url: VARCHAR
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### AdminLogs
- id: UUID (primary key)
- admin_id: UUID (foreign key)
- action: VARCHAR
- entity_type: VARCHAR
- entity_id: UUID
- changes: JSONB
- ip_address: VARCHAR
- created_at: TIMESTAMP
