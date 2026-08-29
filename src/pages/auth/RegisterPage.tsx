import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Logo } from '../../components/common/Logo';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Please accept the Terms of Use and Privacy Policy.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
      });

      if (error) {
        showToast(error.message || 'Registration failed. Please check your details.', 'error');
        return;
      }

      // Check if email confirmation is required by Supabase project
      if (data?.user && !data?.session) {
        setIsVerificationSent(true);
        showToast('Check your email to verify your account.', 'info');
      } else {
        showToast('Account created successfully! Welcome to Creatlifafa.com', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred during signup.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        {/* Header / Switch to Login */}
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" showTagline={false} />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Already have an account?</span>
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Login
            </Link>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Join Creatlifafa.com and start your journey today!
          </p>
        </div>

        {isVerificationSent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-950">
              Verification Link Dispatched
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We have sent a verification email to <strong>{email}</strong>. Please check your inbox and click the link to confirm your account.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Proceed to Login
              </Button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
              autoComplete="name"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
              autoComplete="tel"
            />

            <PasswordInput
              label="Password"
              placeholder="Create password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I agree to the{' '}
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Terms of Use policy displayed.');
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('Privacy Policy displayed.');
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              Register Now
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};
