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
      <Search className="absolute left-3.5 h-4 w-4 text-[#8F9CAE] pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]',
          'pl-10 pr-9 text-sm text-[#1A1D24] placeholder:text-[#8F9CAE]',
          'focus:outline-none focus:border-[#0077FF] focus:ring-2 focus:ring-[#0077FF]/15',
          'transition-all duration-150 shadow-2xs'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 text-[#8F9CAE] hover:text-[#1A1D24] transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
