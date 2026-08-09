'use client';

import { motion } from 'framer-motion';
import { Trello, Plus, Sparkles } from 'lucide-react';
import { ContentItem, WORKFLOW_STAGES, STATUS_MAP, PLATFORM_MAP, PILLAR_MAP } from '@/lib/contentData';

interface Props {
  items: ContentItem[];
  onSelectPost: (post: ContentItem) => void;
  onOpenAddModal: () => void;
}

export function KanbanWorkflowBoard({ items, onSelectPost, onOpenAddModal }: Props) {
  return (
    <div className="rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Trello size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text)]">Hàng Đợi Sản Xuất (Kanban Workflow)</h2>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Quy trình 9 bước từ Ý Tưởng đến Xuất Bản</p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> Thêm bài
        </button>
      </div>

      {/* 9 Columns Horizontal Scroll Grid */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="grid grid-cols-9 gap-3 min-w-[1200px]">
          {WORKFLOW_STAGES.map((stage) => {
            const stageItems = items.filter(i => i.status === stage);
            const statusCfg = STATUS_MAP[stage] || STATUS_MAP['Idea'];

            return (
              <div
                key={stage}
                className={`rounded-2xl bg-gray-50/70 dark:bg-[#141624] p-3 border border-slate-200/60 dark:border-slate-800 border-t-4 shadow-sm flex flex-col justify-between space-y-2`}
                style={{ borderTopColor: statusCfg.dotColor }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusCfg.dotColor }} />
                    {stage}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-sm"
                    style={{ backgroundColor: `${statusCfg.dotColor}20`, color: statusCfg.dotColor }}
                  >
                    {stageItems.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-2 flex-1 min-h-[160px] max-h-[360px] overflow-y-auto no-scrollbar pt-1">
                  {stageItems.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[10px] font-semibold text-[var(--text-muted)] italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Chưa có bài
                    </div>
                  ) : (
                    stageItems.map((post) => {
                      const platformCfg = PLATFORM_MAP[post.platform] || PLATFORM_MAP['Facebook'];
                      const pillarCfg = PILLAR_MAP[post.pillar] || PILLAR_MAP['Branding'];

                      return (
                        <motion.div
                          key={post.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => onSelectPost(post)}
                          className={`p-2.5 rounded-xl bg-[var(--surface)] border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer space-y-2 hover:border-purple-400 transition-all border-l-4 ${pillarCfg.borderLeft}`}
                        >
                          <p className="text-xs font-bold text-[var(--text)] line-clamp-2 leading-snug">
                            {post.title}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] flex-wrap gap-1">
                            <span className="flex items-center gap-1">
                              <span>{platformCfg.icon}</span>
                              <span className="truncate max-w-[60px]">{post.assignee}</span>
                            </span>

                            {post.source === 'real' ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
                                Thực tế
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-slate-500/15 text-slate-500 font-medium text-[9px]">
                                Mẫu
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
