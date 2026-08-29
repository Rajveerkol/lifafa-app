import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Bot, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLAN_DETAILS, PlanSlug, ALL_FEATURES } from '../../services/planFeatureService';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanSlug?: string;
  targetFeatureKey?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlanSlug = 'basic',
  targetFeatureKey,
}) => {
  const navigate = useNavigate();

  const currentSlug = (currentPlanSlug || 'basic').toLowerCase() as PlanSlug;
  const currentPlan = PLAN_DETAILS[currentSlug] || PLAN_DETAILS.basic;

  // Find target feature
  const targetFeature = ALL_FEATURES.find((f) => f.key === targetFeatureKey);
  const targetPlanSlug: PlanSlug = targetFeature?.minPlanSlug || 'growth';
  const targetPlan = PLAN_DETAILS[targetPlanSlug] || PLAN_DETAILS.growth;

  const handleProceed = () => {
    onClose();
    navigate(`/create-bot/setup?plan=plan_${targetPlanSlug}&slug=${targetPlanSlug}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Your Bot Plan"
      subtitle="Unlock premium automation, analytics & broadcast features"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Comparison Header */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Current Plan
            </span>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">{currentPlan.name}</h4>
            <span className="text-xs font-bold text-slate-500">{currentPlan.priceDisplay}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 text-center shadow-xs">
            <span className="text-[10px] uppercase font-black text-blue-600 block flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Recommended Upgrade
            </span>
            <h4 className="text-sm font-black text-blue-900 mt-0.5">{targetPlan.name}</h4>
            <span className="text-xs font-black text-blue-600">{targetPlan.priceDisplay}</span>
          </div>
        </div>

        {/* Feature Highlight */}
        {targetFeature && (
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1 text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Feature to Unlock: {targetFeature.name}
            </span>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              {targetFeature.description}
            </p>
          </div>
        )}

        {/* What you will unlock */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">Included with this upgrade:</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Instant feature unlock without resetting bot data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Enhanced subscriber limits & real-time telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full Telegram channels & welcome automation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Priority 24/7 technical support</span>
            </div>
          </div>
        </div>

        {/* Security & CTA */}
        <div className="pt-2 space-y-2">
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={handleProceed}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Upgrade to {targetPlan.name} ({targetPlan.priceDisplay})
          </Button>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure payment via Wallet Balance or UPI</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
