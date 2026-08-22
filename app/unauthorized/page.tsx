import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dayflow-bg p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dayflow-border shadow-md max-w-md w-full space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            HTTP 403 — Access Denied
          </span>
          <h1 className="text-2xl font-black text-dayflow-text tracking-tight">Unauthorized Access</h1>
          <p className="text-sm text-dayflow-muted leading-relaxed">
            You do not have permission to view Admin Attendance pages. Regular employee accounts are restricted to viewing their own attendance logs.
          </p>
        </div>

        <Link
          href="/attendance"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-dayflow-primary hover:bg-dayflow-secondary text-white font-semibold text-sm shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to My Attendance
        </Link>
      </div>
    </div>
  );
}
