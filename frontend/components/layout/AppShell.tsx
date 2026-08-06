'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CommandPalette } from '@/components/features/CommandPalette';
import { AIAssistantDrawer } from '@/components/features/AIAssistantDrawer';
import { NotificationCenter } from '@/components/features/NotificationCenter';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUndoRedoStore } from '@/lib/undoRedoStore';
import { Bot, Search, Sparkles, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const { undo, redo, canUndo, canRedo } = useUndoRedoStore();

  useKeyboardShortcuts({
    onCommandK: () => setCommandOpen(true),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1a1e2e] text-[var(--text-muted)] hover:text-[var(--text)] text-xs font-bold border border-[var(--border)] transition-all"
            >
              <Search size={14} />
              <span>Tìm kiếm hoặc gõ lệnh...</span>
              <kbd className="hidden sm:inline-block ml-3 px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* UNDO / REDO BUTTONS ON HEADER */}
            <div className="flex items-center gap-1 bg-gray-100/60 dark:bg-[#161924] p-1 rounded-xl border border-[var(--border)]">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Hoàn tác bước vừa rồi (Ctrl + Z)"
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all',
                  canUndo
                    ? 'text-[var(--text)] hover:bg-primary/10 hover:text-primary active:scale-95'
                    : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
                )}
              >
                <Undo2 size={14} />
                <span className="hidden xl:inline text-[11px]">Undo (Ctrl+Z)</span>
              </button>

              <button
                onClick={redo}
                disabled={!canRedo}
                title="Làm lại bước vừa hoàn tác (Ctrl + Shift + Z)"
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all',
                  canRedo
                    ? 'text-[var(--text)] hover:bg-primary/10 hover:text-primary active:scale-95'
                    : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
                )}
              >
                <Redo2 size={14} />
                <span className="hidden xl:inline text-[11px]">Redo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 text-primary dark:text-accent text-xs font-extrabold border border-primary/20 transition-all"
            >
              <Bot size={15} />
              <span className="hidden sm:inline">Trợ Lý AI</span>
              <Sparkles size={12} className="text-amber-500" />
            </button>

            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav onOpenAI={() => setAiOpen(true)} />

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
