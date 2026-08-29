import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../types';
import { Button } from '../common/Button';
import { Users, Trophy, Sparkles, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

interface GameCardProps {
  game: Game;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ game, className }) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col',
        className
      )}
    >
      {/* Game Image Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {game.badge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-md">
              <Sparkles className="w-3 h-3" />
              {game.badge}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-black/60 text-emerald-400 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {game.playerCount}
          </span>
        </div>

        {/* Title over banner */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-black text-white tracking-tight leading-tight">
            {game.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-amber-300 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{game.maxReward}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {game.description}
        </p>

        <Button
          fullWidth
          size="md"
          variant="primary"
          onClick={() => navigate(game.route)}
          rightIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Play Now
        </Button>
      </div>
    </div>
  );
};
