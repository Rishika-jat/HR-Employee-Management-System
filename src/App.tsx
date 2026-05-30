import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  FolderLock, 
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Bell,
  CheckCircle,
  Activity
} from 'lucide-react';

// Subcomponents
import DashboardOverview from './components/DashboardOverview';
import EmployeeSection from './components/EmployeeSection';
import AttendanceSection from './components/AttendanceSection';
import LeaveSection from './components/LeaveSection';
import PayrollSection from './components/PayrollSection';
import DocumentSection from './components/DocumentSection';
import AiAssistantSection from './components/AiAssistantSection';

// Initial Mock Data
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_PAYROLL, 
  INITIAL_DOCUMENTS, 
  INITIAL_LOGS 
} from './defaultData';
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

export default function App() {
  // App navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core App states backed by LocalStorage hydration
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem('nexus_employees');
    return local ? JSON.parse(local) : INITIAL_EMPLOYEES;
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const local = localStorage.getItem('nexus_attendance');
    return local ? JSON.parse(local) : INITIAL_ATTENDANCE;
  });
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const local = localStorage.getItem('nexus_leaves');
    return local ? JSON.parse(local) : INITIAL_LEAVES;
  });
  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const local = localStorage.getItem('nexus_payroll');
    return local ? JSON.parse(local) : INITIAL_PAYROLL;
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const local = localStorage.getItem('nexus_docs');
    return local ? JSON.parse(local) : INITIAL_DOCUMENTS;
  });
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const local = localStorage.getItem('nexus_logs');
    return local ? JSON.parse(local) : INITIAL_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexus_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('nexus_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('nexus_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('nexus_payroll', JSON.stringify(payroll));
  }, [payroll]);

  useEffect(() => {
    localStorage.setItem('nexus_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('nexus_logs', JSON.stringify(logs));
  }, [logs]);

  // Logging Helper
  const addLog = (type: ActivityLog['type'], description: string, user: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      type,
      description,
      user
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- MUTATOR HANDLERS ---
  const addEmployee = (newEmpData: Omit<Employee, 'id'>) => {
    const numericIds = employees.map(e => parseInt(e.id.split('-')[1]) || 100);
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 100;
    const nextId = `EMP-${maxId + 1}`;

    const newEmp: Employee = {
      id: nextId,
      ...newEmpData
    };
    setEmployees(prev => [...prev, newEmp]);

    // Also auto-append current month payroll outline structure for this new staff
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
    setPayroll(prev => [newPayroll, ...prev]);
    addLog('employee', `Added new staff personnel ${newEmp.firstName} ${newEmp.lastName}`, "Admin");
  };

  const editEmployee = (editedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === editedEmp.id ? editedEmp : e));
    setPayroll(prev => prev.map(p => p.employeeId === editedEmp.id ? {
      ...p,
      employeeName: `${editedEmp.firstName} ${editedEmp.lastName}`,
      department: editedEmp.department,
      baseSalary: Math.round(editedEmp.salary / 12)
    }: p));
    addLog('employee', `Edited record parameters for ${editedEmp.firstName} ${editedEmp.lastName}`, "Admin");
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (emp) {
      addLog('employee', `Terminated / removed employee record ${emp.firstName} ${emp.lastName}`, "Admin");
    }
  };

  const checkIn = (employeeId: string, checkInTime: string, notes?: string) => {
    const matchedEmployee = employees.find(e => e.id === employeeId);
    if (!matchedEmployee) return;

    const isLate = checkInTime > "09:00";
    const status: AttendanceStatus = isLate ? 'Late' : 'Present';

    const newAttendance: AttendanceRecord = {
      id: `AT-${Date.now()}`,
      employeeId,
      employeeName: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
      date: "2026-05-30",
      checkIn: checkInTime,
      status,
      notes: notes || ""
    };
    
    setAttendance(prev => [newAttendance, ...prev]);
    addLog('attendance', `Personnel ${matchedEmployee.firstName} ${matchedEmployee.lastName} checked in (${checkInTime}) Today. Status: ${status.toUpperCase()}`, "Lobby Terminal");
  };

  const checkOut = (employeeId: string, checkOutTime: string) => {
    setAttendance(prev => prev.map(log => {
      if (log.employeeId === employeeId && log.date === "2026-05-30" && !log.checkOut) {
        addLog('attendance', `Personnel ${log.employeeName} checked out successfully (${checkOutTime}) today.`, "Lobby Terminal");
        return { ...log, checkOut: checkOutTime };
      }
      return log;
    }));
  };

  const updateAttendanceStatus = (recordId: string, status: AttendanceStatus, notes?: string) => {
    setAttendance(prev => prev.map(log => {
      if (log.id === recordId) {
        return { ...log, status, notes: notes || "" };
      }
      return log;
    }));
    const logObj = attendance.find(a => a.id === recordId);
    if (logObj) {
      addLog('attendance', `Overrode attendance for ${logObj.employeeName} manually to ${status.toUpperCase()}`, "Admin");
    }
  };

  const submitLeaveRequest = (newRequestData: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'employeeName'>) => {
    const matchedEmp = employees.find(e => e.id === newRequestData.employeeId);
    if (!matchedEmp) return;

    const newRequest: LeaveRequest = {
      id: `LV-${Date.now()}`,
      employeeName: `${matchedEmp.firstName} ${matchedEmp.lastName}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
      ...newRequestData
    };

    setLeaves(prev => [newRequest, ...prev]);
    addLog('leave', `Submitted leave request for ${newRequest.employeeName} from ${newRequest.startDate} to ${newRequest.endDate}`, "Employee");
  };

  const approveLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    const leaveReq = leaves.find(l => l.id === id);
    if (leaveReq) {
      setEmployees(prev => prev.map(e => e.id === leaveReq.employeeId ? { ...e, status: 'On Leave' } : e));
      const newAttendancePlaceholder: AttendanceRecord = {
        id: `AT-${Date.now()}`,
        employeeId: leaveReq.employeeId,
        employeeName: leaveReq.employeeName,
        date: "2026-05-30",
        status: 'On Leave',
        notes: `Authorized Leave (${leaveReq.leaveType})`
      };
      setAttendance(prev => [newAttendancePlaceholder, ...prev]);
      addLog('leave', `Approved leave request for ${leaveReq.employeeName} (${leaveReq.leaveType})`, "Admin");
    }
  };

  const rejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    const leaveReq = leaves.find(l => l.id === id);
    if (leaveReq) {
      addLog('leave', `Rejected leave request for ${leaveReq.employeeName}`, "Admin");
    }
  };

  const updatePayroll = (recordId: string, allowance: number, deductions: number, status: PayrollStatus) => {
    setPayroll(prev => prev.map(p => {
      if (p.id === recordId) {
        const netSalary = Math.round(p.baseSalary + allowance - deductions);
        return {
          ...p,
          allowance,
          deductions,
          netSalary,
          status,
          processedDate: status !== 'Hold' ? new Date().toISOString().split('T')[0] : p.processedDate
        };
      }
      return p;
    }));
    const record = payroll.find(p => p.id === recordId);
    if (record) {
      const netVal = Math.round(record.baseSalary + allowance - deductions);
      addLog('payroll', `Updated payroll for ${record.employeeName} (Month: ${record.month}) to NET: $${netVal.toLocaleString()}`, "Admin");
    }
  };

  const processNewMonthPayroll = (month: string) => {
    const existingForMonth = payroll.some(p => p.month === month);
    if (existingForMonth) return;

    const newMonthBatch: PayrollRecord[] = employees
      .filter(emp => emp.status !== 'Suspended')
      .map(emp => ({
        id: `PR-${Date.now()}-${emp.id}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        month,
        baseSalary: Math.round(emp.salary / 12),
        allowance: 0,
        deductions: Math.round((emp.salary / 12) * 0.20),
        netSalary: Math.round((emp.salary / 12) * 0.80),
        status: 'Processed'
      }));

    setPayroll(prev => [...newMonthBatch, ...prev]);
    addLog('payroll', `Generated whole payroll register batch outlines for target month: ${month}`, "Admin");
  };

  const addDocument = (newDoc: Omit<DocumentRecord, 'id' | 'uploadDate'>) => {
    const newDocument: DocumentRecord = {
      id: `DOC-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      ...newDoc
    };
    setDocuments(prev => [newDocument, ...prev]);
    addLog('document', `Uploaded new Document: ${newDocument.title} (${newDocument.type})`, "Admin");
  };

  const deleteDocument = (id: string) => {
    const docObj = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (docObj) {
      addLog('document', `Deleted document: ${docObj.title}`, "Admin");
    }
  };


  // TAB LAYOUTS COUPLING
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            employees={employees} 
            leaves={leaves} 
            attendance={attendance} 
            logs={logs}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'employees':
        return (
          <EmployeeSection 
            employees={employees} 
            documents={documents}
            payroll={payroll}
            leaves={leaves}
            onAddEmployee={addEmployee}
            onEditEmployee={editEmployee}
            onDeleteEmployee={deleteEmployee}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onAddLog={addLog}
          />
        );
      case 'attendance':
        return (
          <AttendanceSection 
            attendance={attendance} 
            employees={employees}
            onCheckIn={checkIn}
            onCheckOut={checkOut}
            onUpdateAttendanceStatus={updateAttendanceStatus}
          />
        );
      case 'leaves':
        return (
          <LeaveSection 
            leaves={leaves} 
            employees={employees}
            onSubmitLeaveRequest={submitLeaveRequest}
            onApproveLeave={approveLeave}
            onRejectLeave={rejectLeave}
            onAddLog={addLog}
          />
        );
      case 'payroll':
        return (
          <PayrollSection 
            payroll={payroll} 
            employees={employees}
            onUpdatePayroll={updatePayroll}
            onProcessNewMonth={processNewMonthPayroll}
            onAddLog={addLog}
          />
        );
      case 'documents':
        return (
          <DocumentSection 
            documents={documents} 
            employees={employees}
            onAddDocument={addDocument}
            onDeleteDocument={deleteDocument}
            onAddLog={addLog}
          />
        );
      case 'ai-assistant':
        return (
          <AiAssistantSection 
            employees={employees} 
            leaves={leaves} 
            payroll={payroll}
          />
        );
      default:
        return <div className="text-center py-10 font-bold text-slate-400">Section not implemented.</div>;
    }
  };

  // Helper sidebar labels
  const sidebarItems = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Staff Records', icon: Users },
    { id: 'attendance', label: 'Timesheet Terminal', icon: Clock },
    { id: 'leaves', label: 'Leaves Management', icon: Calendar },
    { id: 'payroll', label: 'Payroll & Slips', icon: DollarSign },
    { id: 'documents', label: 'Documents Vault', icon: FolderLock },
    { id: 'ai-assistant', label: 'Nellie AI Assistant', icon: Sparkles, premium: true },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800">
      
      {/* MOBILE TRIGGER HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white z-50 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xs font-black uppercase tracking-wider font-sans">NEXUS ENTERPRISE ERP</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-slate-950 text-slate-400 flex flex-col justify-between transform md:translate-x-0 transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0':' -translate-x-full md:relative'}`}>
        
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800/60 mt-14 md:mt-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 border border-slate-800 bg-slate-900 rounded-xl text-indigo-400">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xs font-black text-white tracking-widest uppercase mb-0.5">NEXUS ERP</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">HR Matrix Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close mobile toggler
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition group cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'hover:bg-slate-900 hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.premium && (
                  <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border leading-none ${isActive ? 'bg-white text-indigo-700 border-white':'bg-indigo-950/50 text-indigo-400 border-indigo-900/50'}`}>
                    Gemini
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Context profile footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 text-xs">
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/40 p-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center font-bold text-indigo-400 font-mono uppercase text-xs">
              EA
            </div>
            <div className="space-y-0.5 truncate flex-1">
              <p className="font-extrabold text-slate-100 font-mono text-[10px] truncate">Admin User</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase font-sans tracking-wide">
                Enterprise Admin
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 md:min-h-screen pt-14 md:pt-0">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Security Access Level: LEVEL 4 CHRO ADMIN</span>
            </div>
          </div>

          {/* Quick info right side notification summary */}
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2 border bg-slate-50/50 border-slate-200 p-2 px-3 rounded-xl text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>May 2026 CYCLE ACTIVE</span>
            </div>

            <div className="p-2 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition relative cursor-pointer" title="Alerts active">
              <Bell className="w-4 h-4" />
              {leaves.some(l => l.status === 'Pending') && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
              )}
            </div>

          </div>
        </header>

        {/* INNER RENDER WRAPPER */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveTabContent()}
        </div>

      </main>

    </div>
  );
}
