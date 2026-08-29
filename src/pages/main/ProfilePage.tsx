import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { profileService } from '../../services/profileService';
import {
  Wallet,
  Gift,
  Share2,
  Receipt,
  KeyRound,
  Headphones,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Edit3,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Laptop,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, updatePassword } = useAuth();
  const { setLogoutModalOpen } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setMobileNumber(profile.mobile_number || '');
      setUsername(profile.username || '');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setMobileNumber(user.user_metadata?.mobile_number || '');
      setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!fullName.trim() || !username.trim()) {
      showToast('Full Name and Username cannot be empty.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await profileService.updateProfile(user.id, {
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        username: username.trim(),
      });

      if (error) {
        showToast(error.message || 'Failed to update profile.', 'error');
        return;
      }

      await refreshProfile();
      setIsEditProfileOpen(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        showToast(error.message || 'Failed to update password.', 'error');
        return;
      }
      setIsChangePasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const accountLinks = [
    { label: 'My Wallet', icon: Wallet, path: '/wallet' },
    { label: 'My Rewards', icon: Gift, path: '/referral' },
    { label: 'Referral Program', icon: Share2, path: '/referral' },
    { label: 'Transaction History', icon: Receipt, path: '/wallet' },
  ];

  const supportLinks = [
    {
      label: 'Change Password',
      icon: KeyRound,
      action: () => setIsChangePasswordOpen(true),
    },
    {
      label: 'Help & Support',
      icon: Headphones,
      action: () => navigate('/support'),
    },
    {
      label: 'Terms & Conditions',
      icon: FileText,
      action: () => showToast('Terms of Service: Creatlifafa.com standard terms apply', 'info'),
    },
    {
      label: 'Privacy Policy',
      icon: Shield,
      action: () => showToast('Privacy Policy: User privacy and security guaranteed', 'info'),
    },
  ];

  const displayFullName = profile?.full_name || user?.user_metadata?.full_name || 'Member';
  const displayUsername = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || 'user@creatifafa.com';
  const displayMobile = profile?.mobile_number || user?.user_metadata?.mobile_number || 'Not provided';
  const displayAvatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Profile Hero Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <img
                src={displayAvatar}
                alt={displayFullName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
              <div>
                <p className="text-xs text-blue-200 font-medium">Welcome back,</p>
                <h2 className="text-xl font-black text-white">{displayUsername}</h2>
                <div className="mt-1">
                  <StatusBadge status="Trusted Member" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all border border-white/15 focus:outline-none"
              aria-label="Edit profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Details Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{displayFullName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{displayEmail}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Mobile Number</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{displayMobile}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Active Session Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Security & Active Session
          </h3>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Current Web Session</span>
                <span className="text-[10px] text-slate-400">Authenticated via Supabase JWT</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* My Account Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            My Account
          </h3>
          <div className="divide-y divide-slate-100">
            {accountLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between py-3 px-1 hover:text-blue-600 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Account & Support Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Account & Support
          </h3>
          <div className="divide-y divide-slate-100">
            {supportLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between py-3 px-1 hover:text-blue-600 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          fullWidth
          size="lg"
          variant="outline"
          onClick={() => setLogoutModalOpen(true)}
          leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold"
        >
          Logout from Creatlifafa
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        subtitle="Update your personal information in Supabase"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          <Button fullWidth size="md" onClick={handleSaveProfile} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Password"
        subtitle="Update your account login password"
        maxWidth="sm"
      >
        <div className="space-y-3 pt-1">
          <PasswordInput
            label="New Password"
            placeholder="•••••••• (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            fullWidth
            size="md"
            onClick={handleChangePassword}
            isLoading={isSaving}
            className="mt-2"
          >
            Update Password
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
