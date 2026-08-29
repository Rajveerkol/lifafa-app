-- ==============================================================================
-- CREATLIFAFA.COM - PHASE 2: SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile_number TEXT,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    is_trusted BOOLEAN DEFAULT true,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. WALLETS TABLE (Default Balance: 0.00)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawn >= 0),
    total_deposited NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_deposited >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. BOT PLANS TABLE (8 Paid Plans - NO Free Bot)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bot_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 99),
    price_display TEXT NOT NULL,
    number_badge TEXT NOT NULL,
    subtitle TEXT,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_highlighted BOOLEAN NOT NULL DEFAULT false,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    cta_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. BOTS TABLE (User Telegram Bots Foundation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bot_plan_id UUID REFERENCES public.bot_plans(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    telegram_bot_id TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    qr_code_url TEXT,
    channels_count INTEGER DEFAULT 0,
    bonus_amount NUMERIC(12,2) DEFAULT 10.00,
    refer_reward NUMERIC(12,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. BOT ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bot_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bot_plan_id UUID NOT NULL REFERENCES public.bot_plans(id) ON DELETE RESTRICT,
    bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'completed')),
    payment_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bot_purchase', 'game_entry', 'game_reward', 'referral_reward')),
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    is_credit BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    reference_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('info', 'success', 'warning', 'error', 'bot', 'wallet', 'reward', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. REFERRALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Completed', 'Pending')),
    reward_amount NUMERIC(12,2) NOT NULL DEFAULT 25.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- DATABASE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bot_plans_sort_order ON public.bot_plans(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_bot_plans_slug ON public.bot_plans(slug);

CREATE INDEX IF NOT EXISTS idx_bots_user_id ON public.bots(user_id);

CREATE INDEX IF NOT EXISTS idx_bot_orders_user_id ON public.bot_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_orders_created_at ON public.bot_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Wallets RLS (Read-only for clients, updates through secure backend in Phase 3)
CREATE POLICY "Users can view their own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Bot Plans RLS (Public read for active plans)
CREATE POLICY "Anyone can view active bot plans"
    ON public.bot_plans FOR SELECT
    USING (is_active = true);

-- 4. Bots RLS
CREATE POLICY "Users can view their own bots"
    ON public.bots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bots"
    ON public.bots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots"
    ON public.bots FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots"
    ON public.bots FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Bot Orders RLS
CREATE POLICY "Users can view their own bot orders"
    ON public.bot_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot orders"
    ON public.bot_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Transactions RLS (Read-only for clients)
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- 7. Notifications RLS
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications read status"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Referrals RLS
CREATE POLICY "Users can view their own referral statistics"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_id);

-- ==============================================================================
-- DATABASE TRIGGER: AUTOMATIC PROFILE & WALLET CREATION ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_username TEXT;
    new_ref_code TEXT;
    raw_full_name TEXT;
    raw_mobile TEXT;
BEGIN
    -- Extract full name from metadata or default
    raw_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Creatlifafa User');
    raw_mobile := NEW.raw_user_meta_data->>'mobile_number';

    -- Generate unique username
    new_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    );

    -- Generate unique referral code (e.g. CL8921)
    new_ref_code := 'CL' || upper(substr(md5(NEW.id::text || clock_timestamp()::text), 1, 6));

    -- Insert profile record
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        mobile_number,
        username,
        referral_code,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        raw_full_name,
        NEW.email,
        raw_mobile,
        new_username,
        new_ref_code,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    -- Insert wallet with 0.00 initial balance
    INSERT INTO public.wallets (
        user_id,
        balance,
        total_withdrawn,
        total_deposited,
        currency,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        0.00,
        0.00,
        0.00,
        'INR',
        now(),
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Send initial welcome notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
    ) VALUES (
        NEW.id,
        'Welcome to Creatlifafa.com! 🎉',
        'Your account is ready. Create Telegram bots, play Ludo tournaments, and earn referral rewards!',
        'system',
        false,
        now()
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure if notification or metadata formatting fails
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA: 8 PAID BOT PLANS (NO FREE PLAN)
-- ==============================================================================
INSERT INTO public.bot_plans (
    id,
    name,
    slug,
    price,
    price_display,
    number_badge,
    subtitle,
    features,
    is_highlighted,
    is_custom,
    is_active,
    cta_text,
    sort_order
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Basic Bot',
    'basic-bot',
    99.00,
    '₹99',
    '01',
    NULL,
    '["Basic Telegram bot setup", "Basic commands", "Welcome message", "Basic buttons", "Basic support"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹99',
    1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Starter Bot',
    'starter-bot',
    399.00,
    '₹399',
    '02',
    NULL,
    '["Everything in Basic", "Advanced commands", "Auto replies", "Custom buttons", "Menu system"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹399',
    2
),
(
    '00000000-0000-0000-0000-000000000003',
    'Growth Bot',
    'growth-bot',
    699.00,
    '₹699',
    '03',
    NULL,
    '["Everything in Starter", "Advanced automation", "Custom menus", "User management", "Inline buttons"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹699',
    3
),
(
    '00000000-0000-0000-0000-000000000004',
    'Pro Bot',
    'pro-bot',
    999.00,
    '₹999',
    '04',
    NULL,
    '["Everything in Growth", "Broadcast messaging", "Database integration", "Custom workflows", "Advanced automation"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹999',
    4
),
(
    '00000000-0000-0000-0000-000000000005',
    'Premium Bot',
    'premium-bot',
    1599.00,
    '₹1,599',
    '05',
    NULL,
    '["Everything in Pro", "Referral system", "Advanced user management", "Analytics", "Priority support"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹1,599',
    5
),
(
    '00000000-0000-0000-0000-000000000006',
    'Business Bot',
    'business-bot',
    1999.00,
    '₹1,999',
    '06',
    NULL,
    '["Everything in Premium", "Business automation", "Payment integration", "Advanced analytics", "Advanced admin controls"]'::jsonb,
    false,
    false,
    true,
    'CREATE BOT ₹1,999',
    6
),
(
    '00000000-0000-0000-0000-000000000007',
    'Ultimate Bot',
    'ultimate-bot',
    2999.00,
    '₹2,999',
    '07',
    NULL,
    '["Maximum pre-built features", "Advanced automation", "Payment system", "Referral system", "Broadcast system", "Analytics", "Admin management", "Priority support"]'::jsonb,
    true,
    false,
    true,
    'CREATE BOT ₹2,999',
    7
),
(
    '00000000-0000-0000-0000-000000000008',
    'Custom Bot',
    'custom-bot',
    4999.00,
    'Starting ₹4,999+',
    '08',
    'Price depends on required features.',
    '["Fully custom functionality", "Custom UI/UX", "Custom database", "Custom automation", "Payment integration", "API integrations", "Custom Telegram workflows", "Dedicated development", "Priority support"]'::jsonb,
    false,
    true,
    true,
    'CREATE CUSTOM BOT',
    8
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    price_display = EXCLUDED.price_display,
    features = EXCLUDED.features,
    is_highlighted = EXCLUDED.is_highlighted,
    is_custom = EXCLUDED.is_custom,
    cta_text = EXCLUDED.cta_text,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();
