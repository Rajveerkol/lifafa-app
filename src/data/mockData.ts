import { 
  User, 
  Profile, 
  Wallet, 
  Transaction, 
  BotPlan, 
  Bot, 
  BotAnalytics, 
  Notification, 
  ReferralData, 
  Game,
  LudoTier
} from '../types';

export const mockUser: Profile = {
  id: 'usr_98231',
  email: 'demo@creatifafa.com',
  fullName: 'Demo Account',
  username: 'DemoAccount',
  mobileNumber: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  isTrusted: true,
  role: 'user',
  joinedDate: 'November 2024',
  referralCode: 'CREAT8899',
  notificationsEnabled: true,
};

export const mockWallet: Wallet = {
  balance: 0.00,
  totalWithdrawn: 1450.00,
  totalDeposited: 2000.00,
  currency: '₹',
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_101',
    type: 'deposit',
    title: 'Wallet Deposit',
    description: 'UPI Deposit - Success',
    amount: 500.00,
    isCredit: true,
    status: 'completed',
    createdAt: 'Today, 02:45 PM',
    referenceId: 'UPI/241098231/CR'
  },
  {
    id: 'tx_102',
    type: 'bot_purchase',
    title: 'Starter Bot Purchase',
    description: 'Bot Setup Order #9812',
    amount: 399.00,
    isCredit: false,
    status: 'completed',
    createdAt: 'Yesterday, 11:30 AM',
    referenceId: 'ORD/BOT-399-231'
  },
  {
    id: 'tx_103',
    type: 'game_reward',
    title: 'Ludo 1v1 Victory',
    description: 'Match ID #LUDO-8834',
    amount: 90.00,
    isCredit: true,
    status: 'completed',
    createdAt: '24 Nov 2024, 08:15 PM',
    referenceId: 'GM/LUDO-8834'
  },
  {
    id: 'tx_104',
    type: 'game_entry',
    title: 'Ludo Match Entry',
    description: 'Tier 3 Entry Fee',
    amount: 50.00,
    isCredit: false,
    status: 'completed',
    createdAt: '24 Nov 2024, 08:00 PM',
    referenceId: 'GM/ENTRY-8834'
  },
  {
    id: 'tx_105',
    type: 'referral_reward',
    title: 'Referral Bonus',
    description: 'User @rahul_k joined',
    amount: 25.00,
    isCredit: true,
    status: 'completed',
    createdAt: '22 Nov 2024, 04:10 PM',
    referenceId: 'REF/BONUS-491'
  },
  {
    id: 'tx_106',
    type: 'withdrawal',
    title: 'Bank Withdrawal',
    description: 'IMPS to HDFC Bank A/c ...4819',
    amount: 600.00,
    isCredit: false,
    status: 'completed',
    createdAt: '19 Nov 2024, 01:20 PM',
    referenceId: 'WDL/99482103'
  }
];

export const mockBotPlans: BotPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic Bot',
    price: 99,
    priceDisplay: '₹99',
    numberBadge: '01',
    features: [
      'Basic Telegram bot setup',
      'Basic commands',
      'Welcome message',
      'Basic buttons',
      'Basic support'
    ],
    ctaText: 'CREATE BOT ₹99'
  },
  {
    id: 'plan_starter',
    name: 'Starter Bot',
    price: 399,
    priceDisplay: '₹399',
    numberBadge: '02',
    features: [
      'Everything in Basic',
      'Advanced commands',
      'Auto replies',
      'Custom buttons',
      'Menu system'
    ],
    ctaText: 'CREATE BOT ₹399'
  },
  {
    id: 'plan_growth',
    name: 'Growth Bot',
    price: 699,
    priceDisplay: '₹699',
    numberBadge: '03',
    features: [
      'Everything in Starter',
      'Advanced automation',
      'Custom menus',
      'User management',
      'Inline buttons'
    ],
    ctaText: 'CREATE BOT ₹699'
  },
  {
    id: 'plan_pro',
    name: 'Pro Bot',
    price: 999,
    priceDisplay: '₹999',
    numberBadge: '04',
    features: [
      'Everything in Growth',
      'Broadcast messaging',
      'Database integration',
      'Custom workflows',
      'Advanced automation'
    ],
    ctaText: 'CREATE BOT ₹999'
  },
  {
    id: 'plan_premium',
    name: 'Premium Bot',
    price: 1599,
    priceDisplay: '₹1,599',
    numberBadge: '05',
    features: [
      'Everything in Pro',
      'Referral system',
      'Advanced user management',
      'Analytics',
      'Priority support'
    ],
    ctaText: 'CREATE BOT ₹1,599'
  },
  {
    id: 'plan_business',
    name: 'Business Bot',
    price: 1999,
    priceDisplay: '₹1,999',
    numberBadge: '06',
    features: [
      'Everything in Premium',
      'Business automation',
      'Payment integration',
      'Advanced analytics',
      'Advanced admin controls'
    ],
    ctaText: 'CREATE BOT ₹1,999'
  },
  {
    id: 'plan_ultimate',
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
      'Priority support'
    ],
    ctaText: 'CREATE BOT ₹2,999'
  },
  {
    id: 'plan_custom',
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
      'Priority support'
    ],
    ctaText: 'CREATE CUSTOM BOT'
  }
];

