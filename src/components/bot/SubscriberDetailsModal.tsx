import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { BotUser } from '../../types';
import { User, ShieldCheck, Calendar, Activity, Key } from 'lucide-react';

interface SubscriberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: BotUser | null;
}

export const SubscriberDetailsModal: React.FC<SubscriberDetailsModalProps> = ({
  isOpen,
  onClose,
  subscriber,
}) => {
  if (!subscriber) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subscriber Details"
      subtitle="Public Telegram subscriber metadata"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
            {subscriber.firstName?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900">
                {subscriber.firstName || 'Telegram'} {subscriber.lastName || 'User'}
              </h4>
              <StatusBadge status={subscriber.isActive ? 'Active' : 'Inactive'} />
            </div>
            <span className="text-xs font-bold text-blue-600 font-mono">
              {subscriber.telegramUsername || 'No username set'}
            </span>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" /> Telegram User ID
            </span>
            <span className="font-mono font-bold text-slate-800">{subscriber.telegramUserId}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> First Seen
            </span>
            <span className="font-bold text-slate-700">
              {new Date(subscriber.firstSeenAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" /> Last Active
            </span>
            <span className="font-bold text-slate-700">
              {new Date(subscriber.lastSeenAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Only information provided publicly by the Telegram Bot API is recorded. Private credentials and payment data are never collected.
          </span>
        </div>

        <Button fullWidth variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
