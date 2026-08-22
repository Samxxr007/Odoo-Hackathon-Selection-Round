'use client'

import React, { useState, useMemo } from 'react'
import { EmployeeCard } from './EmployeeCard'
import { NewEmployeeModal } from './NewEmployeeModal'
import { EmployeeSearch } from './EmployeeSearch'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plane, 
  Plus, 
  Filter, 
  Briefcase, 
  Building2,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { AttendanceStatusType, Role } from '@prisma/client'
import type { EmployeeSummary, EmployeeDailyStatus, AuthUser } from '@/types'

interface EmployeeWithStatus extends EmployeeSummary {
  todayStatus?: EmployeeDailyStatus
}

interface EmployeeDirectoryViewProps {
  currentUser: AuthUser
  initialEmployees: EmployeeWithStatus[]
  stats: {
    total: number
    present: number
    onLeave: number
    absent: number
  }
}

export function EmployeeDirectoryView({
  currentUser,
  initialEmployees,
  stats,
}: EmployeeDirectoryViewProps) {
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>(initialEmployees)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return Array.from(set)
  }, [employees])

  // Filter employees by search and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.designation && e.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDept =
        selectedDept === 'ALL' || e.department === selectedDept

      return matchesSearch && matchesDept
    })
  }, [employees, searchQuery, selectedDept])

  const isAdmin = currentUser.role === Role.ADMIN

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0077FF] dark:text-[#38BDF8] bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 px-3 py-1 rounded-full border border-blue-200/40 dark:border-blue-800/40">
              Workforce Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time workplace presence, attendance telemetry, and organizational team roster.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0077FF] via-[#0088FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-lg glow-primary transition-all duration-200 cursor-pointer shrink-0 hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Employees */}
        <div className="relative group overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 text-[#0077FF] dark:text-[#38BDF8] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active Enterprise Accounts</p>
          </div>
        </div>

        {/* Present in Office */}
        <div className="relative group overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-emerald-200/60 dark:border-emerald-900/50 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Present Today</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              {stats.present}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Checked In & On Duty</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="relative group overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-sky-200/60 dark:border-sky-900/50 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">On Leave</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-sky-600 dark:text-sky-400">{stats.onLeave}</p>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80 mt-0.5">Approved Time Off</p>
          </div>
        </div>

        {/* Absent */}
        <div className="relative group overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-amber-200/60 dark:border-amber-900/50 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Absent</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.absent}</p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">Not Marked Present</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <EmployeeSearch
            onSearch={setSearchQuery}
            placeholder="Search employees by name, Login ID (e.g. OIJODO...), role, email..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`text-xs font-bold px-3.5 py-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer ${
                selectedDept === 'ALL'
                  ? 'bg-[#0077FF] text-white shadow-md glow-primary'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({employees.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-xs font-bold px-3.5 py-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-[#0077FF] text-white shadow-md glow-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Employee Cards Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-16 text-center">
          <Building2 className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No employees match your search</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your search keywords or clear the active department filter.
          </p>
        </div>
      )}

      {/* 5. Create Employee Modal (Admin Only) */}
      {isAdmin && (
        <NewEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={(newEmp) => {
            setEmployees((prev) => [newEmp, ...prev])
            setIsModalOpen(false)
          }}
          managers={employees.map((e) => ({ id: e.id, name: e.name }))}
        />
      )}
    </div>
  )
}
