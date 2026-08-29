-- ==============================================================================
-- CREATLIFAFA.COM - PHASE 6: PRODUCTION HARDENING & PLATFORM HEALTH
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE WITH ROLE ARCHITECTURE
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. EXTEND AUTOMATION RULES WITH EXECUTION COUNTERS
ALTER TABLE public.bot_automation_rules
    ADD COLUMN IF NOT EXISTS total_executions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS success_executions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS failed_executions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_automation_rules_last_exec ON public.bot_automation_rules(last_executed_at DESC);

-- 3. EXTEND BROADCASTS WITH RETRY COUNTER
ALTER TABLE public.bot_broadcasts
    ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;

-- ==============================================================================
-- 4. RPC FUNCTIONS FOR HEALTH MONITORING & ADMIN FOUNDATION
-- ==============================================================================

-- Query bot diagnostic health status
CREATE OR REPLACE FUNCTION public.get_bot_health_status(p_bot_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_bot RECORD;
    v_total_users INT;
    v_active_channels INT;
    v_active_rules INT;
    v_pending_broadcasts INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT id, name, username, telegram_bot_id, status, is_connected, webhook_url, last_synced_at, total_messages
    INTO v_bot
    FROM public.bots
    WHERE id = p_bot_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    SELECT count(*) INTO v_total_users FROM public.bot_users WHERE bot_id = p_bot_id;
    SELECT count(*) INTO v_active_channels FROM public.bot_channels WHERE bot_id = p_bot_id AND is_active = true;
    SELECT count(*) INTO v_active_rules FROM public.bot_automation_rules WHERE bot_id = p_bot_id AND is_active = true;
    SELECT count(*) INTO v_pending_broadcasts FROM public.bot_broadcasts WHERE bot_id = p_bot_id AND status IN ('pending', 'processing');

    RETURN jsonb_build_object(
        'bot_id', v_bot.id,
        'name', v_bot.name,
        'username', v_bot.username,
        'telegram_bot_id', v_bot.telegram_bot_id,
        'status', v_bot.status,
        'is_connected', v_bot.is_connected,
        'webhook_url', v_bot.webhook_url,
        'last_synced_at', v_bot.last_synced_at,
        'telegram_connection', CASE WHEN v_bot.is_connected THEN 'CONNECTED' ELSE 'DISCONNECTED' END,
        'webhook_status', CASE WHEN v_bot.webhook_url IS NOT NULL THEN 'ACTIVE' ELSE 'INACTIVE' END,
        'database_status', 'HEALTHY',
        'subscriber_tracking', 'ACTIVE',
        'total_subscribers', v_total_users,
        'active_channels_count', v_active_channels,
        'active_automations_count', v_active_rules,
        'pending_broadcasts_count', v_pending_broadcasts,
        'total_messages_processed', v_bot.total_messages
    );
END;
$$;

-- Secure Admin Platform Overview (Admin & Super Admin only)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
    v_total_users INT;
    v_total_bots INT;
    v_total_orders INT;
    v_total_revenue NUMERIC(10,2);
    v_pending_withdrawals INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check admin role
    SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id;
    IF v_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    SELECT count(*) INTO v_total_users FROM public.profiles;
    SELECT count(*) INTO v_total_bots FROM public.bots;
    SELECT count(*) INTO v_total_orders FROM public.bot_orders WHERE status = 'paid';
    SELECT coalesce(sum(amount), 0) INTO v_total_revenue FROM public.bot_orders WHERE status = 'paid';
    SELECT count(*) INTO v_pending_withdrawals FROM public.withdrawal_requests WHERE status = 'pending';

    RETURN jsonb_build_object(
        'total_users', v_total_users,
        'total_bots', v_total_bots,
        'total_paid_orders', v_total_orders,
        'total_revenue', v_total_revenue,
        'pending_withdrawals', v_pending_withdrawals,
        'generated_at', now()
    );
END;
$$;
