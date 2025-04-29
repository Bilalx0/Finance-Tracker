export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description?: string;
  userId?: string;
  month: number;
  year: number;
}

export interface Target {
  id: string;
  name: string;
  amount: number;
  current?: number;
  userId?: string;
  month?: number;
  year?: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  netWorth: number;
}

export interface MonthData {
  transactions: Transaction[];
  targets: Target[];
  summary: DashboardSummary;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

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

export const IncomeCategories: Record<string, string> = {
  Salary: '#10b981',
  Interest: '#3b82f6',
  Investments: '#8b5cf6',
  Business: '#f59e0b',
  Freelance: '#ec4899',
  Other: '#6b7280',
};

export const ExpenseCategories: Record<string, string> = {
  Housing: '#7c3aed',
  Food: '#ef4444',
  Transportation: '#f97316',
  Utilities: '#0ea5e9',
  Entertainment: '#84cc16',
  Healthcare: '#14b8a6',
  Personal: '#ec4899',
  Education: '#8b5cf6',
  Debt: '#64748b',
  Other: '#6b7280',
};

export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  read: boolean;
}