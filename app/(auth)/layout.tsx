import React from 'react'
import { Sparkles, ShieldCheck, Users, Zap, CheckCircle2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F4F7FB] dark:bg-[#0B0F17] transition-colors duration-300">
      {/* Left — Brand & Hero Experience Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#0055FF] via-[#0077FF] to-[#00C3FF]">
        {/* Animated Background Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/15 blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-300/20 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        {/* Brand Top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/30">
            OI
          </div>
          <div>
            <span className="text-white font-black text-2xl tracking-tight leading-none block">
              Odoo India
            </span>
            <span className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
              HRMS Enterprise <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Next-Gen Workforce Management
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Empower your people. Elevate performance.
          </h1>

          <p className="text-white/85 text-base leading-relaxed">
            Seamless real-time attendance telemetry, intelligent leave approvals, transparent salary breakdowns, and rich employee directory in one unified suite.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              'Automated Login ID Generation',
              'Indian Salary Formula Engine',
              'Real-Time Systray Attendance',
              'Audit-Proof Leave Workflows',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs font-semibold text-white/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
          {[
            { label: 'Workforce Scale', value: '10,000+' },
            { label: 'Precision Uptime', value: '99.99%' },
            { label: 'Security Standard', value: 'SOC-2' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-white font-black text-2xl tracking-tight">{stat.value}</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10 animate-scaleIn">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0077FF] to-[#00B7FE] flex items-center justify-center text-white font-black text-xl shadow-lg glow-primary">
              OI
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight block">
                Odoo India
              </span>
              <span className="text-[#0077FF] dark:text-[#38BDF8] text-[10px] font-bold uppercase tracking-widest">
                HRMS Enterprise
              </span>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
