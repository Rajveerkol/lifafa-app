import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Users,
  Search,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';

export const LudoMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const entryFee = searchParams.get('entry') || '10';
  const winReward = searchParams.get('win') || '18';
  const mode = searchParams.get('mode') || '1v1';

  const [searchSeconds, setSearchSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancel = () => {
    showToast('Matchmaking cancelled.', 'info');
    navigate('/games/ludo');
  };

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'You';
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Ludo Match</h1>
              <p className="text-xs text-slate-500 mt-0.5">Mode: {mode.toUpperCase()}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected Match</span>
          </div>
        </div>

        {/* Stakes Info Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Entry Fee
            </span>
            <p className="text-xl font-black text-blue-700 mt-0.5">₹{entryFee}.00</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Win Prize
            </span>
            <p className="text-xl font-black text-amber-600 mt-0.5">₹{winReward}.00</p>
          </div>
        </div>

        {/* Matchmaking Arena Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-center relative overflow-hidden">
          {/* Background subtle radar circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-64 h-64 rounded-full border-2 border-dashed border-blue-200 animate-spin duration-1000" />
          </div>

          {/* Versus Display */}
          <div className="relative z-10 grid grid-cols-3 items-center gap-2 my-4">
            {/* Player 1 (You) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500 shadow-md"
                />
                <span className="absolute -bottom-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                  You
                </span>
              </div>
              <p className="text-xs font-black text-slate-800 mt-3 truncate max-w-[90px]">
                {username}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Ready</span>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md animate-pulse">
                VS
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-blue-400 flex items-center justify-center text-blue-500 animate-pulse">
                  <Search className="w-6 h-6 animate-bounce" />
                </div>
                <span className="absolute -bottom-2 bg-slate-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                  Opponent
                </span>
              </div>
              <p className="text-xs font-black text-slate-500 mt-3">Searching...</p>
              <span className="text-[10px] text-blue-600 font-bold">Matching</span>
            </div>
          </div>

          {/* Searching Status */}
          <div className="pt-4 border-t border-slate-100 relative z-10 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <h3 className="text-sm font-black text-slate-800">
                Finding Opponent... ({searchSeconds}s)
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Connecting you with an active player in your skill tier...
            </p>
          </div>

          {/* Cancel Action */}
          <div className="mt-6 relative z-10">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={handleCancel}
              leftIcon={<X className="w-4 h-4 text-red-500" />}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel Matchmaking
            </Button>
          </div>
        </div>

        {/* Fair Play & Trust Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-700 block">Fair Play</span>
            <span className="text-[9px] text-slate-400">Anti-Cheat</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-700 block">100% Secure</span>
            <span className="text-[9px] text-slate-400">Escrow Locked</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center shadow-2xs">
            <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-slate-700 block">Real Players</span>
            <span className="text-[9px] text-slate-400">Zero Bots</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