export const mockBot: Bot = {
  id: 'BOT-99214',
  name: 'My Bot',
  username: '@my_bot',
  status: 'Active',
  type: 'Starter Bot (₹399)',
  totalUsers: 12480,
  totalMessages: 84210,
  createdOn: '15 Nov 2024',
  avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://t.me/my_bot',
  channelsCount: 4,
  bonusAmount: 10,
  referReward: 5,
};

export const mockAnalytics: BotAnalytics = {
  totalUsers: 12480,
  totalMessages: 84210,
  totalFundsUsed: '₹399.00',
  vsLast7Days: '+28.4%',
  growthPercentage: 28.4,
  newUsers: 1840,
  returningUsers: 10640,
  messagesSent: 24500,
  commandsUsed: 6210,
  activeSessions: 940,
  avgDailyUsers: 1420,
  growthHistory: {
    '7d': [
      { label: 'Mon', users: 120, messages: 1100 },
      { label: 'Tue', users: 180, messages: 1450 },
      { label: 'Wed', users: 240, messages: 2100 },
      { label: 'Thu', users: 310, messages: 2800 },
      { label: 'Fri', users: 390, messages: 3600 },
      { label: 'Sat', users: 520, messages: 4900 },
      { label: 'Sun', users: 680, messages: 5800 },
    ],
    '30d': [
      { label: 'Week 1', users: 1400, messages: 12000 },
      { label: 'Week 2', users: 2800, messages: 24000 },
      { label: 'Week 3', users: 4900, messages: 41000 },
      { label: 'Week 4', users: 8400, messages: 68000 },
    ],
    '90d': [
      { label: 'Month 1', users: 2100, messages: 18000 },
      { label: 'Month 2', users: 6400, messages: 49000 },
      { label: 'Month 3', users: 12480, messages: 84210 },
    ],
    '1y': [
      { label: 'Q1', users: 2100, messages: 18000 },
      { label: 'Q2', users: 6400, messages: 49000 },
      { label: 'Q3', users: 9800, messages: 68000 },
      { label: 'Q4', users: 12480, messages: 84210 },
    ],
    '3m': [
      { label: 'Sep', users: 2100, messages: 18000 },
      { label: 'Oct', users: 6400, messages: 49000 },
      { label: 'Nov', users: 12480, messages: 84210 },
    ]
  }
};

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    title: 'Bot Created Successfully',
    message: 'Your bot @my_bot is now active and ready to receive messages.',
    time: '10 mins ago',
    type: 'bot',
    isRead: false,
  },
  {
    id: 'notif_2',
    title: 'Wallet Updated',
    message: 'Deposit of ₹500.00 has been credited to your account.',
    time: '2 hours ago',
    type: 'wallet',
    isRead: false,
  },
  {
    id: 'notif_3',
    title: 'New Referral Reward',
    message: 'You earned ₹25.00 from @rahul_k referral signup.',
    time: 'Yesterday',
    type: 'reward',
    isRead: true,
  },
  {
    id: 'notif_4',
    title: 'Broadcast Completed',
    message: 'Your broadcast reached 8,240 active bot users.',
    time: '2 days ago',
    type: 'bot',
    isRead: true,
  },
  {
    id: 'notif_5',
    title: 'Support Update',
    message: 'Ticket #4928 has been resolved by our support team.',
    time: '3 days ago',
    type: 'system',
    isRead: true,
  }
];

export const mockReferralData: ReferralData = {
  referralCode: 'CREAT8899',
  referralLink: 'https://creatifafa.com/register?ref=CREAT8899',
  totalReferrals: 42,
  totalEarnings: 1050,
  pendingRewards: 75,
  successfulReferrals: 39,
  history: [
    { id: 'ref_1', username: 'rohit_sharma', date: 'Today, 01:15 PM', status: 'Completed', reward: 25 },
    { id: 'ref_2', username: 'vikram_singh', date: 'Yesterday, 06:40 PM', status: 'Completed', reward: 25 },
    { id: 'ref_3', username: 'anita_verma', date: '25 Nov 2024', status: 'Completed', reward: 25 },
    { id: 'ref_4', username: 'priya_m', date: '24 Nov 2024', status: 'Pending', reward: 25 },
    { id: 'ref_5', username: 'suresh_k', date: '22 Nov 2024', status: 'Completed', reward: 25 },
  ]
};

export const mockGames: Game[] = [
  {
    id: 'game_ludo',
    name: 'Ludo Game',
    tagline: 'Most Played',
    description: 'Play Ludo and win exciting cash rewards with real players online!',
    maxReward: 'Win up to ₹200',
    playerCount: '1,240 Online',
    badge: 'Most Played',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&auto=format&fit=crop&q=80',
    route: '/games/ludo',
    isLive: true
  },
  {
    id: 'game_big_small',
    name: 'Big Small Game',
    tagline: 'Fast Paced',
    description: 'Predict the outcome, multiply your balance and win instant prizes!',
    maxReward: 'Win up to ₹500',
    playerCount: '850 Online',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    route: '/games',
    isLive: true
  }
];

export const mockLudoTiers: LudoTier[] = [
  { id: 'tier_1', entryFee: 5, winReward: 8, activePlayers: 342 },
  { id: 'tier_2', entryFee: 10, winReward: 18, activePlayers: 489 },
  { id: 'tier_3', entryFee: 20, winReward: 37, activePlayers: 298 },
  { id: 'tier_4', entryFee: 50, winReward: 90, activePlayers: 184 },
  { id: 'tier_5', entryFee: 99, winReward: 181, activePlayers: 95 },
];
