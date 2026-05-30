import React, { useState } from 'react';
import { 
  DollarSign, 
  Settings, 
  Coins, 
  FileCheck, 
  Eye, 
  ArrowUpRight, 
  TrendingUp, 
  Users,
  AlertCircle,
  X,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { PayrollRecord, Employee } from '../types';

interface PayrollSectionProps {
  payroll: PayrollRecord[];
  employees: Employee[];
  onUpdatePayroll: (recordId: string, allowance: number, deductions: number, status: 'Processed' | 'Paid' | 'Hold') => void;
  onProcessNewMonth: (month: string) => void;
  onAddLog: (type: 'employee' | 'leave' | 'attendance' | 'payroll' | 'document', description: string, user: string) => void;
}

export default function PayrollSection({
  payroll,
  employees,
  onUpdatePayroll,
  onProcessNewMonth,
  onAddLog
}: PayrollSectionProps) {
  
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [allowanceInput, setAllowanceInput] = useState(0);
  const [deductionsInput, setDeductionsInput] = useState(0);
  const [viewingSlipRecord, setViewingSlipRecord] = useState<PayrollRecord | null>(null);

  // Group payroll by month
  const months = Array.from(new Set(payroll.map(p => p.month))).sort().reverse();

  // Filter records by selected month
  const monthlyPayroll = payroll.filter(p => p.month === selectedMonth);

  // Calculate totals
  const totalBase = monthlyPayroll.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalAllowances = monthlyPayroll.reduce((sum, p) => sum + p.allowance, 0);
  const totalDeductions = monthlyPayroll.reduce((sum, p) => sum + p.deductions, 0);
  const totalNet = monthlyPayroll.reduce((sum, p) => sum + p.netSalary, 0);

  const handleEditClick = (rec: PayrollRecord) => {
    setEditingRecordId(rec.id);
    setAllowanceInput(rec.allowance);
    setDeductionsInput(rec.deductions);
  };

  const handleSaveAdjustments = (recId: string) => {
    const net = Math.round((monthlyPayroll.find(p => p.id === recId)?.baseSalary || 0) + allowanceInput - deductionsInput);
    onUpdatePayroll(recId, allowanceInput, deductionsInput, 'Processed');
    const rec = monthlyPayroll.find(p => p.id === recId);
    onAddLog('payroll', `Adjusted allowance ($${allowanceInput}) & deductions ($${deductionsInput}) for ${rec?.employeeName}`, "Elena Rostova (HR)");
    setEditingRecordId(null);
  };

  const handlePayAll = () => {
    if (confirm(`Do you wish to mark all Processed wages for the cycle ${selectedMonth} as PAID?`)) {
      monthlyPayroll.forEach(p => {
        if (p.status !== 'Paid') {
          onUpdatePayroll(p.id, p.allowance, p.deductions, 'Paid');
        }
      });
      onAddLog('payroll', `Authorized bank disbursement of ${selectedMonth} payroll values.`, "Elena Rostova (HR)");
      alert(`Payroll disbursement triggered. All ${selectedMonth} records successfully marked as PAID!`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top statistics overview for selected cycle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Gross Base Salaries</span>
            <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-bold font-mono text-slate-800 tracking-tight mt-3 block">
            ${Math.round(totalBase).toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Direct corporate liabilities</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Bonuses & Overtime</span>
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-bold font-mono text-slate-800 tracking-tight mt-3 block">
            +${Math.round(totalAllowances).toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Performance rewards payout</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Taxes & Deductions</span>
            <span className="text-rose-600 bg-rose-50 border border-rose-100 p-1.5 rounded-lg"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-bold font-mono text-slate-800 tracking-tight mt-3 block">
            -${Math.round(totalDeductions).toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Withholdings and balances</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Net Bank Ledger</span>
            <span className="text-slate-800 bg-slate-50 border border-slate-100 p-1.5 rounded-lg"><Coins className="w-4 h-4" /></span>
          </div>
          <span className="text-xl font-bold font-mono text-slate-800 tracking-tight mt-3 block">
            ${Math.round(totalNet).toLocaleString()}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Total final payout balance</p>
        </div>

      </div>

      {/* Main payroll desk table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        
        {/* Desk Header control actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Wages & Disbursal registers</h3>
            <p className="text-xs text-slate-400">Manage cycle bonuses, tax deductions, and print payslips.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-2 px-3 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500"
            >
              {months.map(m => (
                <option key={m} value={m}>Wage Cycle: {m}</option>
              ))}
            </select>

            <button
              onClick={handlePayAll}
              disabled={monthlyPayroll.every(p => p.status === 'Paid') || monthlyPayroll.length === 0}
              className="bg-slate-900 border hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-40 transition cursor-pointer"
            >
              Exits Disbursal Bank-Release
            </button>
          </div>
        </div>

        {/* Table datasheet */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-2.5">Staff Associate</th>
                <th className="py-2.5">Corporate Division</th>
                <th className="py-2.5">Base Salary (Mo.)</th>
                <th className="py-2.5">Allowance (Mo.)</th>
                <th className="py-2.5">Deductions (Mo.)</th>
                <th className="py-2.5">Net Disbursed</th>
                <th className="py-2.5">Disbursed Status</th>
                <th className="py-2.5 text-right">Adjustments / Slips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlyPayroll.map((rec) => {
                const isEditing = editingRecordId === rec.id;

                let statusBadge = "bg-rose-50 text-rose-800 border-rose-100";
                if (rec.status === "Paid") statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-100";
                if (rec.status === "Processed") statusBadge = "bg-amber-50 text-amber-800 border-amber-100";

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-slate-800">{rec.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rec.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 font-bold">{rec.department}</td>
                    <td className="py-3 font-mono font-bold text-slate-700">${Math.round(rec.baseSalary).toLocaleString()}</td>
                    
                    <td className="py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={allowanceInput}
                          onChange={(e) => setAllowanceInput(Number(e.target.value))}
                          className="w-16 p-1 border border-slate-300 rounded-md font-mono bg-slate-50"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">+${rec.allowance}</span>
                      )}
                    </td>

                    <td className="py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={deductionsInput}
                          onChange={(e) => setDeductionsInput(Number(e.target.value))}
                          className="w-16 p-1 border border-slate-300 rounded-md font-mono bg-slate-50"
                        />
                      ) : (
                        <span className="font-mono text-rose-500">-${rec.deductions}</span>
                      )}
                    </td>

                    <td className="py-3 font-mono font-bold text-slate-800">
                      ${Math.round(rec.baseSalary + (isEditing ? allowanceInput - deductionsInput : rec.allowance - rec.deductions)).toLocaleString()}
                    </td>

                    <td className="py-3">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-md ${statusBadge}`}>
                        {rec.status}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveAdjustments(rec.id)}
                            className="bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700 cursor-pointer transition shadow-xs"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(rec)}
                            disabled={rec.status === 'Paid'}
                            className="p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer transition"
                            title="Adjust variables"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setViewingSlipRecord(rec)}
                          className="p-1.5 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 text-indigo-600 cursor-pointer transition"
                          title="Generate payslip document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {monthlyPayroll.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No matching records registered under this wage month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* POPUP PROFESSIONAL WAGE STATEMENT / PAYSLIP */}
      {viewingSlipRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Heading Actions */}
            <div className="border-b border-indigo-50 px-6 py-4 flex items-center justify-between bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 font-mono">DOCUMENT REFERENCE ID: NEXUS-{viewingSlipRecord.id}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-1.5 border hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                  title="Print Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewingSlipRecord(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Complete Professional Corporate Payslip Form Layout */}
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
                <div>
                  <h2 className="text-xl font-black text-indigo-900 tracking-tight uppercase">Nexus Enterprises Ltd</h2>
                  <p className="text-[10px] text-slate-400 font-medium">108 Science Lab Ave, Tech Meadows, CA 94016</p>
                  <p className="text-[10px] text-slate-400 font-mono">EIN Reg: 45-0918-X99</p>
                </div>
                <div className="text-left sm:text-right">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                    Official payslip
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Payment Cycle Month: <strong className="text-slate-800">{viewingSlipRecord.month}</strong></p>
                  <p className="text-xs text-slate-500 font-medium">Bank Release Status: <strong className={viewingSlipRecord.status === 'Paid' ? 'text-emerald-600':'text-amber-600'}>{viewingSlipRecord.status}</strong></p>
                </div>
              </div>

              {/* Associate Info Fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="block text-slate-400 uppercase font-bold text-[9px]">Staff Associate</span>
                  <span className="font-bold text-slate-800">{viewingSlipRecord.employeeName}</span>
                  <span className="block text-slate-400">{viewingSlipRecord.employeeId}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-400 uppercase font-bold text-[9px]">Operating Division</span>
                  <span className="font-bold text-slate-800">{viewingSlipRecord.department}</span>
                  <span className="block text-slate-400">Regular Contract, Full-time</span>
                </div>
              </div>

              {/* Wage details breakdown */}
              <div className="border border-slate-100 rounded-xl overflow-hidden mt-6 text-xs">
                <div className="grid grid-cols-3 bg-slate-50 font-bold border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider p-3">
                  <span>Compensation Category</span>
                  <span className="text-right">Earnings (+)</span>
                  <span className="text-right">Deductions (-)</span>
                </div>

                <div className="divide-y divide-slate-100 font-medium">
                  
                  {/* Basic Salary */}
                  <div className="grid grid-cols-3 p-3 text-slate-700">
                    <span>Base Monthly Compensation</span>
                    <span className="text-right font-mono">${Math.round(viewingSlipRecord.baseSalary).toLocaleString()}</span>
                    <span className="text-right font-mono">—</span>
                  </div>

                  {/* Allowances */}
                  <div className="grid grid-cols-3 p-3 text-slate-700">
                    <span>Performance Bonuses / Overtime Accrual</span>
                    <span className="text-right font-mono text-emerald-600">+${viewingSlipRecord.allowance}</span>
                    <span className="text-right font-mono">—</span>
                  </div>

                  {/* Deductions */}
                  <div className="grid grid-cols-3 p-3 text-slate-700">
                    <span>Income Tax Withholding & Social Contributions</span>
                    <span className="text-right font-mono">—</span>
                    <span className="text-right font-mono text-rose-500">-${viewingSlipRecord.deductions}</span>
                  </div>

                </div>

                {/* Net Total strip */}
                <div className="grid grid-cols-3 bg-indigo-50/50 p-4 font-black border-t border-slate-200">
                  <span className="text-indigo-900 font-extrabold uppercase">Net pay disbursed</span>
                  <span className="text-right font-mono text-indigo-900 col-span-2 text-base">
                    ${Math.round(viewingSlipRecord.baseSalary + viewingSlipRecord.allowance - viewingSlipRecord.deductions).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Disbursal Acknowledgements */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3.5 text-xs">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Verified Disbursal Acknowledgment</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    This document serves as an official electronic declaration of earnings. All earnings are processed in strict compliance with federal wage legislation and reported directly to Treasury.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 text-right">
              <button
                onClick={() => setViewingSlipRecord(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer transition shadow-xs"
              >
                Close Statement
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
