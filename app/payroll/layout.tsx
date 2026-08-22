import { UnifiedHeader } from '@/components/layout/UnifiedHeader'

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B0F17] flex flex-col transition-colors duration-300">
      <UnifiedHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}
