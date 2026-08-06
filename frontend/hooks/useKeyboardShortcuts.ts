'use client';

import { useEffect } from 'react';
import { useUndoRedoStore } from '@/lib/undoRedoStore';

interface Handlers {
  onNewTask?: () => void;
  onSearch?: () => void;
  onCommandK?: () => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts(handlers: Handlers = {}) {
  const { undo, redo } = useUndoRedoStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inside inputs and textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const meta = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl + Shift + Z  hoặc  Ctrl + Y  --> REDO
      if (meta && (e.shiftKey && e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl + Z --> UNDO
      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl + K --> Command Palette
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onCommandK?.();
        return;
      }

      // Single Key Shortcuts (N, /, Ctrl+D)
      if (!meta && !e.altKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          handlers.onNewTask?.();
        } else if (e.key === '/') {
          e.preventDefault();
          handlers.onSearch?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, undo, redo]);
}
