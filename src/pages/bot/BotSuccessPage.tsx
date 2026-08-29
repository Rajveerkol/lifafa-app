import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import {
  CheckCircle2,
  Bot,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

export const BotSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('order_id') || 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const planName = searchParams.get('plan') || 'Telegram Bot Plan';
  const amount = searchParams.get('amount') || '99';
  const mode = searchParams.get('mode') || 'wallet';

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Success Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white shadow-xl shadow-emerald-500/20 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20 mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Order Confirmed & Activated
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bot Ready to Manage!
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto leading-relaxed">
            Your bot package has been activated. You can now configure channels, automation rules, broadcast, and custom menus.
          </p>
        </div>

        {/* Order Details Receipt Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Order Summary
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {mode === 'wallet' ? 'Paid via Wallet' : 'Order Confirmed'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Order Reference</span>
              <span className="font-mono font-bold text-slate-800">{orderId}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Bot Package</span>
              <span className="font-bold text-slate-900">{planName}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Total Paid</span>
              <span className="text-base font-black text-blue-600">₹{amount}.00</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500">Date</span>
              <span className="text-slate-700 font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Instant Management Notice */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/70 text-blue-900 space-y-1.5">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600 shrink-0" />
            <h4 className="text-xs font-bold">Bot Control Center Ready</h4>
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Head to the <strong>Manage Bot</strong> console to link your BotFather token, configure custom reply buttons, set up channel subscription locks, and send broadcasts.
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="space-y-2.5 pt-1">
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={() => navigate('/bot/manage')}
            leftIcon={<Settings className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Manage My Bot
          </Button>

          <Button
            fullWidth
            size="md"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Database Record
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> Instant Provisioning
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
};
