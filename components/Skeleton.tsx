import React from 'react'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string
  height?: string
  count?: number
  className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text',
  width,
  height,
  count = 1,
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  const defaultSizes = {
    text: { height: '1rem' },
    circular: { width: '40px', height: '40px' },
    rectangular: { height: '200px' },
    card: { height: '300px' }
  }

  const finalStyle = {
    ...defaultSizes[variant],
    ...style
  }

  if (count === 1) {
    return (
      <div 
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={finalStyle}
      />
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={finalStyle}
        />
      ))}
    </div>
  )
}

// スケルトンカードコンポーネント
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width="64px" height="64px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  </div>
)

// セラピストカードスケルトン
export const SkeletonTherapistCard: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    <Skeleton variant="rectangular" height="200px" className="rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
      <Skeleton variant="text" count={2} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="60px" height="24px" className="rounded" />
        <Skeleton variant="rectangular" width="60px" height="24px" className="rounded" />
      </div>
    </div>
  </div>
)

// リストスケルトン
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)

export default Skeleton
