import React, { useState } from 'react';
import { 
  Calendar, 
  Send, 
  Check, 
  X, 
  Clock, 
  Compass, 
  FileCheck, 
  ShieldCheck, 
  Info,
  ChevronDown
} from 'lucide-react';
import { LeaveRequest, LeaveType, Employee } from '../types';

interface LeaveSectionProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  onSubmitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status' | 'employeeName'>) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onAddLog: (type: 'employee' | 'leave' | 'attendance' | 'payroll' | 'document', description: string, user: string) => void;
}

export default function LeaveSection({
  leaves,
  employees,
  onSubmitLeaveRequest,
  onApproveLeave,
  onRejectLeave,
  onAddLog
}: LeaveSectionProps) {
  
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !startDate || !endDate || !reason) return;

    onSubmitLeaveRequest({
      employeeId: selectedEmpId,
      leaveType,
      startDate,
      endDate,
      reason
    });

    const emp = employees.find(e => e.id === selectedEmpId);
    onAddLog('leave', `Awaited leave authorization submitted by ${emp?.firstName} ${emp?.lastName} (${leaveType})`, emp?.firstName || "Unknown");

    // reset fields
    setSelectedEmpId('');
    setLeaveType('Annual');
    setStartDate('');
    setEndDate('');
    setReason('');
    alert("Leave request submitted successfully. It is now awaiting approval from Elena Rostova (HR).");
  };

  const handleApprove = (id: string) => {
    const r = leaves.find(l => l.id === id);
    onApproveLeave(id);
    onAddLog('leave', `Authorized leave request for ${r?.employeeName} (${r?.leaveType})`, "Elena Rostova (HR)");
  };

  const handleReject = (id: string) => {
    const r = leaves.find(l => l.id === id);
    onRejectLeave(id);
    onAddLog('leave', `Declined leave request for ${r?.employeeName} (${r?.leaveType})`, "Elena Rostova (HR)");
  };

  const filteredLeaves = leaves.filter(l => typeFilter === 'All' || l.leaveType === typeFilter);

  return (
    <div className="space-y-6">
      
      {/* Balances summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Dynamic balances info card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Standard Annual Credit</span>
            <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">24 days</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Accrued monthly over tenure</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-600">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sick Leave Allotment</span>
            <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">10 days</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Full medical rate compensation</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Active Authorized</span>
            <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
              {leaves.filter(l => l.status === 'Approved').length} Requests
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">In currently tracked calendar</span>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SUBMIT REQUEST FORM */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">File Leave Request</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Employee Submitting *</label>
              <select
                required
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select employee --</option>
                {employees.filter(e => e.status !== 'Suspended').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Leave Type *</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Annual">Annual Paid Leave</option>
                <option value="Sick">Sick / Medical Leave</option>
                <option value="Maternity">Parental / Maternity Leave</option>
                <option value="Unpaid">Unpaid Grace Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Core Purpose / Reason *</label>
              <textarea
                required
                rows={3}
                placeholder="Give details of context..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={!selectedEmpId || !startDate || !endDate}
              className="w-full bg-slate-900 border hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" /> Submit to HR Panel
            </button>
          </form>
        </div>

        {/* TIMELINE / LIST OF REQUESTS */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Leave Decision Timeline</h3>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-1.5 px-3 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Maternity">Parental</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto">
            {filteredLeaves.map((request) => {
              let statusBadge = "border-slate-200 text-slate-500 bg-slate-50";
              if (request.status === "Approved") statusBadge = "border-emerald-200 text-emerald-700 bg-emerald-50/50";
              if (request.status === "Rejected") statusBadge = "border-rose-200 text-rose-700 bg-rose-50/50";
              if (request.status === "Pending") statusBadge = "border-amber-200 text-amber-700 bg-amber-50/50 animate-pulse";

              return (
                <div key={request.id} className="p-4 border border-slate-100 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold text-slate-400 font-mono uppercase">{request.id}</span>
                        <h4 className="text-xs font-bold text-slate-900">{request.employeeName}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        {request.leaveType} Leave Schedule: <strong className="text-slate-700 font-mono">{request.startDate}</strong> to <strong className="text-slate-700 font-mono">{request.endDate}</strong>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-lg ${statusBadge}`}>
                      {request.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                    "{request.reason}"
                  </p>

                  {/* Decision Options if Pending */}
                  {request.status === 'Pending' && (
                    <div className="flex items-center justify-end gap-3.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-400 font-medium">Verify credentials action:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-2.5 py-1 text-[10px] font-bold border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          <X className="w-3 h-3" /> Decline
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-2.5 py-1 text-[10px] font-bold border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          <Check className="w-3 h-3" /> Authorize
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLeaves.length === 0 && (
              <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Info className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                <p className="text-xs italic">No leave request logs processed under this filter.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
