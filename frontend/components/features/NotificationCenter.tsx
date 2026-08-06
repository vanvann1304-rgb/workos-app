'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Clock, X, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import Link from 'next/link';
import { cn, formatDateTime } from '@/lib/utils';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const { data: upcoming } = useSWR('notifications-upcoming', () => api.notifications.getUpcoming(), { refreshInterval: 15000 });
  const { data: overdue } = useSWR('notifications-overdue', () => api.notifications.getOverdue(), { refreshInterval: 15000 });

  const totalBadges = (upcoming?.length || 0) + (overdue?.length || 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all"
        aria-label="Trung tâm thông báo"
      >
        <Bell size={19} />
        {totalBadges > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {totalBadges > 9 ? '9+' : totalBadges}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="absolute right-0 top-11 w-80 sm:w-96 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-modal z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-gray-50/50 dark:bg-[#1f1f1f]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <h3 className="font-semibold text-sm text-[var(--text)]">Trung Tâm Thông Báo</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--border)]">
                {/* Overdue Section */}
                {overdue && overdue.length > 0 && (
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-danger uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> Công việc Quá hạn ({overdue.length})
                    </p>
                    {overdue.map((task: any) => (
                      <Link key={task.id} href={`/tasks/${task.id}`} onClick={() => setOpen(false)}>
                        <div className="p-2.5 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors flex items-start gap-2.5">
                          <AlertTriangle size={15} className="text-danger mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--text)] truncate">{task.title}</p>
                            <p className="text-[11px] text-danger mt-0.5">Hạn chót: {formatDateTime(task.deadline)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Upcoming Section */}
                {upcoming && upcoming.length > 0 && (
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1">
                      <Clock size={12} /> Sắp đến hạn trong 1 giờ ({upcoming.length})
                    </p>
                    {upcoming.map((task: any) => (
                      <Link key={task.id} href={`/tasks/${task.id}`} onClick={() => setOpen(false)}>
                        <div className="p-2.5 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors flex items-start gap-2.5">
                          <Clock size={15} className="text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[var(--text)] truncate">{task.title}</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Hạn chót: {formatDateTime(task.deadline)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {totalBadges === 0 && (
                  <div className="py-8 text-center">
                    <CheckCircle2 size={32} className="text-success mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-medium text-[var(--text-muted)]">Bạn không có thông báo hay việc khẩn cấp nào!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
