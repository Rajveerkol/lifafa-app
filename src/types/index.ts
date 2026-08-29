export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'bot_purchase' 
  | 'game_entry' 
  | 'game_reward' 
  | 'referral_reward';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  avatarUrl?: string;
  isTrusted: boolean;
  role?: 'user' | 'admin' | 'super_admin';
  joinedDate: string;
}

export interface Profile extends User {
  username: string;
  referralCode: string;
  notificationsEnabled: boolean;
}

export interface Wallet {
  balance: number;
  totalWithdrawn: number;
  totalDeposited: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  amount: number;
  isCredit: boolean;
  status: TransactionStatus;
  createdAt: string;
  referenceId?: string;
}

export interface BotPlan {
  id: string;
  name: string;
  slug?: string;
  price: number | string;
  priceDisplay: string;
  numberBadge: string;
  subtitle?: string;
  features: string[];
  isHighlighted?: boolean;
  isCustom?: boolean;
  ctaText: string;
}

export interface BotOrder {
  id: string;
  userId: string;
  botPlanId: string;
  botId?: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'completed';
  paymentReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  planName?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  payoutDetails: {
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    name?: string;
  };
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  referenceId?: string;
  createdAt: string;
}

export interface MenuItem {
  name: string;
  type: 'command' | 'url';
  value: string;
}

export interface BotHealth {
  botId: string;
  name: string;
  username: string;
  telegramBotId?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  isConnected: boolean;
  webhookUrl?: string;
  lastSyncedAt?: string;
  telegramConnection: 'CONNECTED' | 'DISCONNECTED' | 'WARNING';
  webhookStatus: 'ACTIVE' | 'INACTIVE' | 'WARNING';
  databaseStatus: 'HEALTHY' | 'DEGRADED';
  subscriberTracking: 'ACTIVE' | 'INACTIVE';
  totalSubscribers: number;
  activeChannelsCount: number;
  activeAutomationsCount: number;
  pendingBroadcastsCount: number;
  totalMessagesProcessed: number;
  latencyMs?: number;
}

export interface Bot {
  id: string;
  userId?: string;
  botPlanId?: string;
  botOrderId?: string;
  name: string;
  username: string;
  telegramBotId?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  type?: string;
  planSlug?: string;
  planName?: string;
  planPriceDisplay?: string;
  isConnected?: boolean;
  avatarUrl?: string;
  qrCodeUrl?: string;
  channelsCount?: number;
  bonusAmount?: number;
  referReward?: number;
  totalUsers: number;
  totalMessages: number;
  createdOn: string;
  lastSyncedAt?: string;
}

export interface BotUser {
  id: string;
  botId: string;
  telegramUserId: number;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface BotChannel {
  id: string;
  botId: string;
  channelId: string;
  channelTitle: string;
  channelUsername?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BotSettings {
  id?: string;
  botId: string;
  welcomeMessage: string;
  welcomeEnabled: boolean;
  channelLockEnabled?: boolean;
  channelLockMessage?: string;
  customMenu?: MenuItem[];
  referralEnabled: boolean;
  referralBonus: number;
  minWithdrawal: number;
}

export interface BotBroadcast {
  id: string;
  botId: string;
  userId: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  targetAudience: 'all' | 'active' | 'new' | 'inactive';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  retryCount?: number;
  createdAt: string;
  completedAt?: string;
}

export interface BotAutomationRule {
  id: string;
  botId: string;
  triggerType: 'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified';
  triggerValue?: string;
  actionType: 'send_message' | 'show_menu' | 'record_event';
  actionPayload: Record<string, any>;
  isActive: boolean;
  totalExecutions?: number;
  successExecutions?: number;
  failedExecutions?: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BotReferral {
  id: string;
  botId: string;
  referrerUserId: number;
  referredUserId: number;
  referralCode?: string;
  status: 'completed' | 'pending';
  pointsAwarded: number;
  createdAt: string;
}

export interface BotActivityLog {
  id: string;
  botId: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  users: number;
  messages: number;
}

export interface BotAnalytics {
  totalUsers: number;
  totalMessages: number;
  totalFundsUsed: string;
  vsLast7Days: string;
  growthPercentage: number;
  newUsers: number;
  returningUsers: number;
  messagesSent: number;
  commandsUsed: number;
  activeSessions: number;
  avgDailyUsers: number;
  growthHistory: {
    '7d': ChartDataPoint[];
    '30d': ChartDataPoint[];
    '90d': ChartDataPoint[];
    '1y': ChartDataPoint[];
    '3m'?: ChartDataPoint[];
  };
}

export interface SupportFAQ {
  id: string;
  category: 'connection' | 'wallet' | 'broadcast' | 'channels' | 'miniapp' | 'general';
  question: string;
  answer: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalBots: number;
  totalPaidOrders: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  generatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'bot' | 'wallet' | 'reward' | 'system';
  isRead: boolean;
}

export interface ReferralItem {
  id: string;
  username: string;
  date: string;
  status: 'Completed' | 'Pending';
  reward: number;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  successfulReferrals: number;
  history: ReferralItem[];
}

export interface GameMode {
  id: string;
  name: string;
  players: string;
}

export interface LudoTier {
  id: string;
  entryFee: number;
  winReward: number;
  activePlayers: number;
}

export interface Game {
  id: string;
  name: string;
  tagline: string;
  description: string;
  maxReward: string;
  playerCount: string;
  badge?: string;
  image: string;
  route: string;
  isLive: boolean;
}
