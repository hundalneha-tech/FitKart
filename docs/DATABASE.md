# FitKart Database Schema Documentation

## Overview

The FitKart database is built on PostgreSQL 12+ with a comprehensive schema designed for:
- User management and authentication
- Step tracking and anti-cheat measures
- Coin economy and transactions
- Reward redemption and order management
- Achievement system
- Admin audit logging

## Table Structure

### Authentication & Users

#### `users`
Core user information and authentication data.

**Columns:**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `full_name` (VARCHAR) - User's full name
- `phone` (VARCHAR) - Phone number with country code
- `country_code` (VARCHAR) - ISO country code
- `profile_picture_url` (TEXT) - URL to profile image
- `auth_provider` (VARCHAR) - 'email', 'google', or 'apple'
- `provider_id` (VARCHAR) - OAuth provider user ID
- `bio` (TEXT) - User bio/about
- `is_active` (BOOLEAN) - Account active status
- `email_verified` (BOOLEAN) - Email verification status
- `total_steps` (BIGINT) - Cached total steps
- `total_coins` (BIGINT) - Current coin balance (cached)
- `lifetime_coins_earned` (BIGINT) - Total coins ever earned
- `lifetime_coins_spent` (BIGINT) - Total coins ever spent
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time
- `last_login_at` (TIMESTAMP) - Last login timestamp
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

**Indexes:**
- `email` - For login queries
- `provider_id` - For OAuth login
- `created_at` - For user analytics
- `is_active` - For filtering active users

#### `refresh_tokens`
JWT refresh token management for session handling.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `token` (VARCHAR) - Actual token
- `expires_at` (TIMESTAMP) - Token expiration time
- `created_at` (TIMESTAMP) - Token creation time
- `revoked_at` (TIMESTAMP) - Revocation time (if revoked)

### Wallet & Coins

#### `wallets`
Denormalized coin balance for quick access.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users (unique)
- `available_coins` (BIGINT) - Coins available for spending
- `frozen_coins` (BIGINT) - Coins in pending redemptions
- `total_earned` (BIGINT) - Lifetime coins earned
- `total_spent` (BIGINT) - Lifetime coins spent
- `last_updated` (TIMESTAMP) - Last update time

**Strategy:** Denormalized for fast queries. Source of truth is `coin_transactions` table.

#### `coin_transactions`
Complete audit trail of all coin movements.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `amount` (BIGINT) - Amount of coins
- `transaction_type` (VARCHAR) - 'earned', 'spent', 'refund', 'bonus', 'penalty'
- `reference_type` (VARCHAR) - Type of reference (step_record, order, achievement)
- `reference_id` (UUID) - ID of reference entity
- `description` (TEXT) - Human-readable description
- `balance_before` (BIGINT) - Wallet balance before transaction
- `balance_after` (BIGINT) - Wallet balance after transaction
- `created_at` (TIMESTAMP) - Transaction time

**Indexes:**
- `user_id` - For user transaction history
- `transaction_type` - For filtering by type
- `created_at` - For time-based queries
- `reference` - For tracing transactions to source

### Step Tracking

#### `step_records`
Time-series data of user step activity.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `steps` (BIGINT) - Number of steps
- `distance` (DECIMAL) - Distance in km
- `calories` (DECIMAL) - Estimated calories burned
- `heart_points` (INTEGER) - Heart activity score
- `source` (VARCHAR) - 'google_fit', 'health_kit', 'manual'
- `recorded_date` (DATE) - Date of activity
- `sync_token` (VARCHAR) - For incremental sync
- `is_verified` (BOOLEAN) - Passed anti-cheat checks
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

**Indexes:**
- `user_id, recorded_date` - For efficient date range queries
- `created_at` - For recent activity
- `recorded_date` - For analytics

**Note:** One record per user per day to aggregate multiple data points.

#### `step_validations`
Anti-cheat system for step verification.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `step_record_id` (UUID) - Foreign key to step_records
- `expected_steps` (BIGINT) - Expected step count
- `reported_steps` (BIGINT) - Reported step count
- `anomaly_score` (DECIMAL) - 0-100 anomaly score
- `is_suspicious` (BOOLEAN) - Flagged as suspicious
- `validation_reason` (TEXT) - Reason for flag
- `reviewed_by_admin_id` (UUID) - Admin who reviewed
- `status` (VARCHAR) - 'pending', 'approved', 'rejected'
- `created_at` (TIMESTAMP) - Check creation time
- `reviewed_at` (TIMESTAMP) - Admin review time

**Strategy:** Machine learning anomaly detection with admin review queue.

### Rewards & Orders

#### `reward_products`
Shopify-synced reward products available for redemption.

**Columns:**
- `id` (UUID) - Primary key
- `shopify_product_id` (VARCHAR) - Unique Shopify ID
- `shopify_variant_id` (VARCHAR) - Variant ID
- `name` (VARCHAR) - Product name
- `description` (TEXT) - Product description
- `coin_price` (BIGINT) - Price in coins
- `retail_price` (DECIMAL) - Retail price in USD
- `image_url` (TEXT) - Product image URL
- `stock_quantity` (INTEGER) - Available stock
- `category` (VARCHAR) - Product category
- `is_active` (BOOLEAN) - Available for redemption
- `popularity_rank` (INTEGER) - Ranking for algorithm
- `synced_at` (TIMESTAMP) - Last Shopify sync time
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

**Sync Strategy:** Synced with Shopify API periodically to keep prices and stock updated.

