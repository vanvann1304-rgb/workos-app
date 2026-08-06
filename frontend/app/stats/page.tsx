'use client';

import useSWR from 'swr';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BarChart2, TrendingUp, CheckCircle2, AlertCircle, Target } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StatsPage() {
  const { data: stats } = useSWR('stats-page', () => api.stats.get(), { refreshInterval: 15000 });

  const maxWeek = Math.max(...(stats?.weekData?.map((d: any) => d.done + d.created) || [1]), 1);

  return (
    <div className="animate-fade-in max-w-3xl space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold flex items-center gap-2">
          <BarChart2 size={22} className="text-primary" /> Thống Kê Hiệu Suất
        </h1>
        <p className="text-xs text-[var(--text-muted)]">Báo cáo chỉ số hoàn thành công việc theo tuần và tháng</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng số task', value: stats?.total || 0, icon: Target, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Đã hoàn thành', value: stats?.today?.done || 0, icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50 dark:bg-green-950/20' },
          { label: 'Task quá hạn', value: stats?.overdue || 0, icon: AlertCircle, color: 'text-danger', bg: 'bg-red-50 dark:bg-red-950/20' },
          { label: 'Tỷ lệ hoàn thành', value: `${stats?.completionRate || 0}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--text)]">{value}</p>
            <p className="text-xs font-semibold text-[var(--text-muted)] mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Week chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-5"
      >
        <h2 className="font-bold text-sm text-[var(--text)] mb-4">Biểu Đồ Năng Suất 7 Ngày Gần Nhất</h2>
        <div className="flex items-end gap-2 h-44 pt-4">
          {stats?.weekData?.map((day: any, i: number) => {
            const total = day.done + day.created;
            const heightDone = total ? (day.done / maxWeek) * 100 : 0;
            const heightCreated = total ? (day.created / maxWeek) * 100 : 0;
            const isT = i === (stats.weekData.length - 1);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex flex-col justify-end gap-0.5 w-full" style={{ height: '130px' }}>
                  {day.created > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightCreated}%` }}
                      transition={{ delay: i * 0.05, ease: 'easeOut' }}
                      className="w-full bg-gray-200 dark:bg-[#2a2a2a] rounded-t-md"
                    />
                  )}
                  {day.done > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightDone}%` }}
                      transition={{ delay: i * 0.05, ease: 'easeOut' }}
                      className={cn('w-full rounded-md', isT ? 'bg-primary' : 'bg-primary/70')}
                    />
                  )}
                  {total === 0 && <div className="w-full h-1 bg-gray-100 dark:bg-[#222] rounded" />}
                </div>
                <span className={cn('text-[10px] font-bold', isT ? 'text-primary' : 'text-[var(--text-muted)]')}>
                  {format(new Date(day.date), 'dd/MM')}
                </span>
                {day.done > 0 && (
                  <span className="text-[10px] text-success font-extrabold">+{day.done}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <div className="w-3 h-3 rounded bg-primary" /> Hoàn thành
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <div className="w-3 h-3 rounded bg-gray-200 dark:bg-[#2a2a2a]" /> Đã tạo
          </div>
        </div>
      </motion.div>

      {/* By Category */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <h2 className="font-bold text-sm text-[var(--text)] mb-4">Phân Phối Theo Danh Mục Công Việc</h2>
        {stats?.byCategory?.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">Chưa có dữ liệu thống kê</p>
        ) : (
          <div className="space-y-3">
            {stats?.byCategory?.map((cat: any) => {
              const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[var(--text)]">{cat.category}</span>
                    <span className="text-[var(--text-muted)]">{cat.count} công việc ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ease: 'easeOut', delay: 0.1 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
