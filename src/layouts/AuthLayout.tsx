import React, { ReactNode } from 'react';
import { AppLayout } from './AppLayout';
import { FooterCards } from '../components/layout/FooterCards';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 min-h-screen">
        <div className="flex-1 flex flex-col justify-center">
          {children}
          <FooterCards className="mt-8 mb-4" />
        </div>
        <footer className="text-center py-4 border-t border-slate-100 text-xs text-slate-400">
          © {new Date().getFullYear()} Creatlifafa.com. All rights reserved.
        </footer>
      </div>
    </AppLayout>
  );
};
