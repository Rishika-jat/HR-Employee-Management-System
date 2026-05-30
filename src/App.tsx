import React, { useState } from 'react';
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
import { useFirebase } from './FirebaseContext';

// Subcomponents
import DashboardOverview from './components/DashboardOverview';
import EmployeeSection from './components/EmployeeSection';
import AttendanceSection from './components/AttendanceSection';
import LeaveSection from './components/LeaveSection';
import PayrollSection from './components/PayrollSection';
import DocumentSection from './components/DocumentSection';
import AiAssistantSection from './components/AiAssistantSection';

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
  const {
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
  } = useFirebase();

  // App navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await login();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate');
    }
  };

  // Render authentic high-quality login screen if not authenticated
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans animate-fade-in">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <Building className="w-12 h-12 text-indigo-505 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider">SECURE NEXUS ERP</h1>
          <p className="text-slate-400 font-mono text-xs">Decentralized Credentials Core Syncing...</p>
          <div className="w-16 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-950/50 space-y-8 relative z-10">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <span className="p-3 bg-indigo-950/50 border border-indigo-900/50 text-indigo-400 rounded-2xl shadow-inner mb-2">
              <Building className="w-8 h-8" />
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">NEXUS ENTERPRISE</h1>
            <p className="text-slate-400 font-medium text-xs max-w-xs leading-relaxed">
              Enterprise administration and timesheet portal. Integrate verified single sign-on credentials.
            </p>
          </div>

          <div className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 rounded-xl text-xs font-mono">
                {authError}
              </div>
            )}

            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-950 font-bold p-3.5 rounded-xl transition duration-150 border border-slate-200 shadow-md cursor-pointer text-xs"
            >
              {/* Google SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.09 15.42 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.79-.086-1.39-.19-1.925H12.24z"
                />
              </svg>
              <span>Connect Google Identity</span>
            </button>
          </div>

          <div className="border-t border-slate-800/85 pt-5 text-center text-[10px] text-slate-500 font-mono flex flex-col space-y-1">
            <span>Enterprise database: carbide-clover-p4jp1</span>
            <span>Security level: ZERO-TRUST LEVEL 4</span>
          </div>

        </div>
      </div>
    );
  }


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
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 text-xs space-y-2">
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/40 p-3 rounded-xl">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="profile" 
                className="w-8 h-8 rounded-full border border-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white font-mono uppercase text-xs">
                {(user.displayName || user.email || 'A').charAt(0)}
              </div>
            )}
            <div className="space-y-0.5 truncate flex-1">
              <p className="font-extrabold text-slate-100 font-mono text-[10px] truncate">{user.displayName || user.email}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase font-sans tracking-wide">
                {user.email === 'rishikajat03@gmail.com' ? 'Enterprise Admin' : 'Staff Member'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 hover:text-red-405 transition text-slate-400 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Identity</span>
          </button>
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
