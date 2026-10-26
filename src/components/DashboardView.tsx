import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  Download, 
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Transaction, DebtRecord, CATEGORIES } from '../types/finance';
import { formatTaka, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  transactions: Transaction[];
  debts: DebtRecord[];
  onOpenAddTransaction: (type: 'income' | 'expense') => void;
  onOpenAddDebt: () => void;
  onOpenExportCSV: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToDebts: () => void;
  onNavigateToTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  debts,
  onOpenAddTransaction,
  onOpenAddDebt,
  onOpenExportCSV,
  onSelectTransaction,
  onNavigateToDebts,
  onNavigateToTransactions,
}) => {
  // Financial calculations
  const totalIncomeAll = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseAll = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncomeAll - totalExpenseAll;

  // Current Month calculations
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentYearMonth));
  
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpense;

  // Active Debts
  const pendingLent = debts
    .filter((d) => d.type === 'lent' && d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  const pendingBorrowed = debts
    .filter((d) => d.type === 'borrowed' && d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Main Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-700/30">
        <div className="relative z-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-emerald-200/90 uppercase">
                Total Available Balance
              </span>
              <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Bangladeshi Taka (৳)
              </span>
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
              {formatTaka(totalBalance)}
            </div>
          </div>

          {/* Monthly Income & Expense Strip */}
          <div className="mt-6 pt-5 border-t border-emerald-500/20 grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>Monthly Income</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {formatTaka(monthlyIncome)}
              </div>
              <div className="text-[10px] text-emerald-200/60 mt-0.5">
                {currentMonthName}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>Monthly Expense</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {formatTaka(monthlyExpense)}
              </div>
              <div className="text-[10px] text-rose-200/60 mt-0.5">
                {monthlyNet >= 0 ? `Savings +${formatTaka(monthlyNet)}` : `Deficit -${formatTaka(Math.abs(monthlyNet))}`}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onOpenAddTransaction('expense')}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center">
            <Minus className="w-4 h-4" />
          </div>
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => onOpenAddTransaction('income')}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Income</span>
        </button>

        <button
          onClick={onOpenAddDebt}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <span>Track Debt (ধার)</span>
        </button>

        <button
          onClick={onOpenExportCSV}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <span>Export CSV</span>
        </button>
      </div>

      {/* 3. Debts & Lending Snapshot (Requirement #7) */}
      {(pendingLent > 0 || pendingBorrowed > 0) && (
        <div 
          onClick={onNavigateToDebts}
          className="cursor-pointer rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Active Debt Ledger (ধার ও দেনা)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pendingLent > 0 && <span>You are owed: <strong className="text-emerald-600 dark:text-emerald-400">{formatTaka(pendingLent)}</strong></span>}
                {pendingLent > 0 && pendingBorrowed > 0 && <span> · </span>}
                {pendingBorrowed > 0 && <span>You owe: <strong className="text-rose-600 dark:text-rose-400">{formatTaka(pendingBorrowed)}</strong></span>}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
      )}

      {/* 4. Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase text-xs">
            Recent Transactions
          </h3>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
            <p className="text-sm">No transactions added yet.</p>
            <p className="text-xs text-slate-500 mt-1">Tap Add Expense or Add Income to record your first transaction.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = CATEGORIES[tx.category] || CATEGORIES.other;
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={tx.category} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.note || cat.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span>{cat.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatTaka(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isIncome ? 'Income' : 'Expense'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
