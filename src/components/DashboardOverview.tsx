import React from 'react';
import { 
  Users, 
  CalendarMinus, 
  Building, 
  DollarSign, 
  Activity, 
  ArrowRight, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Employee, LeaveRequest, AttendanceRecord, ActivityLog } from '../types';

interface DashboardOverviewProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({ 
  employees, 
  leaves, 
  attendance, 
  logs, 
  onNavigate 
}: DashboardOverviewProps) {
  
  // Calculate statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'On Leave').length;
  
  const todayStr = "2026-05-30"; // Synchronized with calendar metadata
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const lateToday = todayAttendance.filter(a => a.status === 'Late').length;
  
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  
  // Total monthly payroll estimate
  const totalMonthlyPayroll = employees
    .filter(e => e.status !== 'Suspended')
    .reduce((sum, e) => sum + (e.salary / 12), 0);

  // Department counts
  const departmentCounts: { [key: string]: number } = {};
  employees.forEach(e => {
    departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1;
  });

  const deptChartData = Object.keys(departmentCounts).map(dept => ({
    name: dept,
    Employees: departmentCounts[dept]
  }));

  // Status distributions
  const statusCounts = {
    Active: employees.filter(e => e.status === 'Active').length,
    'On Leave': employees.filter(e => e.status === 'On Leave').length,
    Suspended: employees.filter(e => e.status === 'Suspended').length,
  };

  const statusChartData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status as keyof typeof statusCounts]
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header section with Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Overview</h2>
          <p className="text-sm text-slate-500">Real-time indicators and operational signals for your company.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-emerald-800 text-xs font-mono">
          <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>OPERATIONAL HOUR STATUS: ACTIVE (UTC)</span>
        </div>
      </div>

      {/* Grid of Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Staff */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Headcount</span>
            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{totalEmployees}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activeEmployees} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Across {Object.keys(departmentCounts).length} corporate divisions</p>
        </div>

        {/* Card 2: Attendance Rate Today */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Daily Attendance</span>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalEmployees > 0 ? Math.round(((presentToday - lateToday) / totalEmployees) * 100) : 100}%
            </span>
            {lateToday > 0 && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {lateToday} Late Check-in
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">{presentToday} registered present today</p>
        </div>

        {/* Card 3: Pending Leaves */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Leave Backlog</span>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <CalendarMinus className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{pendingLeaves}</span>
            {pendingLeaves > 0 ? (
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                Clear
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">{onLeaveEmployees} employees officially out today</p>
        </div>

        {/* Card 4: Monthly Payroll Commitment */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Payroll Commitment</span>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <DollarSign className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              ${Math.round(totalMonthlyPayroll).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              Monthly
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Based on current active salaries</p>
        </div>

      </div>

      {/* Danger/Attention Banner for approvals if pending leaves */}
      {pendingLeaves > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-sm text-amber-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>You have <strong>{pendingLeaves} pending leave requests</strong> awaiting HR authorization. Please review to avoid project scheduling conflicts.</span>
          </div>
          <button 
            onClick={() => onNavigate('leaves')}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline cursor-pointer flex-shrink-0"
          >
            Review Decisions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Corporate Visualizer and Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Distribution Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-5">Department Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="Employees" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Status Pie Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-5">Core Staff Status</h3>
            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="block text-2xl font-bold font-mono text-slate-800">{totalEmployees}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Staff</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {statusChartData.map((data, index) => (
              <div key={data.name} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-medium text-slate-700">{data.name}</span>
                </div>
                <span className="font-mono font-semibold">{data.value} employees</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Activity Logs Dashboard Widget */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Audit trail Logs</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">Showing recent 5 changes</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 5).map((log) => {
            let badgeBg = "bg-slate-50 text-slate-600 border-slate-100";
            if (log.type === "employee") badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-100";
            if (log.type === "leave") badgeBg = "bg-amber-50 text-amber-700 border-amber-100";
            if (log.type === "attendance") badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
            if (log.type === "payroll") badgeBg = "bg-rose-50 text-rose-700 border-rose-100";
            if (log.type === "document") badgeBg = "bg-sky-50 text-sky-700 border-sky-100";

            return (
              <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeBg} mt-0.5`}>
                    {log.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{log.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Approved/Submitted by: <strong className="text-slate-500">{log.user}</strong></p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
