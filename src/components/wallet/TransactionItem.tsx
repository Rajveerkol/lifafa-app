import React from 'react';
import { Transaction } from '../../types';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Bot, 
  Gamepad2, 
  Gift, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'bot_purchase':
        return <Bot className="w-4 h-4 text-blue-600" />;
      case 'game_entry':
      case 'game_reward':
        return <Gamepad2 className="w-4 h-4 text-indigo-600" />;
      case 'referral_reward':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <ArrowDownLeft className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {transaction.title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {transaction.createdAt}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 ml-2">
        <span
          className={cn(
            'text-xs sm:text-sm font-black tracking-tight block',
            transaction.isCredit ? 'text-emerald-600' : 'text-slate-900'
          )}
        >
          {transaction.isCredit ? '+' : '-'}₹{transaction.amount.toFixed(2)}
        </span>
        <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-slate-400 font-medium capitalize">
          {getStatusIcon()}
          <span>{transaction.status}</span>
        </div>
      </div>
    </div>
  );
};
