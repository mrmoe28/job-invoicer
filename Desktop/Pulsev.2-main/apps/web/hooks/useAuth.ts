'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

const STORAGE_KEYS = {
  USER: 'pulse_user',
  SESSION: 'pulse_session_active',
  TOKEN: 'pulse_auth_token',
} as const;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    isInitialized: false,
  });

  const router = useRouter();

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        setAuthState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
        return;
      }

      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      const sessionActive = localStorage.getItem(STORAGE_KEYS.SESSION);
      const authToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!userData || sessionActive !== 'true' || !authToken) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          isInitialized: true,
        });
        return;
      }

      const parsedUser = JSON.parse(userData) as AuthUser;

      // Validate user data structure
      if (!parsedUser.id || !parsedUser.email || !parsedUser.organizationId) {
        throw new Error('Invalid user data structure');
      }

      setAuthState({
        user: parsedUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        isInitialized: true,
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to initialize authentication',
        isInitialized: true,
      });
    }
  }, []);

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  // Login function
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

      setAuthState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        isInitialized: true,
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Call logout API to invalidate server session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`,
        },
      });
    } catch (error) {
      console.error('Error during logout API call:', error);
    }

    // Clear local auth data regardless of API call result
    clearAuthData();
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      isInitialized: true,
    });

    router.push('/auth');
  }, [clearAuthData, router]);

  // Update user data
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    
    // Admin has all permissions
    if (authState.user.role === 'admin') return true;
    
    // Add role-based permission logic here
    const rolePermissions = {
      manager: ['read_customers', 'write_customers', 'read_documents', 'write_documents'],
      user: ['read_customers', 'read_documents'],
    };

    return rolePermissions[authState.user.role]?.includes(permission) || false;
  }, [authState.user]);

  // Require authentication
  const requireAuth = useCallback(() => {
    if (authState.isInitialized && !authState.isAuthenticated) {
      router.push('/auth');
      return false;
    }
    return true;
  }, [authState.isInitialized, authState.isAuthenticated, router]);

  // Initialize auth on mount
  useEffect(() => {
    if (!authState.isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, authState.isInitialized]);

  return {
    ...authState,
    login,
    logout,
    updateUser,
    hasPermission,
    requireAuth,
    clearAuthData,
  };
};