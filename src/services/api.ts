// import axios from 'axios';
import { Transaction, Target, AuthUser, DashboardSummary } from '../types';
import { apiClient, apiHelpers } from './apiConfig';

// Authentication API
export const AuthAPI = {
  // Register a new user
  register: async (username: string, email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await apiClient.post('/signup', { username, email, password });
      console.log('Signup response:', response.data); // Debug log
      if (response.data.token) {
        localStorage.setItem('financeTrackerToken', response.data.token);
      }
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await apiClient.post('/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      if (response.data.token) {
        localStorage.setItem('financeTrackerToken', response.data.token);
      }
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
      localStorage.removeItem('financeTrackerToken');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('financeTrackerToken');
      throw error;
    }
  },
  
  // Get the current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const token = localStorage.getItem('financeTrackerToken');
      if (!token) return null;

      const response = await apiClient.get('/protected', {
        headers: { 'X-Skip-Redirect': 'true' },
      });
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('financeTrackerToken');
      return null;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<AuthUser> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update user in local storage with new avatar
      const currentUser = JSON.parse(localStorage.getItem('financeTrackerUser') || '{}');
      if (currentUser) {
        currentUser.avatar = response.data.avatar;
        localStorage.setItem('financeTrackerUser', JSON.stringify(currentUser));
      }
      
      return response.data.user;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },
  
  // Get avatar URL for a user
  getAvatarUrl: (userId: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://finance-tracker-backend-production-1cb3.up.railway.app/api';
    // const baseUrl = 'http://localhost:5000/api';
    return `${baseUrl}/avatar/${userId}`;
  }
};

// Transaction API
export const TransactionAPI = {
  // Get all transactions for the current user for a specific month
  getAll: async (month?: number, year?: number): Promise<Transaction[]> => {
    try {
      const params = {
        month: month !== undefined ? month : undefined,
        year: year !== undefined ? year : undefined
      };
      return apiHelpers.get<Transaction[]>('/transactions', params);
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },
  
  // Create a new transaction
  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      return apiHelpers.post<Transaction>('/transactions', transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  },
  
  // Update a transaction
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      return apiHelpers.put<Transaction>(`/transactions/${id}`, transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },
  
  // Delete a transaction
  delete: async (id: string): Promise<void> => {
    try {
      return apiHelpers.delete(`/transactions/${id}`);
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  }
};

// Target API
export const TargetAPI = {
  getAll: async (): Promise<Target[]> => {
    try {
      return apiHelpers.get<Target[]>('/targets');
    } catch (error) {
      console.error('Get targets error:', error);
      throw error;
    }
  },
  
  create: async (target: Omit<Target, 'id'>): Promise<Target> => {
    try {
      return apiHelpers.post<Target>('/targets', {
        name: target.name,   
        amount: target.amount 
      });
    } catch (error) {
      console.error('Create target error:', error);
      throw error;
    }
  },

  
  // Update a target
  update: async (id: string, target: Partial<Target>): Promise<Target> => {
    try {
      return apiHelpers.put<Target>(`/targets/${id}`, target);
    } catch (error) {
      console.error('Update target error:', error);
      throw error;
    }
  },
  
  // Delete a target
  delete: async (id: string): Promise<void> => {
    try {
      return apiHelpers.delete(`/targets/${id}`);
    } catch (error) {
      console.error('Delete target error:', error);
      throw error;
    }
  }
};

// Monthly data API
export const MonthlyDataAPI = {
  // Get summary data for a specific month
  getMonthlySummary: async (month: number, year: number): Promise<DashboardSummary> => {
    try {
      return apiHelpers.get<DashboardSummary>(`/monthly-data/${year}/${month + 1}/summary`);
    } catch (error) {
      console.error('Get monthly summary error:', error);
      throw error;
    }
  },
  
  // Get available months for the current user
  getAvailableMonths: async (): Promise<{month: number, year: number}[]> => {
    try {
      return apiHelpers.get<{month: number, year: number}[]>('/monthly-data/available');
    } catch (error) {
      console.error('Get available months error:', error);
      throw error;
    }
  }
};