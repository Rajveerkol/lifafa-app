import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { botPlanService } from '../../services/botPlanService';
import { botOrderService } from '../../services/botOrderService';
import { telegramService } from '../../services/telegramService';
import { BotPlan } from '../../types';
import {
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';

export const BotSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId') || '';

  const { wallet, refreshWallet } = useAuth();
  const { refreshNotifications } = useApp();
  const { showToast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<BotPlan | null>(null);
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'gateway'>('wallet');
  const [botName, setBotName] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentBalance = wallet ? Number(wallet.balance) : 0.00;

  useEffect(() => {
    botPlanService.getActiveBotPlans().then((res) => {
      if (res.data && res.data.length > 0) {
        const found = res.data.find((p) => p.id === planId) || res.data[0];
        setSelectedPlan(found);
      }
    });
  }, [planId]);

  const planPrice = selectedPlan ? Number(selectedPlan.price) : 99;
  const hasSufficientWalletBalance = currentBalance >= planPrice;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!botName.trim()) {
      showToast('Please enter a name for your bot.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      let orderId = '';

      if (paymentMode === 'wallet') {
        if (!hasSufficientWalletBalance) {
          showToast(
            `Insufficient wallet balance (Available: ₹${currentBalance.toFixed(2)}, Required: ₹${planPrice}). Please add money or choose online payment.`,
            'error'
          );
          setIsProcessing(false);
          return;
        }

        const res = await botOrderService.purchaseBotWithWallet(selectedPlan.id);
        if (res.error) {
          showToast(res.error.message || 'Wallet purchase failed.', 'error');
          return;
        }
        orderId = res.data?.orderId || 'ORD-WALLET';
      } else {
        // Online Gateway Payment mode
        const res = await botOrderService.createBotOrder(selectedPlan.id);
        if (res.error) {
          showToast(res.error.message || 'Unable to create bot order.', 'error');
          return;
        }
        orderId = res.data?.order_id || 'ORD-ONLINE';
      }

      // If BotFather token was supplied, securely connect and verify bot via Edge Function
      if (telegramToken.trim()) {
        const connectRes = await telegramService.connectBot({
          orderId,
          planId: selectedPlan.id,
          botName: botName.trim(),
          token: telegramToken.trim(),
        });

        if (!connectRes.success) {
          showToast(
            connectRes.error ||
              'Payment recorded, but Telegram token verification failed. You can re-enter token in Manage Bot.',
            'warning'
          );
        } else {
          showToast('Telegram bot connected & verified successfully!', 'success');
        }
      } else {
        showToast('Bot purchase confirmed! You can connect your Telegram token anytime in Manage Bot.', 'success');
      }

      await refreshWallet();
      await refreshNotifications();

      navigate(
        `/bot/success?order_id=${orderId}&plan=${encodeURIComponent(
          selectedPlan.name
        )}&amount=${planPrice}&mode=${paymentMode}`
      );
    } catch (err: any) {
      showToast(err.message || 'Checkout failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Hero */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
              <Bot className="w-3.5 h-3.5 text-blue-200" />
              Telegram Bot Provisioning
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Configure & Purchase Bot
            </h1>
            <p className="text-xs text-blue-100">
              Complete your plan order and link your official BotFather token.
            </p>
          </div>
        </div>

        {/* Selected Plan Summary Card */}
        {selectedPlan && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Selected Package
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedPlan.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-600">
                  {selectedPlan.priceDisplay}
                </span>
                <span className="text-[10px] text-slate-400 block">One-time purchase</span>
              </div>
            </div>

            <div className="pt-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Package Includes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedPlan.features.slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        <form onSubmit={handleCheckout} className="space-y-4">
          {/* Bot Information */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Bot Information
            </h3>

            <Input
              label="Bot Display Name"
              placeholder="e.g. My Telegram Bot"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              required
            />

            <Input
              label="Bot Username (Optional)"
              placeholder="e.g. @MyAwesome_bot"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value)}
            />

            {/* Token Input */}
            <div className="pt-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Telegram BotFather Token (Optional now, can link later)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified authoritatively via Telegram getMe and encrypted server-side with AES-256-GCM.</span>
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Pay from Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMode('wallet')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMode === 'wallet'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Wallet className="w-5 h-5" />
                  </div>
                  {hasSufficientWalletBalance ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Sufficient Balance
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Low Balance
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Wallet Balance</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available: <strong className="text-slate-800">₹{currentBalance.toFixed(2)}</strong>
                </p>
              </button>

              {/* Option 2: Online Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMode('gateway')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMode === 'gateway'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Instant UPI
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Pay Online</h4>
                <p className="text-xs text-slate-500 mt-0.5">UPI, QR, Cards, NetBanking</p>
              </button>
            </div>
          </div>

          {/* Checkout CTA */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isProcessing}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {paymentMode === 'wallet'
              ? `Confirm & Pay ₹${planPrice} from Wallet`
              : `Proceed to Pay ₹${planPrice}`}
          </Button>
        </form>

        {/* Security badges */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-500">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Token Storage</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Automated Webhook Link</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
