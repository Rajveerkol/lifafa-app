import React, { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100/70 flex justify-center selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-lg bg-white min-h-screen flex flex-col shadow-xl sm:border-x sm:border-slate-200 relative">
        {children}
      </div>
    </div>
  );
};
