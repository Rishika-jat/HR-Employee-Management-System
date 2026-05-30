import React, { useState } from 'react';
import { 
  Check, 
  MapPin, 
  Clock, 
  UserCheck, 
  UserMinus, 
  Coffee, 
  HelpCircle, 
  Search, 
  Filter, 
  Building, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AttendanceRecord, Employee, AttendanceStatus } from '../types';

interface AttendanceSectionProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  onCheckIn: (employeeId: string, checkInTime: string, notes?: string) => void;
  onCheckOut: (employeeId: string, checkOutTime: string) => void;
  onUpdateAttendanceStatus: (recordId: string, status: AttendanceStatus, notes?: string) => void;
}

export default function AttendanceSection({
  attendance,
  employees,
  onCheckIn,
  onCheckOut,
  onUpdateAttendanceStatus
}: AttendanceSectionProps) {
  
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [activeDate, setActiveDate] = useState("2026-05-30"); // Target today
  const [searchQuery, setSearchQuery] = useState('');

  // Selected date's logs
  const selectedDayLogs = attendance.filter(log => log.date === activeDate);

  // Filter with query
  const filteredLogs = selectedDayLogs.filter(log => 
    log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find employees that haven't checked in today yet
  const todayCheckedInIds = attendance
    .filter(log => log.date === "2026-05-30" && (log.status === 'Present' || log.status === 'Late' || log.status === 'On Leave'))
    .map(log => log.employeeId);

  const employeesNotCheckedIn = employees.filter(emp => !todayCheckedInIds.includes(emp.id) && emp.status !== 'Suspended');

  // Currently checked-in employees who haven't checked out yet
  const checkedInCurrently = attendance.filter(log => 
    log.date === "2026-05-30" && 
    log.checkIn && 
    !log.checkOut && 
    log.status !== 'On Leave'
  );

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    // Get current time formatted as HH:MM
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    onCheckIn(selectedEmpId, currentTimeStr, checkInNotes);
    
    // Reset widget form state
    setSelectedEmpId('');
    setCheckInNotes('');
  };

  const handleCheckoutClick = (empId: string) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    onCheckOut(empId, currentTimeStr);
  };

  // Status Colors styling
  const getStatusStyles = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Absent':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      case 'Late':
        return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'On Leave':
        return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Attendance Grid - Terminal Widget on left, log on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOBBY / TERMINAL DOCK */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lobby terminal Dock</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Allows staff members to register check-ins or mark handovers on the current workspace floor.
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Who are you? *</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Choose employee --</option>
                  {employeesNotCheckedIn.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Check-in Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Field assignment, client visit"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedEmpId}
                className="w-full bg-slate-900 border hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Clock className="w-4 h-4" /> Tap-In Office Terminal
              </button>
            </form>
          </div>

          {/* Active Work Flow Check-outs */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">On-Duty Floors Today ({checkedInCurrently.length})</h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {checkedInCurrently.map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 pl-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{log.employeeName}</p>
                    <p className="text-[10px] text-indigo-600 font-mono">In: {log.checkIn} ({log.status})</p>
                  </div>
                  <button
                    onClick={() => handleCheckoutClick(log.employeeId)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                  >
                    Check Out
                  </button>
                </div>
              ))}

              {checkedInCurrently.length === 0 && (
                <p className="text-[11px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-100">
                  No personnel currently logged on floor.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* ATTENDANCE DATASHEET LOG */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:col-span-2 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Timesheet Registers</h3>
            </div>

            {/* Date Selection tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button 
                onClick={() => setActiveDate("2026-05-28")} 
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeDate === "2026-05-28" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
              >
                May 28
              </button>
              <button 
                onClick={() => setActiveDate("2026-05-29")} 
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeDate === "2026-05-29" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
              >
                May 29
              </button>
              <button 
                onClick={() => setActiveDate("2026-05-30")} 
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeDate === "2026-05-30" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
              >
                Today (May 30)
              </button>
            </div>
          </div>

          {/* Quick Stats for selected day */}
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Logged</span>
              <span className="text-sm font-bold font-mono text-slate-800">{selectedDayLogs.length}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Present</span>
              <span className="text-sm font-bold font-mono text-emerald-600">
                {selectedDayLogs.filter(l => l.status === 'Present').length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Late</span>
              <span className="text-sm font-bold font-mono text-amber-600">
                {selectedDayLogs.filter(l => l.status === 'Late').length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Out</span>
              <span className="text-sm font-bold font-mono text-indigo-600">
                {selectedDayLogs.filter(l => l.status === 'On Leave').length}
              </span>
            </div>
          </div>

          {/* Search table */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search timesheet records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Timesheet List table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 font-bold">Personnel</th>
                  <th className="py-2.5 font-bold">Check-In</th>
                  <th className="py-2.5 font-bold">Check-Out</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Actions / Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-slate-800">{log.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{log.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-medium">
                      {log.checkIn ? log.checkIn : '—'}
                    </td>
                    <td className="py-3 font-mono font-medium">
                      {log.checkOut ? log.checkOut : log.checkIn ? <span className="text-[10px] text-indigo-500 font-mono animate-pulse">active</span> : '—'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 border text-[10px] font-semibold rounded-md ${getStatusStyles(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        
                        {/* Admin Overrides */}
                        <button
                          onClick={() => onUpdateAttendanceStatus(log.id, 'Present', log.notes)}
                          title="Set Present"
                          className="p-1 border border-slate-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateAttendanceStatus(log.id, 'Late', log.notes)}
                          title="Set Late"
                          className="p-1 border border-slate-100 rounded-lg hover:border-amber-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateAttendanceStatus(log.id, 'Absent', log.notes)}
                          title="Set Absent"
                          className="p-1 border border-slate-100 rounded-lg hover:border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic font-mono text-xs">
                      No matching records found for this workspace date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Note: Clock in deadlines are set to 09:00 AM UTC. Any check-ins after are automatically tagged as LATE-ARRIVAL.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
