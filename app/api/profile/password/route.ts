import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, validatePasswordStrength, verifyPassword, hashPassword } from '@/lib/auth';
import { getDbUserById, updatePasswordInDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const session = getCurrentSession(req);
    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword, userId } = body;

    const targetUserId = userId || session.id;

    // Only owner or Admin can change password
    if (session.id !== targetUserId && session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: You cannot change another user password' },
        { status: 403 }
      );
    }

    const user = getDbUserById(targetUserId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If not Admin overriding, verify current password
    if (session.role !== 'ADMIN' || session.id === targetUserId) {
      if (!currentPassword) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isCurrentValid = verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Incorrect current password' },
          { status: 400 }
        );
      }
    }

    // Validate new password confirmation
    if (!newPassword || !confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New password and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Check if new password is same as current password
    if (currentPassword && newPassword === currentPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Validate complexity
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: strengthCheck.message || 'Password does not meet security requirements' },
        { status: 400 }
      );
    }

    // Hash and store
    const newHash = hashPassword(newPassword);
    const updated = updatePasswordInDb(targetUserId, newHash);

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully. Your account is now secure.',
    });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while changing password' },
      { status: 500 }
    );
  }
}
