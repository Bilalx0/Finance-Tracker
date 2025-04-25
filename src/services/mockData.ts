import { Transaction, Target, Notification } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: uuidv4(),
    type: 'income',
    amount: 13000,
    category: 'Salary',
    date: '2025-03-01',
    description: 'Monthly salary'
  },
  {
    id: uuidv4(),
    type: 'income',
    amount: 2100,
    category: 'Business',
    date: '2025-03-15',
    description: 'E-commerce revenue'
  },
  {
    id: uuidv4(),
    type: 'income',
    amount: 950,
    category: 'Interest',
    date: '2025-03-20',
    description: 'Savings account interest'
  },
  {
    id: uuidv4(),
    type: 'income',
    amount: 8000,
    category: 'Business',
    date: '2025-04-05',
    description: 'Online store profits'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 3452,
    category: 'Housing',
    date: '2025-04-01',
    description: 'Rent payment'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 2190,
    category: 'Transportation',
    date: '2025-04-05',
    description: 'Car payment and fuel'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 950,
    category: 'Food',
    date: '2025-04-10',
    description: 'Groceries'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 140,
    category: 'Personal',
    date: '2025-04-15',
    description: 'Pet supplies'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 231,
    category: 'Entertainment',
    date: '2025-04-20',
    description: 'Movie tickets and dinner'
  },
  {
    id: uuidv4(),
    type: 'expense',
    amount: 65,
    category: 'Healthcare',
    date: '2025-04-22',
    description: 'Pharmacy'
  }
];

// Mock target data
export const mockTargets: Target[] = [
  {
    id: uuidv4(),
    name: 'Interest Earnings',
    amount: 1000,
    current: 950
  },
  {
    id: uuidv4(),
    name: 'Monthly Income',
    amount: 25000,
    current: 24050
  }
];

// Mock asset data for the pie chart
export const mockAssets = [
  { name: 'Gold', value: 15700, color: '#f59e0b' },
  { name: 'Stocks', value: 22500, color: '#ef4444' },
  { name: 'Land', value: 120000, color: '#10b981' },
  { name: 'Warehouse', value: 135000, color: '#8b5cf6' }
];

// Mock notification data
export const mockNotifications: Notification[] = [
  {
    id: uuidv4(),
    message: '3 Bills are past due. Pay soon to avoid late fees.',
    type: 'warning',
    read: false
  },
  {
    id: uuidv4(),
    message: 'You have reached 95% of your interest target for the year.',
    type: 'info',
    read: false
  }
];

// Calculate mock summary data
export const mockSummary = {
  totalIncome: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
  totalExpenses: mockTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  availableBalance: 14822,
  netWorth: 278378
};