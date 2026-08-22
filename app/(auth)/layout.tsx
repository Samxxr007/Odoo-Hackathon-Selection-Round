export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #0077FF 0%, #00B7FE 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl">HRMS</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your team,<br />effortlessly.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Attendance, leave, and employee management — all in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[
            { label: 'Employees', value: '500+' },
            { label: 'Companies', value: '50+' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-white font-bold text-2xl">{stat.value}</p>
              <p className="text-white/70 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F4F7FB]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-xl bg-[#0077FF] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-[#0077FF] font-bold text-xl">HRMS</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
