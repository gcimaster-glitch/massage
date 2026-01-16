import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav 
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="パンくずリスト"
    >
      {/* ホームアイコン */}
      <Link 
        to="/"
        className="flex items-center gap-1 text-gray-500 hover:text-teal-600 transition-colors"
        aria-label="ホーム"
      >
        <Home size={16} />
      </Link>

      {/* パンくずアイテム */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            <ChevronRight size={16} className="text-gray-300" />
            
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-teal-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-bold">
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
