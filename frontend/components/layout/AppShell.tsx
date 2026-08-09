'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/features/CommandPalette';
import { AIAssistantDrawer } from '@/components/features/AIAssistantDrawer';
import { NotificationCenter } from '@/components/features/NotificationCenter';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Bot, Search, Sparkles, RefreshCw, ExternalLink, Layers, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useKeyboardShortcuts({
    onCommandK: () => setCommandOpen(true),
  });

  const handleReload = () => {
    setIsReloading(true);
    toast.info('🔄 Đang tải lại dữ liệu hệ thống...');
    setTimeout(() => {
      setIsReloading(false);
      toast.success('✅ Đã cập nhật dữ liệu Content mới nhất!');
    }, 800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/70 dark:bg-[#0c0d14] text-[var(--text)]">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-[var(--surface)] overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar matching Screenshot 5 */}
        <header className="h-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-[var(--surface)]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 text-xs font-bold">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-[var(--text)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Benri Command Center
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => setAiOpen(true)}
                className="text-[var(--text-muted)] hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
              >
                <MessageSquare size={13} /> Chat AI
              </button>
            </div>

            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-100 dark:bg-[#181a28] text-[var(--text-muted)] hover:text-[var(--text)] text-[11px] font-semibold border border-slate-200 dark:border-slate-800 transition-all"
            >
              <Search size={13} />
              <span>Tìm bài viết hoặc gõ lệnh...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-[var(--surface)] border border-slate-200 dark:border-slate-800 text-[9px] font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            <span className="hidden sm:inline">Data updated 6 hours ago</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline font-mono font-bold text-purple-600 dark:text-purple-400">Version Current</span>
            
            <button
              onClick={handleReload}
              className="hover:text-[var(--text)] flex items-center gap-1 transition-colors"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={13} className={isReloading ? 'animate-spin' : ''} /> Reload
            </button>

            <button
              onClick={() => setAiOpen(true)}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-[11px] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <Bot size={13} /> Trợ Lý AI
            </button>

            <NotificationCenter />
          </div>
        </header>

        {/* Page Content View */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </div>
      </main>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <AIAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
