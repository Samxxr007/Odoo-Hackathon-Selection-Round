const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dayflow Database...');

  // Create Users
  const emp1 = await prisma.user.upsert({
    where: { email: 'aswin@dayflow.hr' },
    update: { name: 'Aswin Acharya' },
    create: {
      id: 'emp-001',
      email: 'aswin@dayflow.hr',
      name: 'Aswin Acharya',
      role: 'EMPLOYEE',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      shiftStartTime: '09:00',
      shiftDurationMinutes: 480, // 8 hours
      gracePeriodMinutes: 15,
    },
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'rahul@dayflow.hr' },
    update: { name: 'Rahul Sharma' },
    create: {
      id: 'emp-002',
      email: 'rahul@dayflow.hr',
      name: 'Rahul Sharma',
      role: 'EMPLOYEE',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      shiftStartTime: '09:00',
      shiftDurationMinutes: 480,
      gracePeriodMinutes: 15,
    },
  });

  const emp3 = await prisma.user.upsert({
    where: { email: 'priya@dayflow.hr' },
    update: { name: 'Priya Patel' },
    create: {
      id: 'emp-003',
      email: 'priya@dayflow.hr',
      name: 'Priya Patel',
      role: 'EMPLOYEE',
      department: 'Marketing',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      shiftStartTime: '09:00',
      shiftDurationMinutes: 480,
      gracePeriodMinutes: 15,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.hr' },
    update: { name: 'Sarah Connor' },
    create: {
      id: 'admin-001',
      email: 'admin@dayflow.hr',
      name: 'Sarah Connor',
      role: 'ADMIN',
      department: 'Human Resources',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      shiftStartTime: '09:00',
      shiftDurationMinutes: 480,
      gracePeriodMinutes: 15,
    },
  });

  console.log('Created Users:', [emp1.name, emp2.name, emp3.name, admin.name]);

  // Seed Holidays
  await prisma.holiday.upsert({
    where: { date: '2026-08-15' },
    update: {},
    create: {
      date: '2026-08-15',
      name: 'Independence Day',
      isNonWorkingDay: true,
    },
  });

  // Seed Sample Leaves
  await prisma.leave.createMany({
    data: [
      {
        employeeId: 'emp-001',
        startDate: '2026-08-03',
        endDate: '2026-08-03',
        type: 'PAID',
        status: 'APPROVED',
        reason: 'Personal leave',
      },
      {
        employeeId: 'emp-002',
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        type: 'SICK',
        status: 'APPROVED',
        reason: 'Viral fever',
      },
    ],
  });

  // Seed Past Attendance Records for August 2026
  const pastRecords = [
    {
      employeeId: 'emp-001',
      businessDate: '2026-08-01',
      checkIn: new Date('2026-08-01T03:33:00Z'), // 09:03 AM IST
      checkOut: new Date('2026-08-01T12:12:00Z'), // 05:42 PM IST
      workHoursMinutes: 519,
      extraHoursMinutes: 39,
      status: 'PRESENT',
      isLate: false,
    },
    {
      employeeId: 'emp-001',
      businessDate: '2026-08-02',
      checkIn: new Date('2026-08-02T03:40:00Z'), // 09:10 AM IST
      checkOut: new Date('2026-08-02T07:45:00Z'), // 01:15 PM IST
      workHoursMinutes: 245,
      extraHoursMinutes: 0,
      status: 'HALF_DAY',
      isLate: false,
    },
    {
      employeeId: 'emp-001',
      businessDate: '2026-08-04',
      checkIn: new Date('2026-08-04T03:31:00Z'), // 09:01 AM IST
      checkOut: new Date('2026-08-04T12:15:00Z'), // 05:45 PM IST
      workHoursMinutes: 524,
      extraHoursMinutes: 44,
      status: 'PRESENT',
      isLate: false,
    },
    {
      employeeId: 'emp-002',
      businessDate: '2026-08-01',
      checkIn: new Date('2026-08-01T03:31:00Z'),
      checkOut: new Date('2026-08-01T12:15:00Z'),
      workHoursMinutes: 524,
      extraHoursMinutes: 44,
      status: 'PRESENT',
      isLate: false,
    },
    {
      employeeId: 'emp-003',
      businessDate: '2026-08-01',
      checkIn: new Date('2026-08-01T04:05:00Z'), // 09:35 AM IST (Late)
      checkOut: null, // Missing checkout!
      workHoursMinutes: null,
      extraHoursMinutes: null,
      status: 'PRESENT',
      isLate: true,
    },
  ];

  for (const rec of pastRecords) {
    await prisma.attendance.upsert({
      where: {
        unique_employee_daily_attendance: {
          employeeId: rec.employeeId,
          businessDate: rec.businessDate,
        },
      },
      update: {},
      create: rec,
    });
  }

  console.log('Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
