import { 
  UserProfile, 
  LeaveRequest, 
  ClaimRequest, 
  TrainingApplication,
  TrainingEntitlement,
  LeaveBalance,
  Invoice,
  Bill,
  PayrollRun,
  PayrollItem,
  Payslip,
  DocLink,
  AppSettings 
} from '../types';
import { generateId, addYears } from '../utils';

// ============================================
// STAFF MEMBERS
// ============================================

export const seedStaff: UserProfile[] = [
  {
    id: 'user-admin-001',
    name: 'Ahmad Rizal',
    email: 'ahmad@theaihq.net',
    role: 'admin',
    businessArm: 'Solutions',
    joinDate: '2022-01-15',
    isActive: true,
    salaryBase: 8000,
    epfRate: 11,
    socsoRate: 2,
  },
  {
    id: 'user-staff-001',
    name: 'Siti Nurhaliza',
    email: 'siti@theaihq.net',
    role: 'staff',
    businessArm: 'Training',
    joinDate: '2023-03-01',
    isActive: true,
    salaryBase: 4500,
    epfRate: 11,
    socsoRate: 2,
  },
  {
    id: 'user-staff-002',
    name: 'Wani Ibrahim',
    email: 'wani@theaihq.net',
    role: 'staff',
    businessArm: 'Solutions',
    joinDate: '2023-06-15',
    isActive: true,
    salaryBase: 5000,
    epfRate: 11,
    socsoRate: 2,
  },
  {
    id: 'user-staff-003',
    name: 'Kumar Rajan',
    email: 'kumar@theaihq.net',
    role: 'staff',
    businessArm: 'Training',
    joinDate: '2024-01-10',
    isActive: true,
    salaryBase: 4000,
    epfRate: 11,
    socsoRate: 2,
  },
];

// ============================================
// LEAVE BALANCES
// ============================================

const currentYear = new Date().getFullYear();

export const seedLeaveBalances: LeaveBalance[] = seedStaff.map(staff => ({
  userId: staff.id,
  year: currentYear,
  alTotal: 14,
  alUsed: staff.id === 'user-staff-001' ? 3 : 0,
  alCarryForward: 0,
  slTotal: 10,
  slUsed: staff.id === 'user-staff-002' ? 1 : 0,
}));

// ============================================
// TRAINING ENTITLEMENTS
// ============================================

export const seedTrainingEntitlements: TrainingEntitlement[] = seedStaff.map(staff => ({
  userId: staff.id,
  eligibleFrom: addYears(staff.joinDate, 1),
  annualAmount: 1500,
  usedAmount: staff.id === 'user-staff-001' ? 500 : 0,
}));

// ============================================
// LEAVE REQUESTS
// ============================================

export const seedLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-001',
    type: 'Leave',
    userId: 'user-staff-001',
    status: 'Approved',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T14:00:00Z',
    leaveType: 'AL',
    startDate: '2024-11-15',
    endDate: '2024-11-17',
    halfDay: false,
    reason: 'Family vacation',
    adminComment: 'Approved. Enjoy your break!',
  },
  {
    id: 'leave-002',
    type: 'Leave',
    userId: 'user-staff-002',
    status: 'Pending',
    createdAt: '2024-12-20T10:30:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    leaveType: 'AL',
    startDate: '2024-12-27',
    endDate: '2024-12-28',
    halfDay: false,
    reason: 'Year-end holiday',
  },
  {
    id: 'leave-003',
    type: 'Leave',
    userId: 'user-staff-002',
    status: 'Approved',
    createdAt: '2024-10-05T08:00:00Z',
    updatedAt: '2024-10-05T15:00:00Z',
    leaveType: 'SL',
    startDate: '2024-10-06',
    endDate: '2024-10-06',
    halfDay: false,
    reason: 'Not feeling well',
  },
];

// ============================================
// CLAIM REQUESTS
// ============================================

