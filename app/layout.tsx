import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dayflow — Attendance & Work-Time Management',
  description: 'Production-quality HRMS Attendance module for Dayflow platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-dayflow-bg text-dayflow-text">
        {children}
      </body>
    </html>
  );
}
