import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
  variant?: 'primary' | 'white'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = '読み込み中...',
  fullScreen = false,
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const colorClasses = variant === 'white' 
    ? 'text-white' 
    : 'text-teal-600'

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses} animate-spin`}
        strokeWidth={2.5}
      />
      {text && (
        <p className={`${textSizeClasses[size]} font-medium ${colorClasses}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingSpinner
