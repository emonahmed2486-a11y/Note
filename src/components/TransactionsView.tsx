import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar, 
  ArrowUpDown, 
  Trash2, 
  Receipt,
  X
} from 'lucide-react';
import { Transaction, TransactionType, CategoryId, CATEGORIES } from '../types/finance';
import { formatTaka, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenAddTransaction: (type?: TransactionType) => void;
  onExportCSV: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onSelectTransaction,
  onOpenAddTransaction,
  onExportCSV,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const categoryName = (CATEGORIES[tx.category]?.name || '').toLowerCase();
          const noteText = (tx.note || '').toLowerCase();
          const amountText = tx.amount.toString();
          const dateText = tx.date.toLowerCase();

          return (
            categoryName.includes(query) ||
            noteText.includes(query) ||
            amountText.includes(query) ||
            dateText.includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, searchQuery, sortBy]);

  // Aggregate stats of filtered transactions
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Search Bar & Header */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, categories, amounts..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Type Segment */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Income
          </button>
        </div>

        {/* Category Dropdown Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          {Object.values(CATEGORIES).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-transparent outline-none focus:border-emerald-500 ml-auto"
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Highest Amount</option>
          <option value="amount_asc">Lowest Amount</option>
        </select>
      </div>

      {/* Filter summary strip */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 py-1">
        <span>
          Showing <strong>{filteredTransactions.length}</strong> transactions
        </span>
        <div className="flex items-center gap-3">
          {filteredIncome > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatTaka(filteredIncome)}
            </span>
          )}
          {filteredExpense > 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              -{formatTaka(filteredExpense)}
            </span>
          )}
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No matching transactions found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES.other;
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
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
                      <span>{cat.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatTaka(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {tx.type}
                    </span>
                  </div>

                  {/* Quick Delete action button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this transaction?')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
