export type TransactionType = 'income' | 'expense';

export type CategoryId = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'bills' 
  | 'salary' 
  | 'entertainment' 
  | 'health' 
  | 'education' 
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  nameBn: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
}

export type DebtType = 'lent' | 'borrowed'; // lent = I gave money (to receive), borrowed = I took money (to return)
export type DebtStatus = 'pending' | 'partially_paid' | 'settled';

export interface DebtRecord {
  id: string;
  type: DebtType;
  personName: string;
  phone?: string;
  amount: number;
  paidAmount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  note?: string;
  status: DebtStatus;
  createdAt: number;
}

export interface BackupData {
  version: number;
  exportDate: string;
  app: string;
  currency: string;
  transactions: Transaction[];
  debts: DebtRecord[];
}

export const CATEGORIES: Record<CategoryId, Category> = {
  salary: {
    id: 'salary',
    name: 'Salary & Income',
    nameBn: 'বেতন ও আয়',
    icon: 'Briefcase',
    color: '#10b981', // emerald
    type: 'income'
  },
  food: {
    id: 'food',
    name: 'Food & Dining',
    nameBn: 'খাবার ও বাজার',
    icon: 'Utensils',
    color: '#f97316', // orange
    type: 'expense'
  },
  transport: {
    id: 'transport',
    name: 'Transport',
    nameBn: 'যাতায়াত ও ভাড়া',
    icon: 'Car',
    color: '#06b6d4', // cyan
    type: 'expense'
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    nameBn: 'কেনাকাটা',
    icon: 'ShoppingBag',
    color: '#ec4899', // pink
    type: 'expense'
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    nameBn: 'বিল ও খরচ',
    icon: 'Receipt',
    color: '#ef4444', // red
    type: 'expense'
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    nameBn: 'বিনোদন',
    icon: 'Film',
    color: '#8b5cf6', // purple
    type: 'expense'
  },
  health: {
    id: 'health',
    name: 'Health & Medical',
    nameBn: 'চিকিৎসা ও ওষুধ',
    icon: 'Activity',
    color: '#14b8a6', // teal
    type: 'expense'
  },
  education: {
    id: 'education',
    name: 'Education',
    nameBn: 'শিক্ষা ও বই',
    icon: 'BookOpen',
    color: '#3b82f6', // blue
    type: 'expense'
  },
  other: {
    id: 'other',
    name: 'Other',
    nameBn: 'অন্যান্য',
    icon: 'MoreHorizontal',
    color: '#64748b', // slate
    type: 'both'
  }
};
