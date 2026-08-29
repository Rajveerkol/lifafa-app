import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotPlan } from '../../types';
import { Check, Sparkles, Crown, ArrowRight, Bot } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface BotPlanCardProps {
  plan: BotPlan;
}

export const BotPlanCard: React.FC<BotPlanCardProps> = ({ plan }) => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate(`/create-bot/setup?plan=${plan.id}`);
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-3xl p-5 sm:p-6 transition-all duration-200 border shadow-card',
        plan.isHighlighted
          ? 'border-2 border-blue-600 ring-4 ring-blue-100 shadow-blue-glow'
          : plan.isCustom
          ? 'border-2 border-indigo-300 bg-gradient-to-b from-white via-indigo-50/20 to-white'
          : 'border-slate-100 hover:border-blue-200 hover:shadow-card-hover'
      )}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs shadow-2xs border border-blue-100">
          {plan.numberBadge}
        </span>

        {plan.isHighlighted && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-xs">
            <Crown className="w-3 h-3" />
            Recommended
          </span>
        )}

        {plan.isCustom && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Custom Build
          </span>
        )}
      </div>

      {/* Plan Header */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          {plan.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
            {plan.priceDisplay}
          </span>
        </div>
        {plan.subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium italic">
            {plan.subtitle}
          </p>
        )}
      </div>

      {/* Feature list */}
      <div className="pt-3 pb-5 border-t border-slate-100 space-y-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Included Features:
        </p>
        <ul className="space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        fullWidth
        size="md"
        variant={plan.isHighlighted ? 'primary' : plan.isCustom ? 'primary' : 'primary'}
        onClick={handleSelectPlan}
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className={cn(
          'mt-1',
          plan.isCustom && 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
        )}
      >
        {plan.ctaText}
      </Button>
    </div>
  );
};
