import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { FooterCards } from '../../components/layout/FooterCards';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import {
  Send,
  Gamepad2,
  Share2,
  History,
  Receipt,
  Sparkles,
  Headphones,
  ChevronRight,
  ExternalLink,
  Bot,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const shortcuts = [
    {
      title: 'Play Games',
      subtitle: 'Win cash rewards',
      icon: <Gamepad2 className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-100',
      action: () => navigate('/games'),
    },
    {
      title: 'Refer & Earn',
      subtitle: 'Earn ₹25 per invite',
      icon: <Share2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-100',
      action: () => navigate('/referral'),
    },
    {
      title: 'Wallet History',
      subtitle: 'Statements & logs',
      icon: <History className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-100',
      action: () => navigate('/wallet'),
    },
    {
      title: 'Transactions',
      subtitle: 'Deposits & payouts',
      icon: <Receipt className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-100',
      action: () => navigate('/wallet'),
    },
    {
      title: 'Creat Lifafa',
      subtitle: 'Build Telegram bots',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-100',
      action: () => navigate('/create-bot'),
    },
    {
      title: 'Support',
      subtitle: '24/7 Fast assistance',
      icon: <Headphones className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-100',
      action: () => showToast('Telegram 24/7 Live Support will connect in Phase 4', 'info'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Balance Hero Card */}
        <BalanceCard />

        {/* Telegram Alert Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 p-4 text-white shadow-md shadow-blue-500/15 border border-blue-400/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Send className="w-5 h-5 text-white fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Activate Telegram Bot Alert
                </h3>
                <p className="text-xs text-blue-100 mt-0.5 leading-snug">
                  Get instant account and important updates via Telegram
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs shadow-sm transition-transform active:scale-95 uppercase tracking-wide"
            >
              <span>CLICK HERE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Shortcuts Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Actions
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold">Explore All</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {shortcuts.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs flex items-center justify-between ${item.bg}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Bot Creation Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg relative overflow-hidden border border-blue-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/20">
                <Bot className="w-3 h-3 text-blue-400" /> Telegram Bot Studio
              </span>
              <h4 className="text-sm sm:text-base font-black">Launch Your Telegram Bot</h4>
              <p className="text-[11px] text-slate-300">Plans start from just ₹99 with instant setup.</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/create-bot')}
              className="shrink-0 font-bold"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Trust Cards */}
        <FooterCards className="my-2" />
      </div>

      {/* Telegram Alert Activation Modal */}
      <Modal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        title="Telegram Bot Alerts"
        subtitle="Connect Telegram for real-time notifications"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Send className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Instant Telegram Notifications
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Connect your account to our official Telegram alert bot to receive instant alerts on wallet credits, match results, and bot actions.
            </p>
          </div>
          <Button
            fullWidth
            size="md"
            onClick={() => {
              setIsTelegramModalOpen(false);
              showToast('Telegram webhook connection will be linked in Phase 4.', 'info');
            }}
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            Connect Telegram Bot
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
