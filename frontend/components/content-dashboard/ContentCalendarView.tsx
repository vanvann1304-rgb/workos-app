'use client';

import { Calendar as CalendarIcon, Info } from 'lucide-react';
import { ContentItem, STATUS_MAP, PLATFORM_MAP } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
  onSelectPost: (post: ContentItem) => void;
}

export function ContentCalendarView({ items, onSelectPost }: Props) {
  // Generate August 2026 calendar days grid (7 columns: CN, T2, T3, T4, T5, T6, T7)
  // August 2026 starts on Saturday (T7 = Aug 1). So Sunday CN = July 26, etc.
  // 31 days in August 2026.
  const daysHeader = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Map dates to items for quick lookup
  const itemsByDate: Record<string, ContentItem[]> = {};
  items.forEach(item => {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
    itemsByDate[item.date].push(item);
  });

  // August 1, 2026 is Saturday (column index 6)
  // We offset days so day 1 lands under T7 (index 6)
  const calendarDays: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];
  
  // Previous month padding (July 26 - July 31) -> 6 days padding
  for (let p = 26; p <= 31; p++) {
    calendarDays.push({ dayNum: p, dateStr: `2026-07-${p}`, isCurrentMonth: false });
  }
  // August 1 to 31
  for (let d = 1; d <= 31; d++) {
    const dStr = d < 10 ? `0${d}` : `${d}`;
    calendarDays.push({ dayNum: d, dateStr: `2026-08-${dStr}`, isCurrentMonth: true });
  }
  // Next month padding (Sept 1 - Sept 5)
  for (let n = 1; n <= 5; n++) {
    const nStr = n < 10 ? `0${n}` : `${n}`;
    calendarDays.push({ dayNum: n, dateStr: `2026-09-${nStr}`, isCurrentMonth: false });
  }

  return (
    <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <CalendarIcon size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-[var(--text)] uppercase">
              Content Calendar — Tháng 8/2026
            </h2>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Info size={11} className="text-purple-500" /> Bấm vào bài viết để xem nhanh thông tin
            </p>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Days Row */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 pb-2 text-center">
            {daysHeader.map((dh) => (
              <div key={dh} className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wider py-1">
                {dh}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {calendarDays.map((cell, idx) => {
              const dayItems = itemsByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === '2026-08-09'; // Current metadata date

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] rounded-2xl p-2 border transition-all flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/30'
                        : 'bg-gray-50/50 dark:bg-[#151724] border-slate-200/60 dark:border-slate-800/80 hover:bg-purple-50/30'
                      : 'bg-gray-100/30 dark:bg-[#0e1018]/40 border-slate-200/30 dark:border-slate-900 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-[var(--text-muted)]'}`}>
                      {cell.dayNum}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Posts List inside Day Box */}
                  <div className="space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
                    {dayItems.map((item) => {
                      const statusCfg = STATUS_MAP[item.status] || STATUS_MAP['Idea'];
                      const platformCfg = PLATFORM_MAP[item.platform] || PLATFORM_MAP['Facebook'];

                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectPost(item)}
                          className={`p-1.5 rounded-xl text-[10px] font-bold text-white shadow-sm cursor-pointer hover:scale-[1.03] transition-all flex items-center justify-between gap-1 ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                          title={`${item.title} (${item.status})`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="shrink-0">{platformCfg.icon}</span>
                            <span className="truncate leading-snug">{item.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
