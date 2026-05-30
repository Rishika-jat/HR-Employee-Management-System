import { Employee, LeaveRequest, AttendanceRecord, PayrollRecord, DocumentRecord, ActivityLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-101",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah.connor@cyberdyne.com",
    phone: "+1 (555) 019-2831",
    department: "Engineering",
    role: "Senior Lead Architect",
    status: "Active",
    joiningDate: "2021-03-12",
    salary: 115000,
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    emergencyContact: "John Connor (Son) - 555-019-2832",
    gender: "Female",
    dob: "1985-11-10"
  },
  {
    id: "EMP-102",
    firstName: "Alex",
    lastName: "Mercer",
    email: "alex.mercer@gentek.org",
    phone: "+1 (555) 043-9182",
    department: "Research & Development",
    role: "Principal Virologist",
    status: "Active",
    joiningDate: "2022-07-19",
    salary: 130000,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    emergencyContact: "Dana Mercer (Sister) - 555-043-9183",
    gender: "Male",
    dob: "1988-04-22"
  },
  {
    id: "EMP-103",
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena.rostova@nexus.io",
    phone: "+1 (555) 077-4411",
    department: "Human Resources",
    role: "HR Director",
    status: "Active",
    joiningDate: "2020-01-15",
    salary: 95000,
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    emergencyContact: "Nikolai Rostov (Father) - 555-077-4412",
    gender: "Female",
    dob: "1983-06-30"
  },
  {
    id: "EMP-104",
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus.vance@solaris.net",
    phone: "+1 (555) 021-3948",
    department: "Sales & Marketing",
    role: "Global Growth Lead",
    status: "On Leave",
    joiningDate: "2023-02-01",
    salary: 85000,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    emergencyContact: "Clara Vance (Wife) - 555-021-3949",
    gender: "Male",
    dob: "1991-09-05"
  },
  {
    id: "EMP-105",
    firstName: "Amara",
    lastName: "Kaur",
    email: "amara.kaur@apex.com",
    phone: "+1 (555) 098-7654",
    department: "Operations",
    role: "Operations Manager",
    status: "Active",
    joiningDate: "2022-11-10",
    salary: 90000,
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    emergencyContact: "Sukhdev Kaur (Mother) - 555-098-7655",
    gender: "Female",
    dob: "1994-12-14"
  },
  {
    id: "EMP-106",
    firstName: "Thomas",
    lastName: "Anderson",
    email: "tanderson@metacortex.com",
    phone: "+1 (555) 101-0101",
    department: "Engineering",
    role: "Junior Security Analyst",
    status: "Suspended",
    joiningDate: "2024-05-15",
    salary: 75000,
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    emergencyContact: "Trinity (Partner) - 555-101-0102",
    gender: "Male",
    dob: "1991-03-11"
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: "LV-201",
    employeeId: "EMP-104",
    employeeName: "Marcus Vance",
    leaveType: "Annual",
    startDate: "2026-06-01",
    endDate: "2026-06-10",
    reason: "Family summer vacation and travel abroad.",
    status: "Approved",
    createdAt: "2026-05-25"
  },
  {
    id: "LV-202",
    employeeId: "EMP-101",
    employeeName: "Sarah Connor",
    leaveType: "Sick",
    startDate: "2026-05-28",
    endDate: "2026-05-29",
    reason: "Dental surgery appointment & post-treatment rest.",
    status: "Approved",
    createdAt: "2026-05-27"
  },
  {
    id: "LV-203",
    employeeId: "EMP-105",
    employeeName: "Amara Kaur",
    leaveType: "Annual",
    startDate: "2026-06-15",
    endDate: "2026-06-18",
    reason: "Attending friend's wedding out of state.",
    status: "Pending",
    createdAt: "2026-05-29"
  },
  {
    id: "LV-204",
    employeeId: "EMP-102",
    employeeName: "Alex Mercer",
    leaveType: "Maternity", // Parental/Maternity
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    reason: "Extended family leave for child birth care.",
    status: "Pending",
    createdAt: "2026-05-30"
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Thursday 2026-05-28
  { id: "AT-301", employeeId: "EMP-101", employeeName: "Sarah Connor", date: "2026-05-28", checkIn: "08:45", checkOut: "17:15", status: "Present" },
  { id: "AT-302", employeeId: "EMP-102", employeeName: "Alex Mercer", date: "2026-05-28", checkIn: "09:05", checkOut: "18:00", status: "Present" },
  { id: "AT-303", employeeId: "EMP-103", employeeName: "Elena Rostova", date: "2026-05-28", checkIn: "08:50", checkOut: "17:00", status: "Present" },
  { id: "AT-304", employeeId: "EMP-104", employeeName: "Marcus Vance", date: "2026-05-28", checkIn: "09:35", checkOut: "17:30", status: "Late" },
  { id: "AT-305", employeeId: "EMP-105", employeeName: "Amara Kaur", date: "2026-05-28", checkIn: "08:58", checkOut: "18:15", status: "Present" },
  
  // Friday 2026-05-29
  { id: "AT-311", employeeId: "EMP-101", employeeName: "Sarah Connor", date: "2026-05-29", status: "On Leave", notes: "Approved sick leave" },
  { id: "AT-312", employeeId: "EMP-102", employeeName: "Alex Mercer", date: "2026-05-29", checkIn: "08:55", checkOut: "18:05", status: "Present" },
  { id: "AT-313", employeeId: "EMP-103", employeeName: "Elena Rostova", date: "2026-05-29", checkIn: "08:48", checkOut: "16:55", status: "Present" },
  { id: "AT-314", employeeId: "EMP-104", employeeName: "Marcus Vance", date: "2026-05-29", checkIn: "09:01", checkOut: "17:00", status: "Present" },
  { id: "AT-315", employeeId: "EMP-105", employeeName: "Amara Kaur", date: "2026-05-29", checkIn: "08:59", checkOut: "17:45", status: "Present" },
  
  // Today 2026-05-30
  { id: "AT-321", employeeId: "EMP-101", employeeName: "Sarah Connor", date: "2026-05-30", checkIn: "08:52", status: "Present" },
  { id: "AT-322", employeeId: "EMP-103", employeeName: "Elena Rostova", date: "2026-05-30", checkIn: "08:42", status: "Present" },
  { id: "AT-323", employeeId: "EMP-105", employeeName: "Amara Kaur", date: "2026-05-30", checkIn: "09:12", status: "Late" }
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  // May 2026 payroll history
  {
    id: "PR-401",
    employeeId: "EMP-101",
    employeeName: "Sarah Connor",
    department: "Engineering",
    month: "2026-05",
    baseSalary: 9583, // 115000 / 12
    allowance: 500, // Performance bonus
    deductions: 2450, // Tax withholding + benefits
    netSalary: 7633,
    status: "Paid",
    processedDate: "2026-05-25"
  },
  {
    id: "PR-402",
    employeeId: "EMP-102",
    employeeName: "Alex Mercer",
    department: "Research & Development",
    month: "2026-05",
    baseSalary: 10833, // 130000 / 12
    allowance: 1200, // Research allowance
    deductions: 3100,
    netSalary: 8933,
    status: "Paid",
    processedDate: "2026-05-25"
  },
  {
    id: "PR-403",
    employeeId: "EMP-103",
    employeeName: "Elena Rostova",
    department: "Human Resources",
    month: "2026-05",
    baseSalary: 7916, // 95000 / 12
    allowance: 0,
    deductions: 1950,
    netSalary: 5966,
    status: "Paid",
    processedDate: "2026-05-25"
  },
  {
    id: "PR-404",
    employeeId: "EMP-104",
    employeeName: "Marcus Vance",
    department: "Sales & Marketing",
    month: "2026-05",
    baseSalary: 7083, // 85000 / 12
    allowance: 1500, // Commissions
    deductions: 1800,
    netSalary: 6783,
    status: "Processed",
    processedDate: "2026-05-29"
  },
  {
    id: "PR-405",
    employeeId: "EMP-105",
    employeeName: "Amara Kaur",
    department: "Operations",
    month: "2026-05",
    baseSalary: 7500, // 90000 / 12
    allowance: 300,
    deductions: 1900,
    netSalary: 5900,
    status: "Processed",
    processedDate: "2026-05-29"
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: "DOC-501",
    employeeId: "EMP-101",
    employeeName: "Sarah Connor",
    title: "Employment_Agreement_Connor.pdf",
    type: "Contract",
    uploadDate: "2021-03-12",
    fileSize: "1.2 MB",
    contentSnippet: "Standard Employment Contract for Sarah Connor. Term: Indefinite length starting March 12, 2021. Role: Senior Lead Engineer. Confidentiality clause active. Termination requires 30 days written notice.",
    summary: "Senior Lead Architect agreement outlining indeterminate contract terms, IP ownership for all Cyberdyne systems, standard non-disclosure, and 30-day exit notification period."
  },
  {
    id: "DOC-502",
    employeeId: "EMP-102",
    employeeName: "Alex Mercer",
    title: "Onboarding_Safety_Acknowledge.docx",
    type: "Onboarding",
    uploadDate: "2022-07-20",
    fileSize: "450 KB",
    contentSnippet: "R&D Bio-hazard containment Level 3 certification and lab safety rules. The researcher agrees to standard Bio-Safety Level guidelines and weekly containment reporting.",
    summary: "Lab security and virology department safety guidelines signed by the employee, confirming obedience to containment protocols and bio-hazard reporting schedules."
  },
  {
    id: "DOC-503",
    title: "Company_Handbook_2026_v2.pdf",
    type: "Policy",
    uploadDate: "2026-01-05",
    fileSize: "4.8 MB",
    contentSnippet: "Nexus International Staff Handbook. Covers Equal Opportunity Policy, Core Working Hours (09:00 - 17:00), Remote Work Guidelines (maximum 2 days a week), Annual Leave Allowance (24 days), and Leave accumulation regulations.",
    summary: "The master staff handbook for 2026 defining company culture, working hours, flexible home-office allowances, and leave balances rules."
  },
  {
    id: "DOC-504",
    title: "Anti_Harassment_and_Ethics_Policy.pdf",
    type: "Policy",
    uploadDate: "2025-08-14",
    fileSize: "920 KB",
    contentSnippet: "Corporate Code of Conduct and Zero Tolerance Workplace Harassment Policy. Explains incident reporting paths, investigatory frameworks, and protective disciplinary actions.",
    summary: "Zero-tolerance ethics policy and formal escalation matrix mapping step-by-step reporting lines to the HR department."
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  { id: "LOG-01", timestamp: "2026-05-30 13:45", type: "employee", description: "Updated emergency contact for Alex Mercer.", user: "Elena Rostova (HR)" },
  { id: "LOG-02", timestamp: "2026-05-30 11:20", type: "attendance", description: "Checked in Amara Kaur as Late (09:12 AM).", user: "System (Terminal)" },
  { id: "LOG-03", timestamp: "2026-05-30 09:00", type: "leave", description: "Submitted leave request (Annual) for Amara Kaur.", user: "Amara Kaur" },
  { id: "LOG-04", timestamp: "2026-05-29 17:30", type: "payroll", description: "Generated and processed May 2026 Payroll batch.", user: "Elena Rostova (HR)" },
  { id: "LOG-05", timestamp: "2026-05-28 14:10", type: "document", description: "Uploaded 'Anti_Harassment_and_Ethics_Policy.pdf' to Company Policies.", user: "Elena Rostova (HR)" }
];
