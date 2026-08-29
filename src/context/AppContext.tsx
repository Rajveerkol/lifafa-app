import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, NotificationRow } from '../services/notificationService';

interface AppContextType {
  balanceVisible: boolean;
  toggleBalanceVisible: () => void;
  notifications: NotificationRow[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  isAddMoneyOpen: boolean;
  setAddMoneyOpen: (open: boolean) => void;
  isWithdrawOpen: boolean;
  setWithdrawOpen: (open: boolean) => void;
  isLogoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [isAddMoneyOpen, setAddMoneyOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (user?.id) {
      const res = await notificationService.getNotifications(user.id);
      if (res.data) setNotifications(res.data);
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleBalanceVisible = () => setBalanceVisible((prev) => !prev);

  const markNotificationRead = async (id: string) => {
    if (!user?.id) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await notificationService.markAsRead(id, user.id);
  };

  const markAllNotificationsRead = async () => {
    if (!user?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await notificationService.markAllAsRead(user.id);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        balanceVisible,
        toggleBalanceVisible,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications: fetchNotifications,
        isSidebarOpen,
        setSidebarOpen,
        isNotificationsOpen,
        setNotificationsOpen,
        isAddMoneyOpen,
        setAddMoneyOpen,
        isWithdrawOpen,
        setWithdrawOpen,
        isLogoutModalOpen,
        setLogoutModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
