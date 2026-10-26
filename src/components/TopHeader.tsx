import React from 'react';
import { Moon, Sun, Smartphone, Download, Database } from 'lucide-react';
import { formatTaka } from '../utils/formatters';

interface TopHeaderProps {
  totalBalance: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenFlutterGuide: () => void;
  onExportCSV: () => void;
  activeTab: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  totalBalance,
  darkMode,
  onToggleDarkMode,
  onOpenFlutterGuide,
  onExportCSV,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-base">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                TakaTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Offline
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              টাকা ট্র্যাকার · Personal Finance Ledger
            </p>
          </div>
        </div>

        {/* Center Balance Quick Preview on Desktop */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Net Balance:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatTaka(totalBalance)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick APK & Flutter Source Guide Button */}
          <button
            onClick={onOpenFlutterGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[38px] ${
              activeTab === 'flutter'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
            }`}
            title="Flutter Project Code & Phone APK Build Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Flutter APK Guide</span>
            <span className="xs:hidden">APK</span>
          </button>

          {/* Quick Export CSV */}
          <button
            onClick={onExportCSV}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label="Toggle Dark Mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
