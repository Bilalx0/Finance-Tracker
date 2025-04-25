import axios from 'axios';
import { Transaction, Target } from '../types';

// This will be replaced with your actual API base URL
const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transaction API calls
export const TransactionAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  create: async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await api.post('/transactions', transaction);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

// Target API calls
export const TargetAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/targets');
      return response.data;
    } catch (error) {
      console.error('Error fetching targets:', error);
      throw error;
    }
  },

  create: async (target: Omit<Target, 'id'>) => {
    try {
      const response = await api.post('/targets', target);
      return response.data;
    } catch (error) {
      console.error('Error creating target:', error);
      throw error;
    }
  },

  update: async (id: string, target: Partial<Target>) => {
    try {
      const response = await api.patch(`/targets/${id}`, target);
      return response.data;
    } catch (error) {
      console.error('Error updating target:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/targets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting target:', error);
      throw error;
    }
  }
};