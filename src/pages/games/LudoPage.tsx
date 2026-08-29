import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LudoTierCard } from '../../components/games/LudoTierCard';
import { mockLudoTiers } from '../../data/mockData';
import {
  Gamepad2,
  Users,
  ShieldCheck,
  Zap,
  Headphones,
  Award,
  ChevronLeft,
} from 'lucide-react';

export const LudoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'1v1' | '2v2' | '4v4'>('1v1');

  const modes = [
    { id: '1v1', label: '1 vs 1', players: '2 Players' },
    { id: '2v2', label: '2 vs 2', players: 'Team Match' },
    { id: '4v4', label: '4 vs 4', players: 'Battle Royale' },
  ];

  const trustBadges = [
    { icon: Users, label: 'Real Players' },
    { icon: ShieldCheck, label: 'Safe & Secure' },
    { icon: Zap, label: 'Instant Rewards' },
    { icon: Headphones, label: '24/7 Support' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Top bar with back button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">Ludo Game</h1>
            <p className="text-xs text-slate-500 mt-0.5">Play Ludo and win exciting rewards!</p>
          </div>
        </div>

        {/* Ludo Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full shadow-xs">
                <Award className="w-3 h-3" />
                Live Arena
              </span>
              <h2 className="text-2xl font-black tracking-tight">Classic Ludo Tournament</h2>
              <p className="text-xs text-blue-100 max-w-xs">
                Roll the dice, defeat opponents in real-time, and get automatic wallet payouts.
              </p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shrink-0 flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-amber-300 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Player Mode Selector */}
        <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Select Game Mode:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as any)}
                className={`py-2.5 px-3 rounded-2xl text-center transition-all ${
                  selectedMode === mode.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold'
                }`}
              >
                <div className="text-xs sm:text-sm">{mode.label}</div>
                <div
                  className={`text-[9px] mt-0.5 ${
                    selectedMode === mode.id ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {mode.players}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Entry Fee & Prize Tiers */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Stake & Entry
            </h3>
            <span className="text-[11px] text-blue-600 font-bold">1,240 Playing Now</span>
          </div>

          <div className="space-y-2">
            {mockLudoTiers.map((tier) => (
              <LudoTierCard key={tier.id} tier={tier} selectedMode={selectedMode} />
            ))}
          </div>
        </div>

        {/* Trust & Safety Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
