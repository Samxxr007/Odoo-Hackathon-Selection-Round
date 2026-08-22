import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'HRMS — Human Resource Management System',
  description: 'Enterprise HRMS platform for Odoo India',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F4F7FB] text-[#0F172A]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
