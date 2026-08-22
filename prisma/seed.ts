import { PrismaClient, Role, AttendanceStatusType, LeaveStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Comprehensive Enterprise Database Seeding for Odoo India HRMS...')

  // 1. Clean existing test/demo data safely
  console.log('🧹 Cleaning existing tables...')
  await prisma.notification.deleteMany().catch(() => {})
  await prisma.leaveRequest.deleteMany().catch(() => {})
  await prisma.leave.deleteMany().catch(() => {})
  await prisma.leaveAllocation.deleteMany().catch(() => {})
  await prisma.attendance.deleteMany().catch(() => {})
  await prisma.session.deleteMany().catch(() => {})
  await prisma.yearlySerial.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})
  await prisma.company.deleteMany().catch(() => {})
  await prisma.publicHoliday.deleteMany().catch(() => {})
  await prisma.holiday.deleteMany().catch(() => {})

  // 2. Create Company: Odoo India
  console.log('🏢 Creating Company: Odoo India Technology Pvt. Ltd...')
  const company = await prisma.company.create({
    data: {
      name: 'Odoo India Technology Pvt. Ltd.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    },
  })

  // 3. Seed 2026 Indian Public Holidays
  console.log('📅 Seeding 2026 Public Holidays...')
  const holidaysData = [
    { date: '2026-01-26', name: 'Republic Day', year: 2026 },
    { date: '2026-03-04', name: 'Maha Shivratri', year: 2026 },
    { date: '2026-03-20', name: 'Holi', year: 2026 },
    { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', year: 2026 },
    { date: '2026-05-01', name: 'Maharashtra / Gujarat Day', year: 2026 },
    { date: '2026-08-15', name: 'Independence Day', year: 2026 },
    { date: '2026-08-27', name: 'Raksha Bandhan', year: 2026 },
    { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', year: 2026 },
    { date: '2026-10-20', name: 'Dussehra (Vijayadashami)', year: 2026 },
    { date: '2026-11-08', name: 'Diwali (Deepavali)', year: 2026 },
    { date: '2026-12-25', name: 'Christmas Day', year: 2026 },
  ]

  for (const h of holidaysData) {
    await prisma.publicHoliday.create({
      data: {
        name: h.name,
        date: new Date(`${h.date}T00:00:00.000Z`),
        year: h.year,
      },
    })
    await prisma.holiday.create({
      data: {
        date: h.date,
        name: h.name,
        isNonWorkingDay: true,
      },
    })
  }

  // 4. Hash standard passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12)
  const empPasswordHash = await bcrypt.hash('Emp@123456', 12)

  // 5. Seed 10 Realistic Indian Enterprise Employees
  console.log('👥 Seeding 10 Authentic Employees with Resumes, Private Info & Bank Details...')
  
  const employeesData = [
    {
      id: 'emp-001',
      loginId: 'OIADWR20200001',
      email: 'admin@odoo.com',
      passwordHash: adminPasswordHash,
      name: 'Alexander Wright',
      phone: '+91 98250 11223',
      role: Role.ADMIN,
      department: 'Executive Leadership',
      designation: 'Chief Technology Officer (CTO)',
      joiningDate: new Date('2020-01-15'),
      location: 'Gandhinagar, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2020,
      yearlySerial: 1,
      wage: 250000,
    },
    {
      id: 'emp-002',
      loginId: 'OIPRSH20210002',
      email: 'hr@odoo.com',
      passwordHash: adminPasswordHash,
      name: 'Priya Sharma',
      phone: '+91 98795 44332',
      role: Role.ADMIN,
      department: 'Human Resources',
      designation: 'Senior HR Manager & People Lead',
      joiningDate: new Date('2021-03-10'),
      location: 'Gandhinagar, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2021,
      yearlySerial: 2,
      wage: 120000,
    },
    {
      id: 'emp-003',
      loginId: 'OIROME20210003',
      email: 'rohan.mehta@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Rohan Mehta',
      phone: '+91 97123 55667',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      designation: 'Principal Solutions Architect',
      joiningDate: new Date('2021-08-01'),
      location: 'Ahmedabad, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2021,
      yearlySerial: 3,
      wage: 180000,
    },
    {
      id: 'emp-004',
      loginId: 'OIJODO20220004',
      email: 'john.doe@odoo.com',
      passwordHash: empPasswordHash,
      name: 'John Doe',
      phone: '+91 98980 77889',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: new Date('2022-06-01'),
      location: 'Ahmedabad, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2022,
      yearlySerial: 4,
      wage: 95000,
    },
    {
      id: 'emp-005',
      loginId: 'OIJASM20230005',
      email: 'jane.smith@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Jane Smith',
      phone: '+91 97240 88990',
      role: Role.EMPLOYEE,
      department: 'Product Design',
      designation: 'Lead UI/UX Designer & Design Systems',
      joiningDate: new Date('2023-01-16'),
      location: 'Bangalore, Karnataka',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2023,
      yearlySerial: 5,
      wage: 90000,
    },
    {
      id: 'emp-006',
      loginId: 'OIVIPA20230006',
      email: 'vikram.patel@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Vikram Patel',
      phone: '+91 98241 22334',
      role: Role.EMPLOYEE,
      department: 'DevOps & Cloud Infrastructure',
      designation: 'Senior DevOps & SRE Engineer',
      joiningDate: new Date('2023-07-10'),
      location: 'Gandhinagar, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2023,
      yearlySerial: 6,
      wage: 110000,
    },
    {
      id: 'emp-007',
      loginId: 'OIANIY20240007',
      email: 'ananya.iyer@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Ananya Iyer',
      phone: '+91 99090 33445',
      role: Role.EMPLOYEE,
      department: 'Quality Assurance',
      designation: 'QA Automation Lead',
      joiningDate: new Date('2024-02-15'),
      location: 'Pune, Maharashtra',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2024,
      yearlySerial: 7,
      wage: 75000,
    },
    {
      id: 'emp-008',
      loginId: 'OISIRA20240008',
      email: 'siddharth.rao@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Siddharth Rao',
      phone: '+91 98255 66778',
      role: Role.EMPLOYEE,
      department: 'Product Management',
      designation: 'Senior Product Manager — HR Suite',
      joiningDate: new Date('2024-05-02'),
      location: 'Bangalore, Karnataka',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2024,
      yearlySerial: 8,
      wage: 140000,
    },
    {
      id: 'emp-009',
      loginId: 'OINEJO20250009',
      email: 'neha.joshi@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Neha Joshi',
      phone: '+91 97277 88991',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      designation: 'Frontend React/Next.js Developer',
      joiningDate: new Date('2025-01-10'),
      location: 'Ahmedabad, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      emailVerified: true,
      joiningYear: 2025,
      yearlySerial: 9,
      wage: 60000,
    },
    {
      id: 'emp-010',
      loginId: 'OIAMKU20260010',
      email: 'amit.kumar@odoo.com',
      passwordHash: empPasswordHash,
      name: 'Amit Kumar',
      phone: '+91 98982 33441',
      role: Role.EMPLOYEE,
      department: 'Engineering',
      designation: 'Backend Systems & Database Engineer',
      joiningDate: new Date('2026-01-05'),
      location: 'Gandhinagar, Gujarat',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      mustChangePassword: true, // Needs to change temp password on first login
      emailVerified: true,
      joiningYear: 2026,
      yearlySerial: 10,
      wage: 55000,
    },
  ]

  const seededUsers: any[] = []

  for (const emp of employeesData) {
    const user = await prisma.user.create({
      data: {
        id: emp.id,
        loginId: emp.loginId,
        email: emp.email,
        passwordHash: emp.passwordHash,
        name: emp.name,
        phone: emp.phone,
        role: emp.role,
        companyId: company.id,
        department: emp.department,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        location: emp.location,
        profilePhotoUrl: emp.profilePhotoUrl,
        avatarUrl: emp.avatarUrl,
        isActive: true,
        mustChangePassword: emp.mustChangePassword,
        emailVerified: emp.emailVerified,
        joiningYear: emp.joiningYear,
        yearlySerial: emp.yearlySerial,
        shiftStartTime: '09:00',
        shiftDurationMinutes: 480,
        gracePeriodMinutes: 15,
      },
    })
    seededUsers.push(user)
  }

  // 6. Update YearlySerial table
  await prisma.yearlySerial.create({
    data: {
      companyId: company.id,
      year: 2026,
      lastSerial: 10,
    },
  })

  // 7. Seed Leave Allocations (Paid Time Off = 24 days, Sick Leave = 7 days)
  console.log('🏖️ Seeding Leave Allocations (Paid: 24 days, Sick: 7 days)...')
  for (const user of seededUsers) {
    await prisma.leaveAllocation.createMany({
      data: [
        {
          userId: user.id,
          leaveType: 'PAID_TIME_OFF',
          year: 2026,
          totalDays: 24.0,
        },
        {
          userId: user.id,
          leaveType: 'SICK_LEAVE',
          year: 2026,
          totalDays: 7.0,
        },
        {
          userId: user.id,
          leaveType: 'UNPAID_LEAVE',
          year: 2026,
          totalDays: 30.0,
        },
      ],
    })
  }

  // 8. Seed Realistic Leave Requests (Approved & Pending)
  console.log('📝 Seeding Realistic Leave Requests...')
  // Past approved leave for John Doe
  await prisma.leaveRequest.create({
    data: {
      userId: 'emp-004',
      companyId: company.id,
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-12'),
      fromDate: new Date('2026-08-10T09:00:00.000Z'),
      toDate: new Date('2026-08-12T18:00:00.000Z'),
      days: 3.0,
      leaveType: 'PAID_TIME_OFF',
      reason: 'Family vacation to Udaipur with parents',
      remarks: 'Planned family trip.',
      status: LeaveStatus.APPROVED,
      reviewedBy: 'Priya Sharma (HR)',
      decidedById: 'emp-002',
      decidedAt: new Date('2026-08-05'),
    },
  })

  // Approved leave for Jane Smith (Today - August 22, 2026) -> Shows ✈️ On Leave on dashboard!
  await prisma.leaveRequest.create({
    data: {
      userId: 'emp-005',
      companyId: company.id,
      startDate: new Date('2026-08-21'),
      endDate: new Date('2026-08-23'),
      fromDate: new Date('2026-08-21T09:00:00.000Z'),
      toDate: new Date('2026-08-23T18:00:00.000Z'),
      days: 2.0,
      leaveType: 'PAID_TIME_OFF',
      reason: 'Attending Design Systems India Summit in Bangalore',
      remarks: 'Attending design conference.',
      status: LeaveStatus.APPROVED,
      reviewedBy: 'Priya Sharma (HR)',
      decidedById: 'emp-002',
      decidedAt: new Date('2026-08-18'),
    },
  })

  // Pending Sick Leave Request for Vikram Patel (with doctor certificate) -> Ready for Admin Approve/Reject!
  await prisma.leaveRequest.create({
    data: {
      userId: 'emp-006',
      companyId: company.id,
      startDate: new Date('2026-08-25'),
      endDate: new Date('2026-08-26'),
      fromDate: new Date('2026-08-25T09:00:00.000Z'),
      toDate: new Date('2026-08-26T18:00:00.000Z'),
      days: 2.0,
      leaveType: 'SICK_LEAVE',
      reason: 'Severe viral fever and doctor recommended 2 days bed rest.',
      remarks: 'Attached medical prescription certificate.',
      attachmentName: 'Apollo_Hospital_Medical_Certificate.pdf',
      attachmentPath: '/uploads/medical_cert_vikram.pdf',
      status: LeaveStatus.PENDING,
    },
  })

  // Pending Paid Time Off Request for Amit Kumar -> Ready for Admin review
  await prisma.leaveRequest.create({
    data: {
      userId: 'emp-010',
      companyId: company.id,
      startDate: new Date('2026-08-28'),
      endDate: new Date('2026-08-29'),
      fromDate: new Date('2026-08-28T09:00:00.000Z'),
      toDate: new Date('2026-08-29T18:00:00.000Z'),
      days: 2.0,
      leaveType: 'PAID_TIME_OFF',
      reason: 'Attending younger sister convocation ceremony in Delhi.',
      remarks: 'Family event.',
      status: LeaveStatus.PENDING,
    },
  })

  // 9. Seed 30-Day Attendance Records for August 2026
  console.log('⏱️ Seeding 30-Day Attendance Records for all 10 Employees...')
  
  // Today's date: 2026-08-22
  const currentDay = 22
  const currentMonthStr = '2026-08'

  for (let day = 1; day <= currentDay; day++) {
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${currentMonthStr}-${dayStr}`
    const dateObj = new Date(`${dateStr}T00:00:00.000Z`)
    const dayOfWeek = dateObj.getUTCDay() // 0 = Sunday, 6 = Saturday

    // Skip Sundays
    if (dayOfWeek === 0) continue

    // Public Holiday: Aug 15 (Independence Day)
    if (day === 15) continue

    for (const user of seededUsers) {
      // Special Cases for August 22 (TODAY):
      if (day === 22) {
        if (user.id === 'emp-001' || user.id === 'emp-002' || user.id === 'emp-003' || user.id === 'emp-004' || user.id === 'emp-007') {
          // Present and Checked in right now! 🟢
          const checkIn = new Date(`${dateStr}T09:02:15.000Z`)
          await prisma.attendance.create({
            data: {
              userId: user.id,
              employeeId: user.id,
              date: dateObj,
              businessDate: dateStr,
              checkIn,
              checkOut: null, // Still working right now!
              workHoursMinutes: 320,
              extraHoursMinutes: 0,
              status: AttendanceStatusType.PRESENT,
              isLate: false,
            },
          })
        } else if (user.id === 'emp-005') {
          // On Approved Leave Today ✈️
          await prisma.attendance.create({
            data: {
              userId: user.id,
              employeeId: user.id,
              date: dateObj,
              businessDate: dateStr,
              checkIn: null,
              checkOut: null,
              workHoursMinutes: 0,
              extraHoursMinutes: 0,
              status: AttendanceStatusType.ON_LEAVE,
              notes: 'On Approved Leave: Design Summit',
            },
          })
        } else {
          // Absent today 🟡
          // No record or absent record
        }
        continue
      }

      // Past Days (Aug 1 to Aug 21):
      // Check if user was on approved leave on this day
      if (user.id === 'emp-004' && day >= 10 && day <= 12) {
        // John Doe on Vacation
        await prisma.attendance.create({
          data: {
            userId: user.id,
            employeeId: user.id,
            date: dateObj,
            businessDate: dateStr,
            checkIn: null,
            checkOut: null,
            workHoursMinutes: 0,
            extraHoursMinutes: 0,
            status: AttendanceStatusType.ON_LEAVE,
            notes: 'Approved Vacation',
          },
        })
        continue
      }

      if (user.id === 'emp-005' && day === 21) {
        // Jane Smith on Leave
        await prisma.attendance.create({
          data: {
            userId: user.id,
            employeeId: user.id,
            date: dateObj,
            businessDate: dateStr,
            checkIn: null,
            checkOut: null,
            workHoursMinutes: 0,
            extraHoursMinutes: 0,
            status: AttendanceStatusType.ON_LEAVE,
            notes: 'Design Summit',
          },
        })
        continue
      }

      // Occasional half-day or missing check-out for demo realism
      if (user.id === 'emp-009' && day === 14) {
        // Half Day
        const checkIn = new Date(`${dateStr}T09:30:00.000Z`)
        const checkOut = new Date(`${dateStr}T13:30:00.000Z`)
        await prisma.attendance.create({
          data: {
            userId: user.id,
            employeeId: user.id,
            date: dateObj,
            businessDate: dateStr,
            checkIn,
            checkOut,
            workHoursMinutes: 240, // 4 hours
            extraHoursMinutes: 0,
            status: AttendanceStatusType.HALF_DAY,
            isLate: true,
            notes: 'Half Day - Dentist Appointment',
          },
        })
        continue
      }

      if (user.id === 'emp-008' && day === 18) {
        // Missing Check-Out (Perfect for Admin Correction Demo!)
        const checkIn = new Date(`${dateStr}T09:05:00.000Z`)
        await prisma.attendance.create({
          data: {
            userId: user.id,
            employeeId: user.id,
            date: dateObj,
            businessDate: dateStr,
            checkIn,
            checkOut: null, // Missing!
            workHoursMinutes: null,
            extraHoursMinutes: null,
            status: AttendanceStatusType.PRESENT,
            isLate: false,
            notes: 'Employee forgot to punch out',
          },
        })
        continue
      }

      // Normal Regular Attendance Day:
      // Randomize check-in between 08:45 AM and 09:15 AM
      const checkInMinutes = 45 + ((day * 7 + user.yearlySerial * 3) % 30) // 8:45 to 9:15
      const checkInHour = checkInMinutes >= 60 ? 9 : 8
      const checkInMin = checkInMinutes % 60
      const isLate = checkInHour === 9 && checkInMin > 15

      // Check-out between 18:30 and 19:45
      const checkOutMinutes = 30 + ((day * 11 + user.yearlySerial * 5) % 45) // 18:30 to 19:15
      const checkOutHour = 18 + Math.floor(checkOutMinutes / 60)
      const checkOutMin = checkOutMinutes % 60

      const checkInTime = new Date(`${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00.000Z`)
      const checkOutTime = new Date(`${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00.000Z`)

      const durationMinutes = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60))
      const extraHoursMinutes = Math.max(0, durationMinutes - 480)

      await prisma.attendance.create({
        data: {
          userId: user.id,
          employeeId: user.id,
          date: dateObj,
          businessDate: dateStr,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          workHoursMinutes: durationMinutes,
          extraHoursMinutes,
          status: AttendanceStatusType.PRESENT,
          isLate,
        },
      })
    }
  }

  // 9. Seed Realistic Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 'notif-001',
        type: 'LEAVE_PENDING_ADMIN',
        recipientId: 'emp-001',
        message: 'Vikram Patel requested 2 days Sick Leave (Aug 25 – Aug 26).',
        metadata: { leaveRequestId: 'cmt45s7la001otujs0n1wzn7l', employeeName: 'Vikram Patel' },
        createdAt: new Date('2026-08-22T08:30:00Z'),
      },
      {
        id: 'notif-002',
        type: 'LEAVE_PENDING_ADMIN',
        recipientId: 'emp-001',
        message: 'Amit Kumar requested 2 days Paid Time Off (Aug 28 – Aug 29).',
        metadata: { leaveRequestId: 'cmt45s7ls001qtujsxep2ufkx', employeeName: 'Amit Kumar' },
        createdAt: new Date('2026-08-22T08:45:00Z'),
      },
      {
        id: 'notif-003',
        type: 'PASSWORD_RESET',
        recipientId: 'emp-001',
        message: 'August 2026 attendance and payroll cycles are open for validation.',
        metadata: {},
        createdAt: new Date('2026-08-22T09:00:00Z'),
      },
      {
        id: 'notif-004',
        type: 'LEAVE_PENDING_ADMIN',
        recipientId: 'emp-002',
        message: 'Vikram Patel requested 2 days Sick Leave (Aug 25 – Aug 26).',
        metadata: { leaveRequestId: 'cmt45s7la001otujs0n1wzn7l', employeeName: 'Vikram Patel' },
        createdAt: new Date('2026-08-22T08:30:00Z'),
      },
      {
        id: 'notif-005',
        type: 'LEAVE_APPROVED',
        recipientId: 'emp-004',
        message: 'Your Paid Time Off request for Aug 10 – Aug 12 (3 days) has been approved by Priya Sharma.',
        metadata: { status: 'APPROVED' },
        createdAt: new Date('2026-08-05T10:00:00Z'),
      },
      {
        id: 'notif-006',
        type: 'LEAVE_APPROVED',
        recipientId: 'emp-005',
        message: 'Your Paid Time Off request for Aug 21 – Aug 23 (2 days) has been approved by Priya Sharma.',
        metadata: { status: 'APPROVED' },
        createdAt: new Date('2026-08-18T10:00:00Z'),
      },
      {
        id: 'notif-007',
        type: 'LEAVE_SUBMITTED',
        recipientId: 'emp-006',
        message: 'Your Sick Leave application for Aug 25 – Aug 26 has been submitted for approval.',
        metadata: { status: 'PENDING' },
        createdAt: new Date('2026-08-22T08:30:00Z'),
      },
    ],
  })

  console.log('✅ Master Database Seeding Completed Successfully!')
  console.log('------------------------------------------------------------')
  console.log('👑 Admin Account:   admin@odoo.com / Admin@123456 (Login ID: OIADWR20200001)')
  console.log('👑 HR Manager:      hr@odoo.com / Admin@123456    (Login ID: OIPRSH20210002)')
  console.log('👤 Employee 1:      john.doe@odoo.com / Emp@123456 (Login ID: OIJODO20220004)')
  console.log('👤 Employee 2:      jane.smith@odoo.com / Emp@123456 (Login ID: OIJASM20230005)')
  console.log('👤 Employee 3:      vikram.patel@odoo.com / Emp@123456 (Login ID: OIVIPA20230006)')
  console.log('------------------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
