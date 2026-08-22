import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, canViewPrivateInfo, canEditPersonalProfile } from '@/lib/auth';
import { getDbUserById, deleteDocumentFromDb } from '@/lib/db';
import { ApiResponse, DocumentRecord } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = getCurrentSession(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || session.id;
    const resolvedParams = await params;
    const docId = resolvedParams.docId;

    if (!canViewPrivateInfo(session, targetUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You cannot access this document' },
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

    const doc = user.documents.find(d => d.id === docId);
    if (!doc) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<DocumentRecord>>({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const session = getCurrentSession(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || session.id;
    const resolvedParams = await params;
    const docId = resolvedParams.docId;

    if (!canEditPersonalProfile(session, targetUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You cannot delete this document' },
        { status: 403 }
      );
    }

    const deleted = deleteDocumentFromDb(targetUserId, docId);
    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Document not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
