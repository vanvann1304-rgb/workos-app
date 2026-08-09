'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import {
  ContentItem, CAMPAIGNS, PILLARS, PLATFORMS, ASSIGNEES, WORKFLOW_STAGES
} from '@/lib/contentData';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPost: (newPost: ContentItem) => void;
}

export function ContentAddModal({ open, onClose, onAddPost }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [campaign, setCampaign] = useState(CAMPAIGNS[0]);
  const [pillar, setPillar] = useState<any>(PILLARS[0]);
  const [platform, setPlatform] = useState<any>(PLATFORMS[0]);
  const [assignee, setAssignee] = useState<any>(ASSIGNEES[0]);
  const [status, setStatus] = useState<any>('Idea');
  const [priority, setPriority] = useState<any>('Trung bình');
  const [source, setSource] = useState<'real' | 'sample'>('real');
  const [caption, setCaption] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('#khachsancouple #benriboutiquehotel');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    const tagsArr = hashtagsStr.split(' ').map(t => t.trim()).filter(Boolean);

    const newPost: ContentItem = {
      id: `cnt-${Date.now()}`,
      title: title.trim(),
      date,
      campaign,
      pillar,
      platform,
      assignee,
      status,
      priority,
      source,
      caption: caption.trim() || undefined,
      hashtags: tagsArr.length > 0 ? tagsArr : undefined,
    };

    onAddPost(newPost);
    toast.success('🎉 Đã thêm bài viết mới vào Kế hoạch!');
    setTitle('');
    setCaption('');
    onClose();
  };

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

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[var(--surface)] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                <Sparkles size={16} />
              </div>
              <h2 className="text-base font-black text-[var(--text)] uppercase tracking-wide">Thêm Bài Viết Content Mới</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-slate-800">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-black text-[var(--text)] uppercase tracking-wider mb-1">Tiêu đề bài viết (*)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: 1001 góc check-in siêu thơ tại Benri Boutique..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[var(--text)] outline-none focus:border-purple-500 transition-all"
                required
              />
            </div>

            {/* Campaign & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">CAMPAIGN</label>
                <select
                  value={campaign}
                  onChange={e => setCampaign(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">NGÀY ĐĂNG (DEADLINE)</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                />
              </div>
            </div>

            {/* Pillar, Platform, Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">PILLAR</label>
                <select
                  value={pillar}
                  onChange={e => setPillar(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">NỀN TẢNG</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">NGƯỜI PHỤ TRÁCH</label>
                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Workflow Status & Priority & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">TRẠNG THÁI (STATUS)</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  {WORKFLOW_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">ƯU TIÊN</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  <option value="Cao">Cao</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">NGUỒN DỮ LIỆU</label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none"
                >
                  <option value="real">Thực tế (Real)</option>
                  <option value="sample">Minh họa (Sample)</option>
                </select>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">CAPTION BÀI VIẾT (GHI CHÚ)</label>
              <textarea
                rows={3}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Nhập nội dung kịch bản hoặc caption nháp..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-medium text-[var(--text)] outline-none resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-1">HASHTAGS (Phân cách bằng khoảng trắng)</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={e => setHashtagsStr(e.target.value)}
                placeholder="#khachsancouple #staycation..."
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-mono text-[var(--text)] outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-gray-200 dark:bg-slate-800 text-[var(--text-muted)] font-bold text-xs hover:bg-gray-300 dark:hover:bg-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={16} /> Tạo bài viết ngay
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
