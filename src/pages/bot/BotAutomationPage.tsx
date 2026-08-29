import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { botService } from '../../services/botService';
import { automationService } from '../../services/automationService';
import { telegramBotEngine } from '../../services/telegramBotEngine';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotAutomationRule } from '../../types';
import {
  ChevronLeft,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  Terminal,
  MessageSquare,
  Sparkles,
  RotateCw,
} from 'lucide-react';

export const BotAutomationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bot, setBot] = useState<Bot | null>(null);
  const [rules, setRules] = useState<BotAutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New rule state
  const [triggerType, setTriggerType] = useState<
    'start_command' | 'custom_command' | 'new_subscriber' | 'channel_verified'
  >('start_command');
  const [triggerValue, setTriggerValue] = useState('/start');
  const [actionType, setActionType] = useState<'send_message' | 'show_menu' | 'record_event'>(
    'send_message'
  );
  const [actionMessage, setActionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        // Process incoming telegram commands & automations
        await telegramBotEngine.processUpdatesAndExecuteAutomations(currentBot.id);

        const rulesRes = await automationService.getRules(currentBot.id);
        setRules(rulesRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    // Auto poll every 6 seconds to execute automations in real-time
    const interval = setInterval(() => {
      if (bot?.id) {
        telegramBotEngine.processUpdatesAndExecuteAutomations(bot.id);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchData, bot?.id]);

  const handleRunEngine = async () => {
    if (!bot?.id) return;
    setIsRunningEngine(true);
    try {
      const res = await telegramBotEngine.processUpdatesAndExecuteAutomations(bot.id);
      if (res.success) {
        showToast(
          `Processed ${res.processedCount} action(s) & synced ${res.newUsersCount} subscriber(s)! Total: ${res.totalUsers}`,
          'success'
        );
        await fetchData();
      } else {
        showToast(res.error || 'Engine check complete.', 'info');
      }
    } catch {
      showToast('Engine execution error.', 'error');
    } finally {
      setIsRunningEngine(false);
    }
  };

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const hasAutomation = planFeatureService.hasFeature(planSlug, 'automation_rules');

  const handleCreateRule = async () => {
    if (!bot?.id) return;
    if (actionType === 'send_message' && !actionMessage.trim()) {
      showToast('Action message cannot be empty.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await automationService.createRule(
        bot.id,
        triggerType,
        triggerValue,
        actionType,
        { text: actionMessage.trim() }
      );

      if (res.error) {
        showToast(res.error.message || 'Failed to create rule.', 'error');
        return;
      }

      showToast('Automation rule created and activated!', 'success');
      setIsModalOpen(false);
      setActionMessage('');
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (ruleId: string, current: boolean) => {
    await automationService.toggleRule(ruleId, !current);
    showToast(`Rule ${!current ? 'activated' : 'deactivated'}.`, 'info');
    await fetchData();
  };

  const handleDelete = async (ruleId: string) => {
    await automationService.deleteRule(ruleId);
    showToast('Rule deleted.', 'info');
    await fetchData();
  };

  if (isLoading || !bot) {
    return (
      <DashboardLayout>
        <LoadingState variant="full" message="Loading Bot Automation..." />
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
                Bot Automation Rules
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure event triggers and automated actions for {bot.name}
              </p>
            </div>
          </div>

          {hasAutomation && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunEngine}
                isLoading={isRunningEngine}
                leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRunningEngine ? 'animate-spin' : ''}`} />}
                className="font-bold border-purple-200 text-purple-700 bg-purple-50/50 shadow-2xs text-xs"
              >
                Run Engine
              </Button>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Rule
              </Button>
            </div>
          )}
        </div>

        {/* Feature Lock Guard */}
        {!hasAutomation ? (
          <LockedFeatureCard
            title="Bot Automation Rules Engine"
            description="Trigger automated Telegram actions on /start, channel join verification, and command events."
            minPlanName="Growth Bot"
            minPriceDisplay="₹699"
            onUpgrade={() => setUpgradeModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card text-center text-slate-400">
                <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <h4 className="text-xs font-bold text-slate-700">No Automation Rules Configured</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Click 'Add Rule' above to create automated workflows for your Telegram bot.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl p-4 border border-slate-100 shadow-card flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase">
                          WHEN: {r.triggerType.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {r.triggerValue || ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>THEN: {r.actionType.replace('_', ' ')} ({r.actionPayload?.text || 'Payload'})</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(r.id, r.isActive)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          r.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Automation Rule"
        subtitle="Define trigger event and automatic response"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Trigger Event</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="start_command">User sends /start</option>
              <option value="channel_verified">Channel join verification confirmed</option>
              <option value="new_subscriber">New subscriber first launch</option>
              <option value="custom_command">Custom /command trigger</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="send_message">Send Automated Text Message</option>
              <option value="show_menu">Display Custom Bot Menu</option>
              <option value="record_event">Record Analytics Event</option>
            </select>
          </div>

          {actionType === 'send_message' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Message Content</label>
              <textarea
                rows={3}
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                placeholder="Welcome {first_name}! You are now verified."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          <Button fullWidth size="lg" onClick={handleCreateRule} isLoading={isSubmitting}>
            Save Automation Rule
          </Button>
        </div>
      </Modal>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey="automation_rules"
      />
    </DashboardLayout>
  );
};
