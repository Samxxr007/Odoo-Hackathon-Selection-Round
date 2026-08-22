'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  X 
} from 'lucide-react';
import { validatePasswordStrength } from '@/lib/auth';

interface SecurityTabProps {
  userId: string;
  mustChangePassword?: boolean;
  currentSessionUserId: string;
}

export default function SecurityTab({
  userId,
  mustChangePassword,
  currentSessionUserId,
}: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password criteria check
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const passedCriteriaCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthBar = () => {
    if (newPassword.length === 0) return { label: 'Empty', color: 'bg-gray-200', width: 'w-0' };
    if (passedCriteriaCount <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (passedCriteriaCount <= 4) return { label: 'Good', color: 'bg-amber-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (currentPassword && newPassword === currentPassword) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setErrorMsg(strength.message || 'Password does not meet complexity criteria.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentSessionUserId,
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccessMsg(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while updating password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getStrengthBar();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* First login notice banner if mustChangePassword is true */}
      {mustChangePassword && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-3.5 shadow-sm animate-pulse">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Action Required: Change Default Password</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              This is your first login. To protect your account and company data, you must update your temporary password before accessing full features.
            </p>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Password Change Card */}
      <div className="bg-brand-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
          <div className="p-3 bg-brand-tint text-brand-primary rounded-2xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-text">Account Security & Credentials</h3>
            <p className="text-xs text-brand-muted">
              Update your account password with enterprise-grade encryption.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1.5 flex items-center justify-between">
              <span>Current Password *</span>
              <span className="text-[11px] text-brand-muted font-normal">Default demo password: Password123!</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-4 py-2.5 pr-11 text-sm border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password..."
                className="w-full px-4 py-2.5 pr-11 text-sm border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-brand-muted">Password Strength:</span>
                  <span className="font-bold text-brand-text">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-brand-text mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-4 py-2.5 pr-11 text-sm border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Requirements Checklist */}
          <div className="p-4 bg-brand-bg rounded-xl border border-brand-border text-xs space-y-2">
            <span className="font-bold text-brand-text block uppercase tracking-wider text-[11px] mb-2">
              Password Complexity Guidelines:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                <span>At least 8 characters long</span>
              </div>

              <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                <span>At least 1 uppercase letter (A-Z)</span>
              </div>

              <div className={`flex items-center gap-2 ${hasLower ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                <span>At least 1 lowercase letter (a-z)</span>
              </div>

              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                <span>At least 1 number (0-9)</span>
              </div>

              <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                <span>At least 1 special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !passwordsMatch || passedCriteriaCount < 5}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
