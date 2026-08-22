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
  Building2
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
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#8F9CAE] mt-1 font-medium">
            Real-time workplace presence, attendance telemetry, and organizational team roster.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077FF] hover:bg-[#0066DD] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider">Total Staff</span>
            <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#0077FF] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#1A1D24]">{stats.total}</p>
            <p className="text-[11px] text-[#8F9CAE] font-medium mt-0.5">Active Accounts</p>
          </div>
        </div>

        {/* Present in Office */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider">Present Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#22C55E] flex items-center gap-2">
              {stats.present}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
            </p>
            <p className="text-[11px] text-[#8F9CAE] font-medium mt-0.5">Checked In & Active</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00B7FE] uppercase tracking-wider">On Leave</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#00B7FE] flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#00B7FE]">{stats.onLeave}</p>
            <p className="text-[11px] text-[#8F9CAE] font-medium mt-0.5">Approved Time Off</p>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F9911E] uppercase tracking-wider">Absent</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F9911E] flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#F9911E]">{stats.absent}</p>
            <p className="text-[11px] text-[#8F9CAE] font-medium mt-0.5">Not Marked Present</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <EmployeeSearch
            onSearch={setSearchQuery}
            placeholder="Search employees by name, Login ID, role, email..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-[#8F9CAE] flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedDept === 'ALL'
                  ? 'bg-[#EAF3FF] text-[#0077FF] border border-[#E5ECF2] shadow-2xs'
                  : 'bg-[#F4F7FB] text-[#8F9CAE] hover:text-[#1A1D24] hover:bg-white border border-[#E5ECF2]'
              }`}
            >
              All ({employees.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-[#EAF3FF] text-[#0077FF] border border-[#E5ECF2] shadow-2xs'
                    : 'bg-[#F4F7FB] text-[#8F9CAE] hover:text-[#1A1D24] hover:bg-white border border-[#E5ECF2]'
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
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-16 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-[#8F9CAE] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[#1A1D24]">No employees match your search</h3>
          <p className="text-xs text-[#8F9CAE] max-w-sm mx-auto mt-1">
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
