-- FitKart Database - Common Queries Reference
-- Use these queries as templates for your application

-- ============================================
-- USER QUERIES
-- ============================================

-- Get user profile with stats
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.profile_picture_url,
  u.total_steps,
  w.available_coins,
  w.total_earned,
  w.total_spent,
  u.created_at,
  u.last_login_at
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.id = $1;

-- Update last login
UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1;

-- Search users by email or name
SELECT id, email, full_name, profile_picture_url
FROM users
WHERE is_active = true
  AND (email ILIKE $1 || '%' OR full_name ILIKE $1 || '%')
LIMIT 20;

-- ============================================
-- STEP TRACKING QUERIES
-- ============================================

-- Record today's steps
INSERT INTO step_records (user_id, steps, distance, calories, source, recorded_date, is_verified)
VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, false)
ON CONFLICT (user_id, recorded_date, source) 
DO UPDATE SET steps = $2, distance = $3, calories = $4, updated_at = CURRENT_TIMESTAMP;

-- Get user's step history (last N days)
SELECT recorded_date, steps, distance, calories, source
FROM step_records
WHERE user_id = $1 AND recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY recorded_date DESC;

-- Get weekly steps
SELECT 
  DATE_TRUNC('week', recorded_date)::DATE as week_start,
  SUM(steps) as total_steps,
  COUNT(DISTINCT recorded_date) as active_days
FROM step_records
WHERE user_id = $1 AND recorded_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('week', recorded_date)
ORDER BY week_start DESC;

-- Get monthly steps
SELECT 
  DATE_TRUNC('month', recorded_date)::DATE as month_start,
  SUM(steps) as total_steps,
  COUNT(DISTINCT recorded_date) as active_days
