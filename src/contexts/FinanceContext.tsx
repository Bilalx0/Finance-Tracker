import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Target, DashboardSummary, Notification, MonthData } from '../types';
import { TransactionAPI, TargetAPI, MonthlyDataAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Constants for localStorage keys
const SUMMARY_STORAGE_KEY = 'financeTrackerSummary';
const MONTHLY_DATA_STORAGE_KEY = 'financeTrackerMonthlyData';

interface FinanceContextType {
  transactions: Transaction[];
  targets: Target[];
  notifications: Notification[];
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  currentMonth: string;
  currentYear: number;
  monthlyData: Record<string, MonthData>;
  setMonth: (month: number, year: number) => void;
  isMonthLocked: (month: number, year: number) => boolean;
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

// Helper function to get stored summary from localStorage
const getStoredSummary = (): DashboardSummary | null => {
  try {
    const storedSummary = localStorage.getItem(SUMMARY_STORAGE_KEY);
    if (storedSummary) {
      const parsedSummary = JSON.parse(storedSummary);
      return {
        totalIncome: Number(parsedSummary.totalIncome),
        totalExpenses: Number(parsedSummary.totalExpenses),
        availableBalance: Number(parsedSummary.availableBalance),
        netWorth: Number(parsedSummary.netWorth)
      };
    }
  } catch (error) {
    console.error('Failed to parse stored summary:', error);
  }
  return null;
};

// Helper function to get stored monthly data from localStorage
const getStoredMonthlyData = (): Record<string, MonthData> | null => {
  try {
    const storedMonthlyData = localStorage.getItem(MONTHLY_DATA_STORAGE_KEY);
    if (storedMonthlyData) {
      return JSON.parse(storedMonthlyData);
    }
  } catch (error) {
    console.error('Failed to parse stored monthly data:', error);
  }
  return null;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Get current date for initial month/year
  const now = new Date();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Initialize summary with stored value if available
  const [summary, setSummary] = useState<DashboardSummary>(() => {
    return getStoredSummary() || {
      totalIncome: 0,
      totalExpenses: 0,
      availableBalance: 0,
      netWorth: 0
    };
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month tracking
  const [currentMonth, setCurrentMonth] = useState(now.toLocaleString('default', { month: 'long' }));
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  
  // Initialize monthly data with stored value if available
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(() => {
    return getStoredMonthlyData() || {};
  });
  
  // Store summary in localStorage whenever it changes
  useEffect(() => {
    if (summary && summary.availableBalance !== 0) {
      try {
        localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
        console.log('Stored summary in localStorage:', summary);
      } catch (error) {
        console.error('Failed to store summary in localStorage:', error);
      }
    }
  }, [summary]);
  
  // Store monthly data in localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(monthlyData).length > 0) {
      try {
        localStorage.setItem(MONTHLY_DATA_STORAGE_KEY, JSON.stringify(monthlyData));
        console.log('Stored monthly data in localStorage');
      } catch (error) {
        console.error('Failed to store monthly data in localStorage:', error);
      }
    }
  }, [monthlyData]);

  // Set the current month and year
  const setMonth = (month: number, year: number) => {
    const date = new Date(year, month);
    setCurrentMonth(date.toLocaleString('default', { month: 'long' }));
    setCurrentYear(year);
    
    // Load data for the selected month
    loadMonthData(month, year);
  };

  // Check if a month is locked (past months are accessible, future months are locked)
  const isMonthLocked = (month: number, year: number) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Allow current month or past months
    return (year > currentYear || (year === currentYear && month > currentMonth));
  };

  // Load data for specific month
  const loadMonthData = async (month: number, year: number) => {
    try {
      setLoading(true);
      
      const monthKey = `${year}-${month + 1}`;
      
      // Check if we already have data for this month
      if (monthlyData[monthKey]) {
        setTransactions(monthlyData[monthKey].transactions || []);
        setTargets(monthlyData[monthKey].targets || []);
        setSummary(monthlyData[monthKey].summary);
        setLoading(false);
        return;
      }
      
      // Get month's transactions and targets
      const [transactionsResponse, targetsResponse] = await Promise.all([
        TransactionAPI.getAll(month, year),
        TargetAPI.getAll()
      ]);
      
      setTransactions(transactionsResponse);
      setTargets(targetsResponse);
      
      // Get or calculate summary
      let monthlySummary;
      try {
        monthlySummary = await MonthlyDataAPI.getMonthlySummary(month, year);
      } catch (err) {
        // If API fails, calculate locally
        monthlySummary = calculateSummaryData(transactionsResponse);
      }
      
      setSummary(monthlySummary);
      
      // Store monthly data
      setMonthlyData(prev => ({
        ...prev,
        [monthKey]: {
          transactions: transactionsResponse,
          targets: targetsResponse,
          summary: monthlySummary
        }
      }));

      // Check for notifications based on targets
      checkTargets(transactionsResponse, targetsResponse);
      
    } catch (err) {
      console.error('Error loading month data:', err);
      setError('Failed to load data for selected month');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate summary data from transactions
  const calculateSummaryData = (transactionsData: Transaction[]): DashboardSummary => {
    // Fix: Convert string values to numbers and handle NaN
    const totalIncome = transactionsData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (isNaN(Number(t.amount)) ? 0 : Number(t.amount)), 0);
      
    const totalExpenses = transactionsData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (isNaN(Number(t.amount)) ? 0 : Number(t.amount)), 0);
      
    const availableBalance = totalIncome - totalExpenses;
    
    // This would be replaced by a real net worth calculation from the API
    // For now, we'll use the available balance as a base
    const netWorth = availableBalance;
    
    return {
      totalIncome,
      totalExpenses,
      availableBalance,
      netWorth
    };
  };

  // Fetch data when user changes or month/year changes
  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, don't load any data
      setTransactions([]);
      setTargets([]);
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        availableBalance: 0,
        netWorth: 0
      });
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get month number from name
        const monthNumber = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
        
        // Load data for the current month
        await loadMonthData(monthNumber, currentYear);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user, currentMonth, currentYear]);

  // Check if targets are exceeded and create notifications
  const checkTargets = (transactions: Transaction[], targets: Target[]) => {
    const newNotifications: Notification[] = [];
    
    // Check each target against the transactions
    targets.forEach(target => {
      // Get target creation date
      const targetCreationDate = target.createdAt ? new Date(target.createdAt) : new Date();
      
      // Only consider transactions that happened after the target was created
      const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= targetCreationDate;
      });
      
      // Calculate progress based on target category
      let currentAmount = 0;
      
      if (target.category === 'income') {
        // For income targets, only count income transactions
        currentAmount = relevantTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        // For expense targets, only count expense transactions
        currentAmount = relevantTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
      }
      
      // Calculate progress percentage
      const progress = (currentAmount / target.amount) * 100;
      
      // Check thresholds and create notifications
      if (target.category === 'income' && currentAmount >= target.amount) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Congratulations! You've reached your income target of ${formatCurrency(target.amount)}`,
          type: 'success',
          read: false
        });
      } else if (target.category === 'expense' && currentAmount >= target.amount) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Warning! You've exceeded your expense limit of ${formatCurrency(target.amount)}`,
          type: 'warning',
          read: false
        });
      } else if (progress >= 80 && progress < 100) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `${target.category === 'income' ? 'You\'re getting close' : 'Warning!'} You're at ${progress.toFixed(1)}% of your ${target.category} target (${formatCurrency(target.amount)})`,
          type: target.category === 'income' ? 'success' : 'info',
          read: false
        });
      }
    });
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setLoading(true);
      
      // Use transaction's month and year to update the correct monthly data
      const transactionMonth = transaction.month;
      const transactionYear = transaction.year || currentYear;
      const monthKey = `${transactionYear}-${transactionMonth + 1}`;
      
      // Current month key (for the displayed UI)
      const currentMonthIndex = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
      const currentMonthKey = `${currentYear}-${currentMonthIndex + 1}`;
      
      console.log('Adding transaction:', transaction);
      console.log('For month/year:', transactionMonth, transactionYear);
      console.log('Current month/index/year:', currentMonth, currentMonthIndex, currentYear);
      console.log('monthKey vs currentMonthKey:', monthKey, currentMonthKey);
      
      // Call API to add transaction
      const newTransaction = await TransactionAPI.create(transaction);
      console.log('New transaction created:', newTransaction);
      
      // Update local state if the transaction belongs to the current displayed month
      if (monthKey === currentMonthKey) {
        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        
        // Update summary for current month - do this IMMEDIATELY
        const updatedSummary = calculateSummaryData(updatedTransactions);
        console.log('Updating summary to:', updatedSummary);
        setSummary(updatedSummary);
        
        // Re-check targets for current month with the updated transaction data
        checkTargets(updatedTransactions, targets);
        
        // Force an immediate evaluation of all targets to update progress bars
        // This ensures the target progress is recalculated right after adding a transaction
        const updatedTargets = [...targets];
        setTargets(updatedTargets);
      }
      
      // Always update monthly data for the transaction's month
      setMonthlyData(prev => {
        // Get the existing monthly data or create empty structure
        const existingMonthData = prev[monthKey] || {
          transactions: [],
          targets: [],
          summary: {
            totalIncome: 0,
            totalExpenses: 0,
            availableBalance: 0, 
            netWorth: 0
          }
        };
        
        // Add the new transaction to this month's data
        const updatedTransactions = [...(existingMonthData.transactions || []), newTransaction];
        
        // Calculate updated summary for this month
        const updatedSummary = calculateSummaryData(updatedTransactions);
        
        return {
          ...prev,
          [monthKey]: {
            ...existingMonthData,
            transactions: updatedTransactions,
            summary: updatedSummary
          }
        };
      });
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      
      // Find the transaction to be deleted
      const deletedTransaction = transactions.find(t => t.id === id);
      
      if (!deletedTransaction) {
        console.error('Transaction not found for deletion:', id);
        return;
      }
      
      // API call to delete transaction
      await TransactionAPI.delete(id);
      
      console.log('Deleting transaction:', deletedTransaction);
      
      // Determine which month's data needs to be updated
      const transactionMonth = deletedTransaction.month;
      const transactionYear = deletedTransaction.year || currentYear;
      const monthKey = `${transactionYear}-${transactionMonth + 1}`;
      
      // Current month key (for the displayed UI)
      const currentMonthIndex = new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth();
      const currentMonthKey = `${currentYear}-${currentMonthIndex + 1}`;
      
      console.log('Transaction month/year:', transactionMonth, transactionYear);
      console.log('Current month/index/year:', currentMonth, currentMonthIndex, currentYear);
      console.log('monthKey vs currentMonthKey:', monthKey, currentMonthKey);
      
      // Update local state if the transaction belongs to the current displayed month
      if (monthKey === currentMonthKey) {
        const updatedTransactions = transactions.filter(t => t.id !== id);
        setTransactions(updatedTransactions);
        
        // Update summary for current month - do this IMMEDIATELY 
        const updatedSummary = calculateSummaryData(updatedTransactions);
        console.log('Updating summary to:', updatedSummary);
        setSummary(updatedSummary);
        
        // Re-check targets for current month
        checkTargets(updatedTransactions, targets);
      }
      
      // Always update monthly data for the transaction's month
      setMonthlyData(prev => {
        // Get the existing monthly data
        const existingMonthData = prev[monthKey];
        
        if (!existingMonthData) {
          console.error('Monthly data not found for the transaction:', monthKey);
          return prev;
        }
        
        // Remove the transaction from this month's data
        const updatedTransactions = existingMonthData.transactions.filter(t => t.id !== id);
        
        // Calculate updated summary for this month
        const updatedSummary = calculateSummaryData(updatedTransactions);
        
        return {
          ...prev,
          [monthKey]: {
            ...existingMonthData,
            transactions: updatedTransactions,
            summary: updatedSummary
          }
        };
      });
      
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new target
  const addTarget = async (target: Omit<Target, 'id'>) => {
    try {
      setLoading(true);
      const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
      
      // API call to add target
      const newTarget = await TargetAPI.create(target);
      
      // Update local state
      const updatedTargets = [...targets, newTarget];
      setTargets(updatedTargets);
      
      // Update monthly data
      setMonthlyData(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          targets: updatedTargets
        }
      }));
      
      // Check targets after adding a new one
      checkTargets(transactions, updatedTargets);
    } catch (err) {
      setError('Failed to add target');
      console.error('Error adding target:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a target
  const updateTarget = async (id: string, target: Partial<Target>) => {
    try {
      setLoading(true);
      const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
      
      // API call to update target
      const updatedTarget = await TargetAPI.update(id, target);
      
      // Update local state
      const updatedTargets = targets.map(t => t.id === id ? updatedTarget : t);
      setTargets(updatedTargets);
      
      // Update monthly data
      setMonthlyData(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          targets: updatedTargets
        }
      }));
      
      // Re-check targets
      checkTargets(transactions, updatedTargets);
    } catch (err) {
      setError('Failed to update target');
      console.error('Error updating target:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a target
  const deleteTarget = async (id: string) => {
    try {
      setLoading(true);
      const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
      
      // API call to delete target
      await TargetAPI.delete(id);
      
      // Update local state
      const updatedTargets = targets.filter(t => t.id !== id);
      setTargets(updatedTargets);
      
      // Update monthly data
      setMonthlyData(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          targets: updatedTargets
        }
      }));
      
      // Re-check targets
      checkTargets(transactions, updatedTargets);
    } catch (err) {
      setError('Failed to delete target');
      console.error('Error deleting target:', err);
    } finally {
      setLoading(false);
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
    currentMonth,
    currentYear,
    monthlyData,
    setMonth,
    isMonthLocked,
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