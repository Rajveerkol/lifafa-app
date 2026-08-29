import React from 'react';
import { Bot } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Send, Users, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BotSummaryCardProps {
  bot: Bot;
  className?: string;
  showActions?: boolean;
}

export const BotSummaryCard: React.FC<BotSummaryCardProps> = ({
  bot,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-5 border border-slate-100 shadow-card relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={bot.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
              alt={bot.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80';
              }}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-xs"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-2.5 h-2.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">{bot.name}</h3>
              <StatusBadge status={bot.status} />
            </div>
            <p className="text-xs font-bold text-blue-600 mt-0.5">{bot.username}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{bot.type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 p-2.5 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold uppercase">Users</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-800">
            {bot.totalUsers.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase">Messages</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-800">
            {bot.totalMessages.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[10px] font-bold uppercase">Created</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-800 truncate">
            {bot.createdOn}
          </p>
        </div>
      </div>
    </div>
  );
};
