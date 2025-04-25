import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Target, DashboardSummary, Notification } from '../types';
import { TransactionAPI, TargetAPI } from '../services/api';
import { mockTransactions, mockTargets, mockSummary, mockNotifications } from '../services/mockData';

interface FinanceContextType {
  transactions: Transaction[];
  targets: Target[];
  notifications: Notification[];
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addTarget: (target: Omit<Target, 'id'>) => Promise<void>;
  updateTarget: (id: string, target: Partial<Target>) => Promise<void>;
  deleteTarget: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
  useMockData?: boolean;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ 
  children, 
  useMockData = true // Use mock data by default for development 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    availableBalance: 0,
    netWorth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (useMockData) {
          // Use mock data for development
          setTransactions(mockTransactions);
          setTargets(mockTargets);
          setNotifications(mockNotifications);
          setSummary(mockSummary);
        } else {
          // Fetch real data from API
          const transactionsData = await TransactionAPI.getAll();
          setTransactions(transactionsData);
          
          const targetsData = await TargetAPI.getAll();
          setTargets(targetsData);
          
          // Calculate summary data
          calculateSummary(transactionsData);
          
          // Check targets and create notifications
          checkTargets(transactionsData, targetsData);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [useMockData]);

  // Calculate summary data
  const calculateSummary = (transactionsData: Transaction[]) => {
    const totalIncome = transactionsData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactionsData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const availableBalance = totalIncome - totalExpenses;
    
    // This is just a placeholder. In a real app, net worth might include assets
    // and other factors that would be calculated differently
    const netWorth = availableBalance + 263556; // Mock additional assets value
    
    setSummary({
      totalIncome,
      totalExpenses,
      availableBalance,
      netWorth
    });
  };

  // Check if targets are exceeded and create notifications
  const checkTargets = (transactions: Transaction[], targets: Target[]) => {
    const newNotifications: Notification[] = [];
    
    // Check interest target
    const interestTarget = targets.find(t => t.name === 'Interest Earnings');
    
    if (interestTarget) {
      const interestEarnings = transactions
        .filter(t => t.type === 'income' && t.category === 'Interest')
        .reduce((sum, t) => sum + t.amount, 0);
        
      if (interestEarnings > interestTarget.amount) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Interest earnings (£${interestEarnings}) have exceeded your target of £${interestTarget.amount}`,
          type: 'warning',
          read: false
        });
      } else if (interestEarnings > interestTarget.amount * 0.9) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Interest earnings (£${interestEarnings}) are approaching your target of £${interestTarget.amount}`,
          type: 'info',
          read: false
        });
      }
    }
    
    setNotifications(newNotifications);
  };

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      let newTransaction: Transaction;
      
      if (useMockData) {
        newTransaction = {
          id: crypto.randomUUID(),
          ...transaction
        };
        setTransactions(prev => [...prev, newTransaction]);
      } else {
        newTransaction = await TransactionAPI.create(transaction);
        setTransactions(prev => [...prev, newTransaction]);
      }
      
      // Update summary
      const newSummary = { ...summary };
      
      if (transaction.type === 'income') {
        newSummary.totalIncome += transaction.amount;
      } else {
        newSummary.totalExpenses += transaction.amount;
      }
      
      newSummary.availableBalance = newSummary.totalIncome - newSummary.totalExpenses;
      newSummary.netWorth = newSummary.availableBalance + 263556; // Mock additional assets
      
      setSummary(newSummary);
      
      // Check targets
      checkTargets([...transactions, newTransaction], targets);
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      if (useMockData) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      } else {
        await TransactionAPI.delete(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
      
      // Update summary
      const deletedTransaction = transactions.find(t => t.id === id);
      if (deletedTransaction) {
        const newSummary = { ...summary };
        
        if (deletedTransaction.type === 'income') {
          newSummary.totalIncome -= deletedTransaction.amount;
        } else {
          newSummary.totalExpenses -= deletedTransaction.amount;
        }
        
        newSummary.availableBalance = newSummary.totalIncome - newSummary.totalExpenses;
        newSummary.netWorth = newSummary.availableBalance + 263556; // Mock additional assets
        
        setSummary(newSummary);
        
        // Re-check targets
        checkTargets(transactions.filter(t => t.id !== id), targets);
      }
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  // Add a new target
  const addTarget = async (target: Omit<Target, 'id'>) => {
    try {
      let newTarget: Target;
      
      if (useMockData) {
        newTarget = {
          id: crypto.randomUUID(),
          ...target
        };
        setTargets(prev => [...prev, newTarget]);
      } else {
        newTarget = await TargetAPI.create(target);
        setTargets(prev => [...prev, newTarget]);
      }
      
      // Check targets after adding a new one
      checkTargets(transactions, [...targets, newTarget]);
    } catch (err) {
      setError('Failed to add target');
      console.error('Error adding target:', err);
    }
  };

  // Update a target
  const updateTarget = async (id: string, target: Partial<Target>) => {
    try {
      if (useMockData) {
        setTargets(prev => prev.map(t => t.id === id ? { ...t, ...target } : t));
      } else {
        const updatedTarget = await TargetAPI.update(id, target);
        setTargets(prev => prev.map(t => t.id === id ? updatedTarget : t));
      }
      
      // Re-check targets
      checkTargets(transactions, targets.map(t => t.id === id ? { ...t, ...target } : t));
    } catch (err) {
      setError('Failed to update target');
      console.error('Error updating target:', err);
    }
  };

  // Delete a target
  const deleteTarget = async (id: string) => {
    try {
      if (useMockData) {
        setTargets(prev => prev.filter(t => t.id !== id));
      } else {
        await TargetAPI.delete(id);
        setTargets(prev => prev.filter(t => t.id !== id));
      }
      
      // Re-check targets
      checkTargets(transactions, targets.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete target');
      console.error('Error deleting target:', err);
    }
  };

  // Mark a notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const value = {
    transactions,
    targets,
    notifications,
    summary,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    addTarget,
    updateTarget,
    deleteTarget,
    markNotificationAsRead
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};