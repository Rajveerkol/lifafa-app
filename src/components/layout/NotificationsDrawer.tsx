import React from 'react';
import { X, Check, Bell, Bot, Wallet, Gift, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationRow } from '../../services/notificationService';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationsCount,
  } = useApp();

  if (!isNotificationsOpen) return null;

  const closeDrawer = () => setNotificationsOpen(false);

  const getIcon = (type: NotificationRow['type']) => {
    switch (type) {
      case 'bot':
        return <Bot className="w-4 h-4 text-blue-600" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeDrawer}
      />
      <div className="fixed inset-y-0 right-0 max-w-[340px] w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {unreadNotificationsCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions bar */}
        {unreadNotificationsCount > 0 && (
          <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100/50 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Unread notifications</span>
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  n.is_read
                    ? 'bg-slate-50/70 border-slate-100 text-slate-600'
                    : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatNotificationTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
