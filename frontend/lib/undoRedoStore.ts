import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { mutate } from 'swr';

export interface UndoAction {
  id: string;
  description: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

interface UndoRedoState {
  past: UndoAction[];
  future: UndoAction[];
  pushAction: (action: UndoAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushAction: (action: UndoAction) => {
    set(state => {
      const past = [...state.past, action];
      return {
        past,
        future: [], // Reset future on new action
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: async () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const action = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    try {
      await action.undo();
      toast.success(`↩️ Đã hoàn tác: ${action.description}`);
      // Refresh SWR caches
      mutate(key => typeof key === 'string' && key.startsWith('tasks'));
      mutate(key => typeof key === 'string' && key.startsWith('calendar'));
      mutate('stats-dashboard');

      set({
        past: newPast,
        future: [action, ...future],
        canUndo: newPast.length > 0,
        canRedo: true,
      });
    } catch (err: any) {
      toast.error('Lỗi khi hoàn tác thao tác!');
    }
  },

  redo: async () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const action = future[0];
    const newFuture = future.slice(1);

    try {
      await action.redo();
      toast.success(`↪️ Đã làm lại: ${action.description}`);
      // Refresh SWR caches
      mutate(key => typeof key === 'string' && key.startsWith('tasks'));
      mutate(key => typeof key === 'string' && key.startsWith('calendar'));
      mutate('stats-dashboard');

      set({
        past: [...past, action],
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
    } catch (err: any) {
      toast.error('Lỗi khi làm lại thao tác!');
    }
  },
}));
