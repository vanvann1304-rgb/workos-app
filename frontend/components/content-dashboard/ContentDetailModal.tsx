'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2, Save, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import {
  ContentItem, WORKFLOW_STAGES, STATUS_MAP, PILLAR_MAP, PLATFORM_MAP, ASSIGNEES, CAMPAIGNS
} from '@/lib/contentData';
import { toast } from 'sonner';

interface Props {
  post: ContentItem | null;
  onClose: () => void;
  onUpdatePost: (updated: ContentItem) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: ContentItem) => void;
}

export function ContentDetailModal({
  post,
  onClose,
  onUpdatePost,
  onDeletePost,
  onDuplicatePost
}: Props) {
  const [form, setForm] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (post) setForm({ ...post });
  }, [post]);

  if (!post || !form) return null;

  const handleSave = () => {
    onUpdatePost(form);
    toast.success('🎉 Đã cập nhật bài viết thành công!');
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa bài viết "${post.title}"?`)) {
      onDeletePost(post.id);
      toast.success('🗑️ Đã xóa bài viết khỏi Kế hoạch!');
      onClose();
    }
  };

  const statusCfg = STATUS_MAP[form.status] || STATUS_MAP['Idea'];
  const pillarCfg = PILLAR_MAP[form.pillar] || PILLAR_MAP['Branding'];
  const platformCfg = PLATFORM_MAP[form.platform] || PLATFORM_MAP['Facebook'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[var(--surface)] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>

                <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold ${pillarCfg.badgeBg}`}>
                  {form.pillar}
                </span>

                <span className={`px-2 py-0.5 rounded-xl text-[10px] font-bold ${platformCfg.bg} ${platformCfg.text}`}>
                  {platformCfg.icon} {form.platform}
                </span>

                {form.source === 'real' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                    Thực tế
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-500 text-[10px] font-bold border border-slate-500/30">
                    Minh họa
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-[var(--text)] leading-snug pt-1">
                {form.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onDuplicatePost(post)}
                className="p-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                title="Nhân bản bài viết này"
              >
                <Copy size={16} />
              </button>

              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Xóa bài viết"
              >
                <Trash2 size={16} />
              </button>

              <button onClick={onClose} className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">
            {/* Title edit */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">TIÊU ĐỀ BÀI VIẾT</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[var(--text)] outline-none"
              />
            </div>

            {/* Campaign & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">CAMPAIGN</label>
                <select
                  value={form.campaign}
                  onChange={e => setForm({ ...form, campaign: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">DEADLINE (NGÀY ĐĂNG)</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                />
              </div>
            </div>

            {/* Workflow Stage Select */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">GIAI ĐOẠN (STATUS)</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {WORKFLOW_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">PHỤ TRÁCH</label>
                <select
                  value={form.assignee}
                  onChange={e => setForm({ ...form, assignee: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">MỨC ƯU TIÊN</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  <option value="Cao">Cao</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">CAPTION / KỊCH BẢN NỘI DUNG</label>
              <textarea
                rows={4}
                value={form.caption || ''}
                onChange={e => setForm({ ...form, caption: e.target.value })}
                placeholder="Chưa có kịch bản chi tiết..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-medium text-[var(--text)] outline-none resize-y"
              />
            </div>

            {/* Hashtags display */}
            {form.hashtags && form.hashtags.length > 0 && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">HASHTAGS</label>
                <div className="flex flex-wrap gap-1.5">
                  {form.hashtags.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold border border-purple-200 dark:border-purple-800">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 flex items-center gap-1.5"
            >
              <Trash2 size={15} /> Xóa bài
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-gray-200 dark:bg-slate-800 text-[var(--text-muted)] font-bold text-xs hover:bg-gray-300 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
