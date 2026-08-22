import Link from 'next/link';
import { Clock, ShieldCheck, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dayflow-bg">
      {/* Top Banner */}
      <header className="bg-white border-b border-dayflow-border py-4 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dayflow-primary via-dayflow-secondary to-dayflow-sky flex items-center justify-center text-white font-black text-xl shadow-sm">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-dayflow-text">DAYFLOW</span>
              <span className="text-[10px] font-bold text-dayflow-sky tracking-wider uppercase">Attendance & Work-Time Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/attendance"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-dayflow-light text-dayflow-primary hover:bg-blue-100 transition-colors"
            >
              Employee Portal
            </Link>
            <Link
              href="/admin/attendance"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-dayflow-primary text-white hover:bg-dayflow-secondary transition-colors"
            >
              Admin HR Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-dayflow-light text-dayflow-primary border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Production Ready Module
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-dayflow-text tracking-tight">
            Dayflow Attendance & Work-Time Management
          </h1>
          <p className="text-lg text-dayflow-muted max-w-2xl mx-auto">
            Complete database-backed attendance lifecycle, timezone-safe check-in/out, daily status engine, monthly summaries, payroll helper, and HR administration.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-dayflow-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-dayflow-primary flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-dayflow-text">Employee Attendance Portal</h2>
              <p className="text-sm text-dayflow-muted leading-relaxed">
                Check in/out with real-time timers, view monthly attendance history, summary statistics (Present, Leave, Absent, Half Day), and track extra hours worked.
              </p>
            </div>

            <Link
              href="/attendance"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-dayflow-primary hover:bg-dayflow-secondary text-white font-semibold shadow-sm transition-all"
            >
              <span>Go to Employee Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-dayflow-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-dayflow-text">Admin & HR Management</h2>
              <p className="text-sm text-dayflow-muted leading-relaxed">
                Filter daily company attendance by date or status, search employee records, review late arrivals, and perform audited corrections for missing checkouts.
              </p>
            </div>

            <Link
              href="/admin/attendance"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-dayflow-text hover:bg-slate-800 text-white font-semibold shadow-sm transition-all"
            >
              <span>Go to Admin Management</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
