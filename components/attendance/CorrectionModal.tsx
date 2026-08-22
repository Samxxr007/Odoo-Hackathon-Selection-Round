'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any | null;
  onSuccess: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const [correctedCheckOutTime, setCorrectedCheckOutTime] = useState<string>('17:45');
  const [reason, setReason] = useState<string>('Employee forgot checkout');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Build ISO Date from date + corrected time string
      const isoCheckOut = new Date(`${record.date}T${correctedCheckOutTime}:00Z`).toISOString();

      const res = await fetch('/api/admin/attendance/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: record.attendanceId,
          checkOutTime: isoCheckOut,
          reason,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to submit correction.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-dayflow-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-dayflow-border flex items-center justify-between bg-dayflow-bg">
          <div className="flex items-center gap-2 text-dayflow-text font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Correct Missing Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dayflow-light text-dayflow-muted hover:text-dayflow-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="bg-dayflow-light/50 p-4 rounded-xl space-y-2 border border-dayflow-border text-xs">
            <div className="flex justify-between">
              <span className="text-dayflow-muted">Employee:</span>
              <span className="font-bold text-dayflow-text">{record.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dayflow-muted">Date:</span>
              <span className="font-bold text-dayflow-text">{record.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dayflow-muted">Original Check In:</span>
              <span className="font-mono font-bold text-dayflow-text">{record.checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dayflow-muted">Original Check Out:</span>
              <span className="font-mono font-bold text-amber-700">Missing (null)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dayflow-text uppercase tracking-wider mb-1">
              Corrected Check Out Time (HH:mm 24-hr)
            </label>
            <input
              type="time"
              required
              value={correctedCheckOutTime}
              onChange={(e) => setCorrectedCheckOutTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-dayflow-bg border border-dayflow-border rounded-xl text-sm font-mono text-dayflow-text focus:ring-2 focus:ring-dayflow-primary/20 focus:border-dayflow-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dayflow-text uppercase tracking-wider mb-1">
              Audit Correction Reason
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Employee forgot checkout at end of shift"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-dayflow-bg border border-dayflow-border rounded-xl text-sm text-dayflow-text placeholder-dayflow-muted focus:ring-2 focus:ring-dayflow-primary/20 focus:border-dayflow-primary focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-dayflow-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-dayflow-border text-sm font-semibold text-dayflow-text hover:bg-dayflow-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dayflow-primary hover:bg-dayflow-secondary text-white text-sm font-semibold shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Correction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
