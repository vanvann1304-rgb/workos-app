import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatTimeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDate(date);
}

export function isOverdue(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function isDueToday(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isDueSoon(deadline: string | null | undefined, hours = 24): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff < hours * 3600000;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600 dark:text-blue-400',
    high: 'text-orange-600 dark:text-orange-400',
    urgent: 'text-red-600 dark:text-red-400',
  };
  return map[priority] || '';
}

export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp'
  };
  return map[priority] || priority;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ', done: 'Hoàn thành', cancelled: 'Huỷ'
  };
  return map[status] || status;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}
