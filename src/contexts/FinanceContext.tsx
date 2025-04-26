import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Target, DashboardSummary, Notification, MonthData } from '../types';
import { TransactionAPI, TargetAPI, MonthlyDataAPI } from '../services/api';
import { useAuth } from './AuthContext';

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
  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    availableBalance: 0,
    netWorth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month tracking
  const [currentMonth, setCurrentMonth] = useState(now.toLocaleString('default', { month: 'long' }));
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>({});

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
        TargetAPI.getAll(month, year)
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
    const totalIncome = transactionsData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactionsData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
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
      const category = target.category;
      
      // Get all transactions for this category
      const categoryTransactions = transactions.filter(t => 
        t.type === (target.type || 'expense') && 
        t.category === category
      );
      
      // Calculate total amount for this category
      const categoryTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Check if target is exceeded
      if (target.type === 'income' && categoryTotal >= target.amount) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Income target for ${category} (${formatCurrency(target.amount)}) has been reached! Current: ${formatCurrency(categoryTotal)}`,
          type: 'success',
          read: false
        });
      } else if (target.type === 'expense' && categoryTotal >= target.amount) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Expense limit for ${category} (${formatCurrency(target.amount)}) has been exceeded! Current: ${formatCurrency(categoryTotal)}`,
          type: 'warning',
          read: false
        });
      } else if (target.type === 'expense' && categoryTotal >= target.amount * 0.9) {
        newNotifications.push({
          id: crypto.randomUUID(),
          message: `Expense for ${category} (${formatCurrency(categoryTotal)}) is approaching your limit of ${formatCurrency(target.amount)}`,
          type: 'info',
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
      const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
      
      // Call API to add transaction
      const newTransaction = await TransactionAPI.create(transaction);
      
      // Update local state
      setTransactions(prev => [...prev, newTransaction]);
      
      // Update summary
      const updatedSummary = calculateSummaryData([...transactions, newTransaction]);
      setSummary(updatedSummary);
      
      // Update monthly data
      setMonthlyData(prev => ({
        ...prev,
        [monthKey]: {
          ...prev[monthKey],
          transactions: [...(prev[monthKey]?.transactions || []), newTransaction],
          summary: updatedSummary
        }
      }));
      
      // Check targets
      checkTargets([...transactions, newTransaction], targets);
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
      const monthKey = `${currentYear}-${new Date(Date.parse(`${currentMonth} 1, ${currentYear}`)).getMonth() + 1}`;
      
      // API call to delete transaction
      await TransactionAPI.delete(id);
      
      // Update local state
      const deletedTransaction = transactions.find(t => t.id === id);
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      
      if (deletedTransaction) {
        // Update summary
        const updatedSummary = calculateSummaryData(updatedTransactions);
        setSummary(updatedSummary);
        
        // Update monthly data
        setMonthlyData(prev => ({
          ...prev,
          [monthKey]: {
            ...prev[monthKey],
            transactions: updatedTransactions,
            summary: updatedSummary
          }
        }));
        
        // Re-check targets
        checkTargets(updatedTransactions, targets);
      }
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