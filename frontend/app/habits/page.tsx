'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Repeat2, Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const HABIT_ICONS = ['📚','🧠','🎬','🔍','💪','😴','✍️','🏃','🧘','💧','🎨','💻','📝','🎯'];

export default function HabitsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '⭐', repeat: 'daily', color: '#2563eb' });

  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 6), end: today });

  const fromDate = format(subDays(today, 30), 'yyyy-MM-dd');
  const toDate = format(today, 'yyyy-MM-dd');

  const { data: habits, mutate: mutateHabits } = useSWR('habits', () => api.habits.list());
  const { data: logs, mutate: mutateLogs } = useSWR('habit-logs', () => api.habits.getLogs({ from: fromDate, to: toDate }));

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs?.some((l: any) => l.habit_id === habitId && l.date === dateStr && l.completed) || false;
  };

  const toggle = async (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      await api.habits.toggleLog(habitId, dateStr);
      mutateLogs();
    } catch (e: any) { toast.error(e.message); }
  };

  const createHabit = async () => {
    if (!newHabit.name.trim()) return toast.error('Vui lòng nhập tên thói quen');
    try {
      await api.habits.create(newHabit);
      toast.success('🎉 Đã thêm thói quen mới!');
      mutateHabits();
      setCreateOpen(false);
      setNewHabit({ name: '', icon: '⭐', repeat: 'daily', color: '#2563eb' });
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá thói quen này?')) return;
    try {
      await api.habits.delete(id);
      mutateHabits();
      toast.success('Đã xoá thói quen');
    } catch (e: any) { toast.error(e.message); }
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = subDays(today, i);
      if (isCompleted(habitId, d)) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-2">
            <Repeat2 size={22} className="text-primary" /> Theo Dõi Thói Quen Hằng Ngày
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Xây dựng chuỗi thói quen tích cực kỷ luật mỗi ngày</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <Plus size={16} /> Thêm Thói Quen
        </button>
      </div>

      {/* Grid Table */}
      <div className="card overflow-hidden border border-[var(--border)] shadow-soft">
        <div className="grid border-b border-[var(--border)] bg-gray-50/50 dark:bg-[#1f1f1f]" style={{ gridTemplateColumns: '220px repeat(7, 1fr)' }}>
          <div className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Tên Thói Quen</div>
          {days.map(d => (
            <div key={d.toISOString()} className={cn(
              'p-2.5 text-center border-l border-[var(--border)]',
              isToday(d) && 'bg-primary/10'
            )}>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{format(d, 'EEE', { locale: vi })}</p>
              <p className={cn('text-xs font-extrabold mt-0.5', isToday(d) ? 'text-primary' : 'text-[var(--text)]')}>
                {format(d, 'd')}
              </p>
            </div>
          ))}
        </div>

        {habits?.length === 0 && (
          <div className="p-10 text-center text-xs text-[var(--text-muted)] italic">
            Chưa có thói quen nào. Nhấn nút "Thêm Thói Quen" để bắt đầu!
          </div>
        )}

        {habits?.map((habit: any) => {
          const streak = getStreak(habit.id);
          return (
            <div
              key={habit.id}
              className="grid border-b border-[var(--border)] last:border-none hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a] transition-colors group"
              style={{ gridTemplateColumns: '220px repeat(7, 1fr)' }}
            >
              <div className="p-3 flex items-center gap-2.5">
                <span className="text-xl">{habit.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text)] truncate">{habit.name}</p>
                  {streak > 0 && (
                    <p className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 mt-0.5">
                      <Flame size={11} /> {streak} ngày liên tiếp
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-[var(--text-muted)] hover:text-danger transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {days.map(d => {
                const done = isCompleted(habit.id, d);
                const isT = isToday(d);
                return (
                  <div key={d.toISOString()} className={cn(
                    'border-l border-[var(--border)] flex items-center justify-center p-2',
                    isT && 'bg-primary/5'
                  )}>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggle(habit.id, d)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all flex items-center justify-center',
                        done
                          ? 'bg-primary text-white shadow-soft scale-105'
                          : 'border-2 border-gray-200 dark:border-[#333] hover:border-primary/50'
                      )}
                    >
                      {done && <Check size={14} strokeWidth={3} />}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Modal create habit */}
      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[90vw] max-w-[420px] z-50
                         bg-[var(--surface)] rounded-2xl shadow-modal border border-[var(--border)] p-6 space-y-4"
            >
              <h2 className="font-bold text-sm text-[var(--text)]">Tạo Thói Quen Mới</h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Tên Thói Quen *</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ví dụ: Đọc sách 30 phút, Tập Gym..."
                    className="input text-xs"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Biểu tượng (Icon)</label>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_ICONS.map(icon => (
                      <button
                        key={icon} type="button"
                        onClick={() => setNewHabit(p => ({ ...p, icon }))}
                        className={cn(
                          'w-9 h-9 text-lg rounded-xl transition-all',
                          newHabit.icon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCreateOpen(false)} className="btn-ghost flex-1 justify-center text-xs font-semibold">Huỷ</button>
                <button onClick={createHabit} className="btn-primary flex-1 justify-center text-xs font-bold">Tạo Thói Quen</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
