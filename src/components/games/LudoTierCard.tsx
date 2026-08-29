import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LudoTier } from '../../types';
import { Button } from '../common/Button';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LudoTierCardProps {
  tier: LudoTier;
  selectedMode: string;
}

export const LudoTierCard: React.FC<LudoTierCardProps> = ({ tier, selectedMode }) => {
  const navigate = useNavigate();

  const handleJoinMatch = () => {
    navigate(`/games/ludo/match?entry=${tier.entryFee}&win=${tier.winReward}&mode=${selectedMode}`);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-card hover:border-blue-200 hover:shadow-card-hover transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Fee</span>
          <span className="text-sm font-black leading-none">₹{tier.entryFee}</span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm sm:text-base">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Win ₹{tier.winReward}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{tier.activePlayers} Playing Online</span>
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="primary"
        onClick={handleJoinMatch}
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        className="shrink-0 px-4"
      >
        Play ₹{tier.entryFee}
      </Button>
    </div>
  );
};
