'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, Columns2, FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNav = [
  { href: '/',         label: 'Tổng Quan', icon: LayoutDashboard },
  { href: '/tasks',    label: 'Công Việc', icon: CheckSquare },
  { href: '/kanban',   label: 'Kanban',    icon: Columns2 },
  { href: '/calendar', label: 'Lịch',      icon: Calendar },
  { href: '/notes',    label: 'Ghi Chú',   icon: FileText },
];

interface Props {
  onOpenAI?: () => void;
}

export function BottomNav({ onOpenAI }: Props) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/85 glass border-t border-[var(--border)] pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex flex-col items-center gap-1 py-1 px-1 rounded-xl transition-all',
                  active
                    ? 'text-primary dark:text-accent font-semibold'
                    : 'text-[var(--text-muted)]'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px]">{label}</span>
              </motion.div>
            </Link>
          );
        })}

        <button onClick={onOpenAI} className="flex-1">
          <div className="flex flex-col items-center gap-1 py-1 px-1 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Bot size={20} />
            <span className="text-[10px] font-semibold">Trợ Lý AI</span>
          </div>
        </button>
      </div>
    </nav>
  );
}
