import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, sanitizeProfileForViewer, canEditPersonalProfile, canEditOrgFields } from '@/lib/auth';
import { getDbUserById, getDbUserByIdAsync, updateEmployeeProfileInDb, updatePrivateInfoInDb, updateBankDetailsInDb } from '@/lib/db';
import { ApiResponse, EmployeeProfile } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getCurrentSession(req);
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    const targetUser = await getDbUserByIdAsync(targetUserId);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    const sanitizedProfile = sanitizeProfileForViewer(targetUser, session);
    return NextResponse.json<ApiResponse<EmployeeProfile>>({
      success: true,
      data: sanitizedProfile,
    });
  } catch (error: any) {
    console.error('Error fetching profile by ID:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getCurrentSession(req);
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    const body = await req.json();

    const targetUser = await getDbUserByIdAsync(targetUserId);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    if (!canEditPersonalProfile(session, targetUserId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You do not have permission to edit this profile' },
        { status: 403 }
      );
    }

    const isOrgAdmin = canEditOrgFields(session);
    const profileUpdates: Partial<EmployeeProfile> = {};

    if (body.name !== undefined) profileUpdates.name = String(body.name).trim();
    if (body.mobile !== undefined) profileUpdates.mobile = String(body.mobile).trim();
    if (body.avatar !== undefined) profileUpdates.avatar = String(body.avatar);
    if (body.resume !== undefined) profileUpdates.resume = body.resume;

    if (isOrgAdmin) {
      if (body.company !== undefined) profileUpdates.company = String(body.company).trim();
      if (body.department !== undefined) profileUpdates.department = String(body.department).trim();
      if (body.designation !== undefined) profileUpdates.designation = String(body.designation).trim();
      if (body.manager !== undefined) profileUpdates.manager = String(body.manager).trim();
      if (body.location !== undefined) profileUpdates.location = String(body.location).trim();
      if (body.dateOfJoining !== undefined) profileUpdates.dateOfJoining = String(body.dateOfJoining).trim();
      if (body.email !== undefined) profileUpdates.email = String(body.email).trim();
    }

    updateEmployeeProfileInDb(targetUserId, profileUpdates);

    if (body.privateInfo) {
      const privateUpdates: any = {};
      if (body.privateInfo.dateOfBirth !== undefined) privateUpdates.dateOfBirth = body.privateInfo.dateOfBirth;
      if (body.privateInfo.residingAddress !== undefined) privateUpdates.residingAddress = body.privateInfo.residingAddress;
      if (body.privateInfo.nationality !== undefined) privateUpdates.nationality = body.privateInfo.nationality;
      if (body.privateInfo.personalEmail !== undefined) privateUpdates.personalEmail = body.privateInfo.personalEmail;
      if (body.privateInfo.gender !== undefined) privateUpdates.gender = body.privateInfo.gender;
      if (body.privateInfo.maritalStatus !== undefined) privateUpdates.maritalStatus = body.privateInfo.maritalStatus;

      if (isOrgAdmin && body.privateInfo.dateOfJoining !== undefined) {
        privateUpdates.dateOfJoining = body.privateInfo.dateOfJoining;
      }
      updatePrivateInfoInDb(targetUserId, privateUpdates);
    }

    if (body.bankDetails) {
      const bankUpdates: any = {};
      if (body.bankDetails.accountNumber !== undefined) bankUpdates.accountNumber = body.bankDetails.accountNumber;
      if (body.bankDetails.bankName !== undefined) bankUpdates.bankName = body.bankDetails.bankName;
      if (body.bankDetails.ifsc !== undefined) bankUpdates.ifsc = body.bankDetails.ifsc;

      if (isOrgAdmin) {
        if (body.bankDetails.pan !== undefined) bankUpdates.pan = body.bankDetails.pan;
        if (body.bankDetails.uan !== undefined) bankUpdates.uan = body.bankDetails.uan;
      }
      updateBankDetailsInDb(targetUserId, bankUpdates);
    }

    const updatedUser = getDbUserById(targetUserId)!;
    const sanitizedProfile = sanitizeProfileForViewer(updatedUser, session);

    return NextResponse.json<ApiResponse<EmployeeProfile>>({
      success: true,
      data: sanitizedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating profile by ID:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
