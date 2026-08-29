import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { SubscriberDetailsModal } from '../../components/bot/SubscriberDetailsModal';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { botService } from '../../services/botService';
import { botUserService } from '../../services/botUserService';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotUser } from '../../types';
import {
  ChevronLeft,
  Search,
  Users,
  ShieldCheck,
  Filter,
  Eye,
  UserCheck,
  Calendar,
  Sparkles,
  RotateCw,
} from 'lucide-react';

export const BotUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bot, setBot] = useState<Bot | null>(null);
  const [subscribers, setSubscribers] = useState<BotUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
  const [selectedSubscriber, setSelectedSubscriber] = useState<BotUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTargetFeature, setUpgradeTargetFeature] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        // Auto sync telegram updates on load
        await botUserService.syncSubscribersFromTelegram(currentBot.id);

        const usersRes = await botUserService.getBotUsers(
          currentBot.id,
          searchQuery,
          statusFilter,
          50
        );
        setSubscribers(usersRes.data);
        setTotalCount(usersRes.total);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    if (!bot?.id) return;
    setIsSyncing(true);
    try {
      const res = await botUserService.syncSubscribersFromTelegram(bot.id);
      if (res.success) {
        showToast(`Synced! Found ${res.total} total Telegram subscribers.`, 'success');
        await fetchData();
      } else {
        showToast(res.error || 'Sync completed.', 'info');
      }
    } catch {
      showToast('Sync failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const hasUserList = planFeatureService.hasFeature(planSlug, 'user_list');
  const hasUserSearch = planFeatureService.hasFeature(planSlug, 'user_search');

  const handleOpenUpgrade = (featureKey: string) => {
    setUpgradeTargetFeature(featureKey);
    setUpgradeModalOpen(true);
  };

  if (isLoading || !bot) {
    return (
      <DashboardLayout>
        <LoadingState variant="full" message="Loading Bot Subscribers..." />
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
              onClick={() => navigate('/bot/manage')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                Subscribers Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect registered Telegram subscribers for {bot.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              isLoading={isSyncing}
              leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
              className="font-bold border-blue-200 text-blue-700 bg-blue-50/50 shadow-2xs h-8 text-xs"
            >
              Sync Telegram
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>{totalCount.toLocaleString()} Total</span>
            </div>
          </div>
        </div>

        {/* User List Feature Guard */}
        {!hasUserList ? (
          <LockedFeatureCard
            title="Subscribers & User Management"
            description="View real-time subscriber lists, verify active status, and inspect registration dates."
            minPlanName="Starter Bot"
            minPriceDisplay="₹399"
            onUpgrade={() => handleOpenUpgrade('user_list')}
          />
        ) : (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            {hasUserSearch ? (
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-card space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                  {(['all', 'active', 'inactive', 'new'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-all ${
                        statusFilter === filter
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'new' ? 'New (7D)' : filter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
                <span className="flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> User search is locked in Starter Plan.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenUpgrade('user_search')}
                  className="text-xs font-bold border-amber-300 text-amber-900 bg-white"
                >
                  Upgrade to Growth (₹699)
                </Button>
              </div>
            )}

            {/* Subscriber List Table / Cards */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-card space-y-2">
              {subscribers.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">No subscribers found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Subscribers will appear here automatically when users launch your bot.
                  </p>
                </div>
              ) : (
                subscribers.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {sub.firstName?.[0] || 'U'}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {sub.firstName || 'Telegram'} {sub.lastName || 'User'}
                          </h4>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{sub.telegramUsername || `ID: ${sub.telegramUserId}`}</span>
                          <span>•</span>
                          <span>{new Date(sub.lastSeenAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSubscriber(sub)}
                      leftIcon={<Eye className="w-3 h-3" />}
                      className="shrink-0 text-xs border-slate-200"
                    >
                      Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subscriber Details Modal */}
      <SubscriberDetailsModal
        isOpen={Boolean(selectedSubscriber)}
        onClose={() => setSelectedSubscriber(null)}
        subscriber={selectedSubscriber}
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey={upgradeTargetFeature}
      />
    </DashboardLayout>
  );
};
