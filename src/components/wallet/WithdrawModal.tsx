import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { walletService } from '../../services/walletService';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { isWithdrawOpen, setWithdrawOpen, refreshNotifications } = useApp();
  const { wallet, refreshWallet } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBalance = wallet ? Number(wallet.balance) : 0.00;

  const handleWithdraw = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 50) {
      showToast('Minimum withdrawal amount is ₹50.00', 'warning');
      return;
    }
    if (numericAmount > currentBalance) {
      showToast('Insufficient wallet balance for this withdrawal request.', 'error');
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('Please enter a valid UPI address (e.g., name@okaxis).', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await walletService.requestWithdrawal(numericAmount, {
        upiId: upiId.trim(),
      });

      if (res.error) {
        showToast(res.error.message || 'Withdrawal request failed.', 'error');
        return;
      }

      setWithdrawOpen(false);
      setAmount('');
      showToast(`Withdrawal request #${res.data?.referenceId} submitted successfully (Pending approval).`, 'success');

      await refreshWallet();
      await refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Unable to process withdrawal request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isWithdrawOpen}
      onClose={() => setWithdrawOpen(false)}
      title="Withdraw Funds"
      subtitle={`Available Balance: ₹${currentBalance.toFixed(2)}`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <Input
          label="Withdrawal Amount (₹)"
          placeholder="Min ₹50.00"
          type="number"
          min="50"
          max={currentBalance.toString()}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          helperText="Minimum withdrawal limit: ₹50.00"
        />

        <Input
          label="UPI ID / VPA"
          placeholder="username@okhdfcbank"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          helperText="Payout will be sent directly to this UPI address"
        />

        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-[11px] leading-relaxed border border-amber-200/50">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Withdrawals are processed securely after admin verification. Funds are reserved from your wallet balance immediately upon submission.
          </span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-600 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bank-grade security & anti-fraud protected payouts.</span>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={handleWithdraw}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Submit Withdrawal Request
        </Button>
      </div>
    </Modal>
  );
};
