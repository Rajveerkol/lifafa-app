import React from 'react';
import { ShieldCheck, Gift, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FooterCardsProps {
  className?: string;
}

export const FooterCards: React.FC<FooterCardsProps> = ({ className }) => {
  const cards = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      line1: '100% Safe',
      line2: '& Secure',
      bg: 'bg-blue-50/70 border-blue-100',
    },
    {
      icon: <Gift className="w-5 h-5 text-indigo-600" />,
      line1: 'Existing',
      line2: 'Rewards',
      bg: 'bg-indigo-50/70 border-indigo-100',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-600" />,
      line1: 'Instant',
      line2: 'Payouts',
      bg: 'bg-amber-50/70 border-amber-100',
    },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-2.5 my-6', className)}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={cn(
            'flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-transform duration-150 hover:-translate-y-0.5',
            card.bg
          )}
        >
          <div className="mb-1.5 p-2 rounded-xl bg-white shadow-xs">{card.icon}</div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
            {card.line1}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
            {card.line2}
          </span>
        </div>
      ))}
    </div>
  );
};
