import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Check if demo company exists
  const existingCompany = await prisma.company.findUnique({
    where: { name: 'Odoo India' },
  })

  if (existingCompany) {
    console.log('Company already exists. Skipping seed.')
    return
  }

  const passwordHash = await bcrypt.hash('Admin@123456', 12)
  const employeePasswordHash = await bcrypt.hash('Emp@123456', 12)

  // Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Odoo India',
      logoUrl: null,
    },
  })

  // Initialize Yearly Serial
  const year = new Date().getFullYear()
  await prisma.yearlySerial.create({
    data: {
      companyId: company.id,
      year,
      lastSerial: 3,
    },
  })

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      loginId: `OIADMN${year}0001`,
      email: 'admin@odoo.com',
      passwordHash,
      name: 'Admin User',
      phone: '+91 98765 43210',
      role: Role.ADMIN,
      companyId: company.id,
      department: 'Management',
      designation: 'Operations Director',
      joiningDate: new Date(),
      joiningYear: year,
      yearlySerial: 1,
      location: 'Gandhinagar',
      emailVerified: true,
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Create Sample Employees
  const emp1 = await prisma.user.create({
    data: {
      loginId: `OIJODO${year}0002`,
      email: 'john.doe@odoo.com',
      passwordHash: employeePasswordHash,
      name: 'John Doe',
      phone: '+91 98765 00001',
      role: Role.EMPLOYEE,
      companyId: company.id,
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      joiningDate: new Date(),
      joiningYear: year,
      yearlySerial: 2,
      location: 'Gandhinagar',
      managerId: admin.id,
      emailVerified: true,
      mustChangePassword: false,
      isActive: true,
    },
  })

  const emp2 = await prisma.user.create({
    data: {
      loginId: `OISASM${year}0003`,
      email: 'sarah.smith@odoo.com',
      passwordHash: employeePasswordHash,
      name: 'Sarah Smith',
      phone: '+91 98765 00002',
      role: Role.EMPLOYEE,
      companyId: company.id,
      department: 'Human Resources',
      designation: 'HR Specialist',
      joiningDate: new Date(),
      joiningYear: year,
      yearlySerial: 3,
      location: 'Mumbai',
      managerId: admin.id,
      emailVerified: true,
      mustChangePassword: false,
      isActive: true,
    },
  })

  console.log('Seed completed successfully!')
  console.log('Admin Account:   admin@odoo.com / Admin@123456 (Login ID: ' + admin.loginId + ')')
  console.log('Employee 1:      john.doe@odoo.com / Emp@123456 (Login ID: ' + emp1.loginId + ')')
  console.log('Employee 2:      sarah.smith@odoo.com / Emp@123456 (Login ID: ' + emp2.loginId + ')')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
