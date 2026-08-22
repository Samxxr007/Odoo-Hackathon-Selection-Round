import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopNav } from '@/components/dashboard/TopNav'

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
    <div className="flex min-h-screen bg-[#F4F7FB]">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav user={user} />
        <main className="flex-1 p-4 lg:p-6 animate-fadeIn">{children}</main>
      </div>
    </div>
  )
}
