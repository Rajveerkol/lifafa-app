import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { botService } from '../../services/botService';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotActivityLog } from '../../types';
import {
  ChevronLeft,
  History,
  Activity,
  Calendar,
  Filter,
  CheckCircle2,
  Terminal,
  Radio,
  Zap,
} from 'lucide-react';

export const BotActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bot, setBot] = useState<Bot | null>(null);
  const [logs, setLogs] = useState<BotActivityLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        const logsRes = await botService.getBotActivityLogs(currentBot.id, filter);
        setLogs(logsRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const hasActivityLogs = planFeatureService.hasFeature(planSlug, 'activity_logs');

  if (isLoading || !bot) {
    return (
      <DashboardLayout>
        <LoadingState variant="full" message="Loading Activity Logs..." />
      </DashboardLayout>
    );
  }

  const getEventIcon = (action: string) => {
    if (action.includes('broadcast')) return <Radio className="w-4 h-4 text-sky-500" />;
    if (action.includes('automation')) return <Zap className="w-4 h-4 text-purple-500" />;
    if (action.includes('command')) return <Terminal className="w-4 h-4 text-amber-500" />;
    return <Activity className="w-4 h-4 text-blue-500" />;
  };

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
                Bot Activity Logs
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of bot operations, configuration events, and triggers
              </p>
            </div>
          </div>
        </div>

        {/* Feature Lock Check */}
        {!hasActivityLogs ? (
          <LockedFeatureCard
            title="Bot Activity Audit Trail"
            description="Inspect real-time logs of setting updates, webhook events, and subscriber actions."
            minPlanName="Growth Bot"
            minPriceDisplay="₹699"
            onUpgrade={() => setUpgradeModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { key: 'all', label: 'All Events' },
                { key: 'broadcast', label: 'Broadcasts' },
                { key: 'automation', label: 'Automation' },
                { key: 'settings', label: 'Settings' },
                { key: 'bot', label: 'System' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-card space-y-2">
              {logs.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">No activity logged for this filter</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0">
                        {getEventIcon(log.action)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {log.action.replace('_', ' ')}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          {JSON.stringify(log.details)}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey="activity_logs"
      />
    </DashboardLayout>
  );
};
