import { SupportFAQ } from '../types';

export const SUPPORT_FAQS: SupportFAQ[] = [
  {
    id: 'faq_1',
    category: 'connection',
    question: 'How do I create and connect my Telegram Bot token?',
    answer:
      'Open Telegram, search for @BotFather, send /newbot, follow the prompts to choose a bot name and username. Copy the HTTP API token generated and paste it into the Creatlifafa Bot Setup page. Your token is verified instantly via Telegram getMe and encrypted with AES-256-GCM server-side.',
  },
  {
    id: 'faq_2',
    category: 'channels',
    question: 'How does the Channel Subscription Lock work?',
    answer:
      'Available on Starter Bot (₹399) and higher plans. Add your official Telegram channel in Manage Bot. When users interact with your bot, Creatlifafa verifies their channel membership in real-time. If they have not joined, they receive an interactive prompt to join before accessing protected commands.',
  },
  {
    id: 'faq_3',
    category: 'broadcast',
    question: 'How are broadcast messages delivered safely?',
    answer:
      'Available on Pro Bot (₹999) and higher plans. Broadcasts are queued in database jobs and dispatched by background workers in rate-limited batches (25-50 messages/sec) to avoid Telegram rate limits and temporary IP restrictions.',
  },
  {
    id: 'faq_4',
    category: 'wallet',
    question: 'How do I deposit funds and purchase bot plans?',
    answer:
      'You can add funds instantly to your Wallet using UPI, Cards, or NetBanking. Once funded, you can purchase any bot plan directly from your wallet balance with one-click atomic transactions.',
  },
  {
    id: 'faq_5',
    category: 'miniapp',
    question: 'How can I customize the Mini App UI and add custom features?',
    answer:
      'To ensure maximum platform security and stability, all Mini App UI changes and custom backend integrations are handled directly by our engineering team. Contact developer @Rajveer_0711 on Telegram with your Bot ID and requirements.',
  },
  {
    id: 'faq_6',
    category: 'general',
    question: 'Can I upgrade my bot plan later without losing data?',
    answer:
      'Yes! You can upgrade your bot plan at any time. All your subscriber lists, channel configurations, custom menus, and activity logs are preserved seamlessly.',
  },
];

export const supportService = {
  getFAQs(category?: string): SupportFAQ[] {
    if (!category || category === 'all') return SUPPORT_FAQS;
    return SUPPORT_FAQS.filter((f) => f.category === category);
  },
};
