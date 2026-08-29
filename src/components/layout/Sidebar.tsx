import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Home,
  Wallet,
  Bot,
  Gamepad2,
  Share2,
  User,
  Headphones,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../common/Logo';
import { StatusBadge } from '../common/StatusBadge';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen, setLogoutModalOpen } = useApp();
  const { profile, user } = useAuth();
  const { showToast } = useToast();

  if (!isSidebarOpen) return null;

  const closeSidebar = () => setSidebarOpen(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const displayUsername = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Member';
  const displayEmail = profile?.email || user?.email || '';
  const displayAvatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const mainLinks = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'My Wallet', path: '/wallet', icon: Wallet },
    { label: 'Create Bot', path: '/create-bot', icon: Bot },
    { label: 'Games', path: '/games', icon: Gamepad2 },
    { label: 'Refer & Earn', path: '/referral', icon: Share2 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const supportLinks = [
    {
      label: 'Support',
      icon: Headphones,
      action: () => {
        closeSidebar();
        showToast('Support chat will connect via Telegram in Phase 4', 'info');
      },
    },
    {
      label: 'Terms & Conditions',
      icon: FileText,
      action: () => {
        closeSidebar();
        showToast('Terms of Service: Creatlifafa.com standard terms apply', 'info');
      },
    },
    {
      label: 'Privacy Policy',
      icon: Shield,
      action: () => {
        closeSidebar();
        showToast('Privacy Policy: User privacy and security guaranteed', 'info');
      },
    },
  ];

  const handleLogoutClick = () => {
    closeSidebar();
    setLogoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeSidebar}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-[300px] w-full bg-white shadow-2xl flex flex-col z-10 transform transition-transform animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Logo size="sm" withLink={false} />
          <button
            onClick={closeSidebar}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100/50">
          <div className="flex items-center gap-3">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-600/20 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {displayUsername}
                </h4>
              </div>
              <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
              <div className="mt-1">
                <StatusBadge status="Trusted Member" />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            {mainLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </NavLink>
              );
            })}
          </div>

          {/* Support & Legal */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Support & Legal
            </p>
            {supportLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
