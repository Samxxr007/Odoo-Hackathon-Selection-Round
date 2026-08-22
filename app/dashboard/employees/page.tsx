'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmployeeCard } from '@/components/dashboard/EmployeeCard'
import { EmployeeSearch } from '@/components/dashboard/EmployeeSearch'
import { NewEmployeeModal } from '@/components/dashboard/NewEmployeeModal'
import { EmployeeCardSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import type { EmployeeSummary } from '@/types'

interface PageState {
  employees: EmployeeSummary[]
  total: number
  loading: boolean
  error: string | null
}

interface CurrentUser {
  id: string
  role: string
}

export default function EmployeesPage() {
  const { error: toastError } = useToast()
  const [state, setState] = useState<PageState>({
    employees: [],
    total: 0,
    loading: true,
    error: null,
  })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showNewModal, setShowNewModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [managers, setManagers] = useState<Array<{ id: string; name: string }>>([])

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const json = await res.json()
        if (json.success) setCurrentUser(json.data)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchEmployees = useCallback(
    async (searchQuery: string, pageNum: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const params = new URLSearchParams({
          search: searchQuery,
          page: String(pageNum),
          limit: '24',
        })
        const res = await fetch(`/api/employees?${params}`)
        const json = await res.json()

        if (!json.success) {
          setState((prev) => ({ ...prev, loading: false, error: json.error }))
          return
        }

        setState({
          employees: json.data,
          total: json.pagination.total,
          loading: false,
          error: null,
        })

        // Build managers list for modal
        const adminList = json.data
          .filter((e: EmployeeSummary) => e.role === 'ADMIN')
          .map((e: EmployeeSummary) => ({ id: e.id, name: e.name }))
        setManagers(adminList)
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load employees. Please try again.',
        }))
        toastError('Failed to load employees')
      }
    },
    [toastError]
  )

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    fetchEmployees(search, page)
  }, [search, page, fetchEmployees])

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(1)
  }

  const handleNewEmployee = (employee: EmployeeSummary) => {
    setState((prev) => ({
      ...prev,
      employees: [employee, ...prev.employees],
      total: prev.total + 1,
    }))
    setShowNewModal(false)
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24]">Employees</h1>
          {!state.loading && (
            <p className="text-[#8F9CAE] text-sm mt-0.5">
              {state.total} {state.total === 1 ? 'employee' : 'employees'} found
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <EmployeeSearch onSearch={handleSearch} className="w-64 sm:w-72" />
          {isAdmin && (
            <Button
              onClick={() => setShowNewModal(true)}
              size="md"
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Employee
            </Button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {state.loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!state.loading && state.error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-[#8F9CAE]">{state.error}</p>
          <Button variant="outline" onClick={() => fetchEmployees(search, page)}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!state.loading && !state.error && state.employees.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#EAF3FF] flex items-center justify-center">
            <Users className="h-8 w-8 text-[#0077FF]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1D24]">
              {search ? 'No employees found' : 'No employees yet'}
            </h3>
            <p className="text-sm text-[#8F9CAE] mt-1">
              {search
                ? `No results for "${search}". Try a different search.`
                : isAdmin
                ? 'Create your first employee using the button above.'
                : 'Your team directory is empty.'}
            </p>
          </div>
          {search && (
            <Button variant="outline" onClick={() => handleSearch('')}>
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Employee grid */}
      {!state.loading && !state.error && state.employees.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {state.employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                currentUserId={currentUser?.id ?? ''}
              />
            ))}
          </div>

          {/* Pagination */}
          {state.total > 24 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-[#8F9CAE]">
                Page {page} of {Math.ceil(state.total / 24)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(state.total / 24)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* New Employee Modal — Admin only */}
      {isAdmin && (
        <NewEmployeeModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onCreated={handleNewEmployee}
          managers={managers}
        />
      )}
    </div>
  )
}
