import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { TransactionItem } from '../../components/wallet/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard } from '../../components/common/StatCard';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { transactionService, TransactionRow } from '../../services/transactionService';
import { botOrderService } from '../../services/botOrderService';
import { Transaction, BotOrder } from '../../types';
import { ArrowDownLeft, ArrowUpRight, Receipt, Bot, ShoppingBag } from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { setAddMoneyOpen, setWithdrawOpen } = useApp();
  const { user, wallet } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<BotOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [mainView, setMainView] = useState<'transactions' | 'orders'>('transactions');

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [txRes, ordersRes] = await Promise.all([
        transactionService.getTransactions(user.id),
        botOrderService.getUserBotOrders(user.id),
      ]);

      const mappedTx: Transaction[] = txRes.data.map((row: TransactionRow) => ({
        id: row.id,
        type: row.type as any,
        title: row.title,
        description: row.description || '',
        amount: Number(row.amount),
        isCredit: row.is_credit,
        status: row.status as any,
        createdAt: new Date(row.created_at).toLocaleString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        referenceId: row.reference_id || undefined,
      }));

      setTransactions(mappedTx);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching wallet records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'withdrawal', label: 'Withdrawals' },
    { id: 'bot_purchase', label: 'Bot Plans' },
    { id: 'game', label: 'Games' },
    { id: 'referral_reward', label: 'Referrals' },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'game') return tx.type === 'game_entry' || tx.type === 'game_reward';
    return tx.type === activeTab;
  });

  const totalDeposited = wallet ? Number(wallet.total_deposited) : 0.00;
  const totalWithdrawn = wallet ? Number(wallet.total_withdrawn) : 0.00;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Balance Hero */}
        <BalanceCard
          onAddMoney={() => setAddMoneyOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
        />

        {/* Quick Lifetime Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            title="Total Deposited"
            value={`₹${totalDeposited.toFixed(2)}`}
            icon={<ArrowDownLeft className="w-4 h-4 text-emerald-600" />}
            subtitle="Lifetime deposits"
          />
          <StatCard
            title="Total Withdrawn"
            value={`₹${totalWithdrawn.toFixed(2)}`}
            icon={<ArrowUpRight className="w-4 h-4 text-blue-600" />}
            subtitle="Lifetime payouts"
          />
        </div>

        {/* View Switcher: Transactions vs Bot Orders */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMainView('transactions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              mainView === 'transactions'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Transaction Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setMainView('orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              mainView === 'orders'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bot Orders ({orders.length})</span>
          </button>
        </div>

        {mainView === 'transactions' ? (
          /* Transactions Section */
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Transaction History
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {filteredTransactions.length} records
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Transaction List */}
            {isLoading ? (
              <div className="py-6">
                <LoadingState variant="skeleton" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState
                icon={<Receipt className="w-6 h-6" />}
                title="No Transactions Found"
                description="You have no transactions in this category yet."
                actionText="Deposit Money"
                onAction={() => setAddMoneyOpen(true)}
              />
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Bot Orders Section */
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bot Purchase History
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {orders.length} orders
              </span>
            </div>

            {isLoading ? (
              <div className="py-6">
                <LoadingState variant="skeleton" />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<Bot className="w-6 h-6" />}
                title="No Bot Orders Yet"
                description="You have not purchased any Telegram bot plans yet."
                actionText="Explore Bot Plans"
                onAction={() => (window.location.href = '/create-bot')}
              />
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-white border border-slate-100 shadow-card flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {order.planName || 'Telegram Bot'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Order #{order.id.substring(0, 8)} •{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{order.amount.toFixed(2)}
                      </span>
                      <StatusBadge
                        status={
                          order.status === 'paid'
                            ? 'Completed'
                            : order.status === 'pending'
                            ? 'Pending'
                            : 'Inactive'
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
