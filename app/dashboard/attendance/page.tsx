import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Clock } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1D24]">Attendance</h1>
        <p className="text-[#8F9CAE] text-sm mt-0.5">
          Track employee daily attendance, check-in, and check-out logs.
        </p>
      </div>

      <Card className="text-center py-16">
        <div className="h-16 w-16 rounded-2xl bg-[#EAF3FF] flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-[#0077FF]" />
        </div>
        <CardTitle className="mb-2">Attendance Module</CardTitle>
        <p className="text-sm text-[#8F9CAE] max-w-md mx-auto">
          This section is wired for Member 3 (Attendance & Time Tracking). Check-in/check-out, daily logs, and biometric status helpers will appear here.
        </p>
      </Card>
    </div>
  )
}
