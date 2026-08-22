import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, canEditPersonalProfile } from '@/lib/auth';
import { getDbUserById, updateEmployeeProfileInDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const session = getCurrentSession(req);
    
    // Check if multipart form data or json data url
    const contentType = req.headers.get('content-type') || '';

    let targetUserId = session.id;
    let avatarUrl = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      targetUserId = body.userId || session.id;

      if (!canEditPersonalProfile(session, targetUserId)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Forbidden: You cannot update this profile picture' },
          { status: 403 }
        );
      }

      if (!body.imageDataUrl && !body.avatarUrl) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Image data or URL is required' },
          { status: 400 }
        );
      }

      const rawData = body.imageDataUrl || body.avatarUrl;

      // Validate base64 data url
      if (rawData.startsWith('data:')) {
        const mimeMatch = rawData.match(/^data:([^;]+);base64,/);
        if (!mimeMatch) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Invalid image format' },
            { status: 400 }
          );
        }

        const mimeType = mimeMatch[1].toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: `Disallowed file type: ${mimeType}. Allowed types: JPG, PNG, WEBP, GIF.` },
            { status: 400 }
          );
        }

        // Check approximate base64 size
        const base64Data = rawData.replace(/^data:[^;]+;base64,/, '');
        const byteSize = (base64Data.length * 3) / 4;
        if (byteSize > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'File size exceeds the 2MB limit' },
            { status: 400 }
          );
        }

        avatarUrl = rawData;
      } else if (rawData.startsWith('http://') || rawData.startsWith('https://') || rawData.startsWith('/')) {
        avatarUrl = rawData;
      } else {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid image payload' },
          { status: 400 }
        );
      }
    } else {
      // Multipart form data handling
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const formUserId = formData.get('userId') as string | null;
      
      if (formUserId) targetUserId = formUserId;

      if (!canEditPersonalProfile(session, targetUserId)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Forbidden: You cannot update this profile picture' },
          { status: 403 }
        );
      }

      if (!file) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'No file uploaded' },
          { status: 400 }
        );
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Disallowed file type: ${file.type}. Allowed: JPG, PNG, WEBP.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Image size exceeds maximum limit of 2MB' },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      avatarUrl = `data:${file.type};base64,${base64}`;
    }

    const updatedUser = updateEmployeeProfileInDb(targetUserId, { avatar: avatarUrl });
    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<{ avatarUrl: string }>>({
      success: true,
      data: { avatarUrl },
      message: 'Profile photo updated successfully',
    });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while uploading photo' },
      { status: 500 }
    );
  }
}
