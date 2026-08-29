export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          mobile_number: string | null;
          username: string;
          avatar_url: string | null;
          is_trusted: boolean;
          role: 'user' | 'admin' | 'super_admin';
          referral_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          mobile_number?: string | null;
          username: string;
          avatar_url?: string | null;
          is_trusted?: boolean;
          role?: 'user' | 'admin' | 'super_admin';
          referral_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          mobile_number?: string | null;
          username?: string;
          avatar_url?: string | null;
          is_trusted?: boolean;
          role?: 'user' | 'admin' | 'super_admin';
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          total_withdrawn: number;
          total_deposited: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          total_withdrawn?: number;
          total_deposited?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          total_withdrawn?: number;
          total_deposited?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          price_display: string;
          number_badge: string;
          subtitle: string | null;
          features: Json;
          is_highlighted: boolean;
          is_custom: boolean;
          is_active: boolean;
          cta_text: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price: number;
          price_display: string;
          number_badge: string;
          subtitle?: string | null;
          features?: Json;
          is_highlighted?: boolean;
          is_custom?: boolean;
          is_active?: boolean;
          cta_text: string;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price?: number;
          price_display?: string;
          number_badge?: string;
          subtitle?: string | null;
          features?: Json;
          is_highlighted?: boolean;
          is_custom?: boolean;
          is_active?: boolean;
          cta_text?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_plan_features: {
        Row: {
          id: string;
          plan_slug: string;
          feature_key: string;
          feature_name: string;
          is_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_slug: string;
          feature_key: string;
          feature_name: string;
          is_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_slug?: string;
          feature_key?: string;
          feature_name?: string;
          is_enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      bots: {
        Row: {
          id: string;
          user_id: string;
          bot_plan_id: string | null;
          bot_order_id: string | null;
          name: string;
          username: string;
          telegram_bot_id: string | null;
          status: 'Active' | 'Inactive' | 'Pending';
          plan_slug: string | null;
          encrypted_token: string | null;
          webhook_url: string | null;
          is_connected: boolean;
          avatar_url: string | null;
          qr_code_url: string | null;
          channels_count: number;
          bonus_amount: number;
          refer_reward: number;
          total_users: number;
          total_messages: number;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bot_plan_id?: string | null;
          bot_order_id?: string | null;
          name: string;
          username: string;
          telegram_bot_id?: string | null;
          status?: 'Active' | 'Inactive' | 'Pending';
          plan_slug?: string | null;
          encrypted_token?: string | null;
          webhook_url?: string | null;
          is_connected?: boolean;
          avatar_url?: string | null;
          qr_code_url?: string | null;
          channels_count?: number;
          bonus_amount?: number;
          refer_reward?: number;
          total_users?: number;
          total_messages?: number;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bot_plan_id?: string | null;
          bot_order_id?: string | null;
          name?: string;
          username?: string;
          telegram_bot_id?: string | null;
          status?: 'Active' | 'Inactive' | 'Pending';
          plan_slug?: string | null;
          encrypted_token?: string | null;
          webhook_url?: string | null;
          is_connected?: boolean;
          avatar_url?: string | null;
          qr_code_url?: string | null;
          channels_count?: number;
          bonus_amount?: number;
          refer_reward?: number;
          total_users?: number;
          total_messages?: number;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_users: {
        Row: {
          id: string;
          bot_id: string;
          telegram_user_id: number;
          telegram_username: string | null;
          first_name: string | null;
          last_name: string | null;
          is_active: boolean;
          first_seen_at: string;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          telegram_user_id: number;
          telegram_username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          first_seen_at?: string;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          telegram_user_id?: number;
          telegram_username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          first_seen_at?: string;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_channels: {
        Row: {
          id: string;
          bot_id: string;
          channel_id: string;
          channel_title: string;
          channel_username: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          channel_id: string;
          channel_title: string;
          channel_username?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          channel_id?: string;
          channel_title?: string;
          channel_username?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      bot_settings: {
        Row: {
          id: string;
          bot_id: string;
          welcome_message: string | null;
          welcome_enabled: boolean;
          channel_lock_enabled: boolean;
          channel_lock_message: string | null;
          custom_menu: Json;
          referral_enabled: boolean;
          referral_bonus: number;
          min_withdrawal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          welcome_message?: string | null;
          welcome_enabled?: boolean;
          channel_lock_enabled?: boolean;
          channel_lock_message?: string | null;
          custom_menu?: Json;
          referral_enabled?: boolean;
          referral_bonus?: number;
          min_withdrawal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          welcome_message?: string | null;
          welcome_enabled?: boolean;
          channel_lock_enabled?: boolean;
          channel_lock_message?: string | null;
          custom_menu?: Json;
          referral_enabled?: boolean;
          referral_bonus?: number;
          min_withdrawal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_broadcasts: {
        Row: {
          id: string;
          bot_id: string;
          user_id: string;
          message: string;
          button_text: string | null;
          button_url: string | null;
          target_audience: 'all' | 'active' | 'new' | 'inactive';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          total_recipients: number;
          sent_count: number;
          failed_count: number;
          retry_count: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          bot_id: string;
          user_id: string;
          message: string;
          button_text?: string | null;
          button_url?: string | null;
          target_audience?: 'all' | 'active' | 'new' | 'inactive';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          total_recipients?: number;
          sent_count?: number;
          failed_count?: number;
          retry_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          bot_id?: string;
          user_id?: string;
          message?: string;
          button_text?: string | null;
          button_url?: string | null;
          target_audience?: 'all' | 'active' | 'new' | 'inactive';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          total_recipients?: number;
          sent_count?: number;
          failed_count?: number;
          retry_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      bot_broadcast_recipients: {
        Row: {
          id: string;
          broadcast_id: string;
          bot_user_id: string;
          telegram_user_id: number;
          status: 'pending' | 'sent' | 'failed';
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          broadcast_id: string;
          bot_user_id: string;
          telegram_user_id: number;
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          broadcast_id?: string;
          bot_user_id?: string;
          telegram_user_id?: number;
          status?: 'pending' | 'sent' | 'failed';
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bot_automation_rules: {
        Row: {
          id: string;
          bot_id: string;
          trigger_type: 'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified';
          trigger_value: string | null;
          action_type: 'send_message' | 'show_menu' | 'record_event';
          action_payload: Json;
          is_active: boolean;
          total_executions: number;
          success_executions: number;
          failed_executions: number;
          last_executed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          trigger_type: 'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified';
          trigger_value?: string | null;
          action_type: 'send_message' | 'show_menu' | 'record_event';
          action_payload?: Json;
          is_active?: boolean;
          total_executions?: number;
          success_executions?: number;
          failed_executions?: number;
          last_executed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          trigger_type?: 'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified';
          trigger_value?: string | null;
          action_type?: 'send_message' | 'show_menu' | 'record_event';
          action_payload?: Json;
          is_active?: boolean;
          total_executions?: number;
          success_executions?: number;
          failed_executions?: number;
          last_executed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bot_referrals: {
        Row: {
          id: string;
          bot_id: string;
          referrer_user_id: number;
          referred_user_id: number;
          referral_code: string | null;
          status: 'completed' | 'pending';
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          referrer_user_id: number;
          referred_user_id: number;
          referral_code?: string | null;
          status?: 'completed' | 'pending';
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          referrer_user_id?: number;
          referred_user_id?: number;
          referral_code?: string | null;
          status?: 'completed' | 'pending';
          points_awarded?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      bot_activity_logs: {
        Row: {
          id: string;
          bot_id: string;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          action?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      bot_orders: {
        Row: {
          id: string;
          user_id: string;
          bot_plan_id: string;
          bot_id: string | null;
          amount: number;
          status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'completed';
          payment_reference: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bot_plan_id: string;
          bot_id?: string | null;
          amount: number;
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'completed';
          payment_reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bot_plan_id?: string;
          bot_id?: string | null;
          amount?: number;
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'completed';
          payment_reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'deposit' | 'withdrawal' | 'bot_purchase' | 'game_entry' | 'game_reward' | 'referral_reward';
          title: string;
          description: string | null;
          amount: number;
          is_credit: boolean;
          status: 'completed' | 'pending' | 'failed';
          reference_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'deposit' | 'withdrawal' | 'bot_purchase' | 'game_entry' | 'game_reward' | 'referral_reward';
          title: string;
          description?: string | null;
          amount: number;
          is_credit?: boolean;
          status?: 'completed' | 'pending' | 'failed';
          reference_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'deposit' | 'withdrawal' | 'bot_purchase' | 'game_entry' | 'game_reward' | 'referral_reward';
          title?: string;
          description?: string | null;
          amount?: number;
          is_credit?: boolean;
          status?: 'completed' | 'pending' | 'failed';
          reference_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      withdrawal_requests: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          payout_details: Json;
          status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
          admin_notes: string | null;
          reference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          payout_details?: Json;
          status?: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
          admin_notes?: string | null;
          reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          payout_details?: Json;
          status?: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
          admin_notes?: string | null;
          reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error' | 'bot' | 'wallet' | 'reward' | 'system';
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error' | 'bot' | 'wallet' | 'reward' | 'system';
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error' | 'bot' | 'wallet' | 'reward' | 'system';
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_user_id: string | null;
          referral_code: string;
          status: 'Completed' | 'Pending';
          reward_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_user_id?: string | null;
          referral_code: string;
          status?: 'Completed' | 'Pending';
          reward_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_user_id?: string | null;
          referral_code?: string;
          status?: 'Completed' | 'Pending';
          reward_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_bot_health_status: {
        Args: { p_bot_id: string };
        Returns: Json;
      };
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      create_broadcast_job: {
        Args: {
          p_bot_id: string;
          p_message: string;
          p_target_audience?: string;
          p_button_text?: string;
          p_button_url?: string;
        };
        Returns: Json;
      };
      create_automation_rule: {
        Args: {
          p_bot_id: string;
          p_trigger_type: string;
          p_trigger_value?: string;
          p_action_type: string;
          p_action_payload: Json;
        };
        Returns: Json;
      };
      toggle_automation_rule: {
        Args: { p_rule_id: string; p_is_active: boolean };
        Returns: Json;
      };
      update_bot_custom_menu: {
        Args: { p_bot_id: string; p_menu_items: Json };
        Returns: Json;
      };
      check_bot_feature: {
        Args: { p_bot_id: string; p_feature_key: string };
        Returns: boolean;
      };
      update_bot_settings_secure: {
        Args: { p_bot_id: string; p_settings: Json };
        Returns: Json;
      };
      record_bot_user_activity: {
        Args: {
          p_bot_id: string;
          p_telegram_user_id: number;
          p_username: string;
          p_first_name: string;
          p_last_name: string;
        };
        Returns: Json;
      };
      disconnect_bot_secure: {
        Args: { p_bot_id: string };
        Returns: Json;
      };
      create_bot_order: {
        Args: { p_bot_plan_id: string };
        Returns: Json;
      };
      process_wallet_bot_purchase: {
        Args: { p_bot_plan_id: string };
        Returns: Json;
      };
      request_withdrawal: {
        Args: { p_amount: number; p_payout_details: Json };
        Returns: Json;
      };
      create_deposit_order: {
        Args: { p_amount: number; p_payment_method?: string };
        Returns: Json;
      };
      credit_deposit_idempotent: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_payment_reference: string;
          p_gateway?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
