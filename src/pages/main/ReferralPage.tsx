import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { referralService, ReferralRow } from '../../services/referralService';
import {
  Share2,
  Copy,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  Gift,
} from 'lucide-react';

export const ReferralPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const referralCode = profile?.referral_code || (user ? `CL${user.id.substring(0, 6).toUpperCase()}` : 'CREAT8899');
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const fetchReferrals = useCallback(async () => {
    if (!user?.id) {
      setReferrals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await referralService.getReferrals(user.id);
      setReferrals(res.data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === 'Completed');
  const pendingReferrals = referrals.filter((r) => r.status === 'Pending');

  const totalEarnings = completedReferrals.reduce((sum, r) => sum + Number(r.reward_amount), 0);
  const pendingRewards = pendingReferrals.reduce((sum, r) => sum + Number(r.reward_amount), 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    showToast(`Referral code ${referralCode} copied to clipboard!`, 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied to clipboard!', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join Creatlifafa.com',
          text: `Join Creatlifafa.com using my referral code ${referralCode} and earn rewards!`,
          url: referralLink,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Refer Hero Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
              <Gift className="w-3 h-3 text-amber-300" />
              Invite & Earn
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Refer & Earn Rewards
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed max-w-xs">
              Invite your friends to Creatlifafa.com and earn ₹25 instant cash bonus for every successful referral!
            </p>
          </div>
        </div>

        {/* Referral Code & Link Box */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Your Referral Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-blue-50/70 border-2 border-dashed border-blue-300 rounded-xl px-4 py-2.5 font-mono font-black text-blue-700 text-base tracking-wider text-center select-all">
                {referralCode}
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyCode}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Your Referral Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none select-all"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleShare}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            title="Total Referrals"
            value={totalReferrals}
            icon={<Users className="w-4 h-4 text-blue-600" />}
          />
          <StatCard
            title="Total Earnings"
            value={`₹${totalEarnings}`}
            icon={<Trophy className="w-4 h-4 text-amber-500" />}
          />
          <StatCard
            title="Successful"
            value={completedReferrals.length}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          />
          <StatCard
            title="Pending Rewards"
            value={`₹${pendingRewards}`}
            icon={<Clock className="w-4 h-4 text-purple-600" />}
          />
        </div>

        {/* How It Works Steps */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            How It Works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Share Your Invite Link</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send your referral code or link to friends on Telegram, WhatsApp, or Twitter.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Friends Register & Play</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  They create their account or launch their Telegram bot.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Instant Wallet Reward</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ₹25 is automatically credited to your wallet, withdrawable directly to UPI.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Referrals
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold">
              {referrals.length} records
            </span>
          </div>

          {isLoading ? (
            <div className="py-4">
              <LoadingState variant="skeleton" />
            </div>
          ) : referrals.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No Referrals Yet"
              description="Share your referral link with friends to start earning instant wallet rewards!"
              actionText="Share Invite Link"
              onAction={handleShare}
            />
          ) : (
            <div className="space-y-2">
              {referrals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-mono">
                      Ref #{item.id.substring(0, 8)}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 block">
                      +₹{Number(item.reward_amount).toFixed(2)}
                    </span>
                    <StatusBadge status={item.status} className="mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
