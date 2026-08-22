import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, canViewPrivateInfo, canEditPersonalProfile } from '@/lib/auth';
import { getDbUserById, addDocumentToDb } from '@/lib/db';
import { ApiResponse, DocumentRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  try {
    const session = getCurrentSession(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || session.id;

    // Security check: only Owner or Admin/HR can view documents
    if (!canViewPrivateInfo(session, targetUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You cannot access documents for another employee' },
        { status: 403 }
      );
    }

    const user = getDbUserById(targetUserId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<DocumentRecord[]>>({
      success: true,
      data: user.documents,
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while fetching documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getCurrentSession(req);
    const contentType = req.headers.get('content-type') || '';

    let targetUserId = session.id;
    let documentType: any = 'Other';
    let filename = '';
    let mimeType = 'application/pdf';
    let fileSizeBytes = 0;
    let fileUrl = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      targetUserId = body.userId || session.id;
      documentType = body.documentType || 'Other';
      filename = body.filename || `document_${Date.now()}.pdf`;
      mimeType = body.mimeType || 'application/pdf';
      fileSizeBytes = body.fileSizeBytes || 102400;
      fileUrl = body.fileUrl || `/documents/${targetUserId}/${filename}`;
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const formUserId = formData.get('userId') as string | null;
      const formDocType = formData.get('documentType') as any;

      if (formUserId) targetUserId = formUserId;
      if (formDocType) documentType = formDocType;

      if (!file) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'No file uploaded' },
          { status: 400 }
        );
      }

      if (file.size > MAX_DOC_SIZE_BYTES) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      if (!ALLOWED_DOC_TYPES.includes(file.type.toLowerCase()) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: `Invalid file format: ${file.type}. Allowed: PDF, PNG, JPG, DOCX` },
          { status: 400 }
        );
      }

      filename = file.name;
      mimeType = file.type || 'application/pdf';
      fileSizeBytes = file.size;

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    // Security check: Owner or Admin/HR only
    if (!canEditPersonalProfile(session, targetUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You cannot upload documents for this employee' },
        { status: 403 }
      );
    }

    const createdDoc = addDocumentToDb(targetUserId, {
      employeeId: targetUserId,
      documentType,
      filename,
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: session.name,
      fileSizeBytes,
      mimeType,
      fileUrl,
    });

    if (!createdDoc) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to save document record' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<DocumentRecord>>({
      success: true,
      data: createdDoc,
      message: 'Document uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while uploading document' },
      { status: 500 }
    );
  }
}
