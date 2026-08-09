'use client';

import { Filter, RotateCcw } from 'lucide-react';
import { CAMPAIGNS, PILLARS, PLATFORMS, ASSIGNEES, WORKFLOW_STAGES, FilterState } from '@/lib/contentData';

interface Props {
  filters: FilterState;
  onChangeFilter: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount: number;
}

export function ContentFilterBar({
  filters,
  onChangeFilter,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount
}: Props) {
  return (
    <div className="rounded-3xl bg-[var(--surface)] p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Filter size={14} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Bộ lọc nhanh (Real-time Filter)</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold">
            {totalFilteredCount} bài viết
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 dark:text-pink-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Campaign Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">CAMPAIGN</label>
          <select
            value={filters.campaign}
            onChange={(e) => onChangeFilter('campaign', e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-gray-50 dark:bg-[#181a26] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="All">Tất cả Campaign</option>
            {CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Pillar Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">PILLAR</label>
          <select
            value={filters.pillar}
            onChange={(e) => onChangeFilter('pillar', e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-gray-50 dark:bg-[#181a26] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="All">Tất cả Pillar</option>
            {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">NỀN TẢNG</label>
          <select
            value={filters.platform}
            onChange={(e) => onChangeFilter('platform', e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-gray-50 dark:bg-[#181a26] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="All">Tất cả Nền tảng</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">PHỤ TRÁCH</label>
          <select
            value={filters.assignee}
            onChange={(e) => onChangeFilter('assignee', e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-gray-50 dark:bg-[#181a26] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="All">Tất cả Người phụ trách</option>
            {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">TRẠNG THÁI</label>
          <select
            value={filters.status}
            onChange={(e) => onChangeFilter('status', e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-gray-50 dark:bg-[#181a26] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="All">Tất cả Trạng thái</option>
            {WORKFLOW_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
