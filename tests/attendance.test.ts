import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { toggleAttendance, correctAttendanceCheckout } from '@/lib/attendance/services';
import { getEmployeeDailyStatus } from '@/lib/attendance/engine';
import { getPayableDays } from '@/lib/attendance/payroll';
import { verifyEmployeeOwnership } from '@/lib/auth';

describe('Dayflow Attendance Module — End-to-End Core Business Logic Suite', () => {
  const testEmpId = 'test-emp-101';
  const otherEmpId = 'test-emp-102';
  const adminId = 'test-admin-101';

  beforeAll(async () => {
    // Clean database test fixtures
    await prisma.attendance.deleteMany({ where: { employeeId: { in: [testEmpId, otherEmpId] } } });
    await prisma.leave.deleteMany({ where: { employeeId: { in: [testEmpId, otherEmpId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testEmpId, otherEmpId, adminId] } } });
    await prisma.holiday.deleteMany({ where: { date: '2026-08-15' } });

    const testCompany = await prisma.company.upsert({
      where: { name: 'Dayflow Test Company' },
      update: {},
      create: { name: 'Dayflow Test Company' },
    });

    // Seed test users
    await prisma.user.create({
      data: {
        id: testEmpId,
        loginId: testEmpId,
        companyId: testCompany.id,
        email: 'test.emp101@dayflow.hr',
        name: 'Test Employee One',
        role: 'EMPLOYEE',
        shiftStartTime: '09:00',
        shiftDurationMinutes: 480,
      },
    });

    await prisma.user.create({
      data: {
        id: otherEmpId,
        loginId: otherEmpId,
        companyId: testCompany.id,
        email: 'test.emp102@dayflow.hr',
        name: 'Test Employee Two',
        role: 'EMPLOYEE',
        shiftStartTime: '09:00',
        shiftDurationMinutes: 480,
      },
    });

    await prisma.user.create({
      data: {
        id: adminId,
        loginId: adminId,
        companyId: testCompany.id,
        email: 'test.admin101@dayflow.hr',
        name: 'Test Admin User',
        role: 'ADMIN',
      },
    });

    // Seed Holiday
    await prisma.holiday.create({
      data: {
        date: '2026-08-15',
        name: 'Independence Day',
        isNonWorkingDay: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.attendance.deleteMany({ where: { employeeId: { in: [testEmpId, otherEmpId] } } });
    await prisma.leave.deleteMany({ where: { employeeId: { in: [testEmpId, otherEmpId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testEmpId, otherEmpId, adminId] } } });
    await prisma.holiday.deleteMany({ where: { date: '2026-08-15' } });
    await prisma.$disconnect();
  });

  // -------------------------------------------------------------
  // 1. CHECK-IN / CHECK-OUT TESTS
  // -------------------------------------------------------------
  describe('Module A: Check-In & Check-Out Lifecycle', () => {
    it('Case 1: Should check in normally when no open record exists', async () => {
      const checkInTime = new Date('2026-08-01T03:30:00Z'); // 09:00 AM IST on Aug 1, 2026
      const res = await toggleAttendance(testEmpId, checkInTime);

      expect(res.action).toBe('CHECKED_IN');
      expect(res.attendance.checkIn.toISOString()).toBe(checkInTime.toISOString());
      expect(res.attendance.checkOut).toBeNull();
      expect(res.attendance.status).toBe('PRESENT');
    });

    it('Case 2: Should check out when toggle called on existing open record', async () => {
      const checkOutTime = new Date('2026-08-01T12:00:00Z'); // 05:30 PM IST on Aug 1, 2026
      const res = await toggleAttendance(testEmpId, checkOutTime);

      expect(res.action).toBe('CHECKED_OUT');
      expect(res.attendance.checkOut?.toISOString()).toBe(checkOutTime.toISOString());
      expect(res.attendance.workHoursMinutes).toBe(510); // 8.5 hours
      expect(res.attendance.extraHoursMinutes).toBe(30); // 30 mins overtime
    });

    it('Case 3: Should reject duplicate checkout when already checked out', async () => {
      const checkoutAgainTime = new Date('2026-08-01T12:30:00Z');
      await expect(toggleAttendance(testEmpId, checkoutAgainTime)).rejects.toThrow('Already checked out for today.');
    });

    it('Case 4: Should reject future timestamps beyond clock skew tolerance', async () => {
      const farFutureTime = new Date(Date.now() + 1000 * 3600 * 24 * 30); // 30 days in future
      await expect(toggleAttendance(testEmpId, farFutureTime)).rejects.toThrow(
        'Attendance timestamp cannot be in the future.'
      );
    });

    it('Case 5: Should correctly mark Half-Day when work duration is under threshold (<4h)', async () => {
      const checkIn = new Date('2026-08-02T03:30:00Z'); // 09:00 AM IST
      const checkOut = new Date('2026-08-02T06:30:00Z'); // 12:00 PM IST (3 hours = 180 mins)

      const inRes = await toggleAttendance(testEmpId, checkIn);
      expect(inRes.action).toBe('CHECKED_IN');

      const outRes = await toggleAttendance(testEmpId, checkOut);
      expect(outRes.action).toBe('CHECKED_OUT');
      expect(outRes.attendance.workHoursMinutes).toBe(180);
      expect(outRes.attendance.status).toBe('HALF_DAY');
      expect(outRes.attendance.extraHoursMinutes).toBe(0);
    });

    it('Case 6: Should correctly calculate Extra Hours (Overtime) on checkout', async () => {
      const checkIn = new Date('2026-08-03T03:30:00Z'); // 09:00 AM IST
      const checkOut = new Date('2026-08-03T12:30:00Z'); // 06:00 PM IST (9 hours = 540 mins)

      await toggleAttendance(testEmpId, checkIn);
      const outRes = await toggleAttendance(testEmpId, checkOut);

      expect(outRes.attendance.workHoursMinutes).toBe(540);
      expect(outRes.attendance.extraHoursMinutes).toBe(60); // 540 - 480 = 60 mins extra
      expect(outRes.attendance.status).toBe('PRESENT');
    });
  });

  // -------------------------------------------------------------
  // 2. DAILY STATUS ENGINE PRECEDENCE TESTS
  // -------------------------------------------------------------
  describe('Module C: Daily Status Engine Precedence', () => {
    it('Should prioritize Approved Leave over Absence', async () => {
      const leaveDate = '2026-08-10';
      await prisma.leave.create({
        data: {
          employeeId: testEmpId,
          startDate: leaveDate,
          endDate: leaveDate,
          type: 'PAID',
          status: 'APPROVED',
          reason: 'Doctor appointment',
        },
      });

      const status = await getEmployeeDailyStatus(testEmpId, leaveDate);
      expect(status).toBe('LEAVE');
    });

    it('Should classify non-attendance on past working day as ABSENT', async () => {
      const absentDate = '2026-08-11'; // Tuesday, non-holiday, no attendance record
      const status = await getEmployeeDailyStatus(testEmpId, absentDate);
      expect(status).toBe('ABSENT');
    });

    it('Should handle Holidays and Non-working days without marking absence', async () => {
      const holidayStatus = await getEmployeeDailyStatus(testEmpId, '2026-08-15');
      expect(holidayStatus).toBe('NON_WORKING_DAY');
    });
  });

  // -------------------------------------------------------------
  // 3. PAYROLL HELPER TESTS
  // -------------------------------------------------------------
  describe('Module H: Payroll Helper (getPayableDays)', () => {
    it('Should accurately calculate payable days and breakdown for payroll', async () => {
      const payroll = await getPayableDays(testEmpId, '2026-08');

      expect(payroll.month).toBe('2026-08');
      expect(payroll.workingDays).toBeGreaterThan(0);
      expect(payroll.payableDays).toBeGreaterThanOrEqual(0);
      expect(payroll.breakdown).toHaveProperty('present');
      expect(payroll.breakdown).toHaveProperty('paidLeave');
      expect(payroll.breakdown).toHaveProperty('unpaidLeave');
      expect(payroll.breakdown).toHaveProperty('absent');
      expect(payroll.breakdown).toHaveProperty('holidays');
      expect(Array.isArray(payroll.deductionDays)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 4. ADMIN & SECURITY TESTS
  // -------------------------------------------------------------
  describe('Security & Admin Management', () => {
    it('Should enforce server-side ownership: Employee accessing another employee throws 403', () => {
      const empSession = {
        user: { id: testEmpId, role: 'EMPLOYEE' } as any,
        userId: testEmpId,
        role: 'EMPLOYEE' as any,
      };

      expect(() => verifyEmployeeOwnership(empSession, otherEmpId)).toThrow(
        "Forbidden: You do not have permission to access another employee's attendance data."
      );
    });

    it('Should allow Admin to access any employee attendance', () => {
      const adminSession = {
        user: { id: adminId, role: 'ADMIN' } as any,
        userId: adminId,
        role: 'ADMIN' as any,
      };

      expect(verifyEmployeeOwnership(adminSession, testEmpId)).toBe(true);
    });

    it('Should perform Admin correction on missing checkout with audit trail', async () => {
      // Create missing checkout record
      const missingRec = await prisma.attendance.create({
        data: {
          employeeId: testEmpId,
          businessDate: '2026-08-20',
          checkIn: new Date('2026-08-20T03:30:00Z'),
          checkOut: null,
          status: 'PRESENT',
        },
      });

      const correctedOut = new Date('2026-08-20T12:15:00Z');
      const corrected = await correctAttendanceCheckout({
        adminId,
        attendanceId: missingRec.id,
        correctedCheckOut: correctedOut,
        reason: 'Employee forgot to scan out',
      });

      expect(corrected.checkOut?.toISOString()).toBe(correctedOut.toISOString());
      expect(corrected.isCorrected).toBe(true);
      expect(corrected.correctedBy).toBe(adminId);
      expect(corrected.correctionReason).toBe('Employee forgot to scan out');
    });
  });
});
