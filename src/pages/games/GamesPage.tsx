import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { GameCard } from '../../components/games/GameCard';
import { mockGames } from '../../data/mockData';
import { Gamepad2, Sparkles, Trophy, ShieldCheck } from 'lucide-react';

export const GamesPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Games Hero */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
              <Gamepad2 className="w-3 h-3 text-amber-300" />
              Game Arena
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Play & Win Rewards
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed max-w-xs">
              Play exciting games with real players and win instant rewards directly to your wallet.
            </p>
          </div>
        </div>

        {/* Game Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Games
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              2,000+ Online
            </span>
          </div>

          <div className="space-y-4">
            {mockGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Bottom Banner: Win More, Earn More */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black">Win More, Earn More!</h4>
              <p className="text-[11px] text-amber-100">Play daily tournaments with 100% fair play guarantee.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
