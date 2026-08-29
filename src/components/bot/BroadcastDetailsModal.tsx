import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BotBroadcast } from '../../types';
import { Radio, CheckCircle2, AlertCircle, Clock, Send, ShieldCheck } from 'lucide-react';

interface BroadcastDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: BotBroadcast | null;
}

export const BroadcastDetailsModal: React.FC<BroadcastDetailsModalProps> = ({
  isOpen,
  onClose,
  broadcast,
}) => {
  if (!broadcast) return null;

  const completionPct =
    broadcast.totalRecipients > 0
      ? Math.round((broadcast.sentCount / broadcast.totalRecipients) * 100)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Delivery Details"
      subtitle={`Job ID: ${broadcast.id.substring(0, 8)}`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Status Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Status</span>
            <h4 className="text-sm font-black text-slate-900 uppercase mt-0.5">{broadcast.status}</h4>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-blue-600">{completionPct}%</span>
            <span className="text-[10px] text-slate-400 block">Completed</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Target</span>
            <span className="text-sm font-black text-slate-800">{broadcast.totalRecipients}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">Delivered</span>
            <span className="text-sm font-black text-emerald-700">{broadcast.sentCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 text-red-900">
            <span className="text-[10px] text-red-600 font-bold uppercase block">Failed</span>
            <span className="text-sm font-black text-red-700">{broadcast.failedCount}</span>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Message Content</span>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{broadcast.message}</p>

          {broadcast.buttonText && broadcast.buttonUrl && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600">
                {broadcast.buttonText} ({broadcast.buttonUrl})
              </span>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400">Created At</span>
            <span>{new Date(broadcast.createdAt).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400">Completed At</span>
            <span>
              {broadcast.completedAt
                ? new Date(broadcast.completedAt).toLocaleString('en-IN')
                : 'Processing...'}
            </span>
          </div>
        </div>

        <Button fullWidth variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
