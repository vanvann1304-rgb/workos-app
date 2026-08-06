'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, Calendar, Trello, FileText,
  Repeat, Timer, BarChart3, Settings, Bot, Sparkles, Moon, Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AIAssistantDrawer } from '@/components/features/AIAssistantDrawer';

const NAV_ITEMS = [
  { href: '/', label: 'Tổng Quan (Dashboard)', icon: LayoutDashboard },
  { href: '/tasks', label: 'Quản Lý Công Việc', icon: CheckSquare },
  { href: '/calendar', label: 'Lịch Làm Việc', icon: Calendar },
  { href: '/kanban', label: 'Quy Trình Kanban', icon: Trello },
  { href: '/notes', label: 'Ghi Chú & Tài Nguyên', icon: FileText },
  { href: '/habits', label: 'Theo Dõi Thói Quen', icon: Repeat },
  { href: '/pomodoro', label: 'Tập Trung Pomodoro', icon: Timer },
  { href: '/stats', label: 'Thống Kê Hiệu Suất', icon: BarChart3 },
  { href: '/settings', label: 'Cài Đặt Hệ Thống', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between hidden md:flex shrink-0 h-screen sticky top-0 z-30 shadow-soft">
        {/* Brand Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
                W
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[var(--text)] group-hover:text-primary transition-colors">WorkOS</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Trợ Lý AI Cá Nhân</span>
              </div>
            </Link>
          </div>

          {/* AI Assistant Banner Button */}
          <div className="p-3">
            <button
              onClick={() => setAiOpen(true)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-between shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_25px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot size={18} className="animate-bounce" />
                <span>Mở Trợ Lý AI</span>
              </div>
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative',
                    active
                      ? 'bg-primary/10 text-primary font-extrabold shadow-soft'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  )}
                >
                  <Icon size={17} className={cn('transition-transform group-hover:scale-110', active ? 'text-primary' : 'text-[var(--text-muted)]')} />
                  <span>{item.label}</span>
                  {active && (
                    <div className="absolute right-0 top-1.5 bottom-1.5 w-1 rounded-l-full bg-gradient-to-b from-primary to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center">
          <p className="text-[11px] font-bold text-[var(--text-muted)]">WorkOS v2.0 · GenZ 2027 Edition</p>
        </div>
      </aside>

      <AIAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
