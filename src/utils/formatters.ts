/**
 * Currency & Date formatting utilities for TakaTrack (Bangladeshi Taka - ৳)
 */

export function formatTaka(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '৳0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format with Bangladeshi/Indian numbering grouping or standard comma grouping
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}৳${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);

      const today = new Date();
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const isYesterday = yesterday.getFullYear() === year && yesterday.getMonth() === month && yesterday.getDate() === day;

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';

      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isValidAmount(value: string | number): boolean {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num) && num <= 1000000000;
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}
