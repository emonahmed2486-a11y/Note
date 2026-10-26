import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowLeftRight, 
  BarChart3, 
  Smartphone 
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'transactions' | 'debts' | 'reports' | 'flutter';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingDebtsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingDebtsCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as const, label: 'History', icon: Receipt },
    { 
      id: 'debts' as const, 
      label: 'Debts (ধার)', 
      icon: ArrowLeftRight,
      badge: pendingDebtsCount > 0 ? pendingDebtsCount : undefined 
    },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { id: 'flutter' as const, label: 'Flutter APK', icon: Smartphone, highlight: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
