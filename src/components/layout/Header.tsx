import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { setSidebarOpen, isNotificationsOpen, setNotificationsOpen, unreadNotificationsCount } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Hamburger button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <Logo size="md" showTagline={false} />
        </div>

        {/* Right: Notifications Bell */}
        <button
          onClick={() => setNotificationsOpen(!isNotificationsOpen)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute 1.5 top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
