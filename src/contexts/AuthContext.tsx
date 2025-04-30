import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';
import { AuthAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, avatar: File) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isLoading: boolean;
  uploadAvatar: (file: File) => Promise<void>;
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

const USER_KEY = 'financeTrackerUser';
const TOKEN_KEY = 'financeTrackerToken';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cachedUserData = localStorage.getItem(USER_KEY);
        const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : null;
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('Checking auth - Cached user:', cachedUser, 'Token:', token ? token.slice(0, 10) + '...' : 'missing');
    
        if (cachedUser && token) {
          console.log('Token and user found, verifying with server');
          setState({
            user: cachedUser,
            isAuthenticated: true,
            loading: true,
            error: null,
          });
    
          const user = await AuthAPI.getCurrentUser();
          console.log('getCurrentUser result:', user);
    
          if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            setState({
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } else {
            console.log('No valid user from server, preserving token for debugging');
            setState({
              user: cachedUser,
              isAuthenticated: true, // Keep authenticated if token exists
              loading: false,
              error: 'Unable to verify session, please try logging in again',
            });
          }
        } else {
          console.log('No token or user, unauthenticated');
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        console.error('Auth check error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          console.log('401 - Preserving session for debugging');
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: 'Session expired, please log in again',
          });
        } else {
          console.log('Non-401 error, preserving session');
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

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await AuthAPI.login(email, password);
      console.log('Login successful, user:', user);
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Invalid credentials',
      }));
      throw err;
    }
  };

  const signup = async (username: string, email: string, password: string, avatar: File) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await AuthAPI.register(username, email, password, avatar);
      console.log('Signup successful, user:', user);
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Failed to create account',
      }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      await AuthAPI.logout();
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const updatedUser = await AuthAPI.uploadAvatar(file);
      setState((prev) => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }));
    } catch (err: any) {
      console.error('Avatar upload error:', err.response?.data || err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || 'Failed to upload avatar',
      }));
      throw err;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    uploadAvatar,
    clearError,
    isLoading: state.loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};