// API configuration for connecting to the backend
// This file will be used to configure the connection to the backend

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base API configuration
const API_URL = import.meta.env.VITE_APP_URL || 'https://finance-tracker-backend-production-1cb3.up.railway.app/api';


// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const config: AxiosRequestConfig = {
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const instance = axios.create(config);

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('financeTrackerToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Skip redirect if the request has a special header (e.g., during checkAuth)
        if (error.config.headers['X-Skip-Redirect'] !== 'true') {
          localStorage.removeItem('financeTrackerToken');
          localStorage.removeItem('financeTrackerUser');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export API client
export const apiClient = createApiClient();

// Helper functions for API requests
export const apiHelpers = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
  }
};