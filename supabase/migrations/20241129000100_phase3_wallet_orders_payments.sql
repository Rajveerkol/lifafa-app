-- ==============================================================================
-- CREATLIFAFA.COM - PHASE 3: WALLET, BOT ORDERS, PAYMENTS & ATOMIC RPC FUNCTIONS
-- ==============================================================================

-- ==============================================================================
-- 1. WITHDRAWAL REQUESTS TABLE (Audit trail for pending/processed payouts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 50.00),
    payout_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at DESC);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawal requests"
    ON public.withdrawal_requests FOR SELECT
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 2. ENSURE UNIQUE PAYMENT REFERENCES ON TRANSACTIONS
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_id_unique 
    ON public.transactions(reference_id) 
    WHERE reference_id IS NOT NULL;

-- ==============================================================================
-- 3. RPC: CREATE BOT ORDER (Authoritative plan price from database)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_bot_order(p_bot_plan_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_plan RECORD;
    v_order_id UUID;
    v_result JSONB;
BEGIN
    -- Authenticate user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create a bot order';
    END IF;

    -- Fetch authoritative bot plan from database
    SELECT id, name, price, price_display, is_active 
    INTO v_plan
    FROM public.bot_plans
    WHERE id = p_bot_plan_id;

    IF NOT FOUND OR NOT v_plan.is_active THEN
        RAISE EXCEPTION 'Selected bot plan is invalid or currently inactive';
    END IF;

    -- Insert pending bot order with authoritative price
    INSERT INTO public.bot_orders (
        user_id,
        bot_plan_id,
        amount,
        status,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_plan.id,
        v_plan.price,
        'pending',
        jsonb_build_object(
            'plan_name', v_plan.name,
            'price_display', v_plan.price_display
        ),
        now(),
        now()
    )
    RETURNING id INTO v_order_id;

    v_result := jsonb_build_object(
        'order_id', v_order_id,
        'plan_id', v_plan.id,
        'plan_name', v_plan.name,
        'amount', v_plan.price,
        'price_display', v_plan.price_display,
        'status', 'pending'
    );

    RETURN v_result;
END;
$$;

-- ==============================================================================
-- 4. RPC: PROCESS WALLET BOT PURCHASE (Atomic, locked, double-spend protected)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_wallet_bot_purchase(p_bot_plan_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_wallet RECORD;
    v_plan RECORD;
    v_order_id UUID;
    v_tx_id UUID;
    v_reference TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to make a wallet purchase';
    END IF;

    -- Fetch active plan and authoritative price
    SELECT id, name, price, price_display 
    INTO v_plan
    FROM public.bot_plans
    WHERE id = p_bot_plan_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid bot plan specified';
    END IF;

    -- Acquire row-level exclusive lock on user's wallet
    SELECT id, balance 
    INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet record not found for user';
    END IF;

    IF v_wallet.balance < v_plan.price THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Required: %, Available: %', v_plan.price, v_wallet.balance;
    END IF;

    -- Deduct balance atomically
    UPDATE public.wallets
    SET 
        balance = balance - v_plan.price,
        updated_at = now()
    WHERE user_id = v_user_id;

    -- Create paid order
    v_reference := 'ORD/BOT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);

    INSERT INTO public.bot_orders (
        user_id,
        bot_plan_id,
        amount,
        status,
        payment_reference,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_plan.id,
        v_plan.price,
        'paid',
        v_reference,
        jsonb_build_object(
            'payment_method', 'wallet',
            'plan_name', v_plan.name
        ),
        now(),
        now()
    )
    RETURNING id INTO v_order_id;

    -- Create transaction ledger entry
    INSERT INTO public.transactions (
        user_id,
        type,
        title,
        description,
        amount,
        is_credit,
        status,
        reference_id,
        metadata,
        created_at
    ) VALUES (
        v_user_id,
        'bot_purchase',
        v_plan.name || ' Purchase',
        'Paid from Wallet Balance',
        v_plan.price,
        false,
        'completed',
        v_reference,
        jsonb_build_object('order_id', v_order_id, 'plan_id', v_plan.id),
        now()
    )
    RETURNING id INTO v_tx_id;

    -- Notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
    ) VALUES (
        v_user_id,
        'Bot Order Confirmed! 🎉',
        'Your purchase of ' || v_plan.name || ' (' || v_plan.price_display || ') was successful. Order #' || substr(v_order_id::text, 1, 8),
        'bot',
        false,
        now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'transaction_id', v_tx_id,
        'amount_paid', v_plan.price,
        'new_balance', (v_wallet.balance - v_plan.price),
        'status', 'paid'
    );
END;
$$;

-- ==============================================================================
-- 5. RPC: REQUEST WITHDRAWAL (Atomic balance reservation)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_amount NUMERIC,
    p_payout_details JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_wallet RECORD;
    v_request_id UUID;
    v_tx_id UUID;
    v_ref TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_amount IS NULL OR p_amount < 50.00 THEN
        RAISE EXCEPTION 'Minimum withdrawal amount is ₹50.00';
    END IF;

    -- Acquire row-level lock on user's wallet
    SELECT id, balance 
    INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND OR v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance for withdrawal';
    END IF;

    -- Deduct balance to reserve funds
    UPDATE public.wallets
    SET 
        balance = balance - p_amount,
        total_withdrawn = total_withdrawn + p_amount,
        updated_at = now()
    WHERE user_id = v_user_id;

    v_ref := 'WDL/' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

    -- Insert withdrawal request
    INSERT INTO public.withdrawal_requests (
        user_id,
        amount,
        payout_details,
        status,
        reference_id,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_amount,
        p_payout_details,
        'pending',
        v_ref,
        now(),
        now()
    )
    RETURNING id INTO v_request_id;

    -- Insert pending transaction
    INSERT INTO public.transactions (
        user_id,
        type,
        title,
        description,
        amount,
        is_credit,
        status,
        reference_id,
        metadata,
        created_at
    ) VALUES (
        v_user_id,
        'withdrawal',
        'Bank/UPI Withdrawal',
        'Payout Request Pending Approval',
        p_amount,
        false,
        'pending',
        v_ref,
        jsonb_build_object('withdrawal_request_id', v_request_id),
        now()
    )
    RETURNING id INTO v_tx_id;

    -- Create notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
    ) VALUES (
        v_user_id,
        'Withdrawal Request Placed',
        'Your withdrawal request of ₹' || p_amount::text || ' is pending processing. Reference #' || v_ref,
        'wallet',
        false,
        now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'withdrawal_id', v_request_id,
        'transaction_id', v_tx_id,
        'reference_id', v_ref,
        'amount', p_amount,
        'new_balance', (v_wallet.balance - p_amount),
        'status', 'pending'
    );
