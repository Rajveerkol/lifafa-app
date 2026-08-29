export type PlanSlug =
  | 'basic'
  | 'starter'
  | 'growth'
  | 'pro'
  | 'premium'
  | 'business'
  | 'ultimate'
  | 'custom';

export interface PlanFeatureDefinition {
  key: string;
  name: string;
  description: string;
  minPlanSlug: PlanSlug;
  minPlanName: string;
  minPriceDisplay: string;
  minPrice: number;
}

export const PLAN_TIERS_ORDER: PlanSlug[] = [
  'basic',
  'starter',
  'growth',
  'pro',
  'premium',
  'business',
  'ultimate',
  'custom',
];

export const PLAN_DETAILS: Record<PlanSlug, { name: string; price: number; priceDisplay: string }> = {
  basic: { name: 'Basic Bot', price: 99, priceDisplay: '₹99' },
  starter: { name: 'Starter Bot', price: 399, priceDisplay: '₹399' },
  growth: { name: 'Growth Bot', price: 699, priceDisplay: '₹699' },
  pro: { name: 'Pro Bot', price: 999, priceDisplay: '₹999' },
  premium: { name: 'Premium Bot', price: 1599, priceDisplay: '₹1,599' },
  business: { name: 'Business Bot', price: 1999, priceDisplay: '₹1,999' },
  ultimate: { name: 'Ultimate Bot', price: 2999, priceDisplay: '₹2,999' },
  custom: { name: 'Custom Bot', price: 4999, priceDisplay: 'Starting ₹4,999+' },
};

export const ALL_FEATURES: PlanFeatureDefinition[] = [
  {
    key: 'bot_overview',
    name: 'Bot Overview & Basic Commands',
    description: 'Bot status, commands (/start, /help, /id) and bot connectivity.',
    minPlanSlug: 'basic',
    minPlanName: 'Basic Bot',
    minPriceDisplay: '₹99',
    minPrice: 99,
  },
  {
    key: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'Total user counts and total message telemetry (7-Day Overview).',
    minPlanSlug: 'basic',
    minPlanName: 'Basic Bot',
    minPriceDisplay: '₹99',
    minPrice: 99,
  },
  {
    key: 'developer_contact',
    name: 'Developer Mini App Customization',
    description: 'Direct access to developer for custom UI and Mini App design.',
    minPlanSlug: 'basic',
    minPlanName: 'Basic Bot',
    minPriceDisplay: '₹99',
    minPrice: 99,
  },
  {
    key: 'user_list',
    name: 'Subscribers & User List',
    description: 'View active subscribers and newly registered Telegram users.',
    minPlanSlug: 'starter',
    minPlanName: 'Starter Bot',
    minPriceDisplay: '₹399',
    minPrice: 399,
  },
  {
    key: 'enhanced_analytics',
    name: 'Enhanced User Analytics',
    description: 'Active vs New user breakdowns and message volume graphs.',
    minPlanSlug: 'starter',
    minPlanName: 'Starter Bot',
    minPriceDisplay: '₹399',
    minPrice: 399,
  },
  {
    key: 'welcome_settings',
    name: 'Custom Welcome Message',
    description: 'Configure automated greeting messages with placeholders.',
    minPlanSlug: 'starter',
    minPlanName: 'Starter Bot',
    minPriceDisplay: '₹399',
    minPrice: 399,
  },
  {
    key: 'channels_management',
    name: 'Channel Subscription Locks',
    description: 'Require users to join your official Telegram channels before using the bot.',
    minPlanSlug: 'starter',
    minPlanName: 'Starter Bot',
    minPriceDisplay: '₹399',
    minPrice: 399,
  },
  {
    key: 'advanced_analytics',
    name: 'Growth Charts & Retention',
    description: 'Interactive subscriber growth trajectory and retention metrics.',
    minPlanSlug: 'growth',
    minPlanName: 'Growth Bot',
    minPriceDisplay: '₹699',
    minPrice: 699,
  },
  {
    key: 'user_search',
    name: 'User Search & Filtering',
    description: 'Search bot users by Telegram username, name, or Telegram user ID.',
    minPlanSlug: 'growth',
    minPlanName: 'Growth Bot',
    minPriceDisplay: '₹699',
    minPrice: 699,
  },
  {
    key: 'referral_settings',
    name: 'Referral Program Setup',
    description: 'Configure referral rewards and track subscriber invitations.',
    minPlanSlug: 'growth',
    minPlanName: 'Growth Bot',
    minPriceDisplay: '₹699',
    minPrice: 699,
  },
  {
    key: 'automation_rules',
    name: 'Bot Automation Rules',
    description: 'Trigger-based automatic actions and responses (/start, channel verification).',
    minPlanSlug: 'growth',
    minPlanName: 'Growth Bot',
    minPriceDisplay: '₹699',
    minPrice: 699,
  },
  {
    key: 'activity_logs',
    name: 'Bot Activity Logs',
    description: 'Comprehensive audit log of bot events, settings modifications, and triggers.',
    minPlanSlug: 'growth',
    minPlanName: 'Growth Bot',
    minPriceDisplay: '₹699',
    minPrice: 699,
  },
  {
    key: 'custom_bot_menu',
    name: 'Custom Bot Menu Builder',
    description: 'Configure custom inline reply buttons and commands with HTTPS URLs.',
    minPlanSlug: 'pro',
    minPlanName: 'Pro Bot',
    minPriceDisplay: '₹999',
    minPrice: 999,
  },
  {
    key: 'broadcast_ui',
    name: 'Broadcast Messaging Engine',
    description: 'Queued direct push announcements to active Telegram subscribers.',
    minPlanSlug: 'pro',
    minPlanName: 'Pro Bot',
    minPriceDisplay: '₹999',
    minPrice: 999,
  },
  {
    key: 'priority_support',
    name: 'Priority Support',
    description: 'Fast technical support for bot management and webhook integration.',
    minPlanSlug: 'pro',
    minPlanName: 'Pro Bot',
    minPriceDisplay: '₹999',
    minPrice: 999,
  },
  {
    key: 'premium_tools',
    name: 'Premium User Segmentation',
    description: 'Group subscribers by engagement level and message history.',
    minPlanSlug: 'premium',
    minPlanName: 'Premium Bot',
    minPriceDisplay: '₹1,599',
    minPrice: 1599,
  },
  {
    key: 'business_reports',
    name: 'Detailed Business Reports',
    description: 'Exportable analytics, comprehensive audit reports, and health metrics.',
    minPlanSlug: 'business',
    minPlanName: 'Business Bot',
    minPriceDisplay: '₹1,999',
    minPrice: 1999,
  },
  {
    key: 'full_bot_management',
    name: 'Ultimate Bot Suite',
    description: 'All Phase 5 management & automation features unlocked without restrictions.',
    minPlanSlug: 'ultimate',
    minPlanName: 'Ultimate Bot',
    minPriceDisplay: '₹2,999',
    minPrice: 2999,
  },
  {
    key: 'custom_development',
    name: 'Custom Development & Integrations',
    description: 'Dedicated developer for custom APIs, database bridges, and custom Mini Apps.',
    minPlanSlug: 'custom',
    minPlanName: 'Custom Bot',
    minPriceDisplay: 'Starting ₹4,999+',
    minPrice: 4999,
  },
];

