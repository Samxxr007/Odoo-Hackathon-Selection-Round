'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmployeeSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

export function EmployeeSearch({
  onSearch,
  placeholder = 'Search employees by name, department…',
  className,
  initialValue = '',
}: EmployeeSearchProps) {
  const [value, setValue] = useState(initialValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(v), 350)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700',
          'pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:border-[#0077FF] dark:focus:border-[#38BDF8] focus:ring-3 focus:ring-[#0077FF]/15 dark:focus:ring-[#38BDF8]/20',
          'transition-all duration-200 shadow-2xs'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
