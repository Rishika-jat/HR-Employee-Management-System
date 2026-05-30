import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  User, 
  X, 
  FileText, 
  ShieldAlert, 
  AlertCircle,
  Building,
  Briefcase,
  Layers,
  HeartPulse
} from 'lucide-react';
import { Employee, EmployeeStatus, DocumentRecord, PayrollRecord, LeaveRequest } from '../types';

interface EmployeeSectionProps {
  employees: Employee[];
  documents: DocumentRecord[];
  payroll: PayrollRecord[];
  leaves: LeaveRequest[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  onAddLog: (type: 'employee' | 'leave' | 'attendance' | 'payroll' | 'document', description: string, user: string) => void;
}

export default function EmployeeSection({
  employees,
  documents,
  payroll,
  leaves,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onNavigateToTab,
  onAddLog
}: EmployeeSectionProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: '',
    status: 'Active' as EmployeeStatus,
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 60000,
    emergencyContact: '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    gender: 'Male',
    dob: '1995-01-01'
  });

  const [isEditing, setIsEditing] = useState(false);

  // Handle Form Submission for Add or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedEmployee) {
      onEditEmployee({
        ...selectedEmployee,
        ...formData
      });
      onAddLog('employee', `Modified employee file for ${formData.firstName} ${formData.lastName}`, "Elena Rostova (HR)");
      setSelectedEmployee({ ...selectedEmployee, ...formData });
      setIsEditing(false);
    } else {
      onAddEmployee(formData);
      onAddLog('employee', `Registered new candidate ${formData.firstName} ${formData.lastName} into enterprise roles.`, "Elena Rostova (HR)");
      setIsAdding(false);
    }
    // reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      role: '',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 60000,
      emergencyContact: '',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      gender: 'Male',
      dob: '1995-01-01'
    });
  };

  const handleEditClick = (emp: Employee) => {
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      emergencyContact: emp.emergencyContact || '',
      photoUrl: emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      gender: emp.gender,
      dob: emp.dob
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  // Departments List
  const departments = ['All', 'Engineering', 'Human Resources', 'Research & Development', 'Sales & Marketing', 'Operations'];

  // Match and Filter
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="On Leave">On Leave Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>

        </div>

        {/* Add Employee Button */}
        <button
          onClick={() => {
            setIsEditing(false);
            setIsAdding(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Employee
        </button>
      </div>

      {/* Grid of Employee Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
          if (emp.status === "On Leave") statusBadge = "bg-amber-50 text-amber-700 border-amber-100";
          if (emp.status === "Suspended") statusBadge = "bg-rose-50 text-rose-700 border-rose-100";

          return (
            <div 
              key={emp.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-300 transition duration-150 cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedEmployee(emp)}
            >
              <div>
                <div className="flex items-start gap-4">
                  <img 
                    src={emp.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`} 
                    alt={emp.firstName} 
                    className="w-14 h-14 rounded-full object-cover border border-slate-100 bg-slate-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                      {emp.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight leading-sm">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {emp.role}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                  {emp.status}
                </span>
                <span className="text-xs font-semibold text-slate-800 font-mono">
                  ${emp.salary.toLocaleString()}/yr
                </span>
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="bg-white border select-none border-dashed border-slate-200 rounded-2xl p-10 col-span-full flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-slate-600">No personnel records found</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">Adjust your filter parameters or register a new candidate.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? 'Modify Candidate Record' : 'Register New Enterprise Personnel'}
              </h3>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="e.g. John"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="e.g. Doe"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Corporate Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. john.doe@company.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Contact *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +1 (555) 000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Corporate Title / Role *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. Architect, Specialist"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Annual base Salary ($) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Joining Schedule *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender Selection</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Contact Details</label>
                <input 
                  type="text" 
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  placeholder="e.g. Mary Doe (Spouse) - 555-123-4567"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status Tier</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as EmployeeStatus})}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Avatar Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  {isEditing ? 'Save Updates' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Employee Detail View / Modal Drawer */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white h-full max-w-lg w-full border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Personnel Core File</h3>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Profile Card Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                <img 
                  src={selectedEmployee.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`} 
                  alt={selectedEmployee.firstName} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{selectedEmployee.id}</span>
                  <h4 className="text-lg font-bold text-slate-800">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{selectedEmployee.role}</p>
                </div>
              </div>

              {/* Action grid (Quick edits) */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => {
                    handleEditClick(selectedEmployee);
                  }}
                  className="py-2.5 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  Modify File info
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to terminate ${selectedEmployee.firstName}'s workforce credentials?`)) {
                      onDeleteEmployee(selectedEmployee.id);
                      onAddLog('employee', `Terminated corporate access credentials for ${selectedEmployee.firstName} ${selectedEmployee.lastName}`, "Elena Rostova (HR)");
                      setSelectedEmployee(null);
                    }
                  }}
                  className="py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  Terminate Records
                </button>
              </div>

              {/* Personal Data Lists */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Core Specifications</h4>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm">
                  <div>
                    <span className="block text-slate-400 text-xs font-medium">Department</span>
                    <span className="font-bold text-slate-700">{selectedEmployee.department}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-medium">Annual Compensation</span>
                    <span className="font-bold text-slate-700 font-mono">${selectedEmployee.salary.toLocaleString()}/yr</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-medium">Workforce Status</span>
                    <span className="inline-block mt-0.5 font-bold text-xs text-slate-700 px-2 py-0.5 rounded bg-slate-100 border">
                      {selectedEmployee.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-medium">Assigned Joining Schedule</span>
                    <span className="font-bold text-slate-700">{selectedEmployee.joiningDate}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs font-medium">Demographics</span>
                    <span className="font-bold text-slate-700">{selectedEmployee.gender}, born {selectedEmployee.dob}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Medical / Emergency Contacts</span>
                </div>
                <div className="text-sm bg-rose-50/50 p-4 border border-rose-100/50 rounded-xl">
                  {selectedEmployee.emergencyContact ? (
                    <p className="font-bold text-rose-900 font-mono">{selectedEmployee.emergencyContact}</p>
                  ) : (
                    <span className="text-slate-400 italic">No medical summary or emergency contact provided.</span>
                  )}
                </div>
              </div>

              {/* Employee Attachment File List */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Personnel Documents ({documents.filter(d => d.employeeId === selectedEmployee.id).length})</span>
                <div className="space-y-2">
                  {documents.filter(d => d.employeeId === selectedEmployee.id).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/55 rounded-xl hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.type} • {doc.fileSize}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onNavigateToTab('documents')}
                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Inspect Full File
                      </button>
                    </div>
                  ))}

                  {documents.filter(d => d.employeeId === selectedEmployee.id).length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50 border border-slate-100 rounded-xl">
                      No contracts/attachments registered. Generate a contract under Documents.
                    </div>
                  )}
                </div>
              </div>

              {/* Payslip history snippet */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Recent Payroll Slip</span>
                {payroll.filter(p => p.employeeId === selectedEmployee.id).slice(0,1).map(pay => (
                  <div key={pay.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-bold text-slate-700">Payroll Cycle: {pay.month}</p>
                      <p className="text-xs text-slate-400">Salary + Overtime: ${Math.round(pay.baseSalary + pay.allowance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 font-mono">${pay.netSalary.toLocaleString()}</p>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 border border-emerald-100 text-emerald-600 bg-emerald-50 rounded">
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Drawer Footer AI Helper Quick-Draft Link */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 text-center flex justify-between gap-3">
              <span className="text-xs text-slate-400 mt-2 font-mono">POWERED BY NELLIE AI CO-PILOT</span>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  onNavigateToTab('documents');
                }}
                className="bg-slate-900 border hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                Draft Legal Contract with AI
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
