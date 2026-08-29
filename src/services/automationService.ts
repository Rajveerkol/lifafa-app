import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BotAutomationRule } from '../types';

export const automationService = {
  /**
   * Get all automation rules for a bot
   */
  async getRules(botId: string): Promise<{ data: BotAutomationRule[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: [
          {
            id: 'rule_1',
            botId,
            triggerType: 'start_command',
            triggerValue: '/start',
            actionType: 'send_message',
            actionPayload: { text: 'Welcome {first_name}! Use the menu below to explore.' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'rule_2',
            botId,
            triggerType: 'channel_verified',
            triggerValue: '@official_channel',
            actionType: 'send_message',
            actionPayload: { text: '✅ Channel verification successful! Unlocked all features.' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('bot_automation_rules')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error || !data) return { data: [], error };

    const mapped: BotAutomationRule[] = (data as any[]).map((r) => ({
      id: r.id,
      botId: r.bot_id,
      triggerType: r.trigger_type,
      triggerValue: r.trigger_value,
      actionType: r.action_type,
      actionPayload: r.action_payload || {},
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Create an automation rule via RPC
   */
  async createRule(
    botId: string,
    triggerType: 'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified',
    triggerValue: string,
    actionType: 'send_message' | 'show_menu' | 'record_event',
    actionPayload: Record<string, any>
  ): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured) return { data: { success: true }, error: null };

    try {
      const { data, error } = await (supabase.rpc as any)('create_automation_rule', {
        p_bot_id: botId,
        p_trigger_type: triggerType,
        p_trigger_value: triggerValue.trim(),
        p_action_type: actionType,
        p_action_payload: actionPayload,
      });

      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Toggle an automation rule active status
   */
  async toggleRule(ruleId: string, isActive: boolean): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) return { error: null };

    try {
      const { error } = await (supabase.rpc as any)('toggle_automation_rule', {
        p_rule_id: ruleId,
        p_is_active: isActive,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },

  /**
   * Delete an automation rule
   */
  async deleteRule(ruleId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.from('bot_automation_rules').delete().eq('id', ruleId);
    return { error };
  },
};
