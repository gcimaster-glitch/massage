import React, { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover',
  fallbackSrc = 'https://via.placeholder.com/400x300?text=No+Image',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 遅延読み込み（Intersection Observer）
  useEffect(() => {
    // priority=true の場合は即座に読み込み
    if (priority) {
      setImageSrc(src)
      return
    }

    // Intersection Observer のセットアップ
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current)
            }
          }
        })
      },
      {
        rootMargin: '50px', // 50px手前から読み込み開始
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, priority])

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(fallbackSrc)
    if (onError) onError()
  }

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }[objectFit]

  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : '100%' 
      }}
    >
      {/* ローディングスピナー */}
      {isLoading && imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* プレースホルダー（画像読み込み前） */}
      {!imageSrc && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* 画像 */}
      <img
        ref={imgRef}
        src={imageSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
        alt={alt}
        className={`w-full h-full ${objectFitClass} ${className} ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* エラー表示 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-xs text-gray-400">画像を読み込めませんでした</p>
        </div>
      )}
    </div>
  )
}

export default OptimizedImage
