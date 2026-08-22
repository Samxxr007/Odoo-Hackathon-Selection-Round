'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  Camera, 
  Edit3, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';
import { EmployeeProfile } from '@/lib/types';
import AvatarModal from './AvatarModal';
import EditProfileModal from './EditProfileModal';

interface ProfileHeaderProps {
  profile: EmployeeProfile;
  onProfileUpdate: (updatedProfile: EmployeeProfile) => void;
  currentUserId: string;
}

export default function ProfileHeader({
  profile,
  onProfileUpdate,
  currentUserId,
}: ProfileHeaderProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const canUploadAvatar = profile.permissions?.canUploadAvatar ?? false;
  const canEdit = (profile.permissions?.canEditPersonal || profile.permissions?.canEditOrg) ?? false;
  const isOwner = profile.permissions?.isOwner ?? false;

  return (
    <div className="bg-brand-white rounded-2xl shadow-sm border border-brand-border overflow-hidden mb-6 transition-all">
      {/* Top Banner with Vivid Sky & Primary Blue Gradient */}
      <div className="h-36 sm:h-44 bg-gradient-to-r from-brand-sky via-brand-primary to-[#0055CC] relative overflow-hidden">
        {/* Subtle decorative geometric shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-brand-sky/20 rounded-full blur-xl pointer-events-none" />

        {/* Top Badges / Status */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {profile.permissions?.canEditOrg ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-brand-primary shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
              Admin / HR Access
            </span>
          ) : isOwner ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Own Profile
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-amber-700 shadow-sm backdrop-blur-md">
              <Lock className="w-3 h-3" />
              View-Only Employee
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
          {/* Avatar and Primary Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar with Camera Trigger */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 ring-2 ring-brand-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {canUploadAvatar && (
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1.5 right-1.5 p-2 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
                  title="Update Profile Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Name, Designation & Login ID Badge */}
            <div className="pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
                  {profile.name}
                </h1>
                {/* System Generated Immutable Login ID Badge */}
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-brand-tint border border-brand-sky/40 text-brand-primary text-xs font-bold"
                  title="System-generated immutable Login ID"
                >
                  <Lock className="w-3 h-3 text-brand-primary" />
                  <span>ID: {profile.loginId}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-brand-muted mt-1 font-medium">
                <span className="text-brand-text font-semibold flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-brand-primary" />
                  {profile.designation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Building2 className="w-3.5 h-3.5 text-brand-sky" />
                  {profile.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {profile.location}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            {canEdit && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-brand-border text-xs">
          {/* Company */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
            <span className="text-brand-muted block font-medium mb-0.5">Company</span>
            <span className="font-semibold text-brand-text truncate block" title={profile.company}>
              {profile.company}
            </span>
          </div>

          {/* Manager */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
            <span className="text-brand-muted block font-medium mb-0.5">Manager</span>
            <span className="font-semibold text-brand-text flex items-center gap-1 truncate" title={profile.manager}>
              <UserCheck className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              {profile.manager}
            </span>
          </div>

          {/* Date of Joining */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
            <span className="text-brand-muted block font-medium mb-0.5">Date of Joining</span>
            <span className="font-semibold text-brand-text flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-sky shrink-0" />
              {profile.dateOfJoining}
            </span>
          </div>

          {/* Work Email */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
            <span className="text-brand-muted block font-medium mb-0.5">Work Email</span>
            <a
              href={`mailto:${profile.email}`}
              className="font-semibold text-brand-primary hover:underline flex items-center gap-1 truncate"
              title={profile.email}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {profile.email}
            </a>
          </div>

          {/* Mobile Phone */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
            <span className="text-brand-muted block font-medium mb-0.5">Contact Mobile</span>
            <a
              href={`tel:${profile.mobile}`}
              className="font-semibold text-brand-text hover:text-brand-primary flex items-center gap-1 truncate"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {profile.mobile}
            </a>
          </div>

          {/* Login ID / Immutable */}
          <div className="p-3 bg-brand-tint rounded-xl border border-brand-sky/30">
            <span className="text-brand-primary block font-semibold mb-0.5">System Login ID</span>
            <span className="font-extrabold text-brand-text tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-brand-primary" />
              {profile.loginId}
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        currentAvatar={profile.avatar}
        userId={profile.id}
        onClose={() => setIsAvatarModalOpen(false)}
        onUploadSuccess={(newAvatarUrl) => {
          onProfileUpdate({ ...profile, avatar: newAvatarUrl });
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        profile={profile}
        currentUserId={currentUserId}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={(updated) => {
          onProfileUpdate(updated);
        }}
      />
    </div>
  );
}
