'use client';

import { Users, Hash, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TEAM_MEMBERS, BRAND_HASHTAGS, ContentItem } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
}

export function TeamAndHashtagSection({ items }: Props) {
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);

  const handleCopyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedHashtag(tag);
    toast.success(`📋 Đã sao chép hashtag: ${tag}`);
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Card: Team Overview */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Users size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Team Overview</h3>
            <p className="text-[10px] font-medium text-[var(--text-muted)]">Phân bổ nhân sự & tiến độ deadline</p>
          </div>
        </div>

        <div className="space-y-3">
          {TEAM_MEMBERS.map((member) => {
            const memberItems = items.filter(i => i.assignee === member.name);
            const totalAssigned = memberItems.length;
            const completedCount = memberItems.filter(i => i.status === 'Published').length;
            const pct = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

            // Find nearest deadline
            const activeItemsWithDate = memberItems
              .filter(i => i.status !== 'Published' && i.date)
              .sort((a, b) => a.date.localeCompare(b.date));
            const nearestDeadline = activeItemsWithDate[0]?.date || member.deadline;

            return (
              <div key={member.name} className="p-3 rounded-2xl bg-gray-50/70 dark:bg-[#161824] border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-2xl ${member.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md`}>
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-black text-[var(--text)] truncate">{member.name}</h4>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] truncate">{member.role}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-2 text-[11px] font-mono font-bold text-[var(--text)]">
                    <span>{completedCount}/{totalAssigned} bài</span>
                    <span className="text-purple-600 dark:text-purple-400">({pct}%)</span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-1 ml-auto">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>

                  <p className="text-[9px] font-semibold text-[var(--text-muted)] mt-1">
                    Deadline: <span className="text-pink-600 dark:text-pink-400 font-mono font-bold">{nearestDeadline}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Card: Thư viện Hashtag */}
      <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
            <Hash size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Thư Viện Hashtag</h3>
            <p className="text-[10px] font-medium text-[var(--text-muted)]">Bộ hashtag chính của thương hiệu (Bấm để sao chép)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {BRAND_HASHTAGS.map((tag) => {
            const isCopied = copiedHashtag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleCopyHashtag(tag)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                  isCopied
                    ? 'bg-emerald-500 text-white border-emerald-400 scale-105'
                    : 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:scale-105 active:scale-95'
                }`}
              >
                <span>{tag}</span>
                {isCopied ? <Check size={12} /> : <Copy size={11} className="opacity-60" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