#### `orders`
User redemption orders.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `order_code` (VARCHAR) - Human-readable order code (e.g., FK-2024-00123)
- `total_coins` (BIGINT) - Total coins spent
- `status` (VARCHAR) - Order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `shipping_address` (JSONB) - Full shipping address
- `tracking_number` (VARCHAR) - Shipping tracking number
- `notes` (TEXT) - Internal notes
- `created_at` (TIMESTAMP) - Order creation
- `updated_at` (TIMESTAMP) - Last update
- `shipped_at` (TIMESTAMP) - Shipment time
- `delivered_at` (TIMESTAMP) - Delivery time
- `cancelled_at` (TIMESTAMP) - Cancellation time

**Workflow:**
1. pending → confirmed (payment verified)
2. confirmed → processing (preparing for shipment)
3. processing → shipped (tracking available)
4. shipped → delivered (final state)
5. Any state → cancelled or refunded (if issues)

#### `order_items`
Individual items in orders (join table between orders and products).

**Columns:**
- `id` (UUID) - Primary key
- `order_id` (UUID) - Foreign key to orders
- `product_id` (UUID) - Foreign key to reward_products
- `quantity` (INTEGER) - Quantity of this product
- `coin_price_at_purchase` (BIGINT) - Price at time of purchase
- `total_coins` (BIGINT) - Quantity × price
- `created_at` (TIMESTAMP) - Creation time

**Purpose:** Tracks historical pricing; allows prices to change without affecting previous orders.

### Achievements & Gamification

#### `achievements`
Achievement/badge definitions.

**Columns:**
- `id` (UUID) - Primary key
- `code` (VARCHAR) - Unique achievement code (e.g., 'steps_10k')
- `name` (VARCHAR) - Display name
- `description` (TEXT) - Achievement description
- `icon_url` (TEXT) - Badge icon URL
- `badge_color` (VARCHAR) - Hex color code
- `unlock_criteria` (JSONB) - Criteria JSON (e.g., {"min_steps": 10000})
- `reward_coins` (BIGINT) - Bonus coins for unlocking
- `display_order` (INTEGER) - Sort order in UI
- `is_active` (BOOLEAN) - Currently available
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update

**Example Achievements:**
- steps_1k, steps_5k, steps_10k, steps_50k, steps_100k
- streak_7, streak_30, streak_100
- early_bird, night_owl
- consistency_month
- first_redemption, collector

#### `user_achievements`
User achievement progress and unlocks.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `achievement_id` (UUID) - Foreign key to achievements
- `unlocked_at` (TIMESTAMP) - When unlocked
- `UNIQUE(user_id, achievement_id)` - Prevent duplicates

### Leaderboards

#### `leaderboard_cache`
Cached leaderboard rankings refreshed periodically.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `rank` (INTEGER) - Leaderboard rank
- `total_steps` (BIGINT) - Steps in period
- `week_starts_at` (DATE) - Period start date
- `period` (VARCHAR) - 'weekly', 'monthly', 'all_time'
- `last_updated` (TIMESTAMP) - Last cache refresh
- `UNIQUE(user_id, period, week_starts_at)` - Prevent duplicates

**Refresh Strategy:** Recalculate nightly via scheduled job.

### Admin & Auditing

#### `admin_logs`
Comprehensive audit trail of admin actions.

**Columns:**
- `id` (UUID) - Primary key
- `admin_id` (UUID) - Foreign key to admin users
- `action` (VARCHAR) - Action taken (user_created, coin_adjust, order_cancelled, etc.)
- `entity_type` (VARCHAR) - Type of entity affected (user, order, product, etc.)
- `entity_id` (UUID) - ID of affected entity
- `changes` (JSONB) - Before/after values
- `ip_address` (INET) - Admin's IP address
- `user_agent` (TEXT) - Browser/client info
- `created_at` (TIMESTAMP) - Action timestamp

**Indexes:**
- `admin_id` - Find actions by admin
- `entity_type, entity_id` - Find history for entity
- `action` - Filter by action type
- `created_at` - Audit timeline

#### `settings`
Global platform configuration.

**Columns:**
- `id` (UUID) - Primary key
- `key` (VARCHAR) - Unique setting key
- `value` (TEXT) - Setting value
- `description` (TEXT) - Description of setting
- `updated_by_admin_id` (UUID) - Last admin who changed
- `updated_at` (TIMESTAMP) - Last update time

**Examples:**
- `coins_per_step`: 1
- `daily_step_goal`: 10000
- `anti_cheat_enabled`: true
- `new_user_bonus_coins`: 100

## Views

### `active_users`
Quick access to active user statistics.

```sql
SELECT id, email, full_name, total_steps, available_coins, created_at, last_login_at
FROM active_users;
```

### `daily_step_summary`
Analytics on daily step trends.

```sql
SELECT recorded_date, active_users, total_steps, avg_steps, max_steps
FROM daily_step_summary;
```

### `user_stats`
Comprehensive user statistics.

```sql
SELECT * FROM user_stats WHERE id = ?;
```

## Performance Considerations

### Indexes
- **Composite indexes** on frequently queried column combinations
- **Partial indexes** for filtering (e.g., is_active = true)
- **BRIN indexes** for time-series data (step_records)

### Denormalization
- `wallets` table denormalized from `coin_transactions` for read performance
- `total_steps`, `total_coins` cached in `users` table

### Data Partitioning (Future)
- `step_records` partitioned by year/month as data grows
- `coin_transactions` partitioned by user_id for horizontal scaling

## Backup & Recovery

- Daily automated backups retained for 30 days
- Point-in-time recovery available
- Replicas in separate regions for disaster recovery

## Security

- All sensitive data encrypted at rest
- No passwords stored in plain text (bcrypt hashing)
- Audit logs for compliance
- Row-level security for multi-tenancy (if needed)

## Maintenance

- Weekly analyze for query optimization
- Monthly VACUUM FULL for cleanup
- Index fragmentation monitoring
- Connection pool monitoring
