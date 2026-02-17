-- Seed data for FitKart

-- Create admin user (password: admin123 - hash this in production)
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    phone, 
    country_code,
    auth_provider,
    email_verified,
    is_active
) VALUES (
    'admin@fitkart.com',
    '$2a$10$placeholder_hash_here',
    'Admin User',
    '+1234567890',
    '+1',
    'email',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Get admin user ID
INSERT INTO wallets (user_id, available_coins, total_earned)
SELECT id, 1000000, 1000000 FROM users WHERE email = 'admin@fitkart.com'
ON CONFLICT (user_id) DO NOTHING;

-- Create sample achievement definitions
INSERT INTO achievements (code, name, description, icon_url, badge_color, unlock_criteria, reward_coins, display_order, is_active) VALUES
    ('steps_1k', 'First Steps', 'Walk 1,000 steps', 'https://cdn.fitkart.com/badges/first-steps.png', '#FFB347', '{"min_steps": 1000}', 10, 1, true),
    ('steps_5k', 'Getting Going', 'Walk 5,000 steps', 'https://cdn.fitkart.com/badges/getting-going.png', '#87CEEB', '{"min_steps": 5000}', 25, 2, true),
    ('steps_10k', 'Daily Goal', 'Walk 10,000 steps', 'https://cdn.fitkart.com/badges/daily-goal.png', '#90EE90', '{"min_steps": 10000}', 50, 3, true),
    ('steps_50k', 'Week Warrior', 'Walk 50,000 steps in a week', 'https://cdn.fitkart.com/badges/week-warrior.png', '#DDA0DD', '{"min_steps": 50000}', 250, 4, true),
    ('steps_100k', 'Month Master', 'Walk 100,000 steps in a month', 'https://cdn.fitkart.com/badges/month-master.png', '#FFD700', '{"min_steps": 100000}', 500, 5, true),
    ('streak_7', '7-Day Streak', 'Walk 7 days in a row', 'https://cdn.fitkart.com/badges/7day-streak.png', '#FF6347', '{"min_consecutive_days": 7}', 100, 6, true),
    ('early_bird', 'Early Bird', 'Walk before 8 AM', 'https://cdn.fitkart.com/badges/early-bird.png', '#20B2AA', '{"walk_before_hour": 8}', 15, 7, true)
ON CONFLICT (code) DO NOTHING;

-- Sample reward products (would be synced from Shopify)
INSERT INTO reward_products (
    shopify_product_id,
    name,
    description,
    coin_price,
    retail_price,
    image_url,
    stock_quantity,
    category,
    is_active
) VALUES
    ('prod_001', 'Fitness Tracker Band', 'Premium activity tracking band', 5000, 49.99, 'https://cdn.fitkart.com/products/tracker-band.jpg', 50, 'wearables', true),
    ('prod_002', 'Bluetooth Earbuds', 'True wireless earbuds with heart rate', 8000, 79.99, 'https://cdn.fitkart.com/products/earbuds.jpg', 30, 'accessories', true),
    ('prod_003', 'Water Bottle 1L', 'Insulated water bottle with time marks', 1000, 9.99, 'https://cdn.fitkart.com/products/water-bottle.jpg', 200, 'bottles', true),
    ('prod_004', 'Running Shoes', 'Professional running shoes', 10000, 99.99, 'https://cdn.fitkart.com/products/running-shoes.jpg', 20, 'footwear', true),
    ('prod_005', 'Yoga Mat', 'Premium non-slip yoga mat', 2000, 19.99, 'https://cdn.fitkart.com/products/yoga-mat.jpg', 100, 'equipment', true),
    ('prod_006', '$10 Gift Card', 'Digital gift card', 1000, 10.00, 'https://cdn.fitkart.com/products/gift-card.jpg', 500, 'gift-cards', true),
    ('prod_007', '$50 Gift Card', 'Digital gift card', 5000, 50.00, 'https://cdn.fitkart.com/products/gift-card.jpg', 200, 'gift-cards', true),
    ('prod_008', 'Sports Socks Pack', 'Pack of 5 premium sports socks', 1500, 14.99, 'https://cdn.fitkart.com/products/socks.jpg', 150, 'apparel', true)
ON CONFLICT (shopify_product_id) DO NOTHING;
