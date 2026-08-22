'use client';

import React, { useState } from 'react';
import { X, User, Building, MapPin, Mail, Phone, Briefcase, Calendar, ShieldAlert, Check } from 'lucide-react';
import { EmployeeProfile } from '@/lib/types';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: EmployeeProfile;
  onClose: () => void;
  onSaveSuccess: (updatedProfile: EmployeeProfile) => void;
  currentUserId: string;
}

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSaveSuccess,
  currentUserId,
}: EditProfileModalProps) {
  const canEditOrg = profile.permissions?.canEditOrg ?? false;

  const [formData, setFormData] = useState({
    name: profile.name,
    mobile: profile.mobile,
    email: profile.email,
    company: profile.company,
    department: profile.department,
    designation: profile.designation,
    manager: profile.manager,
    location: profile.location,
    dateOfJoining: profile.dateOfJoining,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({
          id: profile.id,
          ...formData,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onSaveSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-gradient-to-r from-brand-sky/10 to-brand-primary/10">
          <div>
            <h3 className="text-lg font-bold text-brand-text">Edit Profile Information</h3>
            <p className="text-xs text-brand-muted">
              {canEditOrg
                ? 'Admin/HR Mode: You can edit both personal and organizational details'
                : 'Employee Mode: You can edit personal contact fields only'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Immutable Notice */}
          <div className="bg-brand-tint border border-brand-sky/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-brand-text">
            <div className="p-1.5 bg-brand-sky/20 text-brand-primary rounded-md shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-brand-primary">Login ID: {profile.loginId}</span>
              <p className="text-brand-muted mt-0.5">
                Login ID is system-generated and permanently immutable.
              </p>
            </div>
          </div>

          {/* Personal Fields Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Managed Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Organization Details
              </h4>
              {!canEditOrg && (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Locked for regular employee
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Designation / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    disabled={!canEditOrg}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${
                      canEditOrg
                        ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                        : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Department</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!canEditOrg}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${
                      canEditOrg
                        ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                        : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Reporting Manager</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  disabled={!canEditOrg}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                    canEditOrg
                      ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Work Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!canEditOrg}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${
                      canEditOrg
                        ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                        : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Company Entity</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={!canEditOrg}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${
                    canEditOrg
                      ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Date of Joining</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    disabled={!canEditOrg}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${
                      canEditOrg
                        ? 'border-brand-border focus:ring-2 focus:ring-brand-primary bg-white'
                        : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer inside form */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
