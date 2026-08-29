-- ==============================================================================
-- CREATLIFAFA.COM - PHASE 5: ADVANCED BOT AUTOMATION, CHANNEL LOCK & BROADCASTS
-- ==============================================================================

-- 1. EXTEND BOT SETTINGS TABLE
ALTER TABLE public.bot_settings 
    ADD COLUMN IF NOT EXISTS channel_lock_enabled BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS channel_lock_message TEXT DEFAULT 'Please join our required channel to continue using this bot.';

-- 2. BOT BROADCASTS QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.bot_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    button_text TEXT,
    button_url TEXT,
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'new', 'inactive')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_recipients INT NOT NULL DEFAULT 0,
    sent_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bot_broadcasts_bot_id ON public.bot_broadcasts(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_broadcasts_user_id ON public.bot_broadcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_broadcasts_status ON public.bot_broadcasts(status);

ALTER TABLE public.bot_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage broadcasts of their own bots"
    ON public.bot_broadcasts FOR ALL
    USING (auth.uid() = user_id);

-- 3. BOT BROADCAST RECIPIENTS (Idempotent delivery tracking)
CREATE TABLE IF NOT EXISTS public.bot_broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES public.bot_broadcasts(id) ON DELETE CASCADE,
    bot_user_id UUID NOT NULL REFERENCES public.bot_users(id) ON DELETE CASCADE,
    telegram_user_id BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(broadcast_id, bot_user_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_bcast ON public.bot_broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON public.bot_broadcast_recipients(status);

ALTER TABLE public.bot_broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients of their own broadcasts"
    ON public.bot_broadcast_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bot_broadcasts b
            WHERE b.id = bot_broadcast_recipients.broadcast_id AND b.user_id = auth.uid()
        )
    );

-- 4. BOT AUTOMATION RULES TABLE
CREATE TABLE IF NOT EXISTS public.bot_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('start_command', 'custom_command', 'new_subscriber', 'channel_verified')),
    trigger_value TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('send_message', 'show_menu', 'record_event')),
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bot_automation_rules_bot ON public.bot_automation_rules(bot_id);

ALTER TABLE public.bot_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage automation rules of their own bots"
    ON public.bot_automation_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bots
            WHERE bots.id = bot_automation_rules.bot_id AND bots.user_id = auth.uid()
        )
    );