FROM step_records
WHERE user_id = $1 AND EXTRACT(YEAR FROM recorded_date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY DATE_TRUNC('month', recorded_date)
ORDER BY month_start DESC;

-- Get today's steps for all users (for daily report)
SELECT 
  user_id,
  SUM(steps) as daily_steps,
  COUNT(*) as data_points
FROM step_records
WHERE recorded_date = CURRENT_DATE
GROUP BY user_id
ORDER BY daily_steps DESC;

-- ============================================
-- ANTI-CHEAT QUERIES
-- ============================================

-- Get flagged steps awaiting review
SELECT 
  sv.id,
  sv.user_id,
  u.full_name,
  u.email,
  sr.recorded_date,
  sr.steps as reported_steps,
  sv.expected_steps,
  sv.anomaly_score,
  sv.validation_reason,
  sr.source,
  sv.created_at
FROM step_validations sv
JOIN users u ON sv.user_id = u.id
JOIN step_records sr ON sv.step_record_id = sr.id
WHERE sv.status = 'pending' AND sv.is_suspicious = true
ORDER BY sv.anomaly_score DESC, sv.created_at ASC
LIMIT 50;

-- Approve suspicious step record
UPDATE step_validations
SET status = 'approved', reviewed_by_admin_id = $1, reviewed_at = CURRENT_TIMESTAMP
WHERE id = $2;

-- Reject suspicious step record
UPDATE step_records SET is_verified = false WHERE id = $1;
DELETE FROM coin_transactions WHERE reference_id = $1 AND reference_type = 'step_record';

-- Get user's anomaly pattern
SELECT 
  AVG(steps) as avg_daily_steps,
  STDDEV(steps) as stddev_steps,
  MAX(steps) as max_steps,
  MIN(steps) as min_steps,
  COUNT(*) as record_count
FROM step_records
WHERE user_id = $1 AND recorded_date >= CURRENT_DATE - INTERVAL '30 days'
  AND is_verified = true;

-- ============================================
-- COIN QUERIES
-- ============================================

-- Get user's wallet
SELECT available_coins, frozen_coins, total_earned, total_spent
FROM wallets
WHERE user_id = $1;

-- Award coins to user
INSERT INTO coin_transactions 
  (user_id, amount, transaction_type, reference_type, reference_id, description, balance_before, balance_after)
SELECT 
  $1,
  $2,
  'earned',
  'step_record',
  SR.id,
  'Earned from steps',
  w.available_coins,
  w.available_coins + $2
FROM wallets w
WHERE w.user_id = $1
RETURNING *;

-- Update wallet after transaction
UPDATE wallets
SET available_coins = available_coins + $1,
    total_earned = total_earned + $1,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = $2;

-- Get user's coin transaction history
SELECT 
  ct.id,
  ct.amount,
  ct.transaction_type,
  ct.description,
  ct.balance_after,
  ct.created_at
FROM coin_transactions ct
WHERE ct.user_id = $1
ORDER BY ct.created_at DESC
LIMIT 100;

-- Get daily coin stats
SELECT 
  DATE(created_at) as date,
  SUM(CASE WHEN transaction_type = 'earned' THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN transaction_type = 'spent' THEN amount ELSE 0 END) as total_spent,
  COUNT(*) as transaction_count
FROM coin_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- REWARD & PRODUCT QUERIES
-- ============================================

-- Get all active reward products
SELECT 
  id,
  name,
  description,
  coin_price,
  retail_price,
  image_url,
  stock_quantity,
  category,
  popularity_rank
FROM reward_products
WHERE is_active = true AND stock_quantity > 0
ORDER BY popularity_rank ASC NULLS LAST, coin_price ASC;

-- Get products by category
SELECT 
  id,
  name,
  image_url,
  coin_price,
  stock_quantity
FROM reward_products
WHERE is_active = true AND category = $1 AND stock_quantity > 0
ORDER BY popularity_rank ASC NULLS LAST;

-- Search products
SELECT 
  id,
  name,
  description,
  image_url,
  coin_price,
  stock_quantity,
  category
FROM reward_products
WHERE is_active = true 
  AND stock_quantity > 0
  AND (name ILIKE $1 || '%' OR description ILIKE $1 || '%')
ORDER BY popularity_rank ASC;

-- ============================================
-- ORDER QUERIES
-- ============================================

-- Create new order
INSERT INTO orders (user_id, order_code, total_coins, status, shipping_address)
VALUES (
  $1,
  'FK-' || DATE_FORMAT(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('orders_seq')::TEXT, 5, '0'),
  $2,
  'pending',
  $3::jsonb
)
RETURNING id, order_code;

-- Get user's orders
SELECT 
  o.id,
  o.order_code,
  o.total_coins,
  o.status,
  o.tracking_number,
  o.created_at,
  o.delivered_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Get order details with items
SELECT 
  o.id,
  o.order_code,
  o.total_coins,
  o.status,
  o.created_at,
  o.shipped_at,
  o.delivered_at,
  oi.product_id,
  rp.name,
  rp.image_url,
  oi.quantity,
  oi.coin_price_at_purchase
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN reward_products rp ON oi.product_id = rp.id
WHERE o.id = $1;

-- Update order status
UPDATE orders
SET status = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Update order with tracking
UPDATE orders
SET status = 'shipped', tracking_number = $2, shipped_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Mark order as delivered
UPDATE orders
SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Get monthly order summary
SELECT 
  DATE_TRUNC('month', created_at)::DATE as month,
  COUNT(*) as order_count,
  SUM(total_coins) as total_coins_spent,
  COUNT(DISTINCT user_id) as unique_users
FROM orders
WHERE status IN ('delivered', 'shipped')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ============================================
-- ACHIEVEMENT QUERIES
-- ============================================

-- Get all achievements
SELECT id, code, name, description, icon_url, badge_color, unlock_criteria, reward_coins, display_order
FROM achievements
WHERE is_active = true
ORDER BY display_order ASC;

-- Get user's achievements
SELECT 
  a.id,
  a.code,
  a.name,
  a.icon_url,
  a.badge_color,
  a.reward_coins,
  ua.unlocked_at
FROM achievements a
JOIN user_achievements ua ON a.id = ua.achievement_id
WHERE ua.user_id = $1
ORDER BY ua.unlocked_at DESC;

-- Check if user unlocked achievement
SELECT id FROM achievements
WHERE code = $1 AND id IN (
  SELECT achievement_id FROM user_achievements WHERE user_id = $2
);

-- Award achievement to user
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT $1, id, CURRENT_TIMESTAMP
FROM achievements
WHERE code = $2
ON CONFLICT DO NOTHING;

-- Get available (unlocked) achievements
SELECT COUNT(*) FROM user_achievements WHERE user_id = $1;

-- ============================================
-- LEADERBOARD QUERIES
-- ============================================

-- Get top users (weekly leaderboard)
SELECT 
  rank,
  u.id,
  u.full_name,
  u.profile_picture_url,
  u.profile_picture_url,
  lc.total_steps
FROM leaderboard_cache lc
JOIN users u ON lc.user_id = u.id
WHERE lc.period = 'weekly' AND lc.rank <= 100
ORDER BY lc.rank ASC;

-- Get user's current rank
SELECT rank FROM leaderboard_cache
WHERE user_id = $1 AND period = 'weekly'
  AND week_starts_at = DATE_TRUNC('week', CURRENT_DATE)::DATE;

-- Get ranking around user (top and bottom)
WITH user_rank AS (
  SELECT rank FROM leaderboard_cache
  WHERE user_id = $1 AND period = 'weekly'
)
SELECT 
  u.id,
  u.full_name,
  u.profile_picture_url,
  lc.rank,
  lc.total_steps
FROM leaderboard_cache lc
JOIN users u ON lc.user_id = u.id
WHERE lc.period = 'weekly'
  AND lc.rank BETWEEN (SELECT rank - 5 FROM user_rank) AND (SELECT rank + 5 FROM user_rank)
ORDER BY lc.rank ASC;

-- ============================================
-- ADMIN LOGGING
-- ============================================

-- Log admin action
INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, changes, ip_address, user_agent)
VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7);

-- Get activity log for entity
SELECT 
  al.id,
  u.full_name as admin,
  al.action,
  al.changes,
  al.created_at
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
WHERE al.entity_type = $1 AND al.entity_id = $2
ORDER BY al.created_at DESC;

-- Get admin's actions
SELECT 
  action,
  entity_type,
  entity_id,
  created_at,
  changes
FROM admin_logs
WHERE admin_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================
-- ANALYTICS & REPORTING
-- ============================================

-- Daily active users
SELECT 
  DATE(created_at)::DATE as date,
  COUNT(DISTINCT user_id) as active_users
FROM step_records
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Total platform stats
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.last_login_at >= CURRENT_DATE - INTERVAL '1 day' THEN u.id END) as dau,
  COUNT(DISTINCT CASE WHEN u.last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN u.id END) as wau,
  SUM(sr.steps) as total_steps_today,
  SUM(w.available_coins) as total_coins_in_system,
  COUNT(DISTINCT o.id) as total_orders
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN step_records sr ON u.id = sr.user_id AND sr.recorded_date = CURRENT_DATE
LEFT JOIN orders o ON u.id = o.user_id;

-- Most popular products
SELECT 
  rp.id,
  rp.name,
  rp.coin_price,
  COUNT(oi.id) as order_count,
  SUM(oi.quantity) as total_quantity
FROM reward_products rp
LEFT JOIN order_items oi ON rp.id = oi.product_id
GROUP BY rp.id
ORDER BY order_count DESC
LIMIT 20;

-- User growth over time
SELECT 
  DATE_TRUNC('week', created_at)::DATE as week,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as cumulative_users
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week ASC;
