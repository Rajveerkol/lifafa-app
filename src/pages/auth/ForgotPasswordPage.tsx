import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isResetMode = searchParams.get('reset') === 'true';

  const { resetPassword, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email address.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        showToast(error.message || 'Unable to send reset link.', 'error');
        return;
      }
      setIsSubmitted(true);
      showToast('Password reset link has been dispatched to your email.', 'success');
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        showToast(error.message || 'Unable to update password.', 'error');
        return;
      }
      showToast('Password updated successfully! Please login.', 'success');
      navigate('/login');
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" showTagline={false} />
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isResetMode ? 'Set New Password' : 'Forgot Password?'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {isResetMode
              ? 'Enter your new password below to secure your account.'
              : "Enter your registered email address and we'll send you a password recovery link."}
          </p>
        </div>

        {isResetMode ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="•••••••• (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>
        ) : isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">Check Your Inbox</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox or spam folder.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};
