import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';
import { BotPlan } from '../types';

export type BotPlanRow = Database['public']['Tables']['bot_plans']['Row'];

// Fallback constant seeded plans in case database is offline
const fallbackPaidPlans: BotPlan[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Basic Bot',
    price: 99,
    priceDisplay: '₹99',
    numberBadge: '01',
    features: [
      'Basic Telegram bot setup',
      'Basic commands',
      'Welcome message',
      'Basic buttons',
      'Basic support',
    ],
    ctaText: 'CREATE BOT ₹99',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Starter Bot',
    price: 399,
    priceDisplay: '₹399',
    numberBadge: '02',
    features: [
      'Everything in Basic',
      'Advanced commands',
      'Auto replies',
      'Custom buttons',
      'Menu system',
    ],
    ctaText: 'CREATE BOT ₹399',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Growth Bot',
    price: 699,
    priceDisplay: '₹699',
    numberBadge: '03',
    features: [
      'Everything in Starter',
      'Advanced automation',
      'Custom menus',
      'User management',
      'Inline buttons',
    ],
    ctaText: 'CREATE BOT ₹699',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Pro Bot',
    price: 999,
    priceDisplay: '₹999',
    numberBadge: '04',
    features: [
      'Everything in Growth',
      'Broadcast messaging',
      'Database integration',
      'Custom workflows',
      'Advanced automation',
    ],
    ctaText: 'CREATE BOT ₹999',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Premium Bot',
    price: 1599,
    priceDisplay: '₹1,599',
    numberBadge: '05',
    features: [
      'Everything in Pro',
      'Referral system',
      'Advanced user management',
      'Analytics',
      'Priority support',
    ],
    ctaText: 'CREATE BOT ₹1,599',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Business Bot',
    price: 1999,
    priceDisplay: '₹1,999',
    numberBadge: '06',
    features: [
      'Everything in Premium',
      'Business automation',
      'Payment integration',
      'Advanced analytics',
      'Advanced admin controls',
    ],
    ctaText: 'CREATE BOT ₹1,999',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Ultimate Bot',
    price: 2999,
    priceDisplay: '₹2,999',
    numberBadge: '07',
    isHighlighted: true,
    features: [
      'Maximum pre-built features',
      'Advanced automation',
      'Payment system',
      'Referral system',
      'Broadcast system',
      'Analytics',
      'Admin management',
      'Priority support',
    ],
    ctaText: 'CREATE BOT ₹2,999',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Custom Bot',
    price: 4999,
    priceDisplay: 'Starting ₹4,999+',
    numberBadge: '08',
    isCustom: true,
    subtitle: 'Price depends on required features.',
    features: [
      'Fully custom functionality',
      'Custom UI/UX',
      'Custom database',
      'Custom automation',
      'Payment integration',
      'API integrations',
      'Custom Telegram workflows',
      'Dedicated development',
      'Priority support',
    ],
    ctaText: 'CREATE CUSTOM BOT',
  },
];

export const botPlanService = {
  async getActiveBotPlans(): Promise<{ data: BotPlan[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: fallbackPaidPlans, error: null };
    }

    const { data, error } = await supabase
      .from('bot_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return { data: fallbackPaidPlans, error };
    }

    const mappedPlans: BotPlan[] = (data as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      priceDisplay: row.price_display,
      numberBadge: row.number_badge,
      subtitle: row.subtitle || undefined,
      features: Array.isArray(row.features) ? (row.features as string[]) : [],
      isHighlighted: Boolean(row.is_highlighted),
      isCustom: Boolean(row.is_custom),
      ctaText: row.cta_text,
    }));

    return { data: mappedPlans, error: null };
  },
};
