import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthState } from '../types';
import { AuthAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Constants for local storage
const USER_KEY = 'financeTrackerUser';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });
  
  // AuthProvider.tsx
useEffect(() => {
  const checkAuth = async () => {
    try {
      const cachedUserData = localStorage.getItem(USER_KEY);
      const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : null;
      const token = localStorage.getItem(USER_KEY);
      console.log('Checking auth - Cached user:', cachedUser, 'Token:', token);

      // Use cached user data initially
      if (cachedUser && token) {
        setState({
          user: cachedUser,
          isAuthenticated: true,
          loading: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        return; // Skip server check if no token or user
      }

      // Verify with server
      const user = await AuthAPI.getCurrentUser();

      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        console.log('No user returned from server');
        localStorage.removeItem(USER_KEY);
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Session expired',
        });
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Only clear state if the error indicates an invalid token
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem(USER_KEY);
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Session expired',
        });
      } else {
        // Keep the cached user data if the error is not auth-related (e.g., network issue)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }
    }
  };

  checkAuth();
}, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await AuthAPI.login(email, password);
      
      // Save user data to local storage for quicker loads
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Invalid credentials'
      }));
      throw err;
    }
  };
  
  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await AuthAPI.register(username, email, password);
      
      // Save user data to local storage for quicker loads
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Failed to create account'
      }));
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await AuthAPI.logout();
      
      // Remove user data from local storage
      localStorage.removeItem(USER_KEY);
      
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Logout error:', err);
      
      // Still clear local storage and state even if API call fails
      localStorage.removeItem(USER_KEY);
      
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    }
  };
  
  // Clear any authentication errors
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };
  
  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};