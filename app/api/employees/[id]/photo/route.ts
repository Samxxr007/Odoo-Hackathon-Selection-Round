import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { isSameCompany } from '@/lib/auth/authorize'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth()
    const { id } = await params

    const employee = await db.user.findUnique({ where: { id } })
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    // Cross-company check
    if (!isSameCompany(authUser, employee.companyId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Only self or admin can upload photo
    if (authUser.role !== 'ADMIN' && authUser.id !== id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot upload a photo for another employee' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('photo') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No photo file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const ext = path.extname(file.name) || '.jpg'
    const filename = `photo-${id}-${Date.now()}${ext}`
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

    const profilePhotoUrl = `/uploads/photos/${filename}`

    await db.user.update({
      where: { id },
      data: { profilePhotoUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile photo updated',
      data: { profilePhotoUrl },
    })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[POST /employees/[id]/photo] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload photo' }, { status: 500 })
  }
}
