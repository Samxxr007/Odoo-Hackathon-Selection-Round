'use client';

import React, { useState } from 'react';
import { 
  PrivateInfo, 
  BankDetails 
} from '@/lib/types';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  CreditCard, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Globe, 
  FileCheck, 
  Edit3, 
  Check, 
  ShieldAlert 
} from 'lucide-react';

interface PrivateInfoTabProps {
  privateInfo?: PrivateInfo;
  bankDetails?: BankDetails;
  canEdit: boolean;
  canEditOrg: boolean;
  onUpdatePrivate: (updatedPrivate: { privateInfo?: PrivateInfo; bankDetails?: BankDetails }) => Promise<void>;
}

export default function PrivateInfoTab({
  privateInfo,
  bankDetails,
  canEdit,
  canEditOrg,
  onUpdatePrivate,
}: PrivateInfoTabProps) {
  // If private info is omitted by backend due to authorization
  const isRestricted = !privateInfo && !bankDetails;

  const [showAccountNo, setShowAccountNo] = useState(false);
  const [showPan, setShowPan] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [personalForm, setPersonalForm] = useState<PrivateInfo>(
    privateInfo || {
      dateOfBirth: '',
      residingAddress: '',
      nationality: 'Indian',
      personalEmail: '',
      gender: 'Male',
      maritalStatus: 'Single',
      dateOfJoining: '',
    }
  );

  const [bankForm, setBankForm] = useState<BankDetails>(
    bankDetails || {
      accountNumber: '',
      bankName: '',
      ifsc: '',
      pan: '',
      uan: '',
      employeeCode: '',
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (isRestricted) {
    return (
      <div className="bg-brand-white rounded-2xl p-12 border border-brand-border shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 text-brand-warning rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-text mb-2">Confidential Information</h3>
        <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
          Private and banking information is sensitive. Per company data privacy policy, this data is only accessible by the employee and authorized HR/Admin personnel.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-bg text-xs font-semibold text-brand-muted border border-brand-border">
          <ShieldCheck className="w-4 h-4 text-brand-sky" />
          <span>Zero Knowledge Privacy Protection Enforced</span>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onUpdatePrivate({
        privateInfo: personalForm,
        bankDetails: bankForm,
      });
      setSuccessMsg('Private & banking details updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update details');
    } finally {
      setIsSaving(false);
    }
  };

  const maskString = (str?: string, visibleDigits = 4) => {
    if (!str) return '••••••••';
    if (str.length <= visibleDigits) return str;
    const masked = '•'.repeat(str.length - visibleDigits);
    return masked + str.slice(-visibleDigits);
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-brand-tint border border-brand-sky/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary text-white rounded-xl shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-text">Encrypted Private & Banking Vault</h4>
            <p className="text-xs text-brand-muted">
              {canEditOrg
                ? 'Admin/HR Mode: Full edit authority for employee personal and official compliance identifiers.'
                : 'Employee Mode: You can edit personal contact and residence fields. Official tax & bank identifiers are verified by HR.'}
            </p>
          </div>
        </div>

        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Private Details</span>
          </button>
        )}
      </div>

      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Personal Information Edit */}
          <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
            <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={personalForm.dateOfBirth}
                  onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Gender</label>
                <select
                  value={personalForm.gender}
                  onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Marital Status</label>
                <select
                  value={personalForm.maritalStatus}
                  onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Nationality</label>
                <input
                  type="text"
                  value={personalForm.nationality}
                  onChange={(e) => setPersonalForm({ ...personalForm, nationality: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Personal Email</label>
                <input
                  type="email"
                  value={personalForm.personalEmail}
                  onChange={(e) => setPersonalForm({ ...personalForm, personalEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={personalForm.dateOfJoining}
                  onChange={(e) => setPersonalForm({ ...personalForm, dateOfJoining: e.target.value })}
                  disabled={!canEditOrg}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                    canEditOrg ? 'border-brand-border bg-white' : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
                {!canEditOrg && <p className="text-[10px] text-amber-600 mt-1">HR verified field</p>}
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-brand-text mb-1">Residing Address</label>
                <input
                  type="text"
                  value={personalForm.residingAddress}
                  onChange={(e) => setPersonalForm({ ...personalForm, residingAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Bank Details Edit */}
          <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
            <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-primary" /> Bank & Statutory Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifsc}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">PAN (Tax ID)</label>
                <input
                  type="text"
                  value={bankForm.pan}
                  onChange={(e) => setBankForm({ ...bankForm, pan: e.target.value.toUpperCase() })}
                  disabled={!canEditOrg}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none font-mono ${
                    canEditOrg ? 'border-brand-border bg-white' : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
                {!canEditOrg && <p className="text-[10px] text-amber-600 mt-1">HR verified identifier</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">UAN (Provident Fund ID)</label>
                <input
                  type="text"
                  value={bankForm.uan}
                  onChange={(e) => setBankForm({ ...bankForm, uan: e.target.value })}
                  disabled={!canEditOrg}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none font-mono ${
                    canEditOrg ? 'border-brand-border bg-white' : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
                {!canEditOrg && <p className="text-[10px] text-amber-600 mt-1">HR verified identifier</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Employee Code</label>
                <input
                  type="text"
                  value={bankForm.employeeCode}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">System generated code</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {isSaving ? <span>Saving...</span> : <span>Save Vault Information</span>}
            </button>
          </div>
        </form>
      ) : (
        /* View Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Personal Details */}
          <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
              <div className="p-2 bg-brand-tint text-brand-primary rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text">Personal Details</h3>
                <p className="text-xs text-brand-muted">Individual background & residence records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">Date of Birth</span>
                <span className="font-semibold text-brand-text flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-brand-sky" />
                  {personalForm.dateOfBirth || 'Not specified'}
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">Gender</span>
                <span className="font-semibold text-brand-text text-sm">{personalForm.gender}</span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">Marital Status</span>
                <span className="font-semibold text-brand-text text-sm">{personalForm.maritalStatus}</span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">Nationality</span>
                <span className="font-semibold text-brand-text flex items-center gap-1.5 text-sm">
                  <Globe className="w-4 h-4 text-brand-primary" />
                  {personalForm.nationality}
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border sm:col-span-2">
                <span className="text-brand-muted block font-medium mb-1">Personal Email</span>
                <span className="font-semibold text-brand-primary flex items-center gap-1.5 text-sm">
                  <Mail className="w-4 h-4 text-brand-primary" />
                  {personalForm.personalEmail}
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border sm:col-span-2">
                <span className="text-brand-muted block font-medium mb-1">Residing Address</span>
                <span className="font-semibold text-brand-text flex items-start gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{personalForm.residingAddress}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Bank & Tax Information */}
          <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text">Bank Account & Tax Identifiers</h3>
                <p className="text-xs text-brand-muted">Salary disbursement and statutory identity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">Bank Name</span>
                <span className="font-semibold text-brand-text flex items-center gap-1.5 text-sm">
                  <Building2 className="w-4 h-4 text-brand-sky" />
                  {bankForm.bankName}
                </span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">IFSC Code</span>
                <span className="font-bold text-brand-text font-mono text-sm">{bankForm.ifsc}</span>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-brand-muted block font-medium mb-1">Account Number</span>
                  <span className="font-bold text-brand-text font-mono text-sm">
                    {showAccountNo ? bankForm.accountNumber : maskString(bankForm.accountNumber)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountNo(!showAccountNo)}
                  className="p-1.5 text-brand-muted hover:text-brand-primary rounded-lg hover:bg-white transition-colors"
                  title={showAccountNo ? 'Hide account number' : 'Show account number'}
                >
                  {showAccountNo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border flex items-center justify-between">
                <div>
                  <span className="text-brand-muted block font-medium mb-1">PAN Card</span>
                  <span className="font-bold text-brand-text font-mono text-sm">
                    {showPan ? bankForm.pan : maskString(bankForm.pan, 3)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPan(!showPan)}
                  className="p-1.5 text-brand-muted hover:text-brand-primary rounded-lg hover:bg-white transition-colors"
                >
                  {showPan ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                <span className="text-brand-muted block font-medium mb-1">UAN (PF Number)</span>
                <span className="font-bold text-brand-text font-mono text-sm">{bankForm.uan}</span>
              </div>

              <div className="p-3 bg-brand-tint rounded-xl border border-brand-sky/30 sm:col-span-2">
                <span className="text-brand-primary block font-semibold mb-1">Employee Code</span>
                <span className="font-extrabold text-brand-text font-mono text-sm flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-brand-primary" />
                  {bankForm.employeeCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
