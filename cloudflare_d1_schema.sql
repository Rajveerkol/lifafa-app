-- ==============================================================================
-- CREATLIFAFA.COM - CLOUDFLARE D1 DATABASE SCHEMA (SQLITE COMPATIBLE)
-- Database Name: lifafa
-- ==============================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    is_trusted INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin')),
    referral_code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    balance REAL DEFAULT 0.00,
    total_withdrawn REAL DEFAULT 0.00,
    total_deposited REAL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- 3. BOT PLANS TABLE (8 EXACT PAID PLANS)
CREATE TABLE IF NOT EXISTS bot_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price REAL NOT NULL,
    price_display TEXT NOT NULL,
    number_badge TEXT NOT NULL,
    subtitle TEXT,
    features TEXT NOT NULL, -- JSON formatted array
    is_highlighted INTEGER DEFAULT 0,
    is_custom INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    cta_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOTS TABLE
CREATE TABLE IF NOT EXISTS bots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bot_plan_id TEXT,
    bot_order_id TEXT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    telegram_bot_id TEXT UNIQUE,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Pending')),
    plan_slug TEXT DEFAULT 'basic',
    encrypted_token TEXT,
    webhook_url TEXT,
    is_connected INTEGER DEFAULT 1,
    avatar_url TEXT,
    qr_code_url TEXT,
    channels_count INTEGER DEFAULT 0,
    bonus_amount REAL DEFAULT 10.00,
    refer_reward REAL DEFAULT 5.00,
    total_users INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    last_synced_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (bot_plan_id) REFERENCES bot_plans(id)
);

CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_username ON bots(username);

-- 5. BOT USERS / SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS bot_users (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    telegram_user_id INTEGER NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_active INTEGER DEFAULT 1,
    first_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
    UNIQUE (bot_id, telegram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_users_bot_id ON bot_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_tg_id ON bot_users(telegram_user_id);

-- 6. BOT CHANNELS TABLE (CHANNEL SUBSCRIPTION LOCK)
CREATE TABLE IF NOT EXISTS bot_channels (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    channel_username TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bot_channels_bot_id ON bot_channels(bot_id);

-- 7. BOT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS bot_settings (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL UNIQUE,
    welcome_message TEXT,
    welcome_enabled INTEGER DEFAULT 1,
    channel_lock_enabled INTEGER DEFAULT 0,
    channel_lock_message TEXT,
    custom_menu TEXT DEFAULT '[]', -- JSON array of menu buttons
    referral_enabled INTEGER DEFAULT 1,
    referral_bonus REAL DEFAULT 5.00,
    min_withdrawal REAL DEFAULT 100.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

-- 8. BOT BROADCASTS QUEUE TABLE
CREATE TABLE IF NOT EXISTS bot_broadcasts (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    button_text TEXT,
    button_url TEXT,
    target_audience TEXT DEFAULT 'all' CHECK(target_audience IN ('all', 'active', 'new', 'inactive')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_bot_id ON bot_broadcasts(bot_id);

-- 9. BOT BROADCAST RECIPIENTS QUEUE
CREATE TABLE IF NOT EXISTS bot_broadcast_recipients (
    id TEXT PRIMARY KEY,
    broadcast_id TEXT NOT NULL,
    bot_user_id TEXT NOT NULL,
    telegram_user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broadcast_id) REFERENCES bot_broadcasts(id) ON DELETE CASCADE,
    UNIQUE (broadcast_id, bot_user_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON bot_broadcast_recipients(broadcast_id, status);

-- 10. BOT AUTOMATION RULES TABLE
CREATE TABLE IF NOT EXISTS bot_automation_rules (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('start_command', 'custom_command', 'new_subscriber', 'channel_verified')),
    trigger_value TEXT,
    action_type TEXT NOT NULL CHECK(action_type IN ('send_message', 'show_menu', 'record_event')),
    action_payload TEXT NOT NULL, -- JSON payload
    is_active INTEGER DEFAULT 1,
    total_executions INTEGER DEFAULT 0,
    success_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    last_executed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

-- 11. BOT REFERRALS TABLE
CREATE TABLE IF NOT EXISTS bot_referrals (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    referrer_user_id INTEGER NOT NULL,
    referred_user_id INTEGER NOT NULL,
    referral_code TEXT,
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending')),
    points_awarded REAL DEFAULT 0.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
    UNIQUE (bot_id, referred_user_id)
);

-- 12. BOT ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS bot_activity_logs (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

-- 13. BOT ORDERS TABLE
CREATE TABLE IF NOT EXISTS bot_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bot_plan_id TEXT NOT NULL,
    bot_id TEXT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed', 'cancelled', 'completed')),
    payment_reference TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (bot_plan_id) REFERENCES bot_plans(id)
);

-- 14. TRANSACTIONS LEDGER TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'bot_purchase', 'game_entry', 'game_reward', 'referral_reward')),
    title TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    is_credit INTEGER DEFAULT 1,
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed')),
    reference_id TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- 15. WITHDRAWAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payout_details TEXT NOT NULL, -- JSON string
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reference_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 17. SEED EXACT 8 PAID BOT PLANS
-- ==============================================================================
INSERT OR REPLACE INTO bot_plans (id, name, slug, price, price_display, number_badge, subtitle, features, is_highlighted, is_custom, is_active, cta_text, sort_order) VALUES
('plan_basic', 'Basic Bot', 'basic', 99.00, '₹99', '01', 'Quick Start', '["Basic Bot Commands", "Subscriber Overview", "Standard Performance", "Developer Contact"]', 0, 0, 1, 'Buy Now', 1),
('plan_starter', 'Starter Bot', 'starter', 399.00, '₹399', '02', 'Best for Small Channels', '["All Basic Features", "Welcome Messages", "Channel Lock (1 Channel)", "Enhanced Analytics"]', 0, 0, 1, 'Get Started', 2),
('plan_growth', 'Growth Bot', 'growth', 699.00, '₹699', '03', 'Audience Building', '["All Starter Features", "Referral System", "Growth Trajectory Charts", "Automation Rules (3 Rules)"]', 0, 0, 1, 'Scale Up', 3),
('plan_pro', 'Pro Bot', 'pro', 999.00, '₹999', '04', 'Professional Creators', '["All Growth Features", "Broadcast Messaging Engine", "Custom Reply Menu", "Priority Delivery"]', 0, 0, 1, 'Go Pro', 4),
('plan_premium', 'Premium Bot', 'premium', 1599.00, '₹1,599', '05', 'High Traffic Creators', '["All Pro Features", "Unlimited Broadcasts", "Multi-Channel Locks", "Advanced Retention Insights"]', 0, 0, 1, 'Unlock Premium', 5),
('plan_business', 'Business Bot', 'business', 1999.00, '₹1,999', '06', 'Commercial & Businesses', '["All Premium Features", "Business Reports", "High Rate Limits", "VIP Support"]', 0, 0, 1, 'Upgrade Business', 6),
('plan_ultimate', 'Ultimate Bot', 'ultimate', 2999.00, '₹2,999', '07', 'Most Popular Package', '["Full Management Suite", "Unlimited Automation", "Unlimited Broadcasts", "Fastest Delivery Speed"]', 1, 0, 1, 'Get Ultimate', 7),
('plan_custom', 'Custom Bot', 'custom', 4999.00, 'Starting ₹4,999+', '08', 'Bespoke Development', '["Custom Mini App Development", "Dedicated Engineer", "Custom Integrations", "Direct Support"]', 0, 1, 1, 'Contact Developer', 8);
