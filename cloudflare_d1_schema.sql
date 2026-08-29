-- ==============================================================================
-- CREATLIFAFA.COM - MASTER CLOUDFLARE D1 (SQLITE) DATABASE DEFINITION
-- Complete 20 Tables, 25 Indexes & Full Seed Dataset
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. PROFILES / USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    is_trusted INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin')),
    referral_code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- ------------------------------------------------------------------------------
-- 2. WALLETS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. BOT PLANS (8 EXACT PAID TIERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price REAL NOT NULL,
    price_display TEXT NOT NULL,
    number_badge TEXT NOT NULL,
    subtitle TEXT,
    features TEXT NOT NULL, -- JSON array
    is_highlighted INTEGER DEFAULT 0,
    is_custom INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    cta_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_plans_slug ON bot_plans(slug);
CREATE INDEX IF NOT EXISTS idx_bot_plans_order ON bot_plans(sort_order);

-- ------------------------------------------------------------------------------
-- 4. BOT PLAN FEATURES MATRIX
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_plan_features (
    id TEXT PRIMARY KEY,
    plan_slug TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (plan_slug, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_plan_features_lookup ON bot_plan_features(plan_slug, feature_key);

-- ------------------------------------------------------------------------------
-- 5. BOTS TABLE
-- ------------------------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_bots_tg_id ON bots(telegram_bot_id);

-- ------------------------------------------------------------------------------
-- 6. BOT SUBSCRIBERS / USERS
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_bot_users_bot ON bot_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_tg ON bot_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_active ON bot_users(bot_id, is_active);

-- ------------------------------------------------------------------------------
-- 7. BOT CHANNELS (CHANNEL LOCKS)
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_bot_channels_bot ON bot_channels(bot_id);

-- ------------------------------------------------------------------------------
-- 8. BOT SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_settings (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL UNIQUE,
    welcome_message TEXT,
    welcome_enabled INTEGER DEFAULT 1,
    channel_lock_enabled INTEGER DEFAULT 0,
    channel_lock_message TEXT,
    custom_menu TEXT DEFAULT '[]', -- JSON string
    referral_enabled INTEGER DEFAULT 1,
    referral_bonus REAL DEFAULT 5.00,
    min_withdrawal REAL DEFAULT 100.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 9. BOT BROADCASTS QUEUE
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_broadcasts_bot ON bot_broadcasts(bot_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON bot_broadcasts(status);

-- ------------------------------------------------------------------------------
-- 10. BOT BROADCAST RECIPIENTS (RATE-LIMITED DISPATCH QUEUE)
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_worker ON bot_broadcast_recipients(broadcast_id, status);

-- ------------------------------------------------------------------------------
-- 11. BOT AUTOMATION RULES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_automation_rules (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('start_command', 'custom_command', 'new_subscriber', 'channel_verified')),
    trigger_value TEXT,
    action_type TEXT NOT NULL CHECK(action_type IN ('send_message', 'show_menu', 'record_event')),
    action_payload TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    total_executions INTEGER DEFAULT 0,
    success_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    last_executed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_bot ON bot_automation_rules(bot_id);

-- ------------------------------------------------------------------------------
-- 12. BOT REFERRALS
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_bot_referrals_bot ON bot_referrals(bot_id);

-- ------------------------------------------------------------------------------
-- 13. BOT ACTIVITY LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bot_activity_logs (
    id TEXT PRIMARY KEY,
    bot_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_bot ON bot_activity_logs(bot_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 14. BOT ORDERS (PURCHASE TRANSACTIONS)
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_bot_orders_user ON bot_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_orders_status ON bot_orders(status);

-- ------------------------------------------------------------------------------
-- 15. TRANSACTIONS LEDGER (DOUBLE-ENTRY WALLET AUDIT)
-- ------------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 16. WITHDRAWAL REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payout_details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reference_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- ------------------------------------------------------------------------------
-- 17. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'bot', 'wallet', 'reward', 'system')),
    is_read INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 18. PLATFORM REFERRALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_user_id TEXT,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'Completed' CHECK(status IN ('Completed', 'Pending')),
    reward_amount REAL DEFAULT 25.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- ------------------------------------------------------------------------------
-- 19. GAMES MASTER TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT,
    max_reward TEXT NOT NULL,
    player_count TEXT NOT NULL,
    badge TEXT,
    image TEXT NOT NULL,
    route TEXT NOT NULL,
    is_live INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 1
);

-- ------------------------------------------------------------------------------
-- 20. LUDO GAME TIERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ludo_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    entry_fee REAL NOT NULL,
    win_reward REAL NOT NULL,
    active_players INTEGER DEFAULT 120,
    sort_order INTEGER DEFAULT 1
);

-- ==============================================================================
-- SEED DATA: EXACT 8 PAID BOT PLANS (STRICTLY ZERO FREE BOTS)
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

-- ==============================================================================
-- SEED DATA: BOT PLAN FEATURES MATRIX
-- ==============================================================================
INSERT OR REPLACE INTO bot_plan_features (id, plan_slug, feature_key, feature_name, is_enabled) VALUES
('b_ov', 'basic', 'bot_overview', 'Bot Overview & Status', 1),
('b_cmd', 'basic', 'basic_commands', 'Basic Telegram Commands', 1),
('b_an', 'basic', 'basic_analytics', '7-Day Basic Analytics', 1),
('b_dc', 'basic', 'developer_contact', 'Developer Mini App Contact', 1),

('s_all', 'starter', 'all_basic', 'All Basic Features', 1),
('s_ul', 'starter', 'user_list', 'Subscriber List & Search', 1),
('s_ea', 'starter', 'enhanced_analytics', 'Enhanced Analytics Breakdown', 1),
('s_ws', 'starter', 'welcome_settings', 'Custom Welcome Messages', 1),
('s_cm', 'starter', 'channels_management', 'Channel Subscription Lock', 1),

('g_all', 'growth', 'all_starter', 'All Starter Features', 1),
('g_aa', 'growth', 'advanced_analytics', 'Subscriber Growth Trajectory (30D/90D/1Y)', 1),
('g_us', 'growth', 'user_search', 'Advanced Subscriber Search & Filters', 1),
('g_rs', 'growth', 'referral_settings', 'Bot Referral System', 1),
('g_ar', 'growth', 'automation_rules', 'Automated Rules Engine', 1),
('g_al', 'growth', 'activity_logs', 'Activity Audit Trail', 1),

('p_all', 'pro', 'all_growth', 'All Growth Features', 1),
('p_cbm', 'pro', 'custom_bot_menu', 'Custom Bot Menu Builder (HTTPS)', 1),
('p_bui', 'pro', 'broadcast_ui', 'Broadcast Messaging Engine', 1),
('p_ps', 'pro', 'priority_support', 'Priority Worker Dispatch', 1),

('pr_all', 'premium', 'all_pro', 'All Pro Features', 1),
('pr_pt', 'premium', 'premium_tools', 'Premium Broadcast Controls', 1),
('pr_pa', 'premium', 'premium_analytics', 'Advanced Retention Telemetry', 1),

('bz_all', 'business', 'all_premium', 'All Premium Features', 1),
('bz_br', 'business', 'business_reports', 'Business Reports & Higher Rate Limits', 1),

('u_all', 'ultimate', 'all_business', 'All Business Features', 1),
('u_fbm', 'ultimate', 'full_bot_management', 'Full Management & Automation Suite', 1),

('c_all', 'custom', 'all_ultimate', 'All Ultimate Features', 1),
('c_cd', 'custom', 'custom_development', 'Bespoke Mini App UI & Custom Backend', 1);

-- ==============================================================================
-- SEED DATA: GAMES & LUDO TIERS
-- ==============================================================================
INSERT OR REPLACE INTO games (id, name, tagline, description, max_reward, player_count, badge, image, route, is_live, sort_order) VALUES
('game_ludo', 'Ludo Classic', 'Roll dice & win rewards instantly', 'Play 1v1 quick matches and earn real cash balance in wallet.', '₹1,000', '1,420 playing', 'POPULAR', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80', '/games/ludo', 1, 1),
('game_lifafa', 'Lifafa Lucky Drop', 'Claim instant coin giveaways', 'Hourly drops with instant coin credits directly to wallet.', '₹500', '890 playing', 'HOT', 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=600&auto=format&fit=crop&q=80', '/games', 1, 2),
('game_spin', 'Lucky Spin Wheel', 'Spin to win daily multipliers', 'Daily free spin and high stake multiplier rounds.', '₹2,500', '2,100 playing', 'DAILY', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80', '/games', 1, 3);

INSERT OR REPLACE INTO ludo_tiers (id, name, entry_fee, win_reward, active_players, sort_order) VALUES
('tier_10', 'Beginner Pool', 10.00, 18.00, 480, 1),
('tier_50', 'Challenger Pool', 50.00, 90.00, 310, 2),
('tier_100', 'Master Pool', 100.00, 185.00, 190, 3),
('tier_500', 'Grandmaster Pool', 500.00, 925.00, 85, 4);
