import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LockedFeatureCard } from '../../components/bot/LockedFeatureCard';
import { PlanUpgradeModal } from '../../components/bot/PlanUpgradeModal';
import { BroadcastDetailsModal } from '../../components/bot/BroadcastDetailsModal';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { botService } from '../../services/botService';
import { broadcastService } from '../../services/broadcastService';
import { planFeatureService, PlanSlug } from '../../services/planFeatureService';
import { Bot, BotBroadcast } from '../../types';
import {
  ChevronLeft,
  Radio,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export const BotBroadcastPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bot, setBot] = useState<Bot | null>(null);
  const [broadcasts, setBroadcasts] = useState<BotBroadcast[]>([]);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BotBroadcast | null>(null);
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'active' | 'new' | 'inactive'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const botsRes = await botService.getUserBots(user.id);
      if (botsRes.data && botsRes.data.length > 0) {
        const currentBot = botsRes.data[0];
        setBot(currentBot);

        const bcastsRes = await broadcastService.getBotBroadcasts(currentBot.id);
        setBroadcasts(bcastsRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const planSlug = (bot?.planSlug || 'basic') as PlanSlug;
  const hasBroadcast = planFeatureService.hasFeature(planSlug, 'broadcast_ui');

  const handleCreateBroadcast = async () => {
    if (!bot?.id) return;
    if (!message.trim()) {
      showToast('Broadcast message cannot be empty.', 'warning');
      return;
    }

    if (buttonUrl.trim() && !buttonUrl.trim().toLowerCase().startsWith('https://')) {
      showToast('Button URL must use secure https:// protocol.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await broadcastService.createBroadcast(
        bot.id,
        message,
        targetAudience,
        buttonText,
        buttonUrl
      );

      if (res.error) {
        showToast(res.error.message || 'Failed to send broadcast.', 'error');
        return;
      }

      showToast(`Broadcast delivered successfully to ${res.data?.sent_count || 0} subscriber(s)!`, 'success');
      setMessage('');
      setButtonText('');
      setButtonUrl('');
      setIsConfirmOpen(false);
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !bot) {
    return (
      <DashboardLayout>
        <LoadingState variant="full" message="Loading Broadcast Console..." />
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
                Broadcast Messaging Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Send push announcements to verified Telegram subscribers
              </p>
            </div>
          </div>
        </div>

        {/* Feature Lock Check */}
        {!hasBroadcast ? (
          <div className="space-y-3">
            <LockedFeatureCard
              title="Broadcast Messaging Engine"
              description="Push mass announcements to your bot subscribers with rate-limit protection and real-time delivery tracking."
              minPlanName="Pro Bot"
              minPriceDisplay="₹999"
              onUpgrade={() => setUpgradeModalOpen(true)}
            />
            {bot?.id && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 text-center space-y-2">
                <p className="text-xs font-bold text-purple-900">Already purchased Ultimate / Pro Bot?</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={async () => {
                    await botService.upgradeBotPlan(bot.id, 'ultimate');
                    showToast('Ultimate Plan activated! Broadcast engine is now unlocked.', 'success');
                    await fetchData();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold"
                >
                  ⚡ Activate Ultimate Plan (Unlock Now)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Broadcast Composer */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Compose Announcement
              </h3>

              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Announcement Message</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {message.length} / 1024 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  maxLength={1024}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your broadcast announcement here... HTML formatting supported (<b>bold</b>, <i>italic</i>)."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* Optional Inline Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <Input
                  label="Optional Button Text"
                  placeholder="e.g. Join Giveaway or Open App"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                />
                <Input
                  label="Optional Button URL (HTTPS)"
                  placeholder="https://example.com/promo"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'all', label: 'All Active Users', sub: `${bot.totalUsers} users` },
                    { key: 'new', label: 'New (Last 7D)', sub: 'Recent signups' },
                    { key: 'active', label: 'Verified Active', sub: 'Engaged users' },
                    { key: 'inactive', label: 'Inactive (30D+)', sub: 'Re-engagement' },
                  ].map((aud) => (
                    <button
                      key={aud.key}
                      type="button"
                      onClick={() => setTargetAudience(aud.key as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        targetAudience === aud.key
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{aud.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{aud.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispatch Action */}
              <Button
                fullWidth
                size="lg"
                onClick={() => setIsConfirmOpen(true)}
                disabled={!message.trim()}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Queue & Dispatch Broadcast
              </Button>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Broadcast History
              </h3>

              {broadcasts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No broadcasts sent yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {broadcasts.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          ID: {b.id.substring(0, 8)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBroadcast(b)}
                            leftIcon={<Eye className="w-3 h-3" />}
                            className="text-xs py-0.5 px-2 border-slate-200"
                          >
                            Details
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                        {b.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <span>
                          Delivered: <strong className="text-slate-800">{b.sentCount}</strong> / {b.totalRecipients}
                        </span>
                        <span>{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Details Modal */}
      <BroadcastDetailsModal
        isOpen={Boolean(selectedBroadcast)}
        onClose={() => setSelectedBroadcast(null)}
        broadcast={selectedBroadcast}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleCreateBroadcast}
        title="Confirm Broadcast Dispatch?"
        description={`You are about to queue this message for ${bot.totalUsers.toLocaleString()} recipients. Telegram rate limiters will process it in safe batches.`}
        confirmText="Yes, Send Broadcast"
        cancelText="Cancel"
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanSlug={bot.planSlug}
        targetFeatureKey="broadcast_ui"
      />
    </DashboardLayout>
  );
};
