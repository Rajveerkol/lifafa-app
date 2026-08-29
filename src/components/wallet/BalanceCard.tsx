import React from 'react';
import { Eye, EyeOff, Plus, ArrowDownToLine, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface BalanceCardProps {
  onAddMoney?: () => void;
  onWithdraw?: () => void;
  showUserPill?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  onAddMoney,
  onWithdraw,
  showUserPill = true,
}) => {
  const { balanceVisible, toggleBalanceVisible, setAddMoneyOpen, setWithdrawOpen } = useApp();
  const { wallet, profile, user } = useAuth();

  const balance = wallet ? Number(wallet.balance) : 0.00;
  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'DemoAccount';
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const handleAdd = () => {
    if (onAddMoney) onAddMoney();
    else setAddMoneyOpen(true);
  };

  const handleWithdraw = () => {
    if (onWithdraw) onWithdraw();
    else setWithdrawOpen(true);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-6 shadow-xl shadow-blue-600/20 border border-blue-400/20 overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

      {/* Top row: User Info & Pill */}
      <div className="flex items-center justify-between gap-2 relative z-10 mb-4">
        <div className="flex items-center gap-2.5">
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30 shadow-xs"
          />
          <div>
            <p className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">
              Total Balance
            </p>
            {showUserPill && (
              <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/10 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>User: {username}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleBalanceVisible}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-xs focus:outline-none"
          aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
        >
          {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="relative z-10 my-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-blue-200">₹</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {balanceVisible ? balance.toFixed(2) : '••••••'}
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10 mt-5 pt-3 border-t border-white/15">
        <Button
          variant="white"
          size="md"
          onClick={handleAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Add Money
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={handleWithdraw}
          leftIcon={<ArrowDownToLine className="w-4 h-4" />}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold"
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};
