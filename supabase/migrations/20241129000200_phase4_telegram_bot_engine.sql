-- ==============================================================================
-- CREATLIFAFA.COM - PHASE 4: REAL TELEGRAM BOT ENGINE & FEATURE SYSTEM
-- ==============================================================================

-- 1. EXTEND BOTS TABLE WITH OPERATIONAL FIELDS
ALTER TABLE public.bots 
    ADD COLUMN IF NOT EXISTS bot_order_id UUID REFERENCES public.bot_orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS plan_slug TEXT DEFAULT 'basic',
    ADD COLUMN IF NOT EXISTS encrypted_token TEXT,
    ADD COLUMN IF NOT EXISTS webhook_url TEXT,
    ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS total_users INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_messages INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. BOT PLAN FEATURES MATRIX TABLE
CREATE TABLE IF NOT EXISTS public.bot_plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_slug TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(plan_slug, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_bot_plan_features_slug ON public.bot_plan_features(plan_slug);

-- Enable RLS for public read of active plan features
ALTER TABLE public.bot_plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bot plan features" ON public.bot_plan_features FOR SELECT USING (true);

-- Seed Plan Features for all 8 tiers
INSERT INTO public.bot_plan_features (plan_slug, feature_key, feature_name) VALUES
-- Basic (₹99)
('basic', 'bot_overview', 'Bot Overview & Status'),
('basic', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('basic', 'basic_analytics', 'Basic Analytics (7-Day Overview)'),
('basic', 'developer_contact', 'Developer Contact for Mini App Customization'),

-- Starter (₹399) - Inherits Basic + Starter
('starter', 'bot_overview', 'Bot Overview & Status'),
('starter', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('starter', 'basic_analytics', 'Basic Analytics'),
('starter', 'developer_contact', 'Developer Contact for Mini App Customization'),
('starter', 'enhanced_analytics', 'Enhanced Analytics'),
('starter', 'user_list', 'Subscribers & User List'),
('starter', 'welcome_settings', 'Basic Welcome Message Settings'),
('starter', 'channels_management', 'Telegram Channels Connection'),

-- Growth (₹699) - Inherits Starter + Growth
('growth', 'bot_overview', 'Bot Overview & Status'),
('growth', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('growth', 'basic_analytics', 'Basic Analytics'),
('growth', 'developer_contact', 'Developer Contact for Mini App Customization'),
('growth', 'enhanced_analytics', 'Enhanced Analytics'),
('growth', 'user_list', 'Subscribers & User List'),
('growth', 'welcome_settings', 'Welcome Message Settings'),
('growth', 'channels_management', 'Channels Connection'),
('growth', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('growth', 'user_search', 'User Search & Activity Filtering'),
('growth', 'referral_settings', 'Referral Configuration UI'),
('growth', 'activity_logs', 'Bot Activity Logs'),

-- Pro (₹999) - Inherits Growth + Pro
('pro', 'bot_overview', 'Bot Overview & Status'),
('pro', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('pro', 'basic_analytics', 'Basic Analytics'),
('pro', 'developer_contact', 'Developer Contact for Mini App Customization'),
('pro', 'enhanced_analytics', 'Enhanced Analytics'),
('pro', 'user_list', 'Subscribers & User List'),
('pro', 'welcome_settings', 'Welcome Message Settings'),
('pro', 'channels_management', 'Channels Connection'),
('pro', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('pro', 'user_search', 'User Search & Activity Filtering'),
('pro', 'referral_settings', 'Referral Configuration UI'),
('pro', 'activity_logs', 'Bot Activity Logs'),
('pro', 'advanced_bot_settings', 'Advanced Bot Settings & Custom Menu'),
('pro', 'broadcast_ui', 'Broadcast Messaging UI'),
('pro', 'priority_support', 'Priority Support'),

-- Premium (₹1,599) - Inherits Pro + Premium
('premium', 'bot_overview', 'Bot Overview & Status'),
('premium', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('premium', 'basic_analytics', 'Basic Analytics'),
('premium', 'developer_contact', 'Developer Contact for Mini App Customization'),
('premium', 'enhanced_analytics', 'Enhanced Analytics'),
('premium', 'user_list', 'Subscribers & User List'),
('premium', 'welcome_settings', 'Welcome Message Settings'),
('premium', 'channels_management', 'Channels Connection'),
('premium', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('premium', 'user_search', 'User Search & Activity Filtering'),
('premium', 'referral_settings', 'Referral Configuration UI'),
('premium', 'activity_logs', 'Bot Activity Logs'),
('premium', 'advanced_bot_settings', 'Advanced Bot Settings'),
('premium', 'broadcast_ui', 'Broadcast Messaging UI'),
('premium', 'priority_support', 'Priority Support'),
('premium', 'premium_analytics', 'Premium Analytics & User Insights'),
('premium', 'premium_tools', 'Premium Management Tools'),

-- Business (₹1,999) - Inherits Premium + Business
('business', 'bot_overview', 'Bot Overview & Status'),
('business', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('business', 'basic_analytics', 'Basic Analytics'),
('business', 'developer_contact', 'Developer Contact for Mini App Customization'),
('business', 'enhanced_analytics', 'Enhanced Analytics'),
('business', 'user_list', 'Subscribers & User List'),
('business', 'welcome_settings', 'Welcome Message Settings'),
('business', 'channels_management', 'Channels Connection'),
('business', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('business', 'user_search', 'User Search & Activity Filtering'),
('business', 'referral_settings', 'Referral Configuration UI'),
('business', 'activity_logs', 'Bot Activity Logs'),
('business', 'advanced_bot_settings', 'Advanced Bot Settings'),
('business', 'broadcast_ui', 'Broadcast Messaging UI'),
('business', 'priority_support', 'Priority Support'),
('business', 'premium_analytics', 'Premium Analytics & User Insights'),
('business', 'premium_tools', 'Premium Management Tools'),
('business', 'business_reports', 'Detailed Business Reports & Export'),
('business', 'user_segmentation', 'User Segmentation Foundation'),

-- Ultimate (₹2,999) - Full Phase 4 Features
('ultimate', 'bot_overview', 'Bot Overview & Status'),
('ultimate', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('ultimate', 'basic_analytics', 'Basic Analytics'),
('ultimate', 'developer_contact', 'Developer Contact for Mini App Customization'),
('ultimate', 'enhanced_analytics', 'Enhanced Analytics'),
('ultimate', 'user_list', 'Subscribers & User List'),
('ultimate', 'welcome_settings', 'Welcome Message Settings'),
('ultimate', 'channels_management', 'Channels Connection'),
('ultimate', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('ultimate', 'user_search', 'User Search & Activity Filtering'),
('ultimate', 'referral_settings', 'Referral Configuration UI'),
('ultimate', 'activity_logs', 'Bot Activity Logs'),
('ultimate', 'advanced_bot_settings', 'Advanced Bot Settings'),
('ultimate', 'broadcast_ui', 'Broadcast Messaging UI'),
('ultimate', 'priority_support', 'Priority Support'),
('ultimate', 'premium_analytics', 'Premium Analytics & User Insights'),
('ultimate', 'premium_tools', 'Premium Management Tools'),
('ultimate', 'business_reports', 'Detailed Business Reports & Export'),
('ultimate', 'user_segmentation', 'User Segmentation Foundation'),
('ultimate', 'full_bot_management', 'Full Phase 4 Bot Management'),

-- Custom (₹4,999+) - Full Ultimate + Custom Dev
('custom', 'bot_overview', 'Bot Overview & Status'),
('custom', 'basic_commands', 'Basic Commands (/start, /help, /id)'),
('custom', 'basic_analytics', 'Basic Analytics'),
('custom', 'developer_contact', 'Developer Contact for Mini App Customization'),
('custom', 'enhanced_analytics', 'Enhanced Analytics'),
('custom', 'user_list', 'Subscribers & User List'),
('custom', 'welcome_settings', 'Welcome Message Settings'),
('custom', 'channels_management', 'Channels Connection'),
('custom', 'advanced_analytics', 'Advanced Analytics & Growth Charts'),
('custom', 'user_search', 'User Search & Activity Filtering'),
('custom', 'referral_settings', 'Referral Configuration UI'),
('custom', 'activity_logs', 'Bot Activity Logs'),
('custom', 'advanced_bot_settings', 'Advanced Bot Settings'),
('custom', 'broadcast_ui', 'Broadcast Messaging UI'),
('custom', 'priority_support', 'Priority Support'),
('custom', 'premium_analytics', 'Premium Analytics & User Insights'),
('custom', 'premium_tools', 'Premium Management Tools'),
('custom', 'business_reports', 'Detailed Business Reports & Export'),
('custom', 'user_segmentation', 'User Segmentation Foundation'),
('custom', 'full_bot_management', 'Full Phase 4 Bot Management'),
('custom', 'custom_development', 'Custom Development & Custom Integrations')
ON CONFLICT (plan_slug, feature_key) DO NOTHING;

-- 3. BOT SUBSCRIBERS / USERS TABLE
CREATE TABLE IF NOT EXISTS public.bot_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    telegram_user_id BIGINT NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(bot_id, telegram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_users_bot_id ON public.bot_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_tg_id ON public.bot_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_last_seen ON public.bot_users(last_seen_at DESC);

ALTER TABLE public.bot_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscribers of their own bots"
    ON public.bot_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bots 
            WHERE bots.id = bot_users.bot_id AND bots.user_id = auth.uid()
        )
    );

-- 4. BOT CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.bot_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    channel_username TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bot_channels_bot_id ON public.bot_channels(bot_id);

ALTER TABLE public.bot_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage channels of their own bots"
    ON public.bot_channels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bots 
            WHERE bots.id = bot_channels.bot_id AND bots.user_id = auth.uid()
        )
    );

-- 5. BOT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.bot_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL UNIQUE REFERENCES public.bots(id) ON DELETE CASCADE,
    welcome_message TEXT DEFAULT 'Welcome to our official Telegram Bot! Use the menu below to explore options.',
    welcome_enabled BOOLEAN DEFAULT true,
    custom_menu JSONB DEFAULT '[]'::jsonb,
    referral_enabled BOOLEAN DEFAULT false,
    referral_bonus NUMERIC(10,2) DEFAULT 5.00,
    min_withdrawal NUMERIC(10,2) DEFAULT 50.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit settings of their own bots"
    ON public.bot_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bots 
            WHERE bots.id = bot_settings.bot_id AND bots.user_id = auth.uid()
        )
    );

-- 6. BOT ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.bot_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bot_activity_logs_bot_id ON public.bot_activity_logs(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_activity_logs_created ON public.bot_activity_logs(created_at DESC);

ALTER TABLE public.bot_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs of their own bots"
    ON public.bot_activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bots 
            WHERE bots.id = bot_activity_logs.bot_id AND bots.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 7. SECURE RPC FUNCTIONS FOR BOT ENGINE
-- ==============================================================================

-- Check if a bot has a specific feature enabled
CREATE OR REPLACE FUNCTION public.check_bot_feature(p_bot_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_plan_slug TEXT;
    v_allowed BOOLEAN;
BEGIN
    SELECT plan_slug INTO v_plan_slug FROM public.bots WHERE id = p_bot_id;
    IF NOT FOUND OR v_plan_slug IS NULL THEN
        v_plan_slug := 'basic';
    END IF;

    SELECT is_enabled INTO v_allowed 
    FROM public.bot_plan_features 
    WHERE plan_slug = v_plan_slug AND feature_key = p_feature_key;

    RETURN COALESCE(v_allowed, false);
END;
$$;

-- Securely update bot settings with feature verification
CREATE OR REPLACE FUNCTION public.update_bot_settings_secure(
    p_bot_id UUID,
    p_settings JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_bot RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT id, plan_slug INTO v_bot FROM public.bots WHERE id = p_bot_id AND user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    -- Upsert settings
    INSERT INTO public.bot_settings (
        bot_id,
        welcome_message,
        welcome_enabled,
        referral_enabled,
        referral_bonus,
        min_withdrawal,
        updated_at
    ) VALUES (
        p_bot_id,
        COALESCE(p_settings->>'welcome_message', 'Welcome to our bot!'),
        COALESCE((p_settings->>'welcome_enabled')::boolean, true),
        COALESCE((p_settings->>'referral_enabled')::boolean, false),
        COALESCE((p_settings->>'referral_bonus')::numeric, 5.00),
        COALESCE((p_settings->>'min_withdrawal')::numeric, 50.00),
        now()
    )
    ON CONFLICT (bot_id) DO UPDATE SET
        welcome_message = EXCLUDED.welcome_message,
        welcome_enabled = EXCLUDED.welcome_enabled,
        referral_enabled = EXCLUDED.referral_enabled,
        referral_bonus = EXCLUDED.referral_bonus,
        min_withdrawal = EXCLUDED.min_withdrawal,
        updated_at = now();

    -- Log activity
    INSERT INTO public.bot_activity_logs (bot_id, action, details)
    VALUES (p_bot_id, 'settings_updated', p_settings);

    RETURN jsonb_build_object('success', true, 'message', 'Bot settings updated successfully');
END;
$$;

-- Record Telegram user activity (Called by Webhook)
CREATE OR REPLACE FUNCTION public.record_bot_user_activity(
    p_bot_id UUID,
    p_telegram_user_id BIGINT,
    p_username TEXT,
    p_first_name TEXT,
    p_last_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_is_new BOOLEAN := false;
BEGIN
    INSERT INTO public.bot_users (
        bot_id,
        telegram_user_id,
        telegram_username,
        first_name,
        last_name,
        is_active,
        first_seen_at,
        last_seen_at,
        updated_at
    ) VALUES (
        p_bot_id,
        p_telegram_user_id,
        p_username,
        p_first_name,
        p_last_name,
        true,
        now(),
        now(),
        now()
    )
    ON CONFLICT (bot_id, telegram_user_id) DO UPDATE SET
        telegram_username = COALESCE(EXCLUDED.telegram_username, bot_users.telegram_username),
        first_name = COALESCE(EXCLUDED.first_name, bot_users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, bot_users.last_name),
        is_active = true,
        last_seen_at = now(),
        updated_at = now()
    RETURNING id, (xmax = 0) INTO v_user_id, v_is_new;

    -- Increment bot total messages and users
    UPDATE public.bots
    SET 
        total_messages = total_messages + 1,
        total_users = CASE WHEN v_is_new THEN total_users + 1 ELSE total_users END,
        last_synced_at = now()
    WHERE id = p_bot_id;

    RETURN jsonb_build_object(
        'success', true,
        'bot_user_id', v_user_id,
        'is_new_subscriber', v_is_new
    );
END;
$$;

-- Secure Bot Disconnect
CREATE OR REPLACE FUNCTION public.disconnect_bot_secure(p_bot_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    UPDATE public.bots
    SET 
        status = 'Inactive',
        is_connected = false,
        encrypted_token = NULL,
        updated_at = now()
    WHERE id = p_bot_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    -- Activity log
    INSERT INTO public.bot_activity_logs (bot_id, action, details)
    VALUES (p_bot_id, 'bot_disconnected', jsonb_build_object('timestamp', now()));

    RETURN jsonb_build_object('success', true, 'message', 'Bot disconnected successfully');
END;
$$;
