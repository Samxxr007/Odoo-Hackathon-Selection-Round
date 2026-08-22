'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#1A1D24]">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#8F9CAE] pointer-events-none">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm text-[#1A1D24]',
              'placeholder:text-[#8F9CAE]',
              'border-[#E5ECF2] focus:border-[#0077FF] focus:ring-2 focus:ring-[#0077FF]/20',
              'outline-none transition-all duration-150',
              'disabled:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-70',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[#8F9CAE]">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[#8F9CAE]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
