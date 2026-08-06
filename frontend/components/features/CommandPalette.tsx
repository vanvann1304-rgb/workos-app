'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckSquare, FileText, ArrowRight, Loader2, Bot } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [tasks, notes] = await Promise.all([
        api.tasks.list({ search: q }),
        api.notes.list(),
      ]);
      const filtered = [
        ...tasks.slice(0, 5).map((t: any) => ({ ...t, _type: 'task', href: `/tasks` })),
        ...notes.filter((n: any) => n.title.toLowerCase().includes(q.toLowerCase())).slice(0, 3).map((n: any) => ({ ...n, _type: 'note', href: `/notes` })),
      ];
      setResults(filtered);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selected, onClose]);

  const quickActions = [
    { label: 'Tạo công việc mới', href: '/tasks', icon: CheckSquare },
    { label: 'Tạo ghi chú mới', href: '/notes', icon: FileText },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[560px] z-50
                       bg-[var(--surface)] rounded-2xl shadow-modal border border-[var(--border)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
              {loading ? <Loader2 size={18} className="text-[var(--text-muted)] animate-spin shrink-0" />
                       : <Search size={18} className="text-primary shrink-0" />}
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm công việc, ghi chú, lệnh nhanh..."
                className="flex-1 bg-transparent text-xs font-medium text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  <X size={14} />
                </button>
              )}
              <kbd className="text-[10px] bg-[var(--border)] px-1.5 py-0.5 rounded font-mono text-[var(--text-muted)]">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() === '' ? (
                <div className="py-2">
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">Thao Tác Nhanh</p>
                  {quickActions.map(({ label, href, icon: Icon }) => (
                    <Link key={href} href={href} onClick={onClose}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon size={14} className="text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)]">{label}</span>
                        <ArrowRight size={12} className="ml-auto text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Không tìm thấy kết quả phù hợp cho "<strong>{query}</strong>"</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((item, i) => (
                    <Link key={item.id} href={item.href} onClick={onClose}>
                      <div className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                        i === selected ? 'bg-gray-100 dark:bg-[#2a2a2a]' : 'hover:bg-gray-50 dark:hover:bg-[#222]'
                      )}>
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center',
                          item._type === 'task' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
                        )}>
                          {item._type === 'task'
                            ? <CheckSquare size={14} className="text-primary" />
                            : <FileText size={14} className="text-amber-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text)] truncate">{item.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {item._type === 'task' ? `Công việc · ${item.category}` : 'Ghi chú'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 bg-gray-50/50 dark:bg-[#1f1f1f]">
              <span className="text-[10px] text-[var(--text-muted)]"><kbd className="font-mono">↑↓</kbd> Điều hướng</span>
              <span className="text-[10px] text-[var(--text-muted)]"><kbd className="font-mono">↵</kbd> Chọn</span>
              <span className="text-[10px] text-[var(--text-muted)]"><kbd className="font-mono">ESC</kbd> Đóng</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
