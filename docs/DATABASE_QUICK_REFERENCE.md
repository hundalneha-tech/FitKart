# FitKart Database Schema - Quick Reference

## 📊 Database Overview

**17 Core Tables + 3 Views**

### User Management (2 tables)
| Table | Rows (Est.) | Purpose |
|-------|-----------|---------|
| `users` | 100K | User profiles & authentication |
| `refresh_tokens` | 500K | JWT session management |

### Financial/Rewards (4 tables)
| Table | Rows (Est.) | Purpose |
|-------|-----------|---------|
| `wallets` | 100K | User coin balances (denormalized) |
| `coin_transactions` | 5M | Complete audit trail of all coin movements |
| `orders` | 50K | User redemption orders |
| `order_items` | 100K | Items within orders |

### Step Tracking (3 tables)
| Table | Rows (Est.) | Purpose |
|-------|-----------|---------|
| `step_records` | 50M | Daily step data (time-series) |
| `step_validations` | 5M | Anti-cheat anomaly detection |
| `leaderboard_cache` | 500K | Pre-computed rankings |

### Gamification (3 tables)
| Table | Rows (Est.) | Purpose |
|-------|-----------|---------|
| `achievements` | 20 | Badge/achievement definitions |
| `user_achievements` | 500K | User achievement progress |
| `reward_products` | 500 | Shopify synced products |

### Admin & Configuration (2 tables)
| Table | Rows (Est.) | Purpose |
|-------|-----------|---------|
| `admin_logs` | 1M | Comprehensive audit trail |
| `settings` | 50 | Global platform configuration |

---

## 🔑 Primary Keys & Relationships

### User-Centric (all related to users table)
```
users (1)
├─ (1→M) refresh_tokens
├─ (1→M) step_records
├─ (1→M) coin_transactions
├─ (1→M) orders
├─ (1→M) user_achievements
└─ (1→1) wallets
```

### Order-Centric
```
orders (1)
└─ (1→M) order_items
    └─ (M) reward_products
```

### Achievement-Centric
```
achievements (1)
└─ (1→M) user_achievements
    └─ (M) users
```

---

## 💰 Coin Economy Flow

```
Step Recorded → is_verified?
    ├─ YES → Award Coins → Update Wallet → Log Transaction
    └─ NO → Flag for Admin Review

User Spends Coins:
    1. Check available balance
    2. Freeze coins during checkout
    3. Create order
    4. Update wallet (available - frozen)
    5. Log transaction
    6. Upon shipment, actually reduce coins
```

### Wallet Denormalization
- **Why**: Coin balance checked on every purchase, high read frequency
- **Source of Truth**: `coin_transactions` table
- **Sync**: Updated via trigger or job after each transaction
- **Fallback**: Can rebuild from transactions if needed

---

## 🚨 Anti-Cheat System

**Three-Layer Protection:**

1. **Sanity Checks** (Immediate)
   - Steps vs distance ratio
   - Impossible speeds (human max ~8-12 km/h walking)
   - Time gaps (gap > 1 hour = separate records)

2. **Anomaly Detection** (Real-time)
   - Compare daily steps vs user average
   - Compare source data with expected pattern
   - Anomaly score (0-100)
   - Threshold for flag (~75 suspicious)

3. **Admin Review** (Queue)
   - Suspicious records marked for admin
   - Can approve/reject manually
   - Appeals process available

```sql
-- View suspicious records
SELECT * FROM step_validations 
WHERE is_suspicious = true AND status = 'pending' 
ORDER BY anomaly_score DESC;
```

---

## 📈 Analytics Data

### Leaderboard Tiers
- **Weekly**: Top 100 users by steps (refreshed daily ~2 AM UTC)
- **Monthly**: Top 100 users by steps (refreshed daily ~2 AM UTC)
- **All-Time**: Top 1000 users by steps (refreshed weekly)

### Cache Strategy
- Pre-computed rankings for performance
- Prevents expensive real-time calculations
- Can be invalidated if needed

---

## 🔐 Security & Privacy

| Feature | Implementation |
|---------|-----------------|
| **Passwords** | bcrypt hashing (never stored plain) |
| **Tokens** | JWT with refresh token rotation |
| **Audit Logs** | Every admin action logged with IP/user-agent |
| **Soft Deletes** | `deleted_at` field for compliance |
| **Coins** | Immutable transaction trail |
| **PII** | Encrypted phone numbers (in real impl) |

---

## 📊 Indexing Strategy

