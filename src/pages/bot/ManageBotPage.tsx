import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { CustomBotMenuModal } from '../../components/bot/CustomBotMenuModal';
import { CustomizeMiniAppSection } from '../../components/bot/CustomizeMiniAppSection';
import { BotHealthBadge } from '../../components/bot/BotHealthBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { botService } from '../../services/botService';
import { botHealthService } from '../../services/botHealthService';
import { telegramService } from '../../services/telegramService';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotChannel, BotSettings, BotHealth } from '../../types';
import {
  ChevronLeft,
  Settings,
  PlusCircle,
  Gift,
  Share2,
  Radio,
  Trash2,
  ExternalLink,
  Users,
  MessageSquare,
  Sparkles,
  History,
  Send,
  PowerOff,
  RefreshCw,
  TrendingUp,
  Zap,
  Menu,
  ShieldCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const ManageBotPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bot, setBot] = useState<Bot | null>(null);
  const [health, setHealth] = useState<BotHealth | null>(null);
  const [channels, setChannels] = useState<BotChannel[]>([]);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'add_channel' | 'welcome_settings' | 'set_refer' | 'custom_menu' | 'reconnect' | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradeFeature, setTargetUpgradeFeature] = useState<string | undefined>(undefined);

  // Form states
  const [channelUsername, setChannelUsername] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [referralBonus, setReferralBonus] = useState('5');
  const [reconnectToken, setReconnectToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBotData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        // Fetch sub-data in parallel
        const [channelsRes, settingsRes, healthRes] = await Promise.all([
          botService.getBotChannels(currentBot.id),
          botService.getBotSettings(currentBot.id),
          botHealthService.getHealthStatus(currentBot.id),
        ]);

        setChannels(channelsRes.data);
        if (settingsRes.data) {
          setSettings(settingsRes.data);
          setWelcomeMessage(settingsRes.data.welcomeMessage || '');
          setReferralBonus(settingsRes.data.referralBonus.toString());
        }
        setHealth(healthRes.data);
      }
    } catch (err) {
      console.error('Error fetching bot data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData]);

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const unlockedCount = planFeatureService.getUnlockedCount(planSlug);

  const handleOpenUpgrade = (featureKey?: string) => {
    setTargetUpgradeFeature(featureKey);
    setUpgradeModalOpen(true);
  };

  // Channel Actions
  const handleAddChannel = async () => {
    if (!bot?.id || !channelUsername.trim()) {
      showToast('Please enter a channel username.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await botService.addBotChannel(bot.id, channelUsername.trim());
      if (res.error) {
        showToast(res.error.message || 'Failed to add channel.', 'error');
        return;
      }
      showToast('Channel added successfully to mandatory join list.', 'success');
      setActiveModal(null);
      setChannelUsername('');
      await fetchBotData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveChannel = async (id: string) => {
    if (!id) return;
    await botService.removeBotChannel(id);
    showToast('Channel removed.', 'info');
    await fetchBotData();
  };

  // Welcome Settings Action
  const handleSaveWelcome = async () => {
    if (!bot?.id) return;
    setIsSubmitting(true);
    try {
      const res = await botService.updateBotSettings(bot.id, {
        welcomeMessage,
        welcomeEnabled: true,
      });
      if (res.error) {
        showToast(res.error.message || 'Failed to update welcome settings.', 'error');
        return;
      }
      showToast('Welcome message configuration saved!', 'success');
      setActiveModal(null);
      await fetchBotData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Referral Settings Action
  const handleSaveReferral = async () => {
    if (!bot?.id) return;
    setIsSubmitting(true);
    try {
      const res = await botService.updateBotSettings(bot.id, {
        referralEnabled: true,
        referralBonus: Number(referralBonus),
      });
      if (res.error) {
        showToast(res.error.message || 'Failed to update referral configuration.', 'error');
        return;
      }
      showToast('Referral program settings saved!', 'success');
      setActiveModal(null);
      await fetchBotData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disconnect Action
  const handleDisconnect = async () => {
    if (!bot?.id) return;
    setIsDisconnectModalOpen(false);
    const res = await telegramService.disconnectBot(bot.id);
    if (res.success) {
      showToast('Bot disconnected successfully.', 'info');
      await fetchBotData();
    } else {
      showToast(res.error || 'Unable to disconnect bot.', 'error');
    }
  };

  // Reconnect Action
  const handleReconnect = async () => {
    if (!reconnectToken.trim() || !reconnectToken.includes(':')) {
      showToast('Please provide a valid BotFather token.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await telegramService.connectBot({
        botName: bot?.name || 'Telegram Bot',
        token: reconnectToken.trim(),
      });

      if (!res.success) {
        showToast(res.error || 'Reconnection failed.', 'error');
        return;
      }

      showToast('Bot reconnected and webhook updated successfully!', 'success');
      setActiveModal(null);
      setReconnectToken('');
      await fetchBotData();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !bot) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold">Loading Bot Management Console...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                Manage Telegram Bot
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure commands, automation, subscribers, and broadcast
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenUpgrade()}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            className="border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold"
          >
            Upgrade Plan
          </Button>
        </div>

        {/* Bot Profile & Plan Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={bot.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                alt={bot.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80';
                }}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-100 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{bot.name}</h3>
                  <StatusBadge status={bot.status} />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 font-mono">{bot.username}</span>
                  {bot.telegramBotId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {bot.telegramBotId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(`https://t.me/${bot.username.replace('@', '')}`, '_blank')}
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                Open Bot
              </Button>
            </div>
          </div>

          {/* Plan Status Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Active Package
              </span>
              <span className="text-xs sm:text-sm font-black text-blue-900">
                {bot.planName} ({bot.planPriceDisplay})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {unlockedCount} / 19 Features Unlocked
              </span>
            </div>
          </div>

          {/* 4 Dedicated Hub Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/bot/users')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-left flex flex-col justify-between"
            >
              <Users className="w-4 h-4 text-blue-600 mb-1" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Subscribers</span>
                <span className="text-[10px] text-slate-400 font-mono">{bot.totalUsers} users</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/bot/broadcast')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-left flex flex-col justify-between"
            >
              <Radio className="w-4 h-4 text-sky-600 mb-1" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Broadcast</span>
                <span className="text-[10px] text-slate-400">Push messaging</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/bot/automation')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-left flex flex-col justify-between"
            >
              <Zap className="w-4 h-4 text-purple-600 mb-1" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Automation</span>
                <span className="text-[10px] text-slate-400">Workflow rules</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/bot/activity')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-left flex flex-col justify-between"
            >
              <History className="w-4 h-4 text-emerald-600 mb-1" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Activity Logs</span>
                <span className="text-[10px] text-slate-400">Audit trail</span>
              </div>
            </button>
          </div>
        </div>

        {/* Visual Bot Health Section */}
        {health && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Bot System Health
                </h3>
              </div>
              <button
                onClick={() => navigate('/bot/health')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Detailed Diagnostics <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Telegram API</span>
                <BotHealthBadge status={health.telegramConnection} />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Webhook</span>
                <BotHealthBadge status={health.webhookStatus} />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Database</span>
                <BotHealthBadge status={health.databaseStatus} />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Subscribers</span>
                <BotHealthBadge status={health.subscriberTracking} />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Automation</span>
                <BotHealthBadge status="ACTIVE" />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Broadcast</span>
                <BotHealthBadge status="HEALTHY" />
              </div>
            </div>
          </div>
        )}

        {/* Real Bot Analytics Shortcut Card */}
        <div
          onClick={() => navigate('/bot/analytics')}
          className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border border-blue-900/50 flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-300">
                <Sparkles className="w-3 h-3 text-amber-300" /> Real-time Telemetry
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                View Subscriber Analytics & Insights
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Inspect growth trajectory, message volume, and active sessions.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 rotate-180 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Section: Unlocked Plan Features */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Automation & Bot Controls ({bot.planName})
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold">Configurable</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Feature 1: Channels Lock (Unlocked in Starter ₹399+) */}
            {planFeatureService.hasFeature(planSlug, 'channels_management') ? (
              <button
                onClick={() => setActiveModal('add_channel')}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-blue-200 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Channel Subscription Lock ({channels.length} linked)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Require users to join your Telegram channel before using bot.
                  </p>
                </div>
              </button>
            ) : (
              <LockedFeatureCard
                title="Channel Subscription Lock"
                description="Require users to join your Telegram channel before using bot."
                minPlanName="Starter Bot"
                minPriceDisplay="₹399"
                onUpgrade={() => handleOpenUpgrade('channels_management')}
              />
            )}

            {/* Feature 2: Welcome Message (Unlocked in Starter ₹399+) */}
            {planFeatureService.hasFeature(planSlug, 'welcome_settings') ? (
              <button
                onClick={() => setActiveModal('welcome_settings')}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-blue-200 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Welcome Message Configuration
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customize greeting messages with safe placeholders.
                  </p>
                </div>
              </button>
            ) : (
              <LockedFeatureCard
                title="Custom Welcome Message"
                description="Customize automated greeting messages sent upon user launch."
                minPlanName="Starter Bot"
                minPriceDisplay="₹399"
                onUpgrade={() => handleOpenUpgrade('welcome_settings')}
              />
            )}

            {/* Feature 3: Custom Bot Menu (Unlocked in Pro ₹999+) */}
            {planFeatureService.hasFeature(planSlug, 'custom_bot_menu') ? (
              <button
                onClick={() => setActiveModal('custom_menu')}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-blue-200 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Menu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Custom Bot Menu Builder
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure inline reply buttons with validated HTTPS URLs.
                  </p>
                </div>
              </button>
            ) : (
              <LockedFeatureCard
                title="Custom Bot Menu Builder"
                description="Configure inline reply buttons and commands with HTTPS URLs."
                minPlanName="Pro Bot"
                minPriceDisplay="₹999"
                onUpgrade={() => handleOpenUpgrade('custom_bot_menu')}
              />
            )}

            {/* Feature 4: Referral Program Setup (Unlocked in Growth ₹699+) */}
            {planFeatureService.hasFeature(planSlug, 'referral_settings') ? (
              <button
                onClick={() => setActiveModal('set_refer')}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:border-blue-200 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Referral Program Configuration
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure referral bonuses and track subscriber invite links.
                  </p>
                </div>
              </button>
            ) : (
              <LockedFeatureCard
                title="Referral Program Setup"
                description="Configure referral bonuses and subscriber invite tracking."
                minPlanName="Growth Bot"
                minPriceDisplay="₹699"
                onUpgrade={() => handleOpenUpgrade('referral_settings')}
              />
            )}
          </div>
        </div>

        {/* Section: Developer Mini App Customization */}
        <CustomizeMiniAppSection
          botUsername={bot.username}
          botId={bot.telegramBotId || bot.id.substring(0, 8)}
          orderId={bot.botOrderId || 'ORD-MAIN'}
          planName={bot.planName}
        />

        {/* Section: Bot Connectivity Controls */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Bot Connectivity & Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveModal('reconnect')}
              leftIcon={<RefreshCw className="w-4 h-4 text-blue-600" />}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            >
              Reconnect / Update Token
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDisconnectModalOpen(true)}
              leftIcon={<PowerOff className="w-4 h-4 text-amber-600" />}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 font-bold"
            >
              Disconnect Webhook
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/50 rounded-3xl p-5 border border-red-200 space-y-2">
          <div className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-4 h-4" />
            <h3 className="text-xs sm:text-sm font-black">Delete Bot</h3>
          </div>
          <p className="text-[11px] text-red-600/90 leading-relaxed">
            Deleting this bot removes the webhook from Telegram servers while safely preserving your financial transaction and purchase order history in the database.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Bot Safely
          </Button>
        </div>
      </div>

      {/* Add Channel Modal */}
      <Modal
        isOpen={activeModal === 'add_channel'}
        onClose={() => setActiveModal(null)}
        title="Channel Subscription Requirement"
        subtitle="Manage mandatory Telegram channels"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Channel Username or ID"
            placeholder="@official_channel"
            value={channelUsername}
            onChange={(e) => setChannelUsername(e.target.value)}
            helperText="Ensure your bot is added as Admin in the channel."
          />

          <Button fullWidth size="md" onClick={handleAddChannel} isLoading={isSubmitting}>
            Add Channel Requirement
          </Button>

          {/* List of currently connected channels */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Currently Linked Channels:</h4>
            {channels.length === 0 ? (
              <p className="text-xs text-slate-400">No channels linked yet.</p>
            ) : (
              channels.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{c.channelTitle}</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveChannel(c.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Welcome Message Settings Modal */}
      <Modal
        isOpen={activeModal === 'welcome_settings'}
        onClose={() => setActiveModal(null)}
        title="Welcome Message Settings"
        subtitle="Automated reply sent upon initial /start"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Welcome Greeting Text
            </label>
            <textarea
              rows={4}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              placeholder="Welcome {first_name}! You are connected to {bot_name}."
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Supported placeholders: <code>{'{first_name}'}</code>, <code>{'{last_name}'}</code>, <code>{'{username}'}</code>, <code>{'{user_id}'}</code>, <code>{'{bot_name}'}</code>
            </span>
          </div>
          <Button fullWidth size="md" onClick={handleSaveWelcome} isLoading={isSubmitting}>
            Save Welcome Message
          </Button>
        </div>
      </Modal>

      {/* Custom Bot Menu Modal */}
      {settings && (
        <CustomBotMenuModal
          isOpen={activeModal === 'custom_menu'}
          onClose={() => setActiveModal(null)}
          botId={bot.id}
          initialMenuItems={settings.customMenu || []}
          onSaved={fetchBotData}
        />
      )}

      {/* Referral Settings Modal */}
      <Modal
        isOpen={activeModal === 'set_refer'}
        onClose={() => setActiveModal(null)}
        title="Referral Program Configuration"
        subtitle="Configure rewards per invited subscriber"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Points / Reward Per Referral"
            type="number"
            value={referralBonus}
            onChange={(e) => setReferralBonus(e.target.value)}
            helperText="Credited to referrer upon new user /start."
          />
          <Button fullWidth size="md" onClick={handleSaveReferral} isLoading={isSubmitting}>
            Save Referral Rates
          </Button>
        </div>
      </Modal>

      {/* Reconnect Bot Modal */}
      <Modal
        isOpen={activeModal === 'reconnect'}
        onClose={() => setActiveModal(null)}
        title="Reconnect Telegram Bot"
        subtitle="Update token and restore webhook connection"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <Input
            label="New BotFather Token"
            placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
            value={reconnectToken}
            onChange={(e) => setReconnectToken(e.target.value)}
            helperText="Token is verified authoritatively via Telegram API and encrypted server-side."
          />
          <Button fullWidth size="lg" onClick={handleReconnect} isLoading={isSubmitting}>
            Verify & Reconnect Bot
          </Button>
        </div>
      </Modal>

      {/* Disconnect Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Bot Webhook?"
        description="This will deactivate the webhook on Telegram servers. Your bot settings and subscriber database will remain intact."
        confirmText="Yes, Disconnect"
        cancelText="Cancel"
      />

      {/* Delete Bot Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          setIsDeleteModalOpen(false);
          await telegramService.disconnectBot(bot.id);
          showToast('Bot disconnected. Order and financial records preserved.', 'info');
          navigate('/create-bot');
        }}
        title="Delete Bot Record?"
        description="Are you sure you want to remove this bot? Webhook listeners will be disabled on Telegram. Order and purchase history will be preserved."
        confirmText="Yes, Remove Bot"
        cancelText="Cancel"
        isDestructive
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey={targetUpgradeFeature}
      />
    </DashboardLayout>
  );
};
