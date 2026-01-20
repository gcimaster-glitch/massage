import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, UserCircle, LayoutDashboard } from 'lucide-react'
import { userStorage, User as StorageUser } from '../services/storage'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN' | 'THERAPIST' | 'HOST' | 'THERAPIST_OFFICE'
  avatar?: string
}

interface UserMenuProps {
  currentUser?: User | null
  onLogout?: () => void
  variant?: 'light' | 'dark'
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  currentUser, 
  onLogout,
  variant = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // currentUserが渡されている場合はそれを使用
    if (currentUser) {
      setUser(currentUser)
      return
    }

    // storageサービスから取得（フォールバック）
    const storedUser = userStorage.getCurrentUser()
    if (storedUser) {
      setUser(storedUser as User)
    }
  }, [currentUser])

  // クリック外でメニューを閉じる & キーボード操作
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape キーでメニューを閉じる
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogout = () => {
    // storageサービスを使用してログアウト
    userStorage.logout()
    setIsOpen(false)
    
    if (onLogout) {
      onLogout()
    } else {
      navigate('/login')
    }
  }

  // 未ログイン時
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/login')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
            ${variant === 'light' 
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-white hover:bg-white/10'
            }`}
        >
          ログイン
        </button>
        <button
          onClick={() => navigate('/signup')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all
            ${variant === 'light'
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-white text-teal-600 hover:bg-gray-100'
            }`}
        >
          新規登録
        </button>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'THERAPIST':
        return 'bg-teal-100 text-teal-800'
      case 'HOST':
        return 'bg-blue-100 text-blue-800'
      case 'THERAPIST_OFFICE':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '管理者'
      case 'THERAPIST':
        return 'セラピスト'
      case 'HOST':
        return 'ホスト'
      case 'THERAPIST_OFFICE':
        return '施術院'
      case 'USER':
        return '利用者'
      default:
        return role
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* ユーザーアバターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${variant === 'light'
            ? 'hover:bg-gray-100'
            : 'hover:bg-white/10'
          }
          ${isOpen ? 'ring-2 ring-teal-500' : ''}
        `}
        aria-label="ユーザーメニューを開く"
        aria-expanded={isOpen}
      >
        {/* アバター画像 */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
            ${variant === 'light'
              ? 'bg-teal-600 text-white'
              : 'bg-white text-teal-600'
            }`}
          >
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
        )}
        
        {/* ユーザー名（デスクトップのみ） */}
        <div className="hidden md:block text-left">
          <div className={`text-sm font-semibold leading-tight
            ${variant === 'light' ? 'text-gray-900' : 'text-white'}
          `}>
            {user.name || 'ユーザー'}
          </div>
          <div className={`text-xs leading-tight
            ${variant === 'light' ? 'text-gray-500' : 'text-gray-300'}
          `}>
            {getRoleLabel(user.role)}
          </div>
        </div>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.name || 'ユーザー'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email || ''}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* メニュー項目 */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/app')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 transition-colors font-semibold"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600" />
              <span>マイページ</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/app/settings')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>設定</span>
            </button>
          </div>

          {/* ログアウト */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
