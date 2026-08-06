'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth,
  isSameDay, isToday, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays, isSameMonth
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, CheckCircle2, LayoutGrid, CalendarDays, CalendarRange, Maximize2, AlertCircle, Trash2, Copy,
  ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, isOverdue } from '@/lib/utils';
import { TaskCreateModal } from '@/components/features/TaskCreateModal';
import { TaskDetailPanel } from '@/components/features/TaskDetailPanel';
import { toast } from 'sonner';

// Mốc giờ 24h chuẩn Việt Nam: Từ 06:00 đến 23:00
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

// Màu sắc mặc định Google Calendar 2027
const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  'Video':      'bg-purple-600 dark:bg-purple-700 text-white',
  'SEO':        'bg-emerald-600 dark:bg-emerald-700 text-white',
  'Thiết kế':   'bg-amber-500 dark:bg-amber-600 text-white',
  'Fanpage':    'bg-blue-600 dark:bg-blue-700 text-white',
  'Website':    'bg-cyan-600 dark:bg-cyan-700 text-white',
  'Marketing':  'bg-orange-600 dark:bg-orange-700 text-white',
  'AI':         'bg-indigo-600 dark:bg-indigo-700 text-white',
  'Khác':       'bg-rose-600 dark:bg-rose-700 text-white',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const { data: tasks, mutate } = useSWR('calendar-tasks-grid', () => api.tasks.list(), { refreshInterval: 4000 });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const tasksBySlot = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!tasks) return map;
    for (const t of tasks) {
      if (!t.deadline) continue;
      const d = new Date(t.deadline);
      const dayKey = format(d, 'yyyy-MM-dd');
      const hour = d.getHours();
      const slotKey = `${dayKey}_${hour}`;
      if (!map[slotKey]) map[slotKey] = [];
      map[slotKey].push(t);
    }
    return map;
  }, [tasks]);

  // Compute Days for Views
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const showRedLine = currentHour >= 6 && currentHour <= 23;
  const slotMinHeight = Math.round(80 * zoomScale);
  const redLineTop = ((currentHour - 6) * 60 + currentMinute) * (slotMinHeight / 60);

  // Xóa Task trực tiếp trên tờ Lịch + Đăng ký Undo Ctrl+Z
  const handleDeleteTask = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.tasks.delete(task.id);

      const { pushAction } = await import('@/lib/undoRedoStore').then(m => m.useUndoRedoStore.getState());
      pushAction({
        id: task.id,
        description: `Xóa công việc "${task.title}"`,
        undo: async () => { await api.tasks.create(task); },
        redo: async () => { await api.tasks.delete(task.id); },
      });

      toast.success(`🗑️ Đã xóa công việc "${task.title}". Nhấn Ctrl+Z để khôi phục.`);
      mutate();
    } catch (err: any) {
      toast.error('Lỗi khi xóa công việc');
    }
  };

  // Nhân Bản Task trực tiếp trên Lịch + Đăng ký Undo Ctrl+Z
  const handleDuplicateTask = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicatedTask = await api.tasks.create({
        title: task.title,
        description: task.description || '',
        deadline: task.deadline || null,
        priority: task.priority || 'medium',
        category: task.category || 'Khác',
        status: task.status || 'todo',
        tags: task.tags || [],
        checklist: task.checklist || [],
      });

      if (task.color) {
        await api.tasks.update(duplicatedTask.id, { color: task.color });
      }

      const { pushAction } = await import('@/lib/undoRedoStore').then(m => m.useUndoRedoStore.getState());
      pushAction({
        id: duplicatedTask.id,
        description: `Nhân bản công việc "${task.title}"`,
        undo: async () => { await api.tasks.delete(duplicatedTask.id); },
        redo: async () => { await api.tasks.create(duplicatedTask); },
      });

      toast.success(`📋 Đã nhân bản công việc "${task.title}"! Nhấn Ctrl+Z để khôi phục.`);
      mutate();
    } catch (err: any) {
      toast.error('Lỗi khi nhân bản công việc');
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDay: Date, hour: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId;
    if (!taskId) return;

    const targetTask = tasks?.find((t: any) => t.id === taskId);
    const oldDeadline = targetTask?.deadline;

    const newDeadline = new Date(targetDay);
    newDeadline.setHours(hour, 0, 0, 0);
    const newDeadlineIso = newDeadline.toISOString();

    mutate(
      tasks?.map((t: any) => (t.id === taskId ? { ...t, deadline: newDeadlineIso } : t)),
      false
    );

    try {
      await api.tasks.update(taskId, { deadline: newDeadlineIso });

      const { pushAction } = await import('@/lib/undoRedoStore').then(m => m.useUndoRedoStore.getState());
      pushAction({
        id: taskId,
        description: `Đổi lịch công việc "${targetTask?.title || 'task'}"`,
        undo: async () => {
          mutate(tasks?.map((t: any) => (t.id === taskId ? { ...t, deadline: oldDeadline } : t)), false);
          await api.tasks.update(taskId, { deadline: oldDeadline });
          mutate();
        },
        redo: async () => {
          mutate(tasks?.map((t: any) => (t.id === taskId ? { ...t, deadline: newDeadlineIso } : t)), false);
          await api.tasks.update(taskId, { deadline: newDeadlineIso });
          mutate();
        },
      });

      toast.success(`🎉 Đã đổi lịch sang ${format(newDeadline, 'HH:mm - EEEE, d/M', { locale: vi })}`);
      mutate();
    } catch (err: any) {
      mutate();
      toast.error('Lỗi khi đổi lịch công việc');
    } finally {
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-85px)] space-y-4 relative">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="page-title text-2xl font-black flex items-center gap-2 text-[var(--text)]">
            <CalendarIcon size={24} className="text-primary" /> Lịch Công Việc 24h Việt Nam
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </p>
        </div>

        {/* Action Controls & Zoom Level */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-soft text-xs font-black">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.65, +(prev - 0.2).toFixed(2)))}
              title="Thu nhỏ kích thước ô lịch"
              className="btn-ghost p-1.5 text-[var(--text-muted)] hover:text-primary"
            >
              <ZoomOut size={14} />
            </button>

            <span className="px-1 text-[11px] font-mono text-primary select-none">
              {Math.round(zoomScale * 100)}%
            </span>

            <button
              onClick={() => setZoomScale(prev => Math.min(1.75, +(prev + 0.2).toFixed(2)))}
              title="Phóng to kích thước ô lịch"
              className="btn-ghost p-1.5 text-[var(--text-muted)] hover:text-primary"
            >
              <ZoomIn size={14} />
            </button>

            {zoomScale !== 1 && (
              <button
                onClick={() => setZoomScale(1)}
                title="Khôi phục chuẩn 100%"
                className="btn-ghost p-1.5 text-xs text-rose-500"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-soft">
            {[
              { id: 'day', label: 'Ngày', icon: CalendarDays },
              { id: 'week', label: 'Tuần', icon: CalendarRange },
              { id: 'month', label: 'Tháng', icon: LayoutGrid },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all',
                  viewMode === m.id
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                <m.icon size={13} /> {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-soft">
            <input
              type="date"
              value={format(currentDate, 'yyyy-MM-dd')}
              onChange={e => e.target.value && setCurrentDate(new Date(e.target.value))}
              className="bg-transparent text-xs font-black text-[var(--text)] outline-none px-2 py-0.5 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-ghost text-xs font-black px-3 py-2">Hôm Nay</button>
            <button onClick={handleNext} className="btn-ghost p-2"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Main Grid Calendar Container */}
      <div className="flex-1 card border border-[var(--border)] shadow-soft flex flex-col overflow-hidden bg-[var(--surface)]">
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-50/70 dark:bg-[#121520] border-b border-[var(--border)] text-center font-extrabold text-sm text-primary">
              {format(currentDate, 'EEEE, d MMMM yyyy', { locale: vi })}
            </div>
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
              <div className="grid grid-cols-[80px_1fr] relative min-h-[1440px]">
                <div className="border-r border-[var(--border)] bg-gray-50/30 dark:bg-[#0e1017]">
                  {HOURS.map(hour => (
                    <div key={hour} className="h-20 border-b border-[var(--border)] text-xs font-black text-[var(--text-muted)] pr-3 text-right pt-2 tabular-nums">
                      {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {HOURS.map(hour => {
                    const slotTasks = tasks?.filter((t: any) => {
                      if (!t.deadline) return false;
                      const d = new Date(t.deadline);
                      return isSameDay(d, currentDate) && d.getHours() === hour;
                    }) || [];

                    return (
                      <div
                        key={hour}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, currentDate, hour)}
                        onClick={() => {
                          const dt = new Date(currentDate);
                          dt.setHours(hour, 0, 0, 0);
                          setSelectedSlot({ date: dt, hour });
                          setCreateOpen(true);
                        }}
                        className="h-20 border-b border-[var(--border)] p-2 hover:bg-primary/10 transition-colors group relative cursor-pointer"
                      >
                        <div className="space-y-1.5">
                          {slotTasks.map((task: any) => {
                            const taskBg = task.color || DEFAULT_CATEGORY_COLORS[task.category] || DEFAULT_CATEGORY_COLORS['Khác'];
                            const overdue = isOverdue(task.deadline) && task.status !== 'done';
                            return (
                              <div
                                key={task.id}
                                onClick={e => { e.stopPropagation(); setSelectedTaskId(task.id); }}
                                className={cn(
                                  'p-2.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-between cursor-pointer hover:scale-[1.01] group/card',
                                  taskBg,
                                  overdue && 'bg-red-600 ring-2 ring-red-400 text-white'
                                )}
                              >
                                <span className="line-clamp-3 leading-snug">{task.title}</span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    onClick={e => handleDuplicateTask(task, e)}
                                    title="Nhân bản công việc này"
                                    className="p-1 rounded bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover/card:opacity-100 transition-opacity"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    onClick={e => handleDeleteTask(task, e)}
                                    title="Xóa công việc này"
                                    className="p-1 rounded bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover/card:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  {overdue ? <AlertCircle size={13} className="text-white animate-bounce" /> : <Clock size={13} />}
                                  <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-lg font-mono">{format(new Date(task.deadline), 'HH:mm')}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW (SUPPORT DUPLICATE & DELETE TASK ON HOVER) */}
        {viewMode === 'week' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-[var(--border)] bg-gray-50/80 dark:bg-[#121520] shrink-0">
              <div className="p-3 text-[11px] font-black text-primary uppercase tracking-wider flex items-center justify-center border-r border-[var(--border)]">
                Giờ VN
              </div>
              {weekDays.map(day => {
                const isT = isToday(day);
                return (
                  <div key={day.toISOString()} className={cn(
                    'py-2 px-2 text-center border-r border-[var(--border)] last:border-r-0 transition-colors',
                    isT && 'bg-primary/15'
                  )}>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                      {format(day, 'EEEE', { locale: vi }).replace('Thứ ', 'T')}
                    </p>
                    <div className="flex items-center justify-center mt-0.5">
                      <span className={cn(
                        'text-sm font-black w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        isT ? 'bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.8)] scale-110' : 'text-[var(--text)]'
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HÀNG CẢ NGÀY / TẤT CẢ TASK CŨ ĐỀU GIỮ LẠI (ALL-DAY / HISTORY TASKS ROW) */}
            <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-[var(--border)] bg-gray-100/40 dark:bg-[#161924] shrink-0">
              <div className="p-2 text-[10px] font-black text-[var(--text-muted)] uppercase flex items-center justify-center border-r border-[var(--border)]">
                Cả ngày
              </div>
              {weekDays.map(day => {
                const allDayTasks = tasks?.filter((t: any) => {
                  if (!t.deadline) return true;
                  const d = new Date(t.deadline);
                  return isSameDay(d, day) && (d.getHours() < 6 || d.getHours() > 23);
                }) || [];

                return (
                  <div key={day.toISOString()} className="p-1 border-r border-[var(--border)] last:border-r-0 min-h-[36px] flex flex-col gap-1">
                    {allDayTasks.map((task: any) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="p-1 px-2 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:scale-102 group/card"
                      >
                        <span className="truncate">📌 {task.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button onClick={e => handleDuplicateTask(task, e)} title="Nhân bản task này" className="text-primary p-0.5"><Copy size={11} /></button>
                          <button onClick={e => handleDeleteTask(task, e)} title="Xóa task này" className="text-danger p-0.5"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Time-Grid Body với Layout Hàng Giờ Đồng Bộ 100% Đường Kẻ Ngang */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
              <div className="flex flex-col relative min-h-[1440px]">
                {/* Red Line */}
                {showRedLine && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${redLineTop}px` }}>
                    <div className="w-[70px] flex justify-end pr-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-ping" />
                    </div>
                    <div className="flex-1 h-[2px] bg-danger shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                  </div>
                )}

                {/* HÀNG MỐC GIỜ NẰM NGANG ĐỒNG BỘ 100% */}
                {HOURS.map(hour => (
                  <div key={hour} style={{ minHeight: `${slotMinHeight}px` }} className="flex items-stretch border-b border-[var(--border)] group/row">
                    {/* Cột mốc giờ bên trái - tự động kéo dài bằng chiều cao hàng */}
                    <div className="w-[70px] shrink-0 border-r border-[var(--border)] bg-gray-50/30 dark:bg-[#0e1017] text-[11px] font-black text-[var(--text-muted)] pr-2 text-right pt-2 tabular-nums select-none">
                      {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                    </div>

                    {/* Các ô slot đại diện cho từng Ngày trong đúng mốc hour này */}
                    <div className={cn('flex-1 grid gap-0 divide-x divide-[var(--border)]', (viewMode as string) === 'day' ? 'grid-cols-1' : 'grid-cols-7')}>
                      {weekDays.map(day => {
                        const isT = isToday(day);
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const slotTasks = tasksBySlot[`${dayKey}_${hour}`] || [];

                        return (
                          <div
                            key={day.toISOString()}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, day, hour)}
                            onClick={() => {
                              const dt = new Date(day);
                              dt.setHours(hour, 0, 0, 0);
                              setSelectedSlot({ date: dt, hour });
                              setCreateOpen(true);
                            }}
                            style={{ minHeight: `${slotMinHeight}px` }}
                            className={cn(
                              'p-1.5 hover:bg-primary/10 transition-colors relative cursor-pointer flex flex-col gap-1.5',
                              isT && 'bg-primary/5'
                            )}
                          >
                            {slotTasks.map((task: any) => {
                              const taskBg = task.color || DEFAULT_CATEGORY_COLORS[task.category] || DEFAULT_CATEGORY_COLORS['Khác'];
                              const overdue = isOverdue(task.deadline) && task.status !== 'done';
                              const timeStr = format(new Date(task.deadline), 'HH:mm');

                              return (
                                <motion.div
                                  key={task.id}
                                  draggable
                                  onDragStart={(e: any) => {
                                    if (e.dataTransfer) e.dataTransfer.setData('taskId', task.id);
                                    setDraggedTaskId(task.id);
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedTaskId(task.id);
                                  }}
                                  className={cn(
                                    'min-h-[58px] p-2 rounded-xl text-xs cursor-pointer shadow-md transition-all group/card relative flex flex-col justify-between',
                                    overdue
                                      ? 'bg-rose-600 dark:bg-rose-700 text-white ring-2 ring-red-400 font-black'
                                      : taskBg,
                                    task.status === 'done' && 'opacity-65 line-through ring-2 ring-emerald-500 bg-emerald-700 text-white'
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-black text-[11px] leading-tight line-clamp-2 flex-1">
                                      {task.title}
                                    </span>

                                    {/* NÚT NHÂN BẢN & XÓA TASK TRỰC TIẾP TRÊN THỂ LỊCH */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                      <button
                                        onClick={e => handleDuplicateTask(task, e)}
                                        title="Nhân bản task này"
                                        className="p-0.5 rounded bg-black/30 hover:bg-black/60 text-white transition-colors"
                                      >
                                        <Copy size={10} />
                                      </button>
                                      <button
                                        onClick={e => handleDeleteTask(task, e)}
                                        title="Xóa công việc này"
                                        className="p-0.5 rounded bg-black/30 hover:bg-black/60 text-white transition-colors"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-1 text-[10px] opacity-90">
                                    <span className="flex items-center gap-1 font-bold">
                                      {overdue ? <AlertCircle size={10} className="text-yellow-300 animate-bounce shrink-0" /> : <Clock size={9} className="shrink-0" />}
                                      <span className="bg-black/25 text-white px-1 py-0.2 rounded font-mono">{timeStr}</span>
                                    </span>
                                    <span className="text-[9px] font-extrabold px-1 rounded bg-black/20 truncate max-w-[60px]">
                                      {task.tags?.includes('Video') ? '• Video' : '• Ảnh'}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[var(--border)] bg-gray-50/80 dark:bg-[#121520] shrink-0 text-center py-2">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                <span key={d} className="text-xs font-black text-primary">{d}</span>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto no-scrollbar">
              {monthDays.map(day => {
                const isCurMonth = isSameMonth(day, currentDate);
                const isT = isToday(day);
                const dayTasks = tasks?.filter((t: any) => t.deadline && isSameDay(new Date(t.deadline), day)) || [];

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('week');
                    }}
                    className={cn(
                      'p-2 border-r border-b border-[var(--border)] min-h-[100px] cursor-pointer hover:bg-primary/10 transition-colors flex flex-col justify-between',
                      !isCurMonth && 'opacity-40 bg-gray-50/30 dark:bg-[#0c0e14]',
                      isT && 'bg-primary/10 font-bold'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-xs font-black w-6 h-6 rounded-full flex items-center justify-center',
                        isT ? 'bg-primary text-white shadow-soft' : 'text-[var(--text)]'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                          {dayTasks.length} task
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayTasks.slice(0, 2).map((dt: any) => (
                        <div
                          key={dt.id}
                          onClick={e => { e.stopPropagation(); setSelectedTaskId(dt.id); }}
                          className="text-[10px] font-black truncate px-1.5 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/40 flex items-center justify-between group/card"
                        >
                          <span className="truncate">{dt.title}</span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100">
                            <button onClick={e => handleDuplicateTask(dt, e)} className="text-primary p-0.5"><Copy size={10} /></button>
                            <button onClick={e => handleDeleteTask(dt, e)} className="text-danger p-0.5"><Trash2 size={10} /></button>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <p className="text-[9px] text-[var(--text-muted)] font-bold text-center">+{dayTasks.length - 2} task khác</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON (+) NỔI BẬT GÓC DƯỚI BÊN PHẢI */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCreateOpen(true)}
        className="fixed right-6 bottom-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(239,68,68,0.6)] cursor-pointer hover:shadow-[0_12px_40px_rgba(239,68,68,0.8)] transition-all"
        title="Tạo Công Việc Mới Nhanh (+)"
      >
        <Plus size={28} className="font-extrabold stroke-[3]" />
      </motion.button>

      {/* Task Create Modal */}
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { mutate(); setCreateOpen(false); }}
        defaultValues={selectedSlot ? { deadline: selectedSlot.date.toISOString().slice(0, 16) } : {}}
      />

      {/* Task Detail Modal Zoom To */}
      {selectedTaskId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm" onClick={() => setSelectedTaskId(null)}>
          <div className="w-full sm:w-[500px] h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-modal" onClick={e => e.stopPropagation()}>
            <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onUpdated={() => mutate()} />
          </div>
        </div>
      )}
    </div>
  );
}