export const seedClaimRequests: ClaimRequest[] = [
  {
    id: 'claim-001',
    type: 'Claim',
    userId: 'user-staff-001',
    status: 'Approved',
    createdAt: '2024-11-10T11:00:00Z',
    updatedAt: '2024-11-10T11:00:00Z',
    amount: 25,
    category: 'Transport',
    description: 'Grab to client meeting',
    autoApproved: true,
    includedInPayrollMonth: '2024-12',
  },
  {
    id: 'claim-002',
    type: 'Claim',
    userId: 'user-staff-001',
    status: 'Pending',
    createdAt: '2024-12-15T14:00:00Z',
    updatedAt: '2024-12-15T14:00:00Z',
    amount: 150,
    category: 'Equipment',
    description: 'USB-C Hub for laptop',
    autoApproved: false,
    receiptMeta: {
      fileName: 'receipt-usb-hub.jpg',
      fileSize: 245000,
      fileType: 'image/jpeg',
      uploadedAt: '2024-12-15T14:00:00Z',
    },
  },
  {
    id: 'claim-003',
    type: 'Claim',
    userId: 'user-staff-002',
    status: 'Approved',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-11-20T16:00:00Z',
    amount: 45,
    category: 'Meals',
    description: 'Team lunch with client',
    autoApproved: false,
    adminComment: 'Approved',
  },
];

// ============================================
// TRAINING APPLICATIONS
// ============================================

export const seedTrainingApplications: TrainingApplication[] = [
  {
    id: 'training-001',
    userId: 'user-staff-001',
    courseName: 'Advanced React Patterns',
    provider: 'Frontend Masters',
    cost: 500,
    link: 'https://frontendmasters.com/courses/react-patterns/',
    justification: 'To improve our frontend development capabilities for client projects',
    status: 'Completed',
    createdAt: '2024-09-01T10:00:00Z',
    approvedAt: '2024-09-02T09:00:00Z',
    completedAt: '2024-10-15T18:00:00Z',
  },
  {
    id: 'training-002',
    userId: 'user-staff-002',
    courseName: 'AI for Business Leaders',
    provider: 'Coursera',
    cost: 300,
    link: 'https://coursera.org/ai-business',
    justification: 'Understanding AI trends to better support our Solutions arm',
    status: 'Submitted',
    createdAt: '2024-12-18T11:00:00Z',
  },
];

// ============================================
// INVOICES
// ============================================

export const seedInvoices: Invoice[] = [
  {
    id: 'inv-001',
    createdBy: 'user-admin-001',
    invoiceNumber: 'INV00001',
    businessArm: 'Training',
    clientName: 'ABC Corp',
    issueDate: '2024-11-01',
    dueDate: '2024-11-30',
    status: 'Paid',
    items: [
      { description: 'AI Workshop (2 days)', quantity: 1, unitPrice: 8000, total: 8000 },
      { description: 'Materials', quantity: 20, unitPrice: 50, total: 1000 },
    ],
    total: 9000,
    paidDate: '2024-11-25',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-25T14:00:00Z',
  },
  {
    id: 'inv-002',
    createdBy: 'user-admin-001',
    invoiceNumber: 'INV00002',
    businessArm: 'Solutions',
    clientName: 'XYZ Sdn Bhd',
    issueDate: '2024-11-15',
    dueDate: '2024-12-15',
    status: 'Paid',
    items: [
      { description: 'Chatbot Development', quantity: 1, unitPrice: 15000, total: 15000 },
    ],
    total: 15000,
    paidDate: '2024-12-10',
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-12-10T11:00:00Z',
  },
  {
    id: 'inv-003',
    createdBy: 'user-admin-001',
    invoiceNumber: 'INV00003',
    businessArm: 'Training',
    clientName: 'DEF Industries',
    issueDate: '2024-12-01',
    dueDate: '2024-12-31',
    status: 'Sent',
    items: [
      { description: 'Data Analytics Training', quantity: 1, unitPrice: 12000, total: 12000 },
    ],
    total: 12000,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'inv-004',
    createdBy: 'user-admin-001',
    invoiceNumber: 'INV00004',
    businessArm: 'Solutions',
    issueDate: '2024-12-20',
    status: 'Draft',
    items: [
      { description: 'AI Consulting (Phase 1)', quantity: 1, unitPrice: 20000, total: 20000 },
    ],
    total: 20000,
    createdAt: '2024-12-20T15:00:00Z',
    updatedAt: '2024-12-20T15:00:00Z',
  },
];

// ============================================
// BILLS
// ============================================

