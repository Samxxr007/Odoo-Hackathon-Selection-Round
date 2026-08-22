import { PrismaClient } from '@prisma/client'
import { 
  EmployeeProfile, 
  PrivateInfo, 
  BankDetails, 
  SalaryConfig, 
  DocumentRecord, 
  UserRole 
} from './types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ─────────────────────────────────────────────
// Member 2 In-Memory Store & Helpers
// ─────────────────────────────────────────────

export interface DbUserRecord {
  id: string
  loginId: string
  passwordHash: string
  mustChangePassword: boolean
  role: UserRole
  profile: EmployeeProfile
  privateInfo: PrivateInfo
  bankDetails: BankDetails
  salaryConfig: SalaryConfig
  documents: DocumentRecord[]
}

export function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `sha256_${Math.abs(hash).toString(16)}_${str.length}`
}

const initialUsers: DbUserRecord[] = [
  {
    id: 'EMP-001',
    loginId: 'EMP-001',
    passwordHash: simpleHash('Password123!'),
    mustChangePassword: false,
    role: 'ADMIN',
    profile: {
      id: 'EMP-001',
      loginId: 'EMP-001',
      name: 'Alexander Wright',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      email: 'admin@company.com',
      mobile: '+91 98765 43210',
      company: 'Odoo Technologies India Pvt Ltd',
      department: 'Executive Leadership',
      manager: 'Board of Directors',
      location: 'Gandhinagar, Gujarat',
      designation: 'Chief Technology Officer',
      dateOfJoining: '2020-01-15',
      resume: {
        about: 'Visionary engineering executive with 15+ years of experience scaling enterprise SaaS platforms.',
        whatILoveAboutJob: 'Mentoring top engineering talent and building architectural foundations.',
        interestsAndHobbies: 'Cloud Architecture, Open Source Contribution, Mountain Biking, Chess.',
        skills: [
          { id: 's1', name: 'System Architecture', level: 'Expert', category: 'Engineering' },
          { id: 's2', name: 'TypeScript / Node.js', level: 'Expert', category: 'Engineering' },
          { id: 's3', name: 'Strategic Leadership', level: 'Expert', category: 'Management' },
        ],
        certifications: [
          {
            id: 'c1',
            name: 'AWS Certified Solutions Architect - Professional',
            issuingOrg: 'Amazon Web Services',
            issueDate: '2021-04-10',
            expiryDate: '2024-04-10',
            credentialId: 'AWS-PSA-99124',
            credentialUrl: 'https://aws.amazon.com/verification',
          }
        ]
      }
    },
    privateInfo: {
      dateOfBirth: '1985-04-12',
      residingAddress: 'Flat 1204, Skyline Towers, Infocity, Gandhinagar - 382007',
      nationality: 'Indian',
      personalEmail: 'alex.wright.personal@gmail.com',
      gender: 'Male',
      maritalStatus: 'Married',
      dateOfJoining: '2020-01-15',
    },
    bankDetails: {
      accountNumber: '918020038472910',
      bankName: 'HDFC Bank Ltd',
      ifsc: 'HDFC0001042',
      pan: 'ABCDE1234F',
      uan: '100928374651',
      employeeCode: 'EMP-001',
    },
    salaryConfig: {
      monthlyWage: 150000,
      workingDaysPerWeek: 5,
      breakTimeMinutes: 60,
      standardAllowance: 0,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    },
    documents: [
      {
        id: 'doc-1',
        employeeId: 'EMP-001',
        documentType: 'ID Proof',
        filename: 'Passport_Scan.pdf',
        uploadedDate: '2020-01-16',
        uploadedBy: 'Alexander Wright',
        fileSizeBytes: 1450000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/EMP-001/Passport_Scan.pdf',
      },
    ],
  },
  {
    id: 'EMP-002',
    loginId: 'EMP-002',
    passwordHash: simpleHash('Password123!'),
    mustChangePassword: false,
    role: 'HR',
    profile: {
      id: 'EMP-002',
      loginId: 'EMP-002',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      email: 'hr@company.com',
      mobile: '+91 98765 43211',
      company: 'Odoo Technologies India Pvt Ltd',
      department: 'Human Resources',
      manager: 'Alexander Wright',
      location: 'Gandhinagar, Gujarat',
      designation: 'Senior HR Manager',
      dateOfJoining: '2021-03-10',
      resume: {
        about: 'Passionate HR professional specializing in talent acquisition, organizational culture, and employee welfare.',
        whatILoveAboutJob: 'Empowering employees and creating a collaborative high-growth culture.',
        interestsAndHobbies: 'Talent Analytics, Public Speaking, Yoga, Reading.',
        skills: [
          { id: 's4', name: 'HR Operations', level: 'Expert', category: 'Human Resources' },
          { id: 's5', name: 'Payroll & Compliance', level: 'Advanced', category: 'Finance & HR' },
          { id: 's6', name: 'Conflict Resolution', level: 'Expert', category: 'Management' },
        ],
        certifications: [
          {
            id: 'c2',
            name: 'SHRM Senior Certified Professional (SHRM-SCP)',
            issuingOrg: 'SHRM',
            issueDate: '2021-08-20',
            expiryDate: '2024-08-20',
            credentialId: 'SHRM-SCP-55812',
            credentialUrl: 'https://shrm.org/verify',
          }
        ]
      }
    },
    privateInfo: {
      dateOfBirth: '1990-09-22',
      residingAddress: 'B-302, Green Acres, Kudasan, Gandhinagar - 382421',
      nationality: 'Indian',
      personalEmail: 'priya.sharma.hr@outlook.com',
      gender: 'Female',
      maritalStatus: 'Single',
      dateOfJoining: '2021-03-10',
    },
    bankDetails: {
      accountNumber: '501002394857211',
      bankName: 'ICICI Bank Ltd',
      ifsc: 'ICIC0000847',
      pan: 'PRYSH5678G',
      uan: '100482910394',
      employeeCode: 'EMP-002',
    },
    salaryConfig: {
      monthlyWage: 85000,
      workingDaysPerWeek: 5,
      breakTimeMinutes: 60,
      standardAllowance: 0,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    },
    documents: [],
  },
  {
    id: 'EMP-003',
    loginId: 'EMP-003',
    passwordHash: simpleHash('Password123!'),
    mustChangePassword: false,
    role: 'EMPLOYEE',
    profile: {
      id: 'EMP-003',
      loginId: 'EMP-003',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      email: 'john.doe@company.com',
      mobile: '+91 98765 43212',
      company: 'Odoo Technologies India Pvt Ltd',
      department: 'Engineering',
      manager: 'Alexander Wright',
      location: 'Gandhinagar, Gujarat',
      designation: 'Senior Full Stack Engineer',
      dateOfJoining: '2022-06-01',
      resume: {
        about: 'Full-stack software engineer passionate about clean code, high-performance web applications, and intuitive user experiences.',
        whatILoveAboutJob: 'Solving complex distributed systems problems and shipping features used by thousands of customers daily.',
        interestsAndHobbies: 'TypeScript, Web Performance, Open Source, Mechanical Keyboards, Hiking.',
        skills: [
          { id: 's7', name: 'React / Next.js', level: 'Expert', category: 'Frontend' },
          { id: 's8', name: 'Node.js / Express', level: 'Advanced', category: 'Backend' },
          { id: 's9', name: 'PostgreSQL & Database Design', level: 'Advanced', category: 'Database' },
          { id: 's10', name: 'Tailwind CSS', level: 'Expert', category: 'Frontend' },
        ],
        certifications: [
          {
            id: 'c3',
            name: 'Meta Front-End Developer Professional Certificate',
            issuingOrg: 'Meta / Coursera',
            issueDate: '2022-11-15',
            credentialId: 'META-FE-778912',
            credentialUrl: 'https://coursera.org/verify/META-FE-778912',
          },
          {
            id: 'c4',
            name: 'CKA: Certified Kubernetes Administrator',
            issuingOrg: 'Linux Foundation',
            issueDate: '2023-05-10',
            expiryDate: '2026-05-10',
            credentialId: 'LF-CKA-99214',
            credentialUrl: 'https://cncf.io/verify',
          }
        ]
      }
    },
    privateInfo: {
      dateOfBirth: '1995-11-08',
      residingAddress: '404, Tech Park Residency, SG Highway, Ahmedabad - 380054',
      nationality: 'Indian',
      personalEmail: 'john.doe.personal@gmail.com',
      gender: 'Male',
      maritalStatus: 'Single',
      dateOfJoining: '2022-06-01',
    },
    bankDetails: {
      accountNumber: '334001928475829',
      bankName: 'State Bank of India',
      ifsc: 'SBIN0004921',
      pan: 'JOHND9988K',
      uan: '101293847561',
      employeeCode: 'EMP-003',
    },
    salaryConfig: {
      monthlyWage: 50000,
      workingDaysPerWeek: 5,
      breakTimeMinutes: 60,
      standardAllowance: 0,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    },
    documents: [
      {
        id: 'doc-2',
        employeeId: 'EMP-003',
        documentType: 'Offer Letter',
        filename: 'Odoo_Offer_Letter_JohnDoe.pdf',
        uploadedDate: '2022-05-20',
        uploadedBy: 'Priya Sharma (HR)',
        fileSizeBytes: 2450000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/EMP-003/Odoo_Offer_Letter_JohnDoe.pdf',
      },
      {
        id: 'doc-3',
        employeeId: 'EMP-003',
        documentType: 'Degree Certificate',
        filename: 'BTech_ComputerScience_Degree.pdf',
        uploadedDate: '2022-06-02',
        uploadedBy: 'John Doe',
        fileSizeBytes: 3100000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/EMP-003/BTech_ComputerScience_Degree.pdf',
      },
    ],
  },
  {
    id: 'EMP-004',
    loginId: 'EMP-004',
    passwordHash: simpleHash('Password123!'),
    mustChangePassword: true,
    role: 'EMPLOYEE',
    profile: {
      id: 'EMP-004',
      loginId: 'EMP-004',
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      email: 'jane.smith@company.com',
      mobile: '+91 98765 43213',
      company: 'Odoo Technologies India Pvt Ltd',
      department: 'Product Design',
      manager: 'Priya Sharma',
      location: 'Bangalore, Karnataka',
      designation: 'Lead UI/UX Designer',
      dateOfJoining: '2023-01-16',
      resume: {
        about: 'Digital product designer crafting accessible design systems, user journeys, and micro-interactions.',
        whatILoveAboutJob: 'Bridging the gap between user psychology, branding, and delightful engineering execution.',
        interestsAndHobbies: 'Design Systems, Typography, Coffee Brewing, Street Photography.',
        skills: [
          { id: 's11', name: 'Figma & Design Systems', level: 'Expert', category: 'Design' },
          { id: 's12', name: 'User Research & Wireframing', level: 'Expert', category: 'UX' },
          { id: 's13', name: 'Interaction Prototyping', level: 'Advanced', category: 'Design' },
        ],
        certifications: [
          {
            id: 'c5',
            name: 'Nielsen Norman Group UX Master Certified',
            issuingOrg: 'NN/g',
            issueDate: '2022-04-18',
            credentialId: 'NNG-UXM-4421',
            credentialUrl: 'https://nngroup.com/verify',
          }
        ]
      }
    },
    privateInfo: {
      dateOfBirth: '1994-07-14',
      residingAddress: 'Flat 502, Palm Meadows, Indiranagar, Bangalore - 560038',
      nationality: 'Indian',
      personalEmail: 'jane.smith.design@gmail.com',
      gender: 'Female',
      maritalStatus: 'Married',
      dateOfJoining: '2023-01-16',
    },
    bankDetails: {
      accountNumber: '445902817264821',
      bankName: 'Axis Bank Ltd',
      ifsc: 'UTIB0000451',
      pan: 'JANES4433P',
      uan: '101482910293',
      employeeCode: 'EMP-004',
    },
    salaryConfig: {
      monthlyWage: 75000,
      workingDaysPerWeek: 5,
      breakTimeMinutes: 60,
      standardAllowance: 0,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    },
    documents: [
      {
        id: 'doc-4',
        employeeId: 'EMP-004',
        documentType: 'Resume',
        filename: 'Jane_Smith_Design_Portfolio.pdf',
        uploadedDate: '2023-01-10',
        uploadedBy: 'Jane Smith',
        fileSizeBytes: 4200000,
        mimeType: 'application/pdf',
        fileUrl: '/uploads/EMP-004/Jane_Smith_Design_Portfolio.pdf',
      }
    ],
  }
]

let databaseUsers: DbUserRecord[] = JSON.parse(JSON.stringify(initialUsers))

export function getAllDbUsers(): DbUserRecord[] {
  return databaseUsers
}

export function getDbUserById(id: string): DbUserRecord | null {
  return databaseUsers.find(u => u.id === id || u.loginId === id || u.profile.email.toLowerCase() === id.toLowerCase()) || null
}

export async function getDbUserByIdAsync(id: string): Promise<DbUserRecord | null> {
  const existing = databaseUsers.find(u => u.id === id || u.loginId === id || u.profile.email.toLowerCase() === id.toLowerCase())
  if (existing) return existing

  try {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { id },
          { loginId: id },
          { email: id },
        ],
      },
      include: { company: true },
    })

    if (!user) return null

    const record: DbUserRecord = {
      id: user.id,
      loginId: user.loginId || user.id,
      passwordHash: user.passwordHash,
      mustChangePassword: user.mustChangePassword,
      role: user.role as any,
      profile: {
        id: user.id,
        loginId: user.loginId || user.id,
        name: user.name,
        email: user.email,
        mobile: user.phone || '+91 98765 43210',
        company: user.company?.name || 'Odoo HRMS Company',
        department: user.department || 'General',
        designation: user.designation || 'Employee',
        manager: 'Manager',
        location: user.location || 'Gandhinagar, Gujarat',
        dateOfJoining: user.joiningDate ? user.joiningDate.toISOString().split('T')[0] : '2026-01-15',
        avatar: user.avatarUrl || user.profilePhotoUrl || '',
        resume: {
          about: `${user.name} is an employee at ${user.company?.name || 'Odoo HRMS Company'}.`,
          whatILoveAboutJob: 'Building enterprise software solutions and collaborating with modern teams.',
          interestsAndHobbies: 'Technology, Problem Solving, Continuous Learning.',
          skills: [
            { id: 's1', name: 'Software Engineering', level: 'Intermediate', category: 'Engineering' },
            { id: 's2', name: 'Communication', level: 'Advanced', category: 'Soft Skills' },
          ],
          certifications: [],
        },
      },
      privateInfo: {
        dateOfBirth: '1995-06-15',
        residingAddress: user.location || 'Gandhinagar, Gujarat',
        nationality: 'Indian',
        personalEmail: user.email,
        gender: 'Not Specified',
        maritalStatus: 'Single',
        dateOfJoining: user.joiningDate ? user.joiningDate.toISOString().split('T')[0] : '2026-01-15',
      },
      bankDetails: {
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifsc: 'HDFC0001234',
        employeeCode: user.loginId || user.id,
        pan: 'ABCDE1234F',
        uan: '100900800700',
      },
      salaryConfig: {
        monthlyWage: 50000,
        workingDaysPerWeek: 5,
        breakTimeMinutes: 60,
        basicPercentage: 50,
        hraPercentage: 50,
      },
      documents: [],
    }

    databaseUsers.push(record)
    return record
  } catch (e) {
    console.error('Error fetching Prisma user in getDbUserByIdAsync:', e)
    return null
  }
}

export function getDbUserByEmail(email: string): DbUserRecord | null {
  return databaseUsers.find(u => u.profile.email.toLowerCase() === email.toLowerCase()) || null
}

export function getEmployeeSalaryConfigFromDb(userId: string): SalaryConfig | null {
  const user = getDbUserById(userId)
  return user ? user.salaryConfig : null
}

export function updateEmployeeProfileInDb(userId: string, updates: Partial<EmployeeProfile>): DbUserRecord | null {
  const user = getDbUserById(userId)
  if (!user) return null

  const { loginId, id, ...allowedUpdates } = updates as any
  
  if (allowedUpdates.resume) {
    user.profile.resume = {
      ...user.profile.resume,
      ...allowedUpdates.resume
    }
  }

  user.profile = {
    ...user.profile,
    ...allowedUpdates,
    id: user.id,
    loginId: user.loginId,
    resume: user.profile.resume,
  }

  return user
}

export function updatePrivateInfoInDb(userId: string, updates: Partial<PrivateInfo>): DbUserRecord | null {
  const user = getDbUserById(userId)
  if (!user) return null

  user.privateInfo = {
    ...user.privateInfo,
    ...updates,
  }

  return user
}

export function updateBankDetailsInDb(userId: string, updates: Partial<BankDetails>): DbUserRecord | null {
  const user = getDbUserById(userId)
  if (!user) return null

  user.bankDetails = {
    ...user.bankDetails,
    ...updates,
    employeeCode: user.bankDetails.employeeCode,
  }

  return user
}

export function updateSalaryConfigInDb(userId: string, config: Partial<SalaryConfig>): DbUserRecord | null {
  const user = getDbUserById(userId)
  if (!user) return null

  user.salaryConfig = {
    ...user.salaryConfig,
    ...config,
  }

  return user
}

export function updatePasswordInDb(userId: string, newPasswordHash: string): boolean {
  const user = getDbUserById(userId)
  if (!user) return false

  user.passwordHash = newPasswordHash
  user.mustChangePassword = false
  return true
}

export function addDocumentToDb(userId: string, doc: Omit<DocumentRecord, 'id'>): DocumentRecord | null {
  const user = getDbUserById(userId)
  if (!user) return null

  const newDoc: DocumentRecord = {
    ...doc,
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  }

  user.documents.push(newDoc)
  return newDoc
}

export function deleteDocumentFromDb(userId: string, docId: string): boolean {
  const user = getDbUserById(userId)
  if (!user) return false

  const index = user.documents.findIndex(d => d.id === docId)
  if (index === -1) return false

  user.documents.splice(index, 1)
  return true
}

export function resetDatabase(): void {
  databaseUsers = JSON.parse(JSON.stringify(initialUsers))
}
