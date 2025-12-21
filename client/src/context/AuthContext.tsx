// client/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const storedToken = api.getToken();
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Loads users data through token
   * @param authToken token duh
   */
  async function loadUser(authToken: string) {
    try {
      const userData = await api.getCurrentUser(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Fail load user:', error);
      api.removeToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Login function
   * @param email yea
   * @param password exactly
   */
  async function login(email: string, password: string) {
    const { user: userData, token: authToken } = await api.login(email, password);
    api.saveToken(authToken);
    setToken(authToken);
    setUser(userData);
  }

  /**
   * Reg function
   * @param name .
   * @param email .
   * @param password .
   */
  async function register(name: string, email: string, password: string) {
    const { user: userData, token: authToken } = await api.register(name, email, password);
    api.saveToken(authToken);
    setToken(authToken);
    setUser(userData);
  }

  /**
   * Logout function
   */
  function logout() {
    api.removeToken();
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use AuthContext
 * @returns AuthContext value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}