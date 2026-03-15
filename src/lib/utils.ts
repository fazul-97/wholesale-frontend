import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export const fmt = {
  currency: (n: number) => `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`,
  date: (d: string | Date) => new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }),
  time: (d: string | Date) => new Date(d).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
  datetime: (d: string | Date) => `${fmt.date(d)} ${fmt.time(d)}`,
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  MODIFIED: 'bg-orange-100 text-orange-800 border-orange-200',
  DISPATCHED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  IN_STOCK: 'bg-green-100 text-green-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  LIMITED: 'bg-orange-100 text-orange-800',
};