-- 5. BOT REFERRALS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.bot_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    referrer_user_id BIGINT NOT NULL,
    referred_user_id BIGINT NOT NULL,
    referral_code TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    points_awarded NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(bot_id, referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_referrals_bot_id ON public.bot_referrals(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_referrals_referrer ON public.bot_referrals(referrer_user_id);

ALTER TABLE public.bot_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referral tracking of their own bots"
    ON public.bot_referrals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bots
            WHERE bots.id = bot_referrals.bot_id AND bots.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 6. SECURE RPC FUNCTIONS FOR PHASE 5
-- ==============================================================================

-- Create a broadcast job in queue with recipient population
CREATE OR REPLACE FUNCTION public.create_broadcast_job(
    p_bot_id UUID,
    p_message TEXT,
    p_target_audience TEXT DEFAULT 'all',
    p_button_text TEXT DEFAULT NULL,
    p_button_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_bot RECORD;
    v_broadcast_id UUID;
    v_count INT := 0;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Verify bot ownership
    SELECT id, plan_slug INTO v_bot FROM public.bots WHERE id = p_bot_id AND user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    -- Verify broadcast permission for plan
    IF v_bot.plan_slug NOT IN ('pro', 'premium', 'business', 'ultimate', 'custom') THEN
        RAISE EXCEPTION 'Broadcast feature requires Pro Bot (₹999+) or higher';
    END IF;

    IF p_message IS NULL OR trim(p_message) = '' THEN
        RAISE EXCEPTION 'Broadcast message cannot be empty';
    END IF;

    -- Validate button URL if present
    IF p_button_url IS NOT NULL AND trim(p_button_url) <> '' THEN
        IF NOT (p_button_url ILIKE 'https://%') THEN
            RAISE EXCEPTION 'Button URL must use secure https:// protocol';
        END IF;
    END IF;

    -- Insert broadcast job
    INSERT INTO public.bot_broadcasts (
        bot_id,
        user_id,
        message,
        button_text,
        button_url,
        target_audience,
        status,
        created_at
    ) VALUES (
        p_bot_id,
        v_user_id,
        p_message,
        p_button_text,
        p_button_url,
        p_target_audience,
        'pending',
        now()
    )
    RETURNING id INTO v_broadcast_id;

    -- Populate recipients queue based on audience
    IF p_target_audience = 'new' THEN
        INSERT INTO public.bot_broadcast_recipients (broadcast_id, bot_user_id, telegram_user_id, status)
        SELECT v_broadcast_id, id, telegram_user_id, 'pending'
        FROM public.bot_users
        WHERE bot_id = p_bot_id AND first_seen_at >= (now() - INTERVAL '7 days')
        ON CONFLICT (broadcast_id, bot_user_id) DO NOTHING;
    ELSIF p_target_audience = 'inactive' THEN
        INSERT INTO public.bot_broadcast_recipients (broadcast_id, bot_user_id, telegram_user_id, status)
        SELECT v_broadcast_id, id, telegram_user_id, 'pending'
        FROM public.bot_users
        WHERE bot_id = p_bot_id AND last_seen_at < (now() - INTERVAL '30 days')
        ON CONFLICT (broadcast_id, bot_user_id) DO NOTHING;
    ELSE
        -- 'all' or 'active'
        INSERT INTO public.bot_broadcast_recipients (broadcast_id, bot_user_id, telegram_user_id, status)
        SELECT v_broadcast_id, id, telegram_user_id, 'pending'
        FROM public.bot_users
        WHERE bot_id = p_bot_id AND is_active = true
        ON CONFLICT (broadcast_id, bot_user_id) DO NOTHING;
    END IF;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Update total recipients
    UPDATE public.bot_broadcasts
    SET total_recipients = v_count
    WHERE id = v_broadcast_id;

    -- Log activity
    INSERT INTO public.bot_activity_logs (bot_id, action, details)
    VALUES (p_bot_id, 'broadcast_created', jsonb_build_object(
        'broadcast_id', v_broadcast_id,
        'total_recipients', v_count,
        'audience', p_target_audience
    ));

    RETURN jsonb_build_object(
        'success', true,
        'broadcast_id', v_broadcast_id,
        'total_recipients', v_count,
        'status', 'pending'
    );
END;
$$;

-- Create automation rule
CREATE OR REPLACE FUNCTION public.create_automation_rule(
    p_bot_id UUID,
    p_trigger_type TEXT,
    p_trigger_value TEXT,
    p_action_type TEXT,
    p_action_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_rule_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.bots WHERE id = p_bot_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    INSERT INTO public.bot_automation_rules (
        bot_id,
        trigger_type,
        trigger_value,
        action_type,
        action_payload,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        p_bot_id,
        p_trigger_type,
        p_trigger_value,
        p_action_type,
        p_action_payload,
        true,
        now(),
        now()
    )
    RETURNING id INTO v_rule_id;

    -- Log activity
    INSERT INTO public.bot_activity_logs (bot_id, action, details)
    VALUES (p_bot_id, 'automation_rule_created', jsonb_build_object(
        'rule_id', v_rule_id,
        'trigger', p_trigger_type
    ));

    RETURN jsonb_build_object('success', true, 'rule_id', v_rule_id);
END;
$$;

-- Toggle automation rule
CREATE OR REPLACE FUNCTION public.toggle_automation_rule(
    p_rule_id UUID,
    p_is_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_bot_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT bot_id INTO v_bot_id FROM public.bot_automation_rules WHERE id = p_rule_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rule not found';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.bots WHERE id = v_bot_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE public.bot_automation_rules
    SET is_active = p_is_active, updated_at = now()
    WHERE id = p_rule_id;

    RETURN jsonb_build_object('success', true, 'is_active', p_is_active);
END;
$$;

-- Update custom bot menu with URL validation
CREATE OR REPLACE FUNCTION public.update_bot_custom_menu(
    p_bot_id UUID,
    p_menu_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_bot RECORD;
    v_item JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT id, plan_slug INTO v_bot FROM public.bots WHERE id = p_bot_id AND user_id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bot not found or unauthorized';
    END IF;

    IF v_bot.plan_slug NOT IN ('pro', 'premium', 'business', 'ultimate', 'custom') THEN
        RAISE EXCEPTION 'Custom bot menu requires Pro Bot (₹999+) or higher';
    END IF;

    -- Validate menu items structure and protocols
    IF jsonb_typeof(p_menu_items) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_menu_items)
        LOOP
            IF v_item->>'type' = 'url' THEN
                IF NOT ((v_item->>'value') ILIKE 'https://%') THEN
                    RAISE EXCEPTION 'Menu URL buttons must use secure https:// protocol';
                END IF;
            END IF;
        END LOOP;
    END IF;

    UPDATE public.bot_settings
    SET custom_menu = p_menu_items, updated_at = now()
    WHERE bot_id = p_bot_id;

    -- Log activity
    INSERT INTO public.bot_activity_logs (bot_id, action, details)
    VALUES (p_bot_id, 'menu_updated', jsonb_build_object('items_count', jsonb_array_length(p_menu_items)));

    RETURN jsonb_build_object('success', true, 'message', 'Custom bot menu updated successfully');
END;
$$;
