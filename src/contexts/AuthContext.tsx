import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// Types
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  linkedProviders?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================
// Context
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user info from API
  const loadUser = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (token: string) => {
    localStorage.setItem('auth_token', token);
    await loadUser(token);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  // Refresh user info
  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await loadUser(token);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Hook
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
