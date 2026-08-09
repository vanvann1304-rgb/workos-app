'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Trello, BarChart3, Bot, Sparkles,
  Pin, Clock, Plus, Flame, Sparkle, Settings, FileText, ChevronRight, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AIAssistantDrawer } from '@/components/features/AIAssistantDrawer';

const PINNED_ITEMS = [
  { href: '/', label: 'Benri Command Center', icon: LayoutDashboard, badge: 'Hot' },
  { href: '/calendar', label: 'Content Calendar', icon: Calendar },
  { href: '/kanban', label: 'Quy Trình Kanban 9 Bước', icon: Trello },
  { href: '/stats', label: 'Biểu Đồ Thống Kê KPI', icon: BarChart3 },
];

const RECENT_DOCS = [
  'Cập nhật trending AI topic',
  'Daily social media schedule',
  'Prompt AI để biên ảnh thần thái',
  'Chuẩn bị tài liệu talkshow',
  'Đánh giá proposal social media',
  'GIÁO ÁN YUKI ĐỊNH HƯỚNG',
  'Công thức hook viral triệu view',
  'Design direction Benri Hotel',
];

export function Sidebar() {
  const pathname = usePathname();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-[var(--surface)] flex flex-col justify-between hidden md:flex shrink-0 h-screen sticky top-0 z-30 shadow-sm">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                B
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm tracking-tight text-[var(--text)] group-hover:text-purple-600 transition-colors block truncate">
                  Benri Boutique Hotel
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  Content Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* AI Assistant Button */}
          <div className="p-3">
            <button
              onClick={() => setAiOpen(true)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-between shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot size={18} className="animate-bounce" />
                <span>Trợ Lý Content AI</span>
              </div>
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
            </button>
          </div>

          {/* Pinned Workflow Views */}
          <div className="px-3 py-2 space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
              <Pin size={11} className="text-purple-500" /> Pinned Command Views
            </p>
            {PINNED_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group relative',
                    active
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[#181a28]'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={cn('transition-transform group-hover:scale-110 shrink-0', active ? 'text-purple-600 dark:text-purple-400' : 'text-[var(--text-muted)]')} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-600 text-[9px] font-black uppercase">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full bg-gradient-to-b from-pink-500 to-purple-600 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Recents Documents & Topics */}
          <div className="px-3 py-3 space-y-1 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
              <Clock size={11} className="text-pink-500" /> Recents & Prompts
            </p>
            {RECENT_DOCS.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-[#181a28] cursor-pointer transition-colors group truncate"
              >
                <FileText size={13} className="text-slate-400 group-hover:text-purple-500 shrink-0" />
                <span className="truncate">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-gray-50/50 dark:bg-[#131522] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xs flex items-center justify-center shrink-0">
              QQ
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-[var(--text)] truncate">Quỳnh Quizzy</p>
              <p className="text-[9px] font-bold text-emerald-500 truncate">● Online · Content Lead</p>
            </div>
          </div>
        </div>
      </aside>

      <AIAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
