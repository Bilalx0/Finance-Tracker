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
    return response.data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('financeTrackerToken');
    return null;
  }
},
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
  // Get all targets for the current user for a specific month
  getAll: async (month?: number, year?: number): Promise<Target[]> => {
    try {
      const params = {
        month: month !== undefined ? month : undefined,
        year: year !== undefined ? year : undefined
      };
      return apiHelpers.get<Target[]>('/targets', params);
    } catch (error) {
      console.error('Get targets error:', error);
      throw error;
    }
  },
  
  // Create a new target
  create: async (target: Omit<Target, 'id'>): Promise<Target> => {
    try {
      return apiHelpers.post<Target>('/targets', target);
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