export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface UserSession {
  id: string;
  loginId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  mustChangePassword?: boolean;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumeData {
  about: string;
  whatILoveAboutJob: string;
  interestsAndHobbies: string;
  skills: Skill[];
  certifications: Certification[];
}

export interface PrivateInfo {
  dateOfBirth: string;
  residingAddress: string;
  nationality: string;
  personalEmail: string;
  gender: string;
  maritalStatus: string;
  dateOfJoining: string;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifsc: string;
  pan: string;
  uan: string;
  employeeCode: string;
}

export interface DocumentRecord {
  id: string;
  employeeId: string;
  documentType: 'ID Proof' | 'Degree Certificate' | 'Offer Letter' | 'Payslip' | 'Tax Document' | 'Resume' | 'Other';
  filename: string;
  uploadedDate: string;
  uploadedBy: string;
  fileSizeBytes: number;
  mimeType: string;
  fileUrl: string;
}

export interface SalaryConfig {
  monthlyWage: number;
  workingDaysPerWeek: number;
  breakTimeMinutes: number;
  standardAllowance?: number;
  basicPercentage?: number; // default 50
  hraPercentage?: number; // default 50% of Basic
  bonusPercentage?: number; // default 8.33% of Basic
  ltaPercentage?: number; // default 8.33% of Basic
}

export interface SalaryComponentItem {
  id: string;
  name: string;
  percentageBasis?: 'WAGE' | 'BASIC' | 'FIXED';
  percentageValue?: number;
  monthlyAmount: number;
  yearlyAmount: number;
  isCalculated: boolean;
  isEditablePercentage: boolean;
  isEditableAmount: boolean;
  description?: string;
}

export interface SalaryBreakdown {
  userId?: string;
  monthlyWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  breakTimeMinutes: number;
  
  // Earnings Components
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  totalEarnings: number;

  // Deductions & Statutory
  employeePf: number; // 12% of Basic
  employerPf: number; // 12% of Basic
  professionalTax: number; // Rs 200/month
  totalDeductions: number;

  // Net Pay and CTC
  netTakeHomeMonthly: number;
  netTakeHomeYearly: number;
  totalCtcMonthly: number;
  totalCtcYearly: number;

  // Granular component details
  components: SalaryComponentItem[];

  isValid: boolean;
  validationErrors?: string[];
}

export interface EmployeeProfile {
  id: string;
  loginId: string; // System generated, immutable
  name: string;
  avatar: string;
  email: string;
  mobile: string;
  company: string;
  department: string;
  manager: string;
  location: string;
  designation: string;
  dateOfJoining: string;
  
  resume: ResumeData;
  
  // Sensitive sections (sanitized based on role)
  privateInfo?: PrivateInfo;
  bankDetails?: BankDetails;
  salaryConfig?: SalaryConfig;

  // Computed permission flags for UI rendering
  permissions?: {
    isOwner: boolean;
    canEditPersonal: boolean;
    canEditOrg: boolean;
    canEditPrivate: boolean;
    canViewPrivate: boolean;
    canViewSalary: boolean;
    canEditSalary: boolean;
    canUploadAvatar: boolean;
    canManageDocs: boolean;
    canChangePassword: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
