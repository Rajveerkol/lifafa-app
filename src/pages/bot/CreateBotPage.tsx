import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { BotPlanCard } from '../../components/bot/BotPlanCard';
import { LoadingState } from '../../components/common/LoadingState';
import { botPlanService } from '../../services/botPlanService';
import { BotPlan } from '../../types';
import { Bot, Zap, ShieldCheck, Headphones, Send } from 'lucide-react';

export const CreateBotPage: React.FC = () => {
  const [plans, setPlans] = useState<BotPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    botPlanService.getActiveBotPlans().then((res) => {
      if (mounted) {
        setPlans(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Create Bot Hero */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
              <Bot className="w-3.5 h-3.5 text-sky-300" />
              Telegram Bot Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Create Your Bot
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-sm">
              Create and manage your Telegram bot easily and grow your audience with automation, custom menus, broadcasts, and monetization.
            </p>
          </div>

          {/* Decorative Telegram Icon */}
          <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pointer-events-none">
            <Send className="w-14 h-14 text-white/30" />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Fast Setup</span>
            <span className="text-[10px] text-slate-400">Ready in 2 mins</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Secure</span>
            <span className="text-[10px] text-slate-400">Encrypted Token</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">24/7 Support</span>
            <span className="text-[10px] text-slate-400">Dedicated Help</span>
          </div>
        </div>

        {/* Bot Plans Section Header */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Choose Your Bot Plan
              </h2>
              <p className="text-xs text-slate-500">
                Select the perfect package tailored for your audience size.
              </p>
            </div>
          </div>

          {/* 8 Paid Bot Plans Grid loaded from database */}
          {isLoading ? (
            <div className="py-8 space-y-4">
              <LoadingState variant="skeleton" />
              <LoadingState variant="skeleton" />
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <BotPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
