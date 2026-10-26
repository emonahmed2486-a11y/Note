import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DebtRecord } from '../types/finance';
import { formatTaka, isValidAmount } from '../utils/formatters';

interface PartialPayModalProps {
  debt: DebtRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, amount: number) => void;
  onSettleFull: (id: string) => void;
}

export const PartialPayModal: React.FC<PartialPayModalProps> = ({
  debt,
  isOpen,
  onClose,
  onSubmit,
  onSettleFull,
}) => {
  const [payAmount, setPayAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !debt) return null;

  const remaining = Math.max(0, debt.amount - (debt.paidAmount || 0));

  const handlePayPartial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(payAmount);
    if (!isValidAmount(val)) {
      setError('Please enter a valid payment amount');
      return;
    }
    if (val > remaining) {
      setError(`Amount cannot exceed the remaining balance (${formatTaka(remaining)})`);
      return;
    }

    onSubmit(debt.id, val);
    setPayAmount('');
    setError('');
    onClose();
  };

  const handleFull = () => {
    onSettleFull(debt.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {debt.type === 'lent' ? 'Received Repayment' : 'Make Payment'}
            </h3>
            <p className="text-xs text-slate-500">
              Person: <strong className="text-slate-800 dark:text-slate-200">{debt.personName}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-500">Remaining Due:</span>
            <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
              {formatTaka(remaining)}
            </span>
          </div>

          <form onSubmit={handlePayPartial} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Amount Received / Paid (৳)
              </label>
              <div className="relative rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5">
                <span className="text-lg font-bold text-slate-400 mr-2">৳</span>
                <input
                  type="number"
                  step="any"
                  value={payAmount}
                  onChange={(e) => {
                    setPayAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. 500"
                  className="w-[calc(100%-2rem)] bg-transparent text-lg font-bold font-mono text-slate-900 dark:text-white outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleFull}
                className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors text-center"
              >
                Settle Full ({formatTaka(remaining)})
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Add Partial
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
