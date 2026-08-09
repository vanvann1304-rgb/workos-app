'use client';

import { motion } from 'framer-motion';
import { Copy, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { ContentItem, STATUS_MAP, PILLAR_MAP, PLATFORM_MAP } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
  onSelectPost: (post: ContentItem) => void;
  onDuplicatePost: (post: ContentItem, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export function ContentCardGrid({
  items,
  onSelectPost,
  onDuplicatePost,
  onOpenAddModal
}: Props) {
  return (
    <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Danh Sách Content</h2>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">
              <span className="font-bold text-purple-600 dark:text-purple-400">{items.length} bài viết</span> (đang lọc)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Plus size={15} /> Thêm bài viết mới
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <p className="text-sm font-bold text-[var(--text-muted)]">Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.</p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700 transition-colors"
          >
            + Thêm bài viết mới ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((post, idx) => {
            const statusCfg = STATUS_MAP[post.status] || STATUS_MAP['Idea'];
            const pillarCfg = PILLAR_MAP[post.pillar] || PILLAR_MAP['Branding'];
            const platformCfg = PLATFORM_MAP[post.platform] || PLATFORM_MAP['Facebook'];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                onClick={() => onSelectPost(post)}
                className={`rounded-2xl bg-gray-50/70 dark:bg-[#151726] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer space-y-3 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all border-l-4 ${pillarCfg.borderLeft} group relative overflow-hidden`}
              >
                {/* Status Badge & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                    {statusCfg.label}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => onDuplicatePost(post, e)}
                      className="p-1.5 rounded-xl bg-gray-200/70 dark:bg-slate-800 hover:bg-purple-500 hover:text-white text-[var(--text-muted)] transition-colors"
                      title="Nhân bản bài viết này (Duplicate)"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xs font-black text-[var(--text)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug line-clamp-2">
                  {post.title}
                </h3>

                {/* Badges: Pillar, Platform, Assignee, Date */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  {/* Pillar Badge */}
                  <span className={`px-2.5 py-0.5 rounded-xl ${pillarCfg.badgeBg}`}>
                    {post.pillar}
                  </span>

                  {/* Platform Badge */}
                  <span className={`px-2 py-0.5 rounded-xl ${platformCfg.bg} ${platformCfg.text} flex items-center gap-1`}>
                    <span>{platformCfg.icon}</span> {post.platform}
                  </span>

                  {/* Assignee */}
                  <span className="px-2 py-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-[var(--text-muted)]">
                    {post.assignee}
                  </span>

                  {/* Date */}
                  <span className="px-2 py-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-[var(--text-muted)] font-mono">
                    {post.date}
                  </span>
                </div>

                {/* Footer: Priority & Source Tag */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold">
                  <span className="text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={11} /> Ưu tiên: <span className="text-[var(--text)]">{post.priority}</span>
                  </span>

                  {post.source === 'real' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                      Thực tế
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 text-[10px] font-bold border border-slate-500/30">
                      Minh họa
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
