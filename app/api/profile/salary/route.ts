import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, canViewOrEditSalary } from '@/lib/auth';
import { getSalaryBreakdown, calculateSalaryBreakdown } from '@/lib/salary';
import { getDbUserById, updateSalaryConfigInDb } from '@/lib/db';
import { ApiResponse, SalaryBreakdown } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getCurrentSession(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || session.id;

    // Module F rule: Salary endpoints are ADMIN/HR ONLY
    if (!canViewOrEditSalary(session)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: Salary information is restricted to Admin/HR only' },
        { status: 403 }
      );
    }

    const breakdown = getSalaryBreakdown(targetUserId);
    if (!breakdown) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Salary record not found for employee' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<SalaryBreakdown>>({
      success: true,
      data: breakdown,
    });
  } catch (error: any) {
    console.error('Error fetching salary:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while fetching salary' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getCurrentSession(req);

    // Module F rule: Only Admin/HR can update salary
    if (!canViewOrEditSalary(session)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden: Only Admin/HR can update salary structure' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const targetUserId = body.userId || session.id;

    const user = getDbUserById(targetUserId);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Process wage input: allow updating via monthlyWage or yearlyWage
    let monthlyWage = body.monthlyWage;
    if (monthlyWage === undefined && body.yearlyWage !== undefined) {
      monthlyWage = body.yearlyWage / 12;
    }
    if (monthlyWage === undefined) {
      monthlyWage = user.salaryConfig.monthlyWage;
    }

    const salaryUpdates = {
      monthlyWage: Number(monthlyWage),
      workingDaysPerWeek: body.workingDaysPerWeek !== undefined ? Number(body.workingDaysPerWeek) : user.salaryConfig.workingDaysPerWeek,
      breakTimeMinutes: body.breakTimeMinutes !== undefined ? Number(body.breakTimeMinutes) : user.salaryConfig.breakTimeMinutes,
      standardAllowance: body.standardAllowance !== undefined ? Number(body.standardAllowance) : user.salaryConfig.standardAllowance,
      basicPercentage: body.basicPercentage !== undefined ? Number(body.basicPercentage) : user.salaryConfig.basicPercentage,
      hraPercentage: body.hraPercentage !== undefined ? Number(body.hraPercentage) : user.salaryConfig.hraPercentage,
      bonusPercentage: body.bonusPercentage !== undefined ? Number(body.bonusPercentage) : user.salaryConfig.bonusPercentage,
      ltaPercentage: body.ltaPercentage !== undefined ? Number(body.ltaPercentage) : user.salaryConfig.ltaPercentage,
    };

    // Calculate and validate
    const breakdown = calculateSalaryBreakdown(salaryUpdates);
    if (!breakdown.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: breakdown.validationErrors?.join(', ') || 'Invalid salary configuration' },
        { status: 400 }
      );
    }

    // Save to DB
    updateSalaryConfigInDb(targetUserId, salaryUpdates);
    breakdown.userId = targetUserId;

    return NextResponse.json<ApiResponse<SalaryBreakdown>>({
      success: true,
      data: breakdown,
      message: 'Salary configuration updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating salary:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error while updating salary' },
      { status: 500 }
    );
  }
}
