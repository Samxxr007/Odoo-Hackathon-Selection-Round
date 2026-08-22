import * as React from 'react'
import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const initials = getInitials(name)

  if (src && !imgError) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeStyles[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 flex items-center justify-center font-semibold',
        'bg-gradient-to-br from-[#0077FF] to-[#00B7FE] text-white',
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}
