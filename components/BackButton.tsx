import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to?: string
  label?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'outlined'
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to,
  label = '戻る',
  onClick,
  className = '',
  variant = 'default'
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  const variantClasses = {
    default: 'flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95',
    minimal: 'flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors',
    outlined: 'flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95'
  }

  return (
    <button
      onClick={handleClick}
      className={`${variantClasses[variant]} ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  )
}

export default BackButton
