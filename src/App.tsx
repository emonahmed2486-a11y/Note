import React, { useState, useEffect, useCallback } from 'react';
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getDebts, 
  addDebt, 
  updateDebt, 
  deleteDebt, 
  settleDebt, 
  recordDebtPayment, 
  exportToCSV 
} from './services/storage';
import { Transaction, DebtRecord, TransactionType, DebtType, CategoryId } from './types/finance';
import { TopHeader } from './components/TopHeader';
import { BottomNav, NavigationTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { DebtsView } from './components/DebtsView';
import { ReportsView } from './components/ReportsView';
import { FlutterBuilderGuideView } from './components/FlutterBuilderGuideView';
import { TransactionModal } from './components/TransactionModal';
import { DebtModal } from './components/DebtModal';
import { PartialPayModal } from './components/PartialPayModal';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Theme Management (Light / Dark mode - Requirement #10)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('takatrack_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('takatrack_dark_mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Load data from local offline storage
  const reloadData = useCallback(() => {
    setTransactions(getTransactions());
    setDebts(getDebts());
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('expense');

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtRecord | null>(null);
  const [debtInitialType, setDebtInitialType] = useState<DebtType>('lent');

  const [isPartialPayOpen, setIsPartialPayOpen] = useState(false);
  const [partialPayDebt, setPartialPayDebt] = useState<DebtRecord | null>(null);

  // Financial calculations for header
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const pendingDebtsCount = debts.filter((d) => d.status !== 'settled').length;

  // Transaction Handlers
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  const handleSelectTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = (data: {
    type: TransactionType;
    amount: number;
    category: CategoryId;
    date: string;
    note: string;
  }) => {
    if (editingTx) {
      updateTransaction({
        ...editingTx,
        ...data,
      });
    } else {
      addTransaction(data);
    }
    reloadData();
  };

  const handleDeleteTx = (id: string) => {
    deleteTransaction(id);
    reloadData();
  };

  // Debt Handlers
  const handleOpenAddDebt = (type: DebtType = 'lent') => {
    setEditingDebt(null);
    setDebtInitialType(type);
    setIsDebtModalOpen(true);
  };

  const handleEditDebt = (debt: DebtRecord) => {
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  };

  const handleSaveDebt = (data: {
    type: DebtType;
    personName: string;
    phone?: string;
    amount: number;
    date: string;
    dueDate?: string;
    note?: string;
  }) => {
    if (editingDebt) {
      updateDebt({
        ...editingDebt,
        ...data,
      });
    } else {
      addDebt(data);
    }
    reloadData();
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    reloadData();
  };

  const handleSettleDebt = (id: string) => {
    settleDebt(id);
    reloadData();
  };

  const handleOpenPartialPay = (debt: DebtRecord) => {
    setPartialPayDebt(debt);
    setIsPartialPayOpen(true);
  };

  const handlePartialPaymentSubmit = (id: string, amount: number) => {
    recordDebtPayment(id, amount);
    reloadData();
  };

  const handleExportCSV = () => {
    exportToCSV(transactions);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1. Top App Header */}
      <TopHeader
        totalBalance={totalBalance}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenFlutterGuide={() => setActiveTab('flutter')}
        onExportCSV={handleExportCSV}
        activeTab={activeTab}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            debts={debts}
            onOpenAddTransaction={handleOpenAddTx}
            onOpenAddDebt={handleOpenAddDebt}
            onOpenExportCSV={handleExportCSV}
            onSelectTransaction={handleSelectTx}
            onNavigateToDebts={() => setActiveTab('debts')}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onSelectTransaction={handleSelectTx}
            onOpenAddTransaction={handleOpenAddTx}
            onExportCSV={handleExportCSV}
            onDeleteTransaction={handleDeleteTx}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            debts={debts}
            onOpenAddDebt={handleOpenAddDebt}
            onEditDebt={handleEditDebt}
            onOpenPartialPay={handleOpenPartialPay}
            onSettleDebt={handleSettleDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView transactions={transactions} />
        )}

        {activeTab === 'flutter' && (
          <FlutterBuilderGuideView onDataChanged={reloadData} />
        )}
      </main>

      {/* 3. Bottom Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingDebtsCount={pendingDebtsCount}
      />

      {/* 4. Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTx}
        onDelete={handleDeleteTx}
        editingTransaction={editingTx}
        initialType={txInitialType}
      />

      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        onSave={handleSaveDebt}
        onDelete={handleDeleteDebt}
        editingDebt={editingDebt}
        initialType={debtInitialType}
      />

      <PartialPayModal
        isOpen={isPartialPayOpen}
        debt={partialPayDebt}
        onClose={() => setIsPartialPayOpen(false)}
        onSubmit={handlePartialPaymentSubmit}
        onSettleFull={handleSettleDebt}
      />
    </div>
  );
}
