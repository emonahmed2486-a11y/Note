import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Calendar, 
  Trash2,
  CreditCard
} from 'lucide-react';
import { DebtRecord, DebtType } from '../types/finance';
import { formatTaka, formatDate } from '../utils/formatters';

interface DebtsViewProps {
  debts: DebtRecord[];
  onOpenAddDebt: (initialType?: DebtType) => void;
  onEditDebt: (debt: DebtRecord) => void;
  onOpenPartialPay: (debt: DebtRecord) => void;
  onSettleDebt: (id: string) => void;
  onDeleteDebt: (id: string) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  onOpenAddDebt,
  onEditDebt,
  onOpenPartialPay,
  onSettleDebt,
  onDeleteDebt,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('pending');

  // Overall calculations
  const totalLentRemaining = debts
    .filter((d) => d.type === 'lent' && d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  const totalBorrowedRemaining = debts
    .filter((d) => d.type === 'borrowed' && d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  const filteredDebts = debts.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (statusFilter === 'pending' && d.status === 'settled') return false;
    if (statusFilter === 'settled' && d.status !== 'settled') return false;
    return true;
  });

  return (
    <div className="space-y-5 pb-20">
      {/* Top Ledger Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Money Lent (I will receive) */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Money Lent (পাওনা)</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-950 dark:text-emerald-100">
            {formatTaka(totalLentRemaining)}
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            To receive from others
          </p>
        </div>

        {/* Money Borrowed (I must return) */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-300">
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
            <span>Money Borrowed (দেনা)</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-950 dark:text-rose-100">
            {formatTaka(totalBorrowedRemaining)}
          </div>
          <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-1">
            To repay to others
          </p>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type & Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('lent')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'lent'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Lent (পাওনা)
            </button>
            <button
              onClick={() => setFilterType('borrowed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'borrowed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Borrowed (দেনা)
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'settled'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Settled
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Add Record Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddDebt('lent')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lend Money</span>
          </button>
          <button
            onClick={() => onOpenAddDebt('borrowed')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Borrow Money</span>
          </button>
        </div>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <ArrowLeftRight className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No debt records found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tap &quot;Lend Money&quot; or &quot;Borrow Money&quot; to keep track of money transactions with friends and relatives.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((debt) => {
            const isLent = debt.type === 'lent';
            const remaining = Math.max(0, debt.amount - (debt.paidAmount || 0));
            const isSettled = debt.status === 'settled' || remaining <= 0;
            const progress = Math.min(100, Math.round(((debt.paidAmount || 0) / debt.amount) * 100));

            return (
              <div
                key={debt.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isLent
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {isLent ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {debt.personName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSettled
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              : isLent
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}
                        >
                          {isSettled ? 'Settled' : isLent ? 'Lent (পাওনা)' : 'Borrowed (দেনা)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {debt.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {debt.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Given: {formatDate(debt.date)}
                        </span>
                        {debt.dueDate && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="w-3 h-3" />
                            Due: {formatDate(debt.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-bold font-mono ${
                        isSettled
                          ? 'text-slate-400 line-through'
                          : isLent
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatTaka(remaining)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Total: {formatTaka(debt.amount)}
                    </span>
                  </div>
                </div>

                {/* Progress bar if partial */}
                {(debt.paidAmount || 0) > 0 && !isSettled && (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Repaid: {formatTaka(debt.paidAmount)}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Note */}
                {debt.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    {debt.note}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditDebt(debt)}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete debt record for ${debt.personName}?`)) {
                          onDeleteDebt(debt.id);
                        }
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {!isSettled && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPartialPay(debt)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Partial Pay</span>
                      </button>
                      <button
                        onClick={() => onSettleDebt(debt.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settle Full</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
