-- FitKart Database Schema
-- PostgreSQL 12+
-- Initial schema setup for FitKart platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    country_code VARCHAR(3),
    profile_picture_url TEXT,
    auth_provider VARCHAR(50) DEFAULT 'email', -- email, google, apple
    provider_id VARCHAR(255), -- For OAuth providers
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    total_steps BIGINT DEFAULT 0,
    total_coins BIGINT DEFAULT 0,
    lifetime_coins_earned BIGINT DEFAULT 0,
    lifetime_coins_spent BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider_id ON users(provider_id);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Refresh Tokens Table (for JWT management)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Wallet Table (denormalized for quick access)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    available_coins BIGINT DEFAULT 0,
    frozen_coins BIGINT DEFAULT 0, -- Coins in pending redemptions
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Step Records Table (time-series data)
CREATE TABLE step_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    steps BIGINT NOT NULL,
    distance DECIMAL(10, 2), -- in km
    calories DECIMAL(10, 2), -- estimated
    heart_points INTEGER,
    source VARCHAR(50) NOT NULL, -- google_fit, health_kit, manual
    recorded_date DATE NOT NULL,
    sync_token VARCHAR(500), -- For incremental sync
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_step_records_user_id ON step_records(user_id);
CREATE INDEX idx_step_records_recorded_date ON step_records(recorded_date);
CREATE INDEX idx_step_records_user_date ON step_records(user_id, recorded_date);
CREATE INDEX idx_step_records_created_at ON step_records(created_at);

-- Step Validation Table (anti-cheat)
CREATE TABLE step_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_record_id UUID NOT NULL REFERENCES step_records(id) ON DELETE CASCADE,
    expected_steps BIGINT,
    reported_steps BIGINT,
    anomaly_score DECIMAL(5, 2), -- 0-100 score
    is_suspicious BOOLEAN DEFAULT false,
    validation_reason TEXT,
    reviewed_by_admin_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

CREATE INDEX idx_step_validations_user_id ON step_validations(user_id);
CREATE INDEX idx_step_validations_status ON step_validations(status);

-- Coin Transactions Table (audit trail)
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- earned, spent, refund, bonus, penalty
    reference_type VARCHAR(50), -- step_record, order, achievement, admin
    reference_id UUID,
    description TEXT,
    balance_before BIGINT,
    balance_after BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);
CREATE INDEX idx_coin_transactions_reference ON coin_transactions(reference_type, reference_id);

-- Reward Products Table (from Shopify)
CREATE TABLE reward_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopify_product_id VARCHAR(100) NOT NULL UNIQUE,
    shopify_variant_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coin_price BIGINT NOT NULL,
    retail_price DECIMAL(10, 2),
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    popularity_rank INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reward_products_shopify_id ON reward_products(shopify_product_id);
CREATE INDEX idx_reward_products_is_active ON reward_products(is_active);
CREATE INDEX idx_reward_products_category ON reward_products(category);
CREATE INDEX idx_reward_products_created_at ON reward_products(created_at);

-- Orders Table (redemptions)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    total_coins BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_code ON orders(order_code);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES reward_products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    coin_price_at_purchase BIGINT NOT NULL,
    total_coins BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- steps_10k, steps_50k, etc
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_color VARCHAR(7), -- hex color
    unlock_criteria JSONB, -- {"min_steps": 10000}
    reward_coins BIGINT DEFAULT 0,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_code ON achievements(code);
CREATE INDEX idx_achievements_is_active ON achievements(is_active);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- Leaderboard Cache Table (refreshed periodically)
CREATE TABLE leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    total_steps BIGINT NOT NULL,
    week_starts_at DATE NOT NULL,
    period VARCHAR(50), -- weekly, monthly, all_time
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period, week_starts_at)
);

CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(rank);
CREATE INDEX idx_leaderboard_period ON leaderboard_cache(period);

-- Admin Logs Table (audit trail)
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- user_created, coin_adjust, step_review, etc
    entity_type VARCHAR(50), -- user, order, step_record, etc
    entity_id UUID,
    changes JSONB, -- Track what changed
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- Settings Table (global configuration)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by_admin_id UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial settings
INSERT INTO settings (key, value, description) VALUES
    ('coins_per_step', '1', 'Number of coins earned per step'),
    ('daily_step_goal', '10000', 'Daily step goal for achievements'),
    ('anti_cheat_enabled', 'true', 'Enable step anomaly detection'),
    ('new_user_bonus_coins', '100', 'Bonus coins for new user signup')
ON CONFLICT (key) DO NOTHING;

-- Views for common queries

-- Active users view
CREATE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.total_steps,
    w.available_coins,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.is_active = true AND u.deleted_at IS NULL;

-- Daily step summary
CREATE VIEW daily_step_summary AS
SELECT 
    recorded_date,
    COUNT(DISTINCT user_id) as active_users,
    SUM(steps) as total_steps,
    AVG(steps) as avg_steps,
    MAX(steps) as max_steps
FROM step_records
GROUP BY recorded_date;

-- User stats view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.total_steps,
    w.available_coins,
    w.total_earned,
    w.total_spent,
    COUNT(DISTINCT sr.id)::INTEGER as step_records_count,
    COUNT(DISTINCT ach.id)::INTEGER as achievements_count,
    COUNT(DISTINCT o.id)::INTEGER as orders_count
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN step_records sr ON u.id = sr.user_id
LEFT JOIN user_achievements ach ON u.id = ach.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.full_name, u.total_steps, w.available_coins, w.total_earned, w.total_spent;
