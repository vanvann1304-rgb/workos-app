'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, Plus, ArrowRight,
  Sparkles, Calendar as CalendarIcon, Zap, CheckSquare, Flame, Trello
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, isOverdue } from '@/lib/utils';
import { TaskCreateModal } from '@/components/features/TaskCreateModal';
import { TaskDetailPanel } from '@/components/features/TaskDetailPanel';
import Link from 'next/link';

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'planner' | 'eisenhower'>('timeline');

  const { data: stats } = useSWR('stats-dashboard', () => api.stats.get(), { refreshInterval: 10000 });
  const { data: tasks, mutate } = useSWR('tasks-dashboard', () => api.tasks.list(), { refreshInterval: 10000 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'done').length || 0;
  const overdueTasks = tasks?.filter((t: any) => isOverdue(t.deadline) && t.status !== 'done').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayTasks = tasks?.filter((t: any) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold mt-1 text-[var(--text)] tracking-tight">
            Chào buổi chiều, Admin 👋
          </h1>
        </div>

        {/* Live Digital Clock */}
        <div className="card px-5 py-2.5 flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] shadow-soft self-start sm:self-auto">
          <Clock size={18} className="text-primary animate-pulse" />
          <span className="font-mono text-lg font-extrabold text-[var(--text)] tracking-wider">{time || '00:00:00'}</span>
        </div>
      </div>

      {/* Main Stats Banner Card */}
      <div className="card-glow p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-primary/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-primary">TIẾN ĐỘ NĂNG SUẤT HÔM NAY</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-black text-[var(--text)]">{progressPercent}%</span>
              <span className="text-xs font-bold text-[var(--text-muted)]">công việc đã hoàn thành</span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-full sm:w-80 h-3 bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden p-0.5 border border-[var(--border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-soft text-center">
              <p className="text-xl font-extrabold text-[var(--text)]">{totalTasks}</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5">Tổng số task</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Đã hoàn thành</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {tasks?.filter((t: any) => t.status === 'doing').length || 0}
              </p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">Đang thực hiện</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-center">
              <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{overdueTasks}</p>
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">Công việc quá hạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Planner Views */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex border-b border-[var(--border)] bg-[var(--surface)] p-1 rounded-2xl border">
            {[
              { id: 'timeline', label: '⏰ Timeline Trong Ngày', icon: Clock },
              { id: 'planner', label: '⚡ Kế Hoạch 4 Khung Giờ', icon: Zap },
              { id: 'eisenhower', label: '🎯 Ma Trận Ưu Tiên', icon: CheckSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-extrabold text-sm text-[var(--text)]">Lịch Trình Công Việc Hôm Nay</h3>
                <Link href="/calendar" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Xem Lịch Kéo Thả <ArrowRight size={14} />
                </Link>
              </div>

              {todayTasks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--text-muted)]">
                    <CalendarIcon size={24} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-muted)]">Chưa có task nào có deadline hôm nay</p>
                  <button onClick={() => setCreateOpen(true)} className="btn-primary">
                    <Plus size={14} /> Tạo Task Mới Hôm Nay
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-primary/40 hover:shadow-soft flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                          {t.deadline ? new Date(t.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Hôm nay'}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{t.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.category} · Ưu tiên {t.priority}</p>
                        </div>
                      </div>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold priority-' + t.priority)}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4 Slots Planner View */}
          {activeTab === 'planner' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: '☀️ Sáng (05:00 - 12:00)', filter: (h: number) => h >= 5 && h < 12, color: 'border-amber-500/30 bg-amber-500/5' },
                { title: '🌤️ Trưa (12:00 - 18:00)', filter: (h: number) => h >= 12 && h < 18, color: 'border-blue-500/30 bg-blue-500/5' },
                { title: '🌙 Tối (18:00 - 22:00)', filter: (h: number) => h >= 18 && h < 22, color: 'border-purple-500/30 bg-purple-500/5' },
                { title: '🌌 Đêm (22:00 - 05:00)', filter: (h: number) => h >= 22 || h < 5, color: 'border-indigo-500/30 bg-indigo-500/5' },
              ].map((slot, idx) => {
                const slotTasks = tasks?.filter((t: any) => t.deadline && slot.filter(new Date(t.deadline).getHours())) || [];
                return (
                  <div key={idx} className={cn('card p-4 space-y-2 border', slot.color)}>
                    <h4 className="font-extrabold text-xs text-[var(--text)]">{slot.title}</h4>
                    {slotTasks.length === 0 ? (
                      <p className="text-[11px] text-[var(--text-muted)] italic">Chưa có công việc</p>
                    ) : (
                      <div className="space-y-1.5">
                        {slotTasks.map((st: any) => (
                          <div key={st.id} onClick={() => setSelectedTaskId(st.id)} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold truncate cursor-pointer hover:border-primary">
                            {st.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Eisenhower View */}
          {activeTab === 'eisenhower' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: '🔥 LÀM NGAY (Khẩn cấp & Quan trọng)', filter: (t: any) => t.priority === 'urgent', color: 'border-rose-500/40 bg-rose-500/10' },
                { title: '📅 LÊN LỊCH (Quan trọng)', filter: (t: any) => t.priority === 'high', color: 'border-amber-500/40 bg-amber-500/10' },
                { title: '👥 GIAO VIỆC (Khẩn cấp vừa)', filter: (t: any) => t.priority === 'medium', color: 'border-blue-500/40 bg-blue-500/10' },
                { title: '🗑️ LOẠI BỎ / LÀM SAU', filter: (t: any) => t.priority === 'low', color: 'border-gray-500/30 bg-gray-500/5' },
              ].map((matrix, idx) => {
                const mTasks = tasks?.filter(matrix.filter) || [];
                return (
                  <div key={idx} className={cn('card p-4 space-y-2 border', matrix.color)}>
                    <h4 className="font-extrabold text-xs text-[var(--text)]">{matrix.title}</h4>
                    {mTasks.length === 0 ? (
                      <p className="text-[11px] text-[var(--text-muted)] italic">Không có task</p>
                    ) : (
                      <div className="space-y-1.5">
                        {mTasks.map((mt: any) => (
                          <div key={mt.id} onClick={() => setSelectedTaskId(mt.id)} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold truncate cursor-pointer hover:border-primary">
                            {mt.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Action Center */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="font-extrabold text-sm text-[var(--text)]">Thao Tác Nhanh</h3>
            <button onClick={() => setCreateOpen(true)} className="btn-primary w-full justify-center py-3 text-xs font-extrabold">
              <Plus size={16} /> Tạo Task Mới
            </button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/kanban" className="btn-ghost justify-center border border-[var(--border)] py-2.5">
                <Trello size={14} /> Kanban
              </Link>
              <Link href="/pomodoro" className="btn-ghost justify-center border border-[var(--border)] py-2.5">
                <Flame size={14} /> Pomodoro
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Task Create Modal */}
      <TaskCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => mutate()} />

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm" onClick={() => setSelectedTaskId(null)}>
          <div className="w-full sm:w-[480px] h-full bg-[var(--surface)] border-l border-[var(--border)]" onClick={e => e.stopPropagation()}>
            <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onUpdated={() => mutate()} />
          </div>
        </div>
      )}
    </div>
  );
}
