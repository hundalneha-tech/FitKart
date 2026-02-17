# Database Schema Diagram

## Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐         ┌───────────────┐                   │
│  │    users     │◄────────┤ refresh_tokens│                   │
│  ├──────────────┤         └───────────────┘                   │
│  │ id (PK)      │                                             │
│  │ email        │         ┌──────────────┐                   │
│  │ password     │◄────────┤   wallets    │                   │
│  │ full_name    │         └──────────────┘                   │
│  │ phone        │                                             │
│  │ auth_method  │         ┌────────────────────┐             │
│  │ is_active    │◄────────┤ step_records       │             │
│  │ ...          │         ├────────────────────┤             │
│  └──────────────┘         │ user_id (FK)       │             │
│       ▲                    │ steps              │             │
│       │                    │ recorded_date      │             │
│       │                    │ source             │             │
│       │                    └────────────────────┘             │
│       │                             ▲                         │
│       │                             │                         │
│       │                    ┌────────────────────┐             │
│       └────────────────────┤ step_validations   │             │
│                            └────────────────────┘             │
│  ┌──────────────────────────────────────┐                    │
│  │       coin_transactions              │                    │
│  ├──────────────────────────────────────┤                    │
│  │ user_id (FK)                         │                    │
│  │ amount                               │                    │
│  │ transaction_type                     │                    │
│  │ reference_id                         │                    │
│  └──────────────────────────────────────┘                    │
│                                                               │
│  ┌──────────────────────┐   ┌──────────────────────┐        │
│  │     orders           │   │  reward_products     │        │
│  ├──────────────────────┤   ├──────────────────────┤        │
│  │ user_id (FK)         │   │ id (PK)              │        │
│  │ order_code           │   │ shopify_product_id   │        │
│  │ total_coins          │   │ coin_price           │        │
│  │ status               │   │ stock_quantity       │        │
│  │ shipping_address     │   │ category             │        │
│  └──────────────────────┘   └──────────────────────┘        │
│           │                           ▲                      │
│           │                           │                      │
│           │         ┌────────────────────────┐              │
│           └─────────┤    order_items         │              │
│                     ├────────────────────────┤              │
│                     │ order_id (FK)          │              │
│                     │ product_id (FK)        │              │
│                     │ quantity               │              │
│                     │ coin_price_at_purchase │              │
│                     └────────────────────────┘              │
│                                                               │
│  ┌──────────────────────┐   ┌──────────────────────┐        │
│  │   achievements       │   │ user_achievements    │        │
│  ├──────────────────────┤   ├──────────────────────┤        │
│  │ id (PK)              │   │ user_id (FK)         │        │
│  │ code                 │   │ achievement_id (FK)  │        │
│  │ name                 │   │ unlocked_at          │        │
│  │ unlock_criteria      │   └──────────────────────┘        │
│  │ reward_coins         │                                   │
│  └──────────────────────┘                                   │
│                                                               │
│  ┌──────────────────────┐   ┌──────────────────────┐        │
│  │ leaderboard_cache    │   │   admin_logs         │        │
│  ├──────────────────────┤   ├──────────────────────┤        │
│  │ user_id (FK)         │   │ admin_id (FK)        │        │
│  │ rank                 │   │ action               │        │
│  │ total_steps          │   │ entity_type          │        │
│  │ period               │   │ changes (JSONB)      │        │
│  │ week_starts_at       │   └──────────────────────┘        │
│  └──────────────────────┘                                   │
│                                                               │
│  ┌──────────────────────┐                                   │
│  │   settings           │                                   │
│  ├──────────────────────┤                                   │
│  │ key                  │                                   │
│  │ value                │                                   │
│  │ description          │                                   │
│  └──────────────────────┘                                   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
STEP TRACKING FLOW:
┌──────────────────────────────────────────────────────────────┐
│ Mobile App (Google Fit / Health Kit)                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Backend API /steps    │
            └────────────┬───────────┘
                         │
         ┌───────────────┼──────────────┐
         │               │              │
         ▼               ▼              ▼
    ┌────────┐    ┌──────┐    ┌─────────────┐
    │  Save  │    │Check │    │ Anti-Cheat  │
    │ Record │    │Auth  │    │ Validation  │
    └────────┘    └──────┘    └─────────────┘
         │               │             │
         └───────────────┼─────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  step_validations      │
            │  (flag if suspicious)  │
            └────────────┬───────────┘
                         │
         ┌───────────────┴────────────┐
         │                            │
         ▼ (if approved)              ▼ (if need review)
    ┌──────────────┐            ┌──────────────┐
    │ Auto approve │            │ Admin Queue  │
    └────────┬─────┘            └──────────────┘
             │
             ▼
    ┌─────────────────┐
    │ Award coins     │
    │ Update wallet   │
    │ Log transaction │
    └─────────────────┘
```

## Table Statistics

| Table | Purpose | Primary Key | Index Count | Growth |
|-------|---------|------------|-------------|--------|
| users | User accounts | id | 4 | Slow |
| step_records | Time-series data | id | 3 | Fast |
| coin_transactions | Audit trail | id | 4 | Medium |
| orders | Redemptions | id | 3 | Slow |
| reward_products | Product catalog | id | 4 | Medium |
| achievements | Badge definitions | id | 3 | Slow |
| admin_logs | Audit logs | id | 4 | Medium |

## Query Patterns

### Frequently Queried
```sql
-- User daily steps
SELECT * FROM step_records 
WHERE user_id = ? AND recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY recorded_date DESC;

-- Leaderboard (top 100)
SELECT * FROM leaderboard_cache 
WHERE period = 'weekly' 
ORDER BY rank LIMIT 100;

-- Available coins for user
SELECT available_coins FROM wallets WHERE user_id = ?;

-- Cost of product
SELECT coin_price FROM reward_products WHERE id = ?;
```

### Batch Operations
```sql
-- Award coins to multiple users
UPDATE wallets SET available_coins = available_coins + ? 
WHERE user_id = ANY(?);

-- Bulk step sync
INSERT INTO step_records (user_id, steps, recorded_date, source) 
VALUES (?, ?, ?, ?) ON CONFLICT DO UPDATE SET ...;

-- Check for achievements
SELECT achievement_id FROM achievements 
WHERE unlock_criteria ->> 'min_steps'::int <= ?;
```

## Backup Schedule

- **Hourly**: Incremental backups
- **Daily**: Full backup at 2 AM UTC
- **Weekly**: Archive to cold storage
- **Monthly**: Cross-region copy
- **Retention**: 30 days for incremental, 1 year for monthly

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Step record insert | <50ms | Batch supported |
| Coin transaction | <100ms | Includes wallet update |
| Leaderboard query | <200ms | Cached nightly |
| User profile fetch | <50ms | Join with wallet |
| Order creation | <200ms | Includes validation |
