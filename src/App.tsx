import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingState } from './components/common/LoadingState';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Pages
import { DashboardPage } from './pages/main/DashboardPage';
import { ProfilePage } from './pages/main/ProfilePage';
import { WalletPage } from './pages/main/WalletPage';
import { ReferralPage } from './pages/main/ReferralPage';
import { SupportPage } from './pages/main/SupportPage';

// Games Pages
import { GamesPage } from './pages/games/GamesPage';
import { LudoPage } from './pages/games/LudoPage';
import { LudoMatchPage } from './pages/games/LudoMatchPage';

// Bot Pages
import { CreateBotPage } from './pages/bot/CreateBotPage';
import { BotSetupPage } from './pages/bot/BotSetupPage';
import { BotSuccessPage } from './pages/bot/BotSuccessPage';
import { BotAnalyticsPage } from './pages/bot/BotAnalyticsPage';
import { ManageBotPage } from './pages/bot/ManageBotPage';
import { BotUsersPage } from './pages/bot/BotUsersPage';
import { BotBroadcastPage } from './pages/bot/BotBroadcastPage';
import { BotAutomationPage } from './pages/bot/BotAutomationPage';
import { BotActivityPage } from './pages/bot/BotActivityPage';
import { BotHealthPage } from './pages/bot/BotHealthPage';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingState variant="full" message="Loading Creatlifafa.com..." />}>
              <Routes>
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected Main Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <WalletPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/referral"
                  element={
                    <ProtectedRoute>
                      <ReferralPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Games Routes */}
                <Route
                  path="/games"
                  element={
                    <ProtectedRoute>
                      <GamesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/games/ludo"
                  element={
                    <ProtectedRoute>
                      <LudoPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/games/ludo/match"
                  element={
                    <ProtectedRoute>
                      <LudoMatchPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Bot Routes */}
                <Route
                  path="/create-bot"
                  element={
                    <ProtectedRoute>
                      <CreateBotPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-bot/setup"
                  element={
                    <ProtectedRoute>
                      <BotSetupPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/success"
                  element={
                    <ProtectedRoute>
                      <BotSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/analytics"
                  element={
                    <ProtectedRoute>
                      <BotAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/manage"
                  element={
                    <ProtectedRoute>
                      <ManageBotPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/health"
                  element={
                    <ProtectedRoute>
                      <BotHealthPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/users"
                  element={
                    <ProtectedRoute>
                      <BotUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/broadcast"
                  element={
                    <ProtectedRoute>
                      <BotBroadcastPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/automation"
                  element={
                    <ProtectedRoute>
                      <BotAutomationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bot/activity"
                  element={
                    <ProtectedRoute>
                      <BotActivityPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
