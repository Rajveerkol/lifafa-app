import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { paymentService } from '../../services/paymentService';
import { CreditCard, QrCode, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AddMoneyModal: React.FC = () => {
  const { isAddMoneyOpen, setAddMoneyOpen, refreshNotifications } = useApp();
  const { refreshWallet } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('100');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'qr'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleProceed = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 10) {
      showToast('Minimum deposit amount is ₹10.00', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await paymentService.createDepositOrder(numericAmount, selectedMethod);

      if (res.error) {
        showToast(res.error.message || 'Unable to create deposit order.', 'error');
        return;
      }

      setAddMoneyOpen(false);

      if (res.data?.providerConfigured) {
        showToast(`Payment order ${res.data.referenceId} initiated. Complete payment in gateway.`, 'info');
      } else {
        showToast(`Deposit request ${res.data?.referenceId} initiated. (Payment gateway configuration required for live processing)`, 'info');
      }

      await refreshWallet();
      await refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isAddMoneyOpen}
      onClose={() => setAddMoneyOpen(false)}
      title="Add Money to Wallet"
      subtitle="Instant & 100% Secure Deposit via UPI"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Amount Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Deposit Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
              ₹
            </span>
            <input
              type="number"
              min="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                amount === amt.toString()
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              +₹{amt}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Payment Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Instant UPI</p>
                <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('qr')}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'qr'
                  ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Dynamic QR</p>
                <p className="text-[10px] text-slate-500">Scan & Pay</p>
              </div>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-bit encrypted transactions. Server-verified credit.</span>
        </div>

        {/* CTA */}
        <Button
          fullWidth
          size="lg"
          onClick={handleProceed}
          isLoading={isProcessing}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Pay ₹{amount || 0}
        </Button>
      </div>
    </Modal>
  );
};