### Composite Indexes (Multi-column)
```sql
-- Frequent queries
step_records(user_id, recorded_date)  -- Weekly history
coin_transactions(user_id, created_at) -- Recent transactions
leaderboard_cache(period, rank)        -- Rankings
```

### Partial Indexes
```sql
-- Only index active users
users(email) WHERE is_active = true
-- Only pending validations
step_validations(status) WHERE status = 'pending'
```

### BRIN Indexes (Time-Series)
```sql
-- For large time-series tables
step_records(created_at) USING BRIN
coin_transactions(created_at) USING BRIN
```

---

## 🔄 Data Synchronization

### Shopify → FitKart (Nightly)
```
Shopify API
├─ Get all products
├─ Get inventory levels
└─ Sync to reward_products table
```

### Google Fit/Health Kit → FitKart (Real-time)
```
Mobile App
├─ Authenticate with device
├─ Query daily steps
├─ Send to backend /steps/record
└─ Backend processes & validates
```

### Analytics → Reports (Daily)
```
Scheduled Job (2 AM UTC)
├─ Calculate leaderboard_cache
├─ Compute daily_step_summary view
└─ Generate admin reports
```

---

## 🎯 Key Metrics

### User Engagement
```sql
-- DAU (Daily Active Users)
SELECT COUNT(DISTINCT user_id) FROM step_records 
WHERE recorded_date = CURRENT_DATE;

-- Average steps per user
SELECT AVG(steps) FROM step_records 
WHERE recorded_date >= CURRENT_DATE - INTERVAL '7 days';
```

### Revenue Metrics
```sql
-- Total coins spent
SELECT SUM(total_coins) FROM orders 
WHERE status IN ('delivered', 'shipped');

-- Most popular products
SELECT product_id, COUNT(*) as purchases 
FROM order_items 
GROUP BY product_id 
ORDER BY purchases DESC 
LIMIT 10;
```

### Fraud Metrics
```sql
-- Suspicious activity rate
SELECT COUNT(*) as flagged, COUNT(*) * 100.0 / 
  (SELECT COUNT(*) FROM step_records) as percentage
FROM step_validations 
WHERE is_suspicious = true;
```

---

## ⚡ Performance Targets

| Operation | Target | Optimization |
|-----------|--------|--------------|
| Record steps | < 50ms | Batch insert, async |
| Coin transaction | < 100ms | Connection pooling |
| Get user balance | < 10ms | Wallet table (denorm) |
| Leaderboard query | < 200ms | Cache nightly |
| Login | < 150ms | Index on email |

---

## 🔧 Migration & Deployment

### Initial Setup
```bash
# Run schema migration
npm run migrate

# Seed initial data
npm run seed

# Verify tables
psql -c "\dt" fitkart
```

### Adding New Features
```bash
# Create migration file
npm run migrate:create AddNewTable

# Write SQL changes
# Deploy to prod after testing
npm run migrate:run
```

### Backup & Recovery
```bash
# Daily backup
pg_dump fitkart > backup_$(date +%Y%m%d).sql

# Restore from backup
psql fitkart < backup_20240217.sql
```

---

## 📝 Example Queries

### Get User's Current Stats
```sql
SELECT 
  u.full_name,
  u.total_steps,
  w.available_coins,
  COUNT(DISTINCT sa.id) as achievements_count,
  COUNT(DISTINCT o.id) as orders_count
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN user_achievements sa ON u.id = sa.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id = ?
GROUP BY u.id;
```

### Last 7 Days Activity
```sql
SELECT 
  sr.recorded_date,
  sr.steps,
  sr.source,
  ct.amount as coins_earned
FROM step_records sr
LEFT JOIN coin_transactions ct ON sr.id = ct.reference_id AND ct.reference_type = 'step_record'
WHERE sr.user_id = ? AND sr.recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY sr.recorded_date DESC;
```

### Top 10 Leaderboard
```sql
SELECT 
  rank,
  u.full_name,
  u.profile_picture_url,
  lc.total_steps
FROM leaderboard_cache lc
JOIN users u ON lc.user_id = u.id
WHERE lc.period = 'weekly' AND rank <= 10
ORDER BY lc.rank;
```

---

## ✅ Database Checklist

- [ ] PostgreSQL 12+ installed
- [ ] Create database and user (with permissions)
- [ ] Run migrations (001_initial_schema.sql)
- [ ] Seed initial data (001_initial_seed.sql)
- [ ] Create indexes (done in migration)
- [ ] Set up daily backup schedule
- [ ] Configure replication for HA
- [ ] Enable SSL for connections
- [ ] Set up monitoring alerts
- [ ] Document disaster recovery procedure
