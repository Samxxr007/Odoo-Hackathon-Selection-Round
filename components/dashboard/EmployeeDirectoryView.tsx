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
  Sparkles
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
    <div className="space-y-6">
      {/* 1. Header & Summary Statistics Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D24] tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-[#5A687D] mt-1">
            Real-time workplace directory, attendance status, and team information.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077FF] hover:bg-[#0060CC] text-white font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Employee</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3FF] text-[#0077FF] flex items-center justify-center font-bold text-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8F9CAE] uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-[#1A1D24] mt-0.5">{stats.total}</p>
          </div>
        </div>

        {/* Present in Office */}
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs font-semibold text-[#8F9CAE] uppercase tracking-wider">Present Today</p>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.present}</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8F9CAE] uppercase tracking-wider">On Leave</p>
            <p className="text-2xl font-black text-sky-600 mt-0.5">{stats.onLeave}</p>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8F9CAE] uppercase tracking-wider">Absent</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{stats.absent}</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5ECF2] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <EmployeeSearch
            onSearch={setSearchQuery}
            placeholder="Search by employee name, Login ID (e.g. OIJODO...), role, email..."
            className="w-full sm:max-w-md"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[#8F9CAE] flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Dept:
            </span>
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                selectedDept === 'ALL'
                  ? 'bg-[#0077FF] text-white shadow-xs'
                  : 'bg-[#F4F7FB] text-[#5A687D] hover:bg-gray-200'
              }`}
            >
              All ({employees.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-[#0077FF] text-white shadow-xs'
                    : 'bg-[#F4F7FB] text-[#5A687D] hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Employee Cards Grid (Matching Wireframe Grid) */}
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
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-12 text-center">
          <Building2 className="w-12 h-12 text-[#8F9CAE] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-[#1A1D24]">No employees found</h3>
          <p className="text-sm text-[#8F9CAE] max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or clear the department filter.
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
