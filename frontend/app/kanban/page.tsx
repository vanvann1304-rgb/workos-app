'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, AlertCircle, Columns2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, isOverdue, getPriorityLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { TaskCreateModal } from '@/components/features/TaskCreateModal';

const COLUMNS = [
  { id: 'todo',     label: 'Chưa Làm (To Do)',   color: 'bg-gray-100 dark:bg-[#2a2a2a]',   dot: 'bg-gray-400' },
  { id: 'doing',    label: 'Đang Làm (Doing)',   color: 'bg-blue-50/60 dark:bg-blue-950/10', dot: 'bg-blue-500' },
  { id: 'waiting',  label: 'Đang Chờ (Review)', color: 'bg-amber-50/60 dark:bg-amber-950/10',dot: 'bg-amber-500' },
  { id: 'done',     label: 'Hoàn Thành (Done)',  color: 'bg-green-50/60 dark:bg-green-950/10', dot: 'bg-green-500' },
];

export default function KanbanPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState('todo');

  const { data: tasks, mutate } = useSWR('kanban-tasks', () => api.tasks.list(), { refreshInterval: 20000 });

  const columns = COLUMNS.map(col => ({
    ...col,
    tasks: tasks?.filter((t: any) => t.status === col.id) || [],
  }));

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    try {
      await api.tasks.update(draggableId, { status: newStatus });
      mutate();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col space-y-4">
      <div className="page-header mb-2 flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-2">
            <Columns2 size={22} className="text-primary" /> Quy Trình Kanban
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Kéo thả để di chuyển trạng thái công việc mượt mà</p>
        </div>
        <button onClick={() => { setCreateStatus('todo'); setCreateOpen(true); }} className="btn-primary">
          <Plus size={16} /> Tạo Công Việc Mới
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 no-scrollbar">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col w-72 shrink-0">
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={cn('w-2.5 h-2.5 rounded-full', col.dot)} />
                <span className="font-bold text-xs text-[var(--text)]">{col.label}</span>
                <span className="ml-1 text-[11px] font-bold bg-gray-100 dark:bg-[#2a2a2a] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                  {col.tasks.length}
                </span>
                <button
                  onClick={() => { setCreateStatus(col.id); setCreateOpen(true); }}
                  className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-[var(--text-muted)] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Droppable Container */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 rounded-2xl p-2.5 min-h-[220px] transition-colors space-y-2.5 border border-transparent',
                      col.color,
                      snapshot.isDraggingOver && 'ring-2 ring-primary/30 border-primary/20'
                    )}
                  >
                    {col.tasks.map((task: any, i: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={i}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                'bg-[var(--surface)] rounded-xl p-3.5 shadow-soft cursor-grab active:cursor-grabbing',
                                'border border-[var(--border)] hover:shadow-card transition-all',
                                snap.isDragging && 'shadow-modal rotate-1 scale-102',
                                isOverdue(task.deadline) && task.status !== 'done' && 'border-l-4 border-l-danger rounded-l-none'
                              )}
                            >
                              <p className="text-xs font-bold text-[var(--text)] leading-snug">{task.title}</p>
                              {task.description && (
                                <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <span className={cn('badge text-[10px]', `priority-${task.priority}`)}>
                                  {getPriorityLabel(task.priority)}
                                </span>
                                {task.checklist_total > 0 && (
                                  <span className="text-[10px] font-bold text-[var(--text-muted)]">
                                    {task.checklist_done}/{task.checklist_total} mục
                                  </span>
                                )}
                                {isOverdue(task.deadline) && task.status !== 'done' && (
                                  <AlertCircle size={12} className="text-danger ml-auto" />
                                )}
                              </div>
                              {task.progress > 0 && task.status !== 'done' && (
                                <div className="mt-2.5 h-1 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                                </div>
                              )}
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { mutate(); setCreateOpen(false); }}
        defaultValues={{ status: createStatus }}
      />
    </div>
  );
}
