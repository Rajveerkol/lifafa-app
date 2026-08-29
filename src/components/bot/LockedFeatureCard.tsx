import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface LockedFeatureCardProps {
  title: string;
  description: string;
  minPlanName: string;
  minPriceDisplay: string;
  onUpgrade: () => void;
  className?: string;
}

export const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({
  title,
  description,
  minPlanName,
  minPriceDisplay,
  onUpgrade,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 shadow-2xs relative overflow-hidden flex flex-col justify-between group transition-all hover:border-blue-300 ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-bold">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Locked Feature</span>
          </div>
          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {minPlanName} ({minPriceDisplay})
          </span>
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span>{title}</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-3.5 mt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" /> Upgrade to unlock
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onUpgrade}
          rightIcon={<ArrowRight className="w-3 h-3" />}
          className="text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};
