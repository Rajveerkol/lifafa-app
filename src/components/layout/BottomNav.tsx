import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Wallet, Bot, Gamepad2, User } from 'lucide-react';
import { cn } from '../../utils/cn';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home, exact: true },
    { label: 'My Wallet', path: '/wallet', icon: Wallet },
    { 
      label: 'Create Bot', 
      path: '/create-bot', 
      icon: Bot, 
      isHighlighted: true 
    },
    { label: 'Games', path: '/games', icon: Gamepad2 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <nav className="max-w-xl mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          if (item.isHighlighted) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center relative -top-3 group focus:outline-none"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 active:scale-95',
                    isActive
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/35 ring-4 ring-blue-100'
                      : 'bg-blue-600 text-white shadow-blue-500/25'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold mt-1 tracking-tight',
                    isActive ? 'text-blue-600 font-extrabold' : 'text-slate-600'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors relative focus:outline-none',
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-xl transition-all',
                  isActive ? 'bg-blue-50 text-blue-600 scale-110' : ''
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-1" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
