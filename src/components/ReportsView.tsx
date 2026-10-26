import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Percent, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight 
} from 'lucide-react';
import { Transaction, CategoryId, CATEGORIES } from '../types/finance';
import { formatTaka } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ReportsViewProps {
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
  // Generate list of available months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    const now = new Date();
    // Default current month
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentKey);

    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.substring(0, 7));
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  // Month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTx = monthTransactions.filter((t) => t.type === 'expense');
    const map = new Map<CategoryId, { total: number; count: number }>();

    expenseTx.forEach((tx) => {
      const existing = map.get(tx.category) || { total: 0, count: 0 };
      map.set(tx.category, {
        total: existing.total + tx.amount,
        count: existing.count + 1,
      });
    });

    const list = Array.from(map.entries()).map(([catId, data]) => {
      const percentage = totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0;
      return {
        category: catId,
        info: CATEGORIES[catId] || CATEGORIES.other,
        total: data.total,
        count: data.count,
        percentage,
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [monthTransactions, totalExpense]);

  // Recent 6 Months comparison for the bar chart
  const sixMonthsData = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });

      const txs = transactions.filter((t) => t.date.startsWith(key));
      const inc = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      result.push({
        key,
        label,
        income: inc,
        expense: exp,
      });
    }

    return result;
  }, [transactions]);

  // Max value for bar chart scaling
  const maxBarValue = Math.max(
    1000,
    ...sixMonthsData.map((d) => Math.max(d.income, d.expense))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Report Period:
          </span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border-0 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {availableMonths.map((m) => {
            const [year, month] = m.split('-');
            const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
            const label = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            return (
              <option key={m} value={m}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      {/* 3 Metric Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Income</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatTaka(totalIncome)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {monthTransactions.filter((t) => t.type === 'income').length} credit transactions
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Expenses</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatTaka(totalExpense)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {monthTransactions.filter((t) => t.type === 'expense').length} debit transactions
          </p>
        </div>

        {/* Net Savings & Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Savings Rate</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
            <span>{savingsRate}%</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                netSavings >= 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {netSavings >= 0 ? `+${formatTaka(netSavings)}` : formatTaka(netSavings)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {netSavings >= 0 ? 'Surplus retained' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* 6-Month Income vs Expense Bar Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              6-Month Income vs Expense (টাকা)
            </h3>
            <p className="text-xs text-slate-500">
              Visual comparison across the last half-year
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Expense</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          {sixMonthsData.map((d) => {
            const incomeHeight = Math.max(4, Math.round((d.income / maxBarValue) * 120));
            const expenseHeight = Math.max(4, Math.round((d.expense / maxBarValue) * 120));
            const isCurrent = d.key === selectedMonth;

            return (
              <div
                key={d.key}
                onClick={() => setSelectedMonth(d.key)}
                className={`flex-1 flex flex-col items-center cursor-pointer group p-1 rounded-xl transition-colors ${
                  isCurrent ? 'bg-slate-50 dark:bg-slate-800/60' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Dual Bars */}
                <div className="w-full flex items-end justify-center gap-1.5 h-32">
                  {/* Income Bar */}
                  <div
                    title={`Income: ${formatTaka(d.income)}`}
                    style={{ height: `${incomeHeight}px` }}
                    className="w-3 sm:w-4 rounded-t-md bg-emerald-500 group-hover:bg-emerald-600 transition-all"
                  />
                  {/* Expense Bar */}
                  <div
                    title={`Expense: ${formatTaka(d.expense)}`}
                    style={{ height: `${expenseHeight}px` }}
                    className="w-3 sm:w-4 rounded-t-md bg-rose-500 group-hover:bg-rose-600 transition-all"
                  />
                </div>
                {/* Month Label */}
                <span
                  className={`mt-2 text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown (Donut & Ranked List) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Expense Breakdown by Category ({selectedMonth})
          </h3>
          <p className="text-xs text-slate-500">
            Where your money was spent this month
          </p>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No expense records found for this month.
          </p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((item) => {
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.info.color }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.info.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.count} items)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatTaka(item.total)}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Category Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.info.color,
                      }}
                    />
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
