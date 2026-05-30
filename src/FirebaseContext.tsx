import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocFromServer,
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  DocumentRecord, 
  ActivityLog,
  AttendanceStatus,
  PayrollStatus
} from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_PAYROLL, 
  INITIAL_DOCUMENTS, 
  INITIAL_LOGS 
} from './defaultData';

interface FirebaseContextType {
  user: User | null;
  loadingAuth: boolean;
  loadingData: boolean;
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  documents: DocumentRecord[];
  logs: ActivityLog[];
  
  // Auth Functions
  login: () => Promise<User>;
  logout: () => Promise<void>;
  
  // ERP Mutators
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  editEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  checkIn: (employeeId: string, checkInTime: string, notes?: string) => Promise<void>;
  checkOut: (employeeId: string, checkOutTime: string) => Promise<void>;
  updateAttendanceStatus: (recordId: string, status: AttendanceStatus, notes?: string) => Promise<void>;
  
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'employeeName'>) => Promise<void>;
  approveLeave: (id: string) => Promise<void>;
  rejectLeave: (id: string) => Promise<void>;
  
  updatePayroll: (recordId: string, allowance: number, deductions: number, status: PayrollStatus) => Promise<void>;
  processNewMonthPayroll: (month: string) => Promise<void>;
  
  addDocument: (docRecord: Omit<DocumentRecord, 'id' | 'uploadDate'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  addLog: (type: ActivityLog['type'], description: string, actor: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // 1. Connection Validation as requested by SKILL.md
  useEffect(() => {
    async function validateFirestoreConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration: client is offline.");
        }
      }
    }
    validateFirestoreConnection();
  }, []);

  // 2. Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper seed logic
  const seedCollectionsIfEmpty = async () => {
    try {
      setLoadingData(true);
      const readyRef = doc(db, 'system', 'initialized');
      const readySnap = await getDocFromServer(readyRef).catch(() => null);
      if (readySnap && readySnap.exists()) {
        return;
      }

      // Check if employees is already loaded on DB to avoid seeding duplicates
      const empQuery = await getDocs(collection(db, 'employees'));
      if (!empQuery.empty) {
        // Already seeded or has data
        await setDoc(readyRef, { seeded: true });
        return;
      }

      console.log('Seeding initial data to Firestore database...');
      const batch = writeBatch(db);

      // Seed Employees
      INITIAL_EMPLOYEES.forEach((emp) => {
        batch.set(doc(db, 'employees', emp.id), emp);
      });

      // Seed Attendance
      INITIAL_ATTENDANCE.forEach((att) => {
        batch.set(doc(db, 'attendance', att.id), att);
      });

      // Seed Leaves
      INITIAL_LEAVES.forEach((lv) => {
        batch.set(doc(db, 'leaves', lv.id), lv);
      });

      // Seed Payroll
      INITIAL_PAYROLL.forEach((pr) => {
        batch.set(doc(db, 'payroll', pr.id), pr);
      });

      // Seed Documents
      INITIAL_DOCUMENTS.forEach((docRec) => {
        batch.set(doc(db, 'documents', docRec.id), docRec);
      });

      // Seed Logs
      INITIAL_LOGS.forEach((lg) => {
        batch.set(doc(db, 'logs', lg.id), lg);
      });

      // Mark initialized state
      batch.set(readyRef, { seeded: true });
      await batch.commit();
      console.log('Successfully seeded initial data database.');
    } catch (err) {
      console.error('Error seeding initial Firestore structure:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // 3. Real-time lists synchronization
  useEffect(() => {
    if (!user) {
      setEmployees([]);
      setAttendance([]);
      setLeaves([]);
      setPayroll([]);
      setDocuments([]);
      setLogs([]);
      return;
    }

    setLoadingData(true);
    
    // Seed database if empty first
    seedCollectionsIfEmpty().then(() => {
      setLoadingData(false);
    });

    // Subscriptions
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const items: Employee[] = [];
      snapshot.forEach((d) => items.push(d.data() as Employee));
      setEmployees(items.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'employees');
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as AttendanceRecord));
      setAttendance(items.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendance');
    });

    const unsubLeaves = onSnapshot(collection(db, 'leaves'), (snapshot) => {
      const items: LeaveRequest[] = [];
      snapshot.forEach((d) => items.push(d.data() as LeaveRequest));
      setLeaves(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'leaves');
    });

    const unsubPayroll = onSnapshot(collection(db, 'payroll'), (snapshot) => {
      const items: PayrollRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as PayrollRecord));
      setPayroll(items.sort((a, b) => b.month.localeCompare(a.month) || b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payroll');
    });

    const unsubDocuments = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const items: DocumentRecord[] = [];
      snapshot.forEach((d) => items.push(d.data() as DocumentRecord));
      setDocuments(items.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate) || b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });

    const unsubLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const items: ActivityLog[] = [];
      snapshot.forEach((d) => items.push(d.data() as ActivityLog));
      setLogs(items.sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'logs');
    });

    return () => {
      unsubEmployees();
      unsubAttendance();
      unsubLeaves();
      unsubPayroll();
      unsubDocuments();
      unsubLogs();
    };
  }, [user]);

  // --- MUTATORS & BUSINESS LOGIC HANDLERS ---

  const addLog = async (type: ActivityLog['type'], description: string, actor: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const logId = `LOG-${Date.now()}`;
    const newLog: ActivityLog = {
      id: logId,
      timestamp,
      type,
      description,
      user: actor
    };
    try {
      await setDoc(doc(db, 'logs', logId), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `logs/${logId}`);
    }
  };

  const addEmployee = async (newEmpData: Omit<Employee, 'id'>) => {
    // Generate new EMP ID based on max
    const numericIds = employees.map(e => parseInt(e.id.split('-')[1]) || 100);
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 100;
    const nextId = `EMP-${maxId + 1}`;

    const newEmp: Employee = {
      id: nextId,
      ...newEmpData
    };

    try {
      await setDoc(doc(db, 'employees', nextId), newEmp);
      
      // Auto-append payroll outline record structure for current month
      const currentMonthStr = "2026-05";
      const newPayroll: PayrollRecord = {
        id: `PR-${Date.now()}`,
        employeeId: nextId,
        employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
        department: newEmp.department,
        month: currentMonthStr,
        baseSalary: Math.round(newEmp.salary / 12),
        allowance: 0,
        deductions: Math.round((newEmp.salary / 12) * 0.22),
        netSalary: Math.round((newEmp.salary / 12) * 0.78),
        status: 'Processed'
      };
      await setDoc(doc(db, 'payroll', newPayroll.id), newPayroll);
      await addLog('employee', `Added new staff personnel ${newEmp.firstName} ${newEmp.lastName}`, user?.email || 'Admin');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `employees/${nextId}`);
    }
  };

  const editEmployee = async (editedEmp: Employee) => {
    try {
      await setDoc(doc(db, 'employees', editedEmp.id), editedEmp);
      
      // Sync names and standard base salary across payroll for this ID
      const batch = writeBatch(db);
      const pItems = payroll.filter(p => p.employeeId === editedEmp.id);
      pItems.forEach((p) => {
        batch.update(doc(db, 'payroll', p.id), {
          employeeName: `${editedEmp.firstName} ${editedEmp.lastName}`,
          department: editedEmp.department,
          baseSalary: Math.round(editedEmp.salary / 12)
        });
      });
      await batch.commit();
      
      await addLog('employee', `Edited record parameters for ${editedEmp.firstName} ${editedEmp.lastName}`, user?.email || 'Admin');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `employees/${editedEmp.id}`);
    }
  };

  const deleteEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    try {
      await deleteDoc(doc(db, 'employees', id));
      if (emp) {
        await addLog('employee', `Terminated / removed employee record ${emp.firstName} ${emp.lastName}`, user?.email || 'Admin');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `employees/${id}`);
    }
  };

  const checkIn = async (employeeId: string, checkInTime: string, notes?: string) => {
    const matchedEmployee = employees.find(e => e.id === employeeId);
    if (!matchedEmployee) return;

    const isLate = checkInTime > "09:00";
    const status: AttendanceStatus = isLate ? 'Late' : 'Present';
    const recordId = `AT-${Date.now()}`;

    const newAttendance: AttendanceRecord = {
      id: recordId,
      employeeId,
      employeeName: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
      date: "2026-05-30",
      checkIn: checkInTime,
      status,
      notes: notes || ""
    };

    try {
      await setDoc(doc(db, 'attendance', recordId), newAttendance);
      await addLog('attendance', `Personnel ${matchedEmployee.firstName} ${matchedEmployee.lastName} checked in (${checkInTime}) Today. Status: ${status.toUpperCase()}`, "Lobby Terminal");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `attendance/${recordId}`);
    }
  };

  const checkOut = async (employeeId: string, checkOutTime: string) => {
    const record = attendance.find(log => log.employeeId === employeeId && log.date === "2026-05-30" && !log.checkOut);
    if (!record) return;

    try {
      await updateDoc(doc(db, 'attendance', record.id), {
        checkOut: checkOutTime
      });
      await addLog('attendance', `Personnel ${record.employeeName} checked out successfully (${checkOutTime}) today.`, "Lobby Terminal");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `attendance/${record.id}`);
    }
  };

  const updateAttendanceStatus = async (recordId: string, status: AttendanceStatus, notes?: string) => {
    const logObj = attendance.find(a => a.id === recordId);
    try {
      await updateDoc(doc(db, 'attendance', recordId), {
        status,
        notes: notes || ""
      });
      await addLog('attendance', `Overrode attendance for ${logObj?.employeeName} manually to ${status.toUpperCase()}`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `attendance/${recordId}`);
    }
  };

  const submitLeaveRequest = async (newRequestData: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'employeeName'>) => {
    const matchedEmp = employees.find(e => e.id === newRequestData.employeeId);
    if (!matchedEmp) return;

    const recordId = `LV-${Date.now()}`;
    const newRequest: LeaveRequest = {
      id: recordId,
      employeeName: `${matchedEmp.firstName} ${matchedEmp.lastName}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...newRequestData
    };

    try {
      await setDoc(doc(db, 'leaves', recordId), newRequest);
      await addLog('leave', `Submitted leave request for ${newRequest.employeeName} from ${newRequest.startDate} to ${newRequest.endDate}`, user?.email || "Employee");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leaves/${recordId}`);
    }
  };

  const approveLeave = async (id: string) => {
    const leaveReq = leaves.find(l => l.id === id);
    if (!leaveReq) return;

    try {
      // 1. Approve Leave Request
      await updateDoc(doc(db, 'leaves', id), { status: 'Approved' });
      
      // 2. Set Employee to On Leave
      await updateDoc(doc(db, 'employees', leaveReq.employeeId), { status: 'On Leave' });
      
      // 3. Register placeholder attendance On Leave
      const attId = `AT-${Date.now()}`;
      const newAttendancePlaceholder: AttendanceRecord = {
        id: attId,
        employeeId: leaveReq.employeeId,
        employeeName: leaveReq.employeeName,
        date: "2026-05-30",
        status: 'On Leave',
        notes: `Authorized Leave (${leaveReq.leaveType})`
      };
      await setDoc(doc(db, 'attendance', attId), newAttendancePlaceholder);
      
      await addLog('leave', `Approved leave request for ${leaveReq.employeeName} (${leaveReq.leaveType})`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leaves/${id}`);
    }
  };

  const rejectLeave = async (id: string) => {
    const leaveReq = leaves.find(l => l.id === id);
    if (!leaveReq) return;

    try {
      await updateDoc(doc(db, 'leaves', id), { status: 'Rejected' });
      await addLog('leave', `Rejected leave request for ${leaveReq.employeeName}`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leaves/${id}`);
    }
  };

  const updatePayroll = async (recordId: string, allowance: number, deductions: number, status: PayrollStatus) => {
    const record = payroll.find(p => p.id === recordId);
    if (!record) return;
    
    const netSalary = Math.round(record.baseSalary + allowance - deductions);
    const updateObj: Partial<PayrollRecord> = {
      allowance,
      deductions,
      netSalary,
      status,
      processedDate: status !== 'Hold' ? new Date().toISOString().split('T')[0] : record.processedDate
    };

    try {
      await updateDoc(doc(db, 'payroll', recordId), updateObj);
      await addLog('payroll', `Updated payroll for ${record.employeeName} (Month: ${record.month}) to NET: $${netSalary.toLocaleString()}`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `payroll/${recordId}`);
    }
  };

  const processNewMonthPayroll = async (month: string) => {
    const existingForMonth = payroll.some(p => p.month === month);
    if (existingForMonth) return;

    try {
      const batch = writeBatch(db);
      const activeEmps = employees.filter(emp => emp.status !== 'Suspended');
      
      activeEmps.forEach((emp) => {
        const id = `PR-${Date.now()}-${emp.id}`;
        const newRecord: PayrollRecord = {
          id,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          month,
          baseSalary: Math.round(emp.salary / 12),
          allowance: 0,
          deductions: Math.round((emp.salary / 12) * 0.20),
          netSalary: Math.round((emp.salary / 12) * 0.80),
          status: 'Processed'
        };
        batch.set(doc(db, 'payroll', id), newRecord);
      });

      await batch.commit();
      await addLog('payroll', `Generated whole payroll register batch outlines for target month: ${month}`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `payroll/batch-${month}`);
    }
  };

  const addDocument = async (newDoc: Omit<DocumentRecord, 'id' | 'uploadDate'>) => {
    const docId = `DOC-${Date.now()}`;
    const newDocument: DocumentRecord = {
      id: docId,
      uploadDate: new Date().toISOString().split('T')[0],
      ...newDoc
    };

    try {
      await setDoc(doc(db, 'documents', docId), newDocument);
      await addLog('document', `Uploaded new Document: ${newDocument.title} (${newDocument.type})`, user?.email || "Admin");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `documents/${docId}`);
    }
  };

  const deleteDocument = async (id: string) => {
    const docObj = documents.find(d => d.id === id);
    try {
      await deleteDoc(doc(db, 'documents', id));
      if (docObj) {
        await addLog('document', `Deleted document: ${docObj.title}`, user?.email || "Admin");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
    }
  };

  const login = async () => {
    return loginWithGoogle();
  };

  const logout = async () => {
    return logoutUser();
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loadingAuth,
      loadingData,
      employees,
      attendance,
      leaves,
      payroll,
      documents,
      logs,
      login,
      logout,
      addEmployee,
      editEmployee,
      deleteEmployee,
      checkIn,
      checkOut,
      updateAttendanceStatus,
      submitLeaveRequest,
      approveLeave,
      rejectLeave,
      updatePayroll,
      processNewMonthPayroll,
      addDocument,
      deleteDocument,
      addLog
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};
