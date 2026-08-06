'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Loader2, Trash2, ChevronDown, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatDateTime, isOverdue, getStatusLabel, getPriorityLabel, truncate } from '@/lib/utils';
import { TaskCreateModal } from '@/components/features/TaskCreateModal';
import { TaskDetailPanel } from '@/components/features/TaskDetailPanel';
import { toast } from 'sonner';

const STATUSES = ['','todo','doing','waiting','done','cancelled'];
const PRIORITIES = ['','low','medium','high','urgent'];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const { data: tasks, mutate, isLoading } = useSWR(
    ['tasks', filterStatus, filterPriority, search],
    () => {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;
      return api.tasks.list(Object.keys(params).length ? params : undefined);
    },
    { refreshInterval: 15000 }
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá công việc này?')) return;
    try {
      await api.tasks.delete(id);
      toast.success('Đã xoá công việc');
      mutate();
      if (selectedTask === id) setSelectedTask(null);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.tasks.update(id, { status });
      mutate();
    } catch (e: any) { toast.error(e.message); }
  };

  const grouped = {
    urgent: tasks?.filter((t: any) => t.priority === 'urgent' && t.status !== 'done' && t.status !== 'cancelled') || [],
    active: tasks?.filter((t: any) => ['todo','doing','waiting'].includes(t.status) && t.priority !== 'urgent') || [],
    done: tasks?.filter((t: any) => t.status === 'done') || [],
    cancelled: tasks?.filter((t: any) => t.status === 'cancelled') || [],
  };

  return (
    <div className="animate-fade-in flex gap-6 h-[calc(100vh-80px)]">
      {/* Task List */}
      <div className={cn('flex flex-col flex-1 min-w-0', selectedTask && 'hidden lg:flex lg:flex-1')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="page-title text-2xl font-bold">Quản Lý Công Việc</h1>
            <p className="text-xs text-[var(--text-muted)]">Danh sách toàn bộ task, deadline & tiến độ chi tiết</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Tạo Công Việc Mới
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="global-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, tag, ghi chú..."
              className="input pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input w-36 text-xs font-medium"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUSES.slice(1).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="input w-36 text-xs font-medium"
          >
            <option value="">Tất cả độ ưu tiên</option>
            {PRIORITIES.slice(1).map(p => <option key={p} value={p}>{getPriorityLabel(p)}</option>)}
          </select>
        </div>

        {/* Task Groups */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {grouped.urgent.length > 0 && (
              <TaskGroup
                title="🔥 Mức Độ Khẩn Cấp"
                tasks={grouped.urgent}
                onSelect={setSelectedTask}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                selected={selectedTask}
              />
            )}
            <TaskGroup
              title="📋 Đang Thực Hiện / Cần Làm"
              tasks={grouped.active}
              onSelect={setSelectedTask}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              selected={selectedTask}
              emptyText="Không có công việc nào trong danh sách này"
            />
            {grouped.done.length > 0 && (
              <TaskGroup
                title="✅ Đã Hoàn Thành"
                tasks={grouped.done}
                onSelect={setSelectedTask}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                selected={selectedTask}
                collapsible
              />
            )}
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="w-full lg:w-[460px] shrink-0 overflow-y-auto"
          >
            <TaskDetailPanel
              taskId={selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdated={mutate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { mutate(); setCreateOpen(false); }}
      />
    </div>
  );
}

function TaskGroup({ title, tasks, onSelect, onDelete, onStatusChange, selected, collapsible, emptyText }: any) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        onClick={() => collapsible && setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-2 w-full text-left"
      >
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{title}</span>
        <span className="text-xs font-bold text-[var(--text-muted)] bg-gray-100 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full">{tasks.length}</span>
        {collapsible && <ChevronDown size={14} className={cn('ml-auto text-[var(--text-muted)] transition-transform', collapsed && 'rotate-180')} />}
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {tasks.length === 0 && emptyText && (
            <p className="text-xs text-[var(--text-muted)] py-4 text-center italic">{emptyText}</p>
          )}
          {tasks.map((task: any) => (
            <TaskCard
              key={task.id}
              task={task}
              selected={selected === task.id}
              onSelect={() => onSelect(task.id)}
              onDelete={() => onDelete(task.id)}
              onStatusChange={(s: string) => onStatusChange(task.id, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, selected, onSelect, onDelete, onStatusChange }: any) {
  const overdue = isOverdue(task.deadline) && !['done','cancelled'].includes(task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card p-4 cursor-pointer transition-all hover:shadow-card group',
        selected && 'ring-2 ring-primary/40',
        overdue && 'border-l-4 border-l-danger rounded-l-none'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); onStatusChange(task.status === 'done' ? 'todo' : 'done'); }}
          className="mt-0.5 shrink-0"
        >
          <CheckCircle2 size={18} className={cn(
            'transition-colors',
            task.status === 'done' ? 'text-success fill-success/20' : 'text-gray-300 hover:text-success'
          )} />
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm text-[var(--text)]', task.status === 'done' && 'line-through text-[var(--text-muted)]')}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{truncate(task.description, 70)}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={cn('badge text-[10px]', `priority-${task.priority}`)}>{getPriorityLabel(task.priority)}</span>
            <span className={cn('badge text-[10px]', `status-${task.status}`)}>{getStatusLabel(task.status)}</span>
            {task.category && <span className="text-[11px] text-[var(--text-muted)] font-medium">· {task.category}</span>}
            {task.deadline && (
              <span className={cn('flex items-center gap-1 text-[11px] font-medium ml-auto', overdue ? 'text-danger font-bold' : 'text-[var(--text-muted)]')}>
                {overdue && <AlertCircle size={11} />}
                <Clock size={11} />
                {formatDateTime(task.deadline)}
              </span>
            )}
          </div>

          {task.progress > 0 && task.status !== 'done' && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums">{task.progress}%</span>
            </div>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-[var(--text-muted)] hover:text-danger"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}