export const planFeatureService = {
  /**
   * Check whether a given plan slug has access to a feature key
   */
  hasFeature(planSlug: string | undefined, featureKey: string): boolean {
    const slug = (planSlug || 'basic').toLowerCase() as PlanSlug;
    const currentTierIdx = PLAN_TIERS_ORDER.indexOf(slug);
    if (currentTierIdx === -1) return false;

    const feature = ALL_FEATURES.find((f) => f.key === featureKey);
    if (!feature) return false;

    const requiredTierIdx = PLAN_TIERS_ORDER.indexOf(feature.minPlanSlug);
    return currentTierIdx >= requiredTierIdx;
  },

  /**
   * Get feature definition and minimum plan required
   */
  getFeatureDefinition(featureKey: string): PlanFeatureDefinition | undefined {
    return ALL_FEATURES.find((f) => f.key === featureKey);
  },

  /**
   * Count unlocked features for a plan
   */
  getUnlockedCount(planSlug: string | undefined): number {
    const slug = (planSlug || 'basic').toLowerCase() as PlanSlug;
    return ALL_FEATURES.filter((f) => this.hasFeature(slug, f.key)).length;
  },

  /**
   * Return all feature keys accessible to a given plan
   */
  getAvailableFeatures(planSlug: string | undefined): PlanFeatureDefinition[] {
    const slug = (planSlug || 'basic').toLowerCase() as PlanSlug;
    return ALL_FEATURES.filter((f) => this.hasFeature(slug, f.key));
  },

  /**
   * Return locked features for a given plan
   */
  getLockedFeatures(planSlug: string | undefined): PlanFeatureDefinition[] {
    const slug = (planSlug || 'basic').toLowerCase() as PlanSlug;
    return ALL_FEATURES.filter((f) => !this.hasFeature(slug, f.key));
  },
};
