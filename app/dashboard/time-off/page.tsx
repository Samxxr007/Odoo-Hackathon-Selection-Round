import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { CalendarDays } from 'lucide-react'

export default function TimeOffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1D24]">Time Off</h1>
        <p className="text-[#8F9CAE] text-sm mt-0.5">
          Request, approve, and track annual, sick, and unpaid leaves.
        </p>
      </div>

      <Card className="text-center py-16">
        <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="h-8 w-8 text-[#F9911E]" />
        </div>
        <CardTitle className="mb-2">Time Off & Leave Management</CardTitle>
        <p className="text-sm text-[#8F9CAE] max-w-md mx-auto">
          This section is wired for Member 4 (Time Off & Leave Approvals). Leave requests, approvals, and allocation balances will be managed here.
        </p>
      </Card>
    </div>
  )
}
