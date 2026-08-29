import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Sidebar } from '../components/layout/Sidebar';
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer';
import { AddMoneyModal } from '../components/wallet/AddMoneyModal';
import { WithdrawModal } from '../components/wallet/WithdrawModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isLogoutModalOpen, setLogoutModalOpen } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <AppLayout>
      <Header />
      <Sidebar />
      <NotificationsDrawer />
      <AddMoneyModal />
      <WithdrawModal />

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Logout from Account?"
        description="Are you sure you want to log out of Creatlifafa.com? You will need to sign in again to access your dashboard."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isDestructive
      />

      <main className="flex-1 pb-24 px-4 py-4 sm:px-5">
        {children}
      </main>

      <BottomNav />
    </AppLayout>
  );
};
