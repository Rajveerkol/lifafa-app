import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { BotSummaryCard } from '../../components/bot/BotSummaryCard';
import { StatCard } from '../../components/common/StatCard';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { botService } from '../../services/botService';
import { botAnalyticsService } from '../../services/botAnalyticsService';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotAnalytics } from '../../types';
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  Activity,
  Terminal,
  Clock,
  Sparkles,
  Info,
  UserCheck,
  Zap,
} from 'lucide-react';

export const BotAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bot, setBot] = useState<Bot | null>(null);
  const [analytics, setAnalytics] = useState<BotAnalytics | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTargetFeature, setUpgradeTargetFeature] = useState<string | undefined>(undefined);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        const analyticsRes = await botAnalyticsService.getBotAnalytics(
          currentBot.id,
          currentBot.planSlug
        );
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const hasAdvancedAnalytics = planFeatureService.hasFeature(planSlug, 'advanced_analytics');
  const hasEnhancedAnalytics = planFeatureService.hasFeature(planSlug, 'enhanced_analytics');

  const handleOpenUpgrade = (featureKey: string) => {
    setUpgradeTargetFeature(featureKey);
    setUpgradeModalOpen(true);
  };

  if (isLoading || !bot || !analytics) {
    return (
      <DashboardLayout>
        <LoadingState variant="full" message="Loading Real Bot Analytics..." />
      </DashboardLayout>
    );
  }

  const currentGrowthData = analytics.growthHistory[timeFilter] || [];
  const maxVal = Math.max(...currentGrowthData.map((d) => d.users), 1);

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
                Bot Analytics & Telemetry
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time subscriber metrics, message volume & retention
              </p>
            </div>
          </div>
        </div>

        {/* Bot Profile Card */}
        <BotSummaryCard bot={bot} />

        {/* Real Data Status Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Showing verified live subscriber data from Supabase PostgreSQL.</span>
        </div>

        {/* 4 Primary Analytics Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            icon={<Users className="w-4 h-4 text-blue-600" />}
            trend={analytics.vsLast7Days}
            isPositive
          />
          <StatCard
            title="Total Messages"
            value={analytics.totalMessages.toLocaleString()}
            icon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
            subtitle="Verified count"
          />
          <StatCard
            title="Active Plan"
            value={analytics.totalFundsUsed}
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            subtitle="Current package"
          />
          <StatCard
            title="Growth Rate"
            value={analytics.vsLast7Days}
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            trend="Active"
            isPositive
          />
        </div>

        {/* Interactive Growth Chart Section (Growth ₹699+) */}
        {hasAdvancedAnalytics ? (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Subscriber Growth Trajectory</h3>
                <p className="text-xs text-slate-500">Cumulative Telegram subscribers over time</p>
              </div>

              {/* Time Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
                {(['7d', '30d', '90d', '1y'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      timeFilter === filter
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter === '7d' ? '7D' : filter === '30d' ? '30D' : filter === '90d' ? '90D' : '1 Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1">
              {currentGrowthData.map((item, idx) => {
                const heightPercent = Math.round((item.users / maxVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.users}
                    </span>
                    <div
                      style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg group-hover:from-blue-700 group-hover:to-indigo-600 transition-all duration-300 shadow-xs"
                    />
                    <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <LockedFeatureCard
            title="Subscriber Growth Charts & Trajectory"
            description="Interactive subscriber analytics, 30-day/90-day/1-year retention curves, and daily engagement graphs."
            minPlanName="Growth Bot"
            minPriceDisplay="₹699"
            onUpgrade={() => handleOpenUpgrade('advanced_analytics')}
          />
        )}

        {/* Enhanced Engagement & Performance (Starter ₹399+) */}
        {hasEnhancedAnalytics ? (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Subscriber Segmentation & Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">New Users (7D)</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  +{analytics.newUsers.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Returning Users</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {analytics.returningUsers.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Messages Sent</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {analytics.messagesSent.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Commands Used</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {analytics.commandsUsed.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Active Sessions</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {analytics.activeSessions.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-2 text-sky-600 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Avg Daily Users</span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  {analytics.avgDailyUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <LockedFeatureCard
            title="Enhanced Engagement Telemetry"
            description="Active sessions, command breakdown, and message volume insights."
            minPlanName="Starter Bot"
            minPriceDisplay="₹399"
            onUpgrade={() => handleOpenUpgrade('enhanced_analytics')}
          />
        )}
      </div>

      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey={upgradeTargetFeature}
      />
    </DashboardLayout>
  );
};