END;
$$;

-- ==============================================================================
-- 6. RPC: CREATE DEPOSIT ORDER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_deposit_order(
    p_amount NUMERIC,
    p_payment_method TEXT DEFAULT 'upi'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_ref TEXT;
    v_tx_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_amount IS NULL OR p_amount < 10.00 THEN
        RAISE EXCEPTION 'Minimum deposit amount is ₹10.00';
    END IF;

    v_ref := 'DEP/' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

    INSERT INTO public.transactions (
        user_id,
        type,
        title,
        description,
        amount,
        is_credit,
        status,
        reference_id,
        metadata,
        created_at
    ) VALUES (
        v_user_id,
        'deposit',
        'Wallet Deposit',
        'Pending payment via ' || upper(p_payment_method),
        p_amount,
        true,
        'pending',
        v_ref,
        jsonb_build_object('payment_method', p_payment_method),
        now()
    )
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'transaction_id', v_tx_id,
        'reference_id', v_ref,
        'amount', p_amount,
        'currency', 'INR',
        'status', 'pending'
    );
END;
$$;

-- ==============================================================================
-- 7. RPC: CREDIT DEPOSIT IDEMPOTENT (Protected server-side callback)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.credit_deposit_idempotent(
    p_user_id UUID,
    p_amount NUMERIC,
    p_payment_reference TEXT,
    p_gateway TEXT DEFAULT 'manual'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_tx RECORD;
    v_wallet RECORD;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid deposit amount';
    END IF;

    -- Check if reference was already credited
    SELECT id, status 
    INTO v_existing_tx
    FROM public.transactions
    WHERE reference_id = p_payment_reference;

    IF FOUND AND v_existing_tx.status = 'completed' THEN
        -- Already credited, return existing state safely
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Payment reference already processed (Idempotent response)',
            'reference_id', p_payment_reference
        );
    END IF;

    -- Lock wallet and update balance atomically
    SELECT id, balance 
    INTO v_wallet
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for user';
    END IF;

    UPDATE public.wallets
    SET 
        balance = balance + p_amount,
        total_deposited = total_deposited + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Update or insert transaction record
    IF FOUND AND v_existing_tx.id IS NOT NULL THEN
        UPDATE public.transactions
        SET 
            status = 'completed',
            description = 'Instant Deposit via ' || upper(p_gateway)
        WHERE id = v_existing_tx.id;
    ELSE
        INSERT INTO public.transactions (
            user_id,
            type,
            title,
            description,
            amount,
            is_credit,
            status,
            reference_id,
            metadata,
            created_at
        ) VALUES (
            p_user_id,
            'deposit',
            'Wallet Deposit',
            'Instant Deposit via ' || upper(p_gateway),
            p_amount,
            true,
            'completed',
            p_payment_reference,
            jsonb_build_object('gateway', p_gateway),
            now()
        );
    END IF;

    -- Send notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        'Wallet Credited! 💰',
        'Deposit of ₹' || p_amount::text || ' has been successfully credited to your wallet.',
        'wallet',
        false,
        now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'amount_credited', p_amount,
        'new_balance', (v_wallet.balance + p_amount),
        'reference_id', p_payment_reference
    );
END;
$$;
