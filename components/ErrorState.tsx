import React from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  showHomeButton?: boolean
  showBackButton?: boolean
  fullScreen?: boolean
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'エラーが発生しました',
  message = '申し訳ございません。問題が発生しました。',
  error,
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  fullScreen = false
}) => {
  const navigate = useNavigate()

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      {/* エラーアイコン */}
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={2} />
      </div>

      {/* エラーメッセージ */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {message}
        </p>
        
        {/* デバッグ用エラー詳細（開発環境のみ） */}
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto max-h-40">
              {typeof error === 'string' ? error : error.message}
            </pre>
          </details>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <RefreshCw size={16} />
            再試行
          </button>
        )}
        
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            戻る
          </button>
        )}
        
        {showHomeButton && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            <Home size={16} />
            ホームへ
          </button>
        )}
      </div>

      {/* サポート案内 */}
      <p className="text-xs text-gray-400 mt-4">
        問題が続く場合は、
        <a 
          href="mailto:support@hogusy.com" 
          className="text-teal-600 hover:underline ml-1"
        >
          サポートチーム
        </a>
        までお問い合わせください。
      </p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {content}
    </div>
  )
}

// 404 Not Found 専用コンポーネント
export const NotFoundError: React.FC<{ 
  resourceName?: string
  onBack?: () => void 
}> = ({ 
  resourceName = 'ページ',
  onBack 
}) => {
  const navigate = useNavigate()
  
  return (
    <ErrorState
      title={`${resourceName}が見つかりませんでした`}
      message={`お探しの${resourceName}は存在しないか、削除された可能性があります。`}
      onRetry={undefined}
      showBackButton={true}
      showHomeButton={true}
      fullScreen={true}
    />
  )
}

// ネットワークエラー専用コンポーネント
export const NetworkError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="接続エラー"
    message="インターネット接続を確認して、もう一度お試しください。"
    onRetry={onRetry}
    showBackButton={false}
    showHomeButton={false}
  />
)

// 権限エラー専用コンポーネント
export const PermissionError: React.FC = () => (
  <ErrorState
    title="アクセス権限がありません"
    message="このページを表示する権限がありません。ログインしているか確認してください。"
    onRetry={undefined}
    showBackButton={true}
    showHomeButton={true}
    fullScreen={true}
  />
)

export default ErrorState
