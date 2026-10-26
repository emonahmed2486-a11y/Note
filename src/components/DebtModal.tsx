import React, { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, FileText, Check, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { DebtRecord, DebtType } from '../types/finance';
import { getTodayDateString, isValidAmount } from '../utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: DebtType;
    personName: string;
    phone?: string;
    amount: number;
    date: string;
    dueDate?: string;
    note?: string;
  }) => void;
  onDelete?: (id: string) => void;
  editingDebt?: DebtRecord | null;
  initialType?: DebtType;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingDebt,
  initialType = 'lent',
}) => {
  const [type, setType] = useState<DebtType>(initialType);
  const [personName, setPersonName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [dueDate, setDueDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.type);
      setPersonName(editingDebt.personName);
      setPhone(editingDebt.phone || '');
      setAmount(editingDebt.amount.toString());
      setDate(editingDebt.date || getTodayDateString());
      setDueDate(editingDebt.dueDate || '');
      setNote(editingDebt.note || '');
      setError('');
    } else {
      setType(initialType);
      setPersonName('');
      setPhone('');
      setAmount('');
      setDate(getTodayDateString());
      setDueDate('');
      setNote('');
      setError('');
    }
  }, [editingDebt, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!personName.trim()) {
      setError('Please enter the person or shop name');
      return;
    }

    if (!amount.trim()) {
      setError('Please enter the debt amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isValidAmount(numAmount)) {
      setError('Please enter a valid positive amount in Taka (৳)');
      return;
    }

    onSave({
      type,
      personName: personName.trim(),
      phone: phone.trim() || undefined,
      amount: numAmount,
      date,
      dueDate: dueDate.trim() || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingDebt ? 'Edit Debt Record' : type === 'lent' ? 'Money Lent (টাকা ধার দিয়েছি)' : 'Money Borrowed (টাকা ধার নিয়েছি)'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Lent vs Borrowed */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType('lent')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'lent'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Lent / পাওনা (I Gave)
            </button>
            <button
              type="button"
              onClick={() => setType('borrowed')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'borrowed'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Borrowed / দেনা (I Took)
            </button>
          </div>

          {/* Person Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Person / Contact Name *
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Tanvir, Arif Bhai, Rahim Grocery"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
              Amount (BDT ৳) *
            </label>
            <div className="relative rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-2.5">
              <span className="text-xl font-bold text-slate-400 mr-2">৳</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0"
                className="w-[calc(100%-2rem)] bg-transparent text-xl font-bold font-mono text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712-XXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Due Date (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Expected Return Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Exam fee, emergency medical support"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3">
            {editingDebt && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this debt record?')) {
                    onDelete(editingDebt.id);
                    onClose();
                  }
                }}
                className="p-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900"
                title="Delete Record"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              {editingDebt ? 'Update Debt' : 'Save Debt Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
