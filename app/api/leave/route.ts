import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthUser, requireRoles } from '@/lib/authGuard'
import {
  getUserLeaveRequests,
  getAllLeaveRequests,
  createLeaveRequest,
} from '@/lib/leave/leaveService'
import type { LeaveStatus, LeaveType } from '@/types/leave'
import path from 'path'
import fs from 'fs/promises'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const CreateLeaveSchema = z.object({
  leaveType: z.enum(['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE']),
  fromDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  toDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  remarks: z.string().max(1000).optional(),
})

export const dynamic = 'force-dynamic'

// GET /api/leave — employee gets own list; admin gets all
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as LeaveStatus | null

    if (user.role === 'ADMIN' || user.role === 'HR') {
      const employeeId = searchParams.get('userId') ?? undefined
      const requests = await getAllLeaveRequests(status ?? undefined, employeeId)
      return NextResponse.json(requests)
    }

    const requests = await getUserLeaveRequests(user.id, status ?? undefined)
    return NextResponse.json(requests)
  } catch (err: any) {
    console.error('[GET /api/leave]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leave — employee submits new request (with optional file)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    let body: Record<string, any>
    let attachmentPath: string | undefined
    let attachmentName: string | undefined

    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      body = {
        leaveType: formData.get('leaveType'),
        fromDate: formData.get('fromDate'),
        toDate: formData.get('toDate'),
        remarks: formData.get('remarks') ?? undefined,
      }

      const file = formData.get('attachment') as File | null
      if (file && file.size > 0) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: 'Invalid file type. Allowed: PDF, JPG, PNG.' },
            { status: 400 }
          )
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: 'File size exceeds 5 MB limit.' },
            { status: 400 }
          )
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'leave')
        await fs.mkdir(uploadDir, { recursive: true })
        const filename = `${user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = path.join(uploadDir, filename)
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(filePath, buffer)
        attachmentPath = `/uploads/leave/${filename}`
        attachmentName = file.name
      }
    } else {
      body = await req.json()
    }

    const parsed = CreateLeaveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { leaveType, fromDate, toDate, remarks } = parsed.data

    const request = await createLeaveRequest(
      user.id, // always from session — never from body
      leaveType as LeaveType,
      new Date(fromDate),
      new Date(toDate),
      remarks,
      attachmentPath,
      attachmentName
    )

    return NextResponse.json(request, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/leave]', err)
    const status = err.message?.includes('balance') || err.message?.includes('overlap') ? 400 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
