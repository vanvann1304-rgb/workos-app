'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Sparkles, Send } from 'lucide-react';
import { ContentItem } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
}

export function KPIOverview({ items }: Props) {
  const total = items.length;
  const publishedCount = items.filter(i => i.status === 'Published').length;
  
  // Doing = Idea, Research, Outline, Writing, Design
  const doingCount = items.filter(i => ['Idea', 'Research', 'Outline', 'Writing', 'Design'].includes(i.status)).length;
  
  // Pending review/approval = Review, Approved, Scheduled
  const pendingCount = items.filter(i => ['Review', 'Approved', 'Scheduled'].includes(i.status)).length;

  const completionRate = total > 0 ? Math.round((publishedCount / total) * 100) : 0;

  // Overdue check: deadline in past and not Published
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = items.filter(i => i.date && i.date < todayStr && i.status !== 'Published').length;

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards in a single row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white p-6 shadow-lg shadow-purple-500/15 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-200">TỔNG BÀI VIẾT</span>
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{total}</span>
            <span className="text-xs font-semibold text-pink-200">Tháng 8</span>
          </div>
        </div>

        {/* Card 2: Published / Hoàn thành */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-400 via-emerald-500 to-green-600 text-white p-6 shadow-lg shadow-emerald-500/15 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-lime-100">HOÀN THÀNH</span>
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{publishedCount}</span>
            <span className="text-xs font-semibold text-lime-100">đã publish</span>
          </div>
        </div>

        {/* Card 3: Doing / Đang thực hiện */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600 text-white p-6 shadow-lg shadow-blue-500/15 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-100">ĐANG THỰC HIỆN</span>
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{doingCount}</span>
            <span className="text-xs font-semibold text-blue-100">idea → design</span>
          </div>
        </div>

        {/* Card 4: Pending / Chờ duyệt */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 shadow-lg shadow-purple-500/15 group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-200">CHỜ DUYỆT</span>
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Send size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{pendingCount}</span>
            <span className="text-xs font-semibold text-purple-200">review/approved</span>
          </div>
        </div>
      </div>

      {/* Completion Rate Full-width Row */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Tỷ Lệ Hoàn Thành Kế Hoạch</h3>
              {overdueCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle size={13} />
                  <span>⚠ {overdueCount} bài quá hạn</span>
                </span>
              )}
            </div>

            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{completionRate}%</span>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full h-4 bg-gray-100 dark:bg-[#161824] rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-emerald-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
