'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Camera, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  currentAvatar: string;
  onClose: () => void;
  onUploadSuccess: (newAvatarUrl: string) => void;
  userId: string;
}

export default function AvatarModal({
  isOpen,
  currentAvatar,
  onClose,
  onUploadSuccess,
  userId,
}: AvatarModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2MB limit. Please choose a smaller image.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!previewUrl || previewUrl === currentAvatar) {
      onClose();
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          userId,
          imageDataUrl: previewUrl,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => {
        onUploadSuccess(data.data.avatarUrl || previewUrl);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-gradient-to-r from-brand-sky/10 to-brand-primary/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-tint text-brand-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-brand-text">Update Profile Picture</h3>
              <p className="text-xs text-brand-muted">Upload a high-resolution professional photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-brand-sky shadow-lg bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-full shadow-md transition-transform hover:scale-110 active:scale-95"
              title="Select New Image"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload helper text */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
            >
              <Upload className="w-4 h-4" />
              {selectedFile ? 'Choose a different photo' : 'Choose photo from device'}
            </button>
            <p className="text-xs text-brand-muted mt-1">Supports JPG, PNG, WEBP up to 2MB</p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="mt-4 w-full p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 w-full p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-brand-bg border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !selectedFile}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              'Save Avatar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
