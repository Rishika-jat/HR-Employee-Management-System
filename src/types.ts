export type EmployeeStatus = 'Active' | 'On Leave' | 'Suspended';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  joiningDate: string;
  salary: number;
  photoUrl?: string;
  emergencyContact?: string;
  gender: string;
  dob: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: AttendanceStatus;
  notes?: string;
}

export type PayrollStatus = 'Processed' | 'Paid' | 'Hold';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string; // YYYY-MM
  baseSalary: number;
  allowance: number; // bonuses, overtime etc
  deductions: number; // taxes, unpaid leave etc
  netSalary: number;
  status: PayrollStatus;
  processedDate?: string;
}

export type DocType = 'Contract' | 'ID Proof' | 'Policy' | 'Review' | 'Other' | 'Onboarding';

export interface DocumentRecord {
  id: string;
  employeeId?: string; // undefined means global company document
  employeeName?: string;
  title: string;
  type: DocType;
  uploadDate: string;
  fileSize: string;
  contentSnippet?: string; // Text content if analyzed or created by AI
  summary?: string; // AI generated summary
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'employee' | 'leave' | 'attendance' | 'payroll' | 'document';
  description: string;
  user: string;
}
