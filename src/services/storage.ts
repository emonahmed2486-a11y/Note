import { Transaction, DebtRecord, BackupData, CATEGORIES } from '../types/finance';
import { getTodayDateString } from '../utils/formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'takatrack_transactions_v1',
  DEBTS: 'takatrack_debts_v1',
  THEME: 'takatrack_theme_mode',
};

// Seed sample data to give a beautiful out-of-the-box experience
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_seed_1',
    type: 'income',
    amount: 55000,
    category: 'salary',
    date: getTodayDateString(),
    note: 'Monthly Office Salary',
    createdAt: Date.now() - 3600000 * 24 * 3,
  },
  {
    id: 'tx_seed_2',
    type: 'expense',
    amount: 5400,
    category: 'food',
    date: getTodayDateString(),
    note: 'Weekly Bazar & Grocery',
    createdAt: Date.now() - 3600000 * 24 * 2,
  },
  {
    id: 'tx_seed_3',
    type: 'expense',
    amount: 1850,
    category: 'bills',
    date: getTodayDateString(),
    note: 'DESCO Electricity & WiFi Bill',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    amount: 850,
    category: 'transport',
    date: getTodayDateString(),
    note: 'Dhaka Metro Rail & Rickshaw',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'tx_seed_5',
    type: 'expense',
    amount: 2200,
    category: 'shopping',
    date: getTodayDateString(),
    note: 'New shirts & household items',
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'tx_seed_6',
    type: 'expense',
    amount: 600,
    category: 'health',
    date: getTodayDateString(),
    note: 'Prescription medicine from pharmacy',
    createdAt: Date.now() - 3600000 * 2,
  }
];

const INITIAL_DEBTS: DebtRecord[] = [
  {
    id: 'debt_seed_1',
    type: 'lent',
    personName: 'Tanvir Hossain',
    phone: '01711223344',
    amount: 3000,
    paidAmount: 1000,
    date: getTodayDateString(),
    dueDate: getTodayDateString(),
    note: 'Lent for exam registration fee',
    status: 'partially_paid',
    createdAt: Date.now() - 3600000 * 24 * 4,
  },
  {
    id: 'debt_seed_2',
    type: 'borrowed',
    personName: 'Rahim Bhai (Shopkeeper)',
    phone: '01819876543',
    amount: 1500,
    paidAmount: 0,
    date: getTodayDateString(),
    dueDate: getTodayDateString(),
    note: 'Borrowed for emergency cash',
    status: 'pending',
    createdAt: Date.now() - 3600000 * 24 * 2,
  }
];

export function getTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read transactions from storage:', error);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions to storage:', error);
  }
}

export function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions();
  const newTx: Transaction = {
    ...data,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
  };
  const updated = [newTx, ...transactions];
  saveTransactions(updated);
  return newTx;
}

export function updateTransaction(updatedTx: Transaction): void {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === updatedTx.id);
  if (index !== -1) {
    transactions[index] = updatedTx;
    saveTransactions([...transactions]);
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
}

// Debts Storage
export function getDebts(): DebtRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (!raw) {
      saveDebts(INITIAL_DEBTS);
      return INITIAL_DEBTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read debts from storage:', error);
    return [];
  }
}

export function saveDebts(debts: DebtRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  } catch (error) {
    console.error('Failed to save debts to storage:', error);
  }
}

export function addDebt(data: Omit<DebtRecord, 'id' | 'createdAt' | 'paidAmount' | 'status'>): DebtRecord {
  const debts = getDebts();
  const newDebt: DebtRecord = {
    ...data,
    id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    paidAmount: 0,
    status: 'pending',
    createdAt: Date.now(),
  };
  const updated = [newDebt, ...debts];
  saveDebts(updated);
  return newDebt;
}

export function updateDebt(updatedDebt: DebtRecord): void {
  const debts = getDebts();
  const index = debts.findIndex(d => d.id === updatedDebt.id);
  if (index !== -1) {
    debts[index] = updatedDebt;
    saveDebts([...debts]);
  }
}

export function recordDebtPayment(id: string, paymentAmount: number): DebtRecord | null {
  const debts = getDebts();
  const index = debts.findIndex(d => d.id === id);
  if (index === -1) return null;

  const current = debts[index];
  const newPaidAmount = Math.min(current.amount, (current.paidAmount || 0) + paymentAmount);
  const newStatus: DebtRecord['status'] = newPaidAmount >= current.amount ? 'settled' : 'partially_paid';

  const updated: DebtRecord = {
    ...current,
    paidAmount: newPaidAmount,
    status: newStatus,
  };

  debts[index] = updated;
  saveDebts([...debts]);
  return updated;
}

export function settleDebt(id: string): DebtRecord | null {
  const debts = getDebts();
  const index = debts.findIndex(d => d.id === id);
  if (index === -1) return null;

  const current = debts[index];
  const updated: DebtRecord = {
    ...current,
    paidAmount: current.amount,
    status: 'settled',
  };

  debts[index] = updated;
  saveDebts([...debts]);
  return updated;
}

export function deleteDebt(id: string): void {
  const debts = getDebts();
  const filtered = debts.filter(d => d.id !== id);
  saveDebts(filtered);
}

// Export Transactions to CSV
export function exportToCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (BDT)', 'Note'];
  const rows = transactions.map(t => {
    const categoryName = CATEGORIES[t.category]?.name || t.category;
    const sanitizedNote = (t.note || '').replace(/"/g, '""');
    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${categoryName}"`,
      t.amount,
      `"${sanitizedNote}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TakaTrack_Transactions_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Full Backup & Restore
export function createBackupJSON(): BackupData {
  return {
    version: 1,
    exportDate: new Date().toISOString(),
    app: 'TakaTrack',
    currency: 'BDT (৳)',
    transactions: getTransactions(),
    debts: getDebts(),
  };
}

export function downloadBackupFile(): void {
  const backup = createBackupJSON();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TakaTrack_Backup_${getTodayDateString()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function restoreFromJSON(jsonString: string): { 
  success: boolean; 
  message: string; 
  transactionCount?: number; 
  debtCount?: number 
} {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format' };
    }

    if (!Array.isArray(data.transactions)) {
      return { success: false, message: 'Missing valid transactions data in backup file' };
    }

    // Validate transactions
    const validTransactions: Transaction[] = [];
    for (const tx of data.transactions) {
      if (tx.id && tx.amount && tx.type && tx.date) {
        validTransactions.push({
          id: String(tx.id),
          type: tx.type === 'income' ? 'income' : 'expense',
          amount: Math.abs(Number(tx.amount) || 0),
          category: tx.category || 'other',
          date: String(tx.date),
          note: String(tx.note || ''),
          createdAt: Number(tx.createdAt) || Date.now(),
        });
      }
    }

    // Validate debts
    const validDebts: DebtRecord[] = [];
    if (Array.isArray(data.debts)) {
      for (const d of data.debts) {
        if (d.id && d.personName && d.amount) {
          validDebts.push({
            id: String(d.id),
            type: d.type === 'borrowed' ? 'borrowed' : 'lent',
            personName: String(d.personName),
            phone: d.phone ? String(d.phone) : undefined,
            amount: Math.abs(Number(d.amount) || 0),
            paidAmount: Math.abs(Number(d.paidAmount) || 0),
            date: String(d.date || getTodayDateString()),
            dueDate: d.dueDate ? String(d.dueDate) : undefined,
            note: d.note ? String(d.note) : '',
            status: d.status || 'pending',
            createdAt: Number(d.createdAt) || Date.now(),
          });
        }
      }
    }

    saveTransactions(validTransactions);
    saveDebts(validDebts);

    return {
      success: true,
      message: `Restored ${validTransactions.length} transactions and ${validDebts.length} debt records successfully!`,
      transactionCount: validTransactions.length,
      debtCount: validDebts.length
    };
  } catch (error) {
    return { success: false, message: 'Error parsing JSON: ' + (error instanceof Error ? error.message : 'Unknown error') };
  }
}

export function resetToDefaultData(): void {
  saveTransactions(INITIAL_TRANSACTIONS);
  saveDebts(INITIAL_DEBTS);
}

export function clearAllData(): void {
  saveTransactions([]);
  saveDebts([]);
}
