// Transaction types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description?: string;
  userId?: string; // To track which user the transaction belongs to
  month: number; // Add the month property (0-11 index)
  year: number;  // Add the year property (full year, e.g., 2025)
}

// Financial target types
export interface Target {
  id: string;
  name: string;
  type?: TransactionType; // Added type property matching TransactionType
  category: string; // Added category property
  amount: number;
  current?: number;
  userId?: string; // To track which user the target belongs to
  month?: number; // Added month for consistency with transactions
  year?: number;  // Added year for consistency with transactions
}

// Dashboard summary data
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  netWorth: number;
}

// Monthly data structure
export interface MonthData {
  transactions: Transaction[];
  targets: Target[];
  summary: DashboardSummary;
}

// User authentication types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

// Category types with their corresponding colors
export const IncomeCategories: Record<string, string> = {
  'Salary': '#10b981',
  'Interest': '#3b82f6',
  'Investments': '#8b5cf6',
  'Business': '#f59e0b',
  'Freelance': '#ec4899',
  'Other': '#6b7280'
};

export const ExpenseCategories: Record<string, string> = {
  'Housing': '#7c3aed',
  'Food': '#ef4444',
  'Transportation': '#f97316',
  'Utilities': '#0ea5e9',
  'Entertainment': '#84cc16',
  'Healthcare': '#14b8a6',
  'Personal': '#ec4899',
  'Education': '#8b5cf6',
  'Debt': '#64748b',
  'Other': '#6b7280'
};

// Notification types
export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  read: boolean;
}