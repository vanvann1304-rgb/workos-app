'use client';

import { PieChart, BarChart2, TrendingUp } from 'lucide-react';
import { ContentItem, PILLARS, PLATFORMS } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
}

export function AnalyticsChartsSection({ items }: Props) {
  const total = items.length || 1;

  // 1. Pillar distribution
  const pillarCounts = PILLARS.map(p => ({
    name: p,
    count: items.filter(i => i.pillar === p).length,
  }));
  const pillarColors = ['#a855f7', '#ec4899', '#6366f1', '#84cc16', '#10b981', '#3b82f6'];

  // 2. Platform distribution
  const platformCounts = PLATFORMS.map(pl => ({
    name: pl,
    count: items.filter(i => i.platform === pl).length,
  }));
  const maxPlatform = Math.max(...platformCounts.map(p => p.count), 1);

  // 3. Weekly performance (Tuần 1: 1-7, Tuần 2: 8-14, Tuần 3: 15-21, Tuần 4: 22-31)
  const weeklyData = [
    { week: 'Tuần 1 (1-7/8)', count: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 1 && d <= 7; }).length, done: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 1 && d <= 7 && i.status === 'Published'; }).length },
    { week: 'Tuần 2 (8-14/8)', count: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 8 && d <= 14; }).length, done: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 8 && d <= 14 && i.status === 'Published'; }).length },
    { week: 'Tuần 3 (15-21/8)', count: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 15 && d <= 21; }).length, done: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 15 && d <= 21 && i.status === 'Published'; }).length },
    { week: 'Tuần 4 (22-31/8)', count: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 22 && d <= 31; }).length, done: items.filter(i => { const d = parseInt(i.date.slice(8), 10); return d >= 22 && d <= 31 && i.status === 'Published'; }).length },
  ];
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Content theo Pillar (Donut Chart) */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 border-t-4 border-t-purple-500 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <PieChart size={15} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Content theo Pillar</h3>
        </div>

        {/* Custom SVG Donut Chart */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {pillarCounts.reduce((acc, pc, idx) => {
                const pct = (pc.count / total) * 100;
                const strokeDasharray = `${pct} ${100 - pct}`;
                const strokeDashoffset = acc.offset;
                acc.offset -= pct;
                acc.elements.push(
                  <circle
                    key={pc.name}
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={pillarColors[idx % pillarColors.length]}
                    strokeWidth="3.8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
                return acc;
              }, { offset: 0, elements: [] as JSX.Element[] }).elements}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-[var(--text)]">{total}</span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Bài viết</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 flex-1 min-w-0">
            {pillarCounts.map((pc, idx) => {
              const pct = Math.round((pc.count / total) * 100);
              return (
                <div key={pc.name} className="flex items-center justify-between text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pillarColors[idx % pillarColors.length] }} />
                    <span className="text-[var(--text)] truncate">{pc.name}</span>
                  </div>
                  <span className="text-[var(--text-muted)] font-mono font-bold shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 2: Content theo Nền tảng (Bar Chart) */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 border-t-4 border-t-pink-500 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
            <BarChart2 size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Content theo Nền Tảng</h3>
            <p className="text-[10px] font-medium text-[var(--text-muted)]">Kế hoạch tháng hiện tại</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {platformCounts.map((pl) => {
            const barWidth = Math.round((pl.count / maxPlatform) * 100);
            return (
              <div key={pl.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[var(--text)]">{pl.name}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">{pl.count} bài</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Hiệu suất thực tế theo tuần (Weekly Performance) */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 border-t-4 border-t-indigo-500 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <TrendingUp size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Hiệu Suất Thực Tế Theo Tuần</h3>
            <p className="text-[10px] font-medium text-[var(--text-muted)]">Tiến độ xuất bản theo tuần</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {weeklyData.map((w) => {
            const pct = w.count > 0 ? Math.round((w.done / w.count) * 100) : 0;
            return (
              <div key={w.week} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[var(--text)]">{w.week}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{w.done}/{w.count} bài ({pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
