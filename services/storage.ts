/**
 * 安全なlocalStorageラッパー
 * エラーハンドリング・型安全性・有効期限管理を提供
 */

interface StorageItem<T> {
  value: T
  expiresAt?: number
}

class StorageService {
  private prefix: string = 'hogusy_'

  /**
   * 値を保存
   */
  set<T>(key: string, value: T, expiresInMs?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
      return true
    } catch (error) {
      console.error(`Failed to set storage item: ${key}`, error)
      return false
    }
  }

  /**
   * 値を取得
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key)
      if (!itemStr) return defaultValue ?? null

      const item: StorageItem<T> = JSON.parse(itemStr)

      // 有効期限チェック
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key)
        return defaultValue ?? null
      }

      return item.value
    } catch (error) {
      console.error(`Failed to get storage item: ${key}`, error)
      return defaultValue ?? null
    }
  }

  /**
   * 値を削除
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.error(`Failed to remove storage item: ${key}`, error)
      return false
    }
  }

  /**
   * すべてクリア（prefixが一致するもののみ）
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      )
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('Failed to clear storage', error)
      return false
    }
  }

  /**
   * すべてのキーを取得
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('Failed to get all keys', error)
      return []
    }
  }

  /**
   * ストレージの使用量を取得（おおよそ）
   */
  getStorageSize(): number {
    try {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      console.error('Failed to get storage size', error)
      return 0
    }
  }
}

// シングルトンインスタンス
export const storage = new StorageService()

// ユーザー関連の型定義
export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN' | 'THERAPIST' | 'HOST' | 'THERAPIST_OFFICE'
  avatar?: string
}

// ユーザー管理ヘルパー
export const userStorage = {
  setCurrentUser: (user: User) => storage.set('currentUser', user),
  getCurrentUser: () => storage.get<User>('currentUser'),
  removeCurrentUser: () => storage.remove('currentUser'),
  
  setAuthToken: (token: string, expiresInMs?: number) => 
    storage.set('auth_token', token, expiresInMs),
  getAuthToken: () => storage.get<string>('auth_token'),
  removeAuthToken: () => storage.remove('auth_token'),
  
  isAuthenticated: () => !!storage.get<string>('auth_token'),
  
  logout: () => {
    storage.remove('currentUser')
    storage.remove('auth_token')
  }
}

// お気に入り管理
export const favoriteStorage = {
  addFavorite: (type: 'therapist' | 'site', id: string) => {
    const key = `favorites_${type}`
    const favorites = storage.get<string[]>(key, [])
    if (!favorites.includes(id)) {
      favorites.push(id)
      storage.set(key, favorites)
    }
  },
  
  removeFavorite: (type: 'therapist' | 'site', id: string) => {
    const key = `favorites_${type}`
    const favorites = storage.get<string[]>(key, [])
    const filtered = favorites.filter(fav => fav !== id)
    storage.set(key, filtered)
  },
  
  getFavorites: (type: 'therapist' | 'site') => {
    const key = `favorites_${type}`
    return storage.get<string[]>(key, [])
  },
  
  isFavorite: (type: 'therapist' | 'site', id: string) => {
    const favorites = favoriteStorage.getFavorites(type)
    return favorites.includes(id)
  }
}

// 検索履歴管理
export const searchHistoryStorage = {
  addSearch: (query: string, maxHistory: number = 10) => {
    const history = storage.get<string[]>('search_history', [])
    const filtered = history.filter(h => h !== query)
    filtered.unshift(query)
    storage.set('search_history', filtered.slice(0, maxHistory))
  },
  
  getHistory: () => storage.get<string[]>('search_history', []),
  
  clearHistory: () => storage.remove('search_history')
}

export default storage
