'use client';

import { motion } from 'framer-motion';
import { Layers, Calendar, CheckCircle, Target } from 'lucide-react';
import { ContentItem, CAMPAIGNS } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
}

export function CampaignSection({ items }: Props) {
  // Aggregate campaigns
  const campaignStats = CAMPAIGNS.map((campaignName, idx) => {
    const campaignItems = items.filter(i => i.campaign === campaignName);
    const total = campaignItems.length;
    const published = campaignItems.filter(i => i.status === 'Published').length;
    const progress = total > 0 ? Math.round((published / total) * 100) : 0;
    const hasRealData = campaignItems.some(i => i.source === 'real');

    // Accent colors alternating
    const borderTopColors = [
      'border-t-pink-500',
      'border-t-purple-500',
      'border-t-indigo-500',
      'border-t-emerald-500',
      'border-t-amber-500'
    ];

    const progressGradients = [
      'from-pink-500 to-purple-600',
      'from-purple-500 to-indigo-600',
      'from-indigo-500 to-blue-600',
      'from-emerald-400 to-teal-600',
      'from-amber-400 to-orange-500'
    ];

    return {
      name: campaignName,
      total,
      published,
      progress,
      hasRealData,
      borderTopColor: borderTopColors[idx % borderTopColors.length],
      progressGradient: progressGradients[idx % progressGradients.length],
      timeFrame: idx % 2 === 0 ? '01/08 - 31/08/2026' : '15/08 - 15/09/2026'
    };
  });

  return (
    <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Campaign Đang Chạy</h2>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Tiến độ sản xuất nội dung theo chiến dịch</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaignStats.map((c, idx) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-2xl bg-gray-50/60 dark:bg-[#161824] p-5 border border-slate-200/60 dark:border-slate-800 border-t-4 ${c.borderTopColor} shadow-sm space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-transform`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-[var(--text)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {c.name}
                </h3>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 mt-1">
                  <Calendar size={11} /> {c.timeFrame}
                </p>
              </div>

              {/* Tag Thực Tế / Minh Họa */}
              {c.hasRealData ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30 shrink-0">
                  Thực tế
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-500/30 shrink-0">
                  Minh họa
                </span>
              )}
            </div>

            {/* KPI Target & Completion Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[var(--text-muted)] flex items-center gap-1">
                  <Target size={12} className="text-purple-500" /> KPI Đạt Được
                </span>
                <span className="text-[var(--text)] font-mono font-black">
                  {c.published}/{c.total} bài ({c.progress}%)
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full bg-gradient-to-r ${c.progressGradient} rounded-full transition-all duration-500`}
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