export const seedBills: Bill[] = [
  {
    id: 'bill-001',
    createdBy: 'user-admin-001',
    vendorName: 'TM Net',
    category: 'Utilities',
    amount: 200,
    dueDate: '2024-11-25',
    status: 'Paid',
    paidDate: '2024-11-20',
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z',
  },
  {
    id: 'bill-002',
    createdBy: 'user-admin-001',
    vendorName: 'AWS',
    category: 'Cloud Services',
    amount: 850,
    dueDate: '2024-12-05',
    status: 'Paid',
    paidDate: '2024-12-01',
    createdAt: '2024-11-28T09:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
  },
  {
    id: 'bill-003',
    createdBy: 'user-admin-001',
    vendorName: 'WeWork',
    category: 'Office Rent',
    amount: 3500,
    dueDate: '2024-12-28',
    status: 'Draft',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z',
  },
];

// ============================================
// PAYROLL
// ============================================

export const seedPayrollRuns: PayrollRun[] = [
  {
    id: 'payroll-nov-2024',
    month: '2024-11',
    status: 'Finalized',
    createdAt: '2024-11-25T10:00:00Z',
    finalizedAt: '2024-11-28T14:00:00Z',
  },
];

export const seedPayrollItems: PayrollItem[] = [
  {
    id: 'payitem-001',
    runId: 'payroll-nov-2024',
    userId: 'user-admin-001',
    userName: 'Ahmad Rizal',
    baseSalary: 8000,
    epf: 880,
    socso: 160,
    claimsTotal: 0,
    trainingClaimsTotal: 0,
    netPay: 6960,
  },
  {
    id: 'payitem-002',
    runId: 'payroll-nov-2024',
    userId: 'user-staff-001',
    userName: 'Siti Nurhaliza',
    baseSalary: 4500,
    epf: 495,
    socso: 90,
    claimsTotal: 0,
    trainingClaimsTotal: 0,
    netPay: 3915,
  },
  {
    id: 'payitem-003',
    runId: 'payroll-nov-2024',
    userId: 'user-staff-002',
    userName: 'Wani Ibrahim',
    baseSalary: 5000,
    epf: 550,
    socso: 100,
    claimsTotal: 0,
    trainingClaimsTotal: 0,
    netPay: 4350,
  },
  {
    id: 'payitem-004',
    runId: 'payroll-nov-2024',
    userId: 'user-staff-003',
    userName: 'Kumar Rajan',
    baseSalary: 4000,
    epf: 440,
    socso: 80,
    claimsTotal: 0,
    trainingClaimsTotal: 0,
    netPay: 3480,
  },
];

export const seedPayslips: Payslip[] = seedPayrollItems.map(item => ({
  id: `payslip-${item.userId}-2024-11`,
  runId: item.runId,
  userId: item.userId,
  month: '2024-11',
  baseSalary: item.baseSalary,
  epf: item.epf,
  socso: item.socso,
  claimsTotal: item.claimsTotal,
  trainingClaimsTotal: item.trainingClaimsTotal,
  netPay: item.netPay,
  createdAt: '2024-11-28T14:00:00Z',
}));

// ============================================
// DOCUMENTS
// ============================================

export const seedDocs: DocLink[] = [
  {
    id: 'doc-001',
    title: 'Employee Handbook',
    category: 'HR Policies',
    url: 'https://docs.google.com/document/d/employee-handbook',
    description: 'Company policies, benefits, and guidelines for all employees',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-002',
    title: 'Leave Policy',
    category: 'HR Policies',
    url: 'https://docs.google.com/document/d/leave-policy',
    description: 'Annual leave, sick leave, and other leave entitlements',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-003',
    title: 'Claims SOP',
    category: 'SOPs',
    url: 'https://docs.google.com/document/d/claims-sop',
    description: 'How to submit expense claims and reimbursements',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-004',
    title: 'Training Fund Guidelines',
    category: 'Benefits',
    url: 'https://docs.google.com/document/d/training-fund',
    description: 'Eligibility and process for training fund applications',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-005',
    title: 'Brand Guidelines',
    category: 'Marketing',
    url: 'https://docs.google.com/document/d/brand-guidelines',
    description: 'Logo usage, colors, and branding standards',
    createdAt: '2024-03-15T00:00:00Z',
  },
];

// ============================================
// APP SETTINGS
// ============================================

export const seedSettings: AppSettings = {
  invoiceCounter: 4,
  invoiceCounterYear: 2024,
};
