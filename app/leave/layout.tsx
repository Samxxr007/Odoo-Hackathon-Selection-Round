import { UnifiedHeader } from '@/components/layout/UnifiedHeader'

export default function LeaveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <UnifiedHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}
