import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/session'
import { UnifiedHeader } from '@/components/layout/UnifiedHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user
  try {
    user = await requireAuth()
  } catch {
    redirect('/signin')
  }

  // Redirect first-login users to change password
  if (user.mustChangePassword) {
    redirect('/change-password')
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <UnifiedHeader initialUser={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}
