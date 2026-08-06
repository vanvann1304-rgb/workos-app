'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, AlertCircle, Plus, Trash2, Tag, Link2, FileText, Image as ImageIcon, Video as VideoIcon, Palette, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultValues?: Partial<{
    title: string;
    description: string;
    deadline: string;
    category: string;
    priority: string;
    status: string;
    color: string;
  }>;
}

const CATEGORIES = ['Video', 'SEO', 'Thiết kế', 'Fanpage', 'Website', 'Khách hàng', 'Marketing', 'AI', 'Khác'];
const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'text-gray-400 bg-gray-900/60 border-gray-700' },
  { value: 'medium', label: 'Trung bình', color: 'text-blue-400 bg-blue-950/60 border-blue-800' },
  { value: 'high', label: 'Cao', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  { value: 'urgent', label: 'Khẩn cấp 🚨', color: 'text-rose-400 bg-rose-950/60 border-rose-800' },
];

const COLOR_OPTIONS = [
  { name: 'Tím Neon', value: 'bg-purple-600 dark:bg-purple-700 text-white ring-purple-400' },
  { name: 'Xanh Cyber', value: 'bg-blue-600 dark:bg-blue-700 text-white ring-blue-400' },
  { name: 'Xanh Ngọc', value: 'bg-emerald-600 dark:bg-emerald-700 text-white ring-emerald-400' },
  { name: 'Vàng Hổ Phách', value: 'bg-amber-500 dark:bg-amber-600 text-white ring-amber-300' },
  { name: 'Cam Cháy', value: 'bg-orange-600 dark:bg-orange-700 text-white ring-orange-400' },
  { name: 'Đỏ Ruby', value: 'bg-rose-600 dark:bg-rose-700 text-white ring-rose-400' },
  { name: 'Hồng Fuchsia', value: 'bg-pink-600 dark:bg-pink-700 text-white ring-pink-400' },
  { name: 'Xám Khói', value: 'bg-gray-600 dark:bg-gray-700 text-white ring-gray-400' },
];

export function TaskCreateModal({ open, onClose, onCreated, defaultValues }: TaskCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: defaultValues?.title || '',
    description: defaultValues?.description || '',
    deadline: defaultValues?.deadline || '',
    category: defaultValues?.category || 'Video',
    priority: defaultValues?.priority || 'medium',
    mediaType: 'video' as 'image' | 'video',
    color: defaultValues?.color || COLOR_OPTIONS[0].value,
    tags: [] as string[],
    checklist: [] as { text: string; completed: boolean }[],
    referenceLinks: [] as { name: string; url: string }[],
  });

  const [linkNameInput, setLinkNameInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return;
    }

    setLoading(true);
    try {
      const deadlineValue = form.deadline ? new Date(form.deadline).toISOString() : new Date(Date.now() + 3600000).toISOString();
      const task = await api.tasks.create({
        title: form.title.trim(),
        description: form.description,
        deadline: deadlineValue,
        priority: form.priority,
        category: form.category,
        color: form.color,
        status: defaultValues?.status || 'todo',
        tags: [...form.tags, form.mediaType === 'image' ? 'Ảnh' : 'Video'],
        checklist: form.checklist,
      });

      const { pushAction } = await import('@/lib/undoRedoStore').then(m => m.useUndoRedoStore.getState());
      pushAction({
        id: task.id,
        description: `Tạo công việc "${task.title}"`,
        undo: async () => { await api.tasks.delete(task.id); },
        redo: async () => { await api.tasks.create(task); },
      });

      if (form.referenceLinks.length > 0) {
        for (const item of form.referenceLinks) {
          await api.tasks.addAttachment(task.id, {
            type: 'link',
            name: item.name || item.url,
            url: item.url,
          });
        }
      }

      toast.success('🎉 Đã tạo công việc thành công!');
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-blue-500/30 bg-[#0d101f]/95 shadow-[0_0_60px_rgba(59,130,246,0.3)] p-7 text-white no-scrollbar relative"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-300">
                  Tạo Công Việc Mới
                </h2>
                <p className="text-[11px] font-bold text-gray-400">Thiết kế phong cách Luxury GenZ 2027</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-5">
            {/* Tiêu đề */}
            <div>
              <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Tiêu đề công việc (*)</label>
              <input
                type="text"
                placeholder="Ví dụ: Làm 5 nội dung Canva miễn phí..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {/* Thể loại & Danh mục */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Thể loại nội dung</label>
                <div className="flex items-center gap-2 bg-[#121526] p-1.5 rounded-2xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: 'image' })}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      form.mediaType === 'image'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon size={14} /> Hình Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mediaType: 'video' })}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      form.mediaType === 'video'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <VideoIcon size={14} /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Danh mục chính</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-black text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#161a2e] text-white">{c}</option>)}
                </select>
              </div>
            </div>

            {/* BỘ CHỌN MÀU SẮC TÙY CHỈNH (LUXURY COLOR SWATCHES BÉ ĐẸP VỪA VẶN) */}
            <div>
              <label className="block text-xs font-black text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Palette size={14} className="text-blue-400" /> Chọn Màu Sắc Thẻ Task
              </label>
              <div className="inline-flex items-center gap-2 bg-[#121526] p-2 rounded-2xl border border-gray-800 shadow-inner">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center relative cursor-pointer ${c.value.split(' ')[0]} ${
                      form.color === c.value
                        ? 'scale-110 ring-4 ring-white/80 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {form.color === c.value && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div>
              <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Mô tả chi tiết kịch bản</label>
              <textarea
                rows={4}
                placeholder="Ghi chú chi tiết kịch bản, ý tưởng nội dung cần làm..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all resize-y shadow-inner"
              />
            </div>

            {/* Link mẫu đính kèm */}
            <div>
              <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Link mẫu đính kèm</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ví dụ: Video mẫu Canva"
                  value={linkNameInput}
                  onChange={e => setLinkNameInput(e.target.value)}
                  className="w-1/3 px-3 py-2 rounded-xl bg-[#161a2e]/90 border border-gray-700/70 text-xs text-white placeholder-gray-500"
                />
                <input
                  type="url"
                  placeholder="URL link mẫu..."
                  value={linkUrlInput}
                  onChange={e => setLinkUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#161a2e]/90 border border-gray-700/70 text-xs text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (linkUrlInput.trim()) {
                      setForm({
                        ...form,
                        referenceLinks: [...form.referenceLinks, { name: linkNameInput.trim() || linkUrlInput.trim(), url: linkUrlInput.trim() }]
                      });
                      setLinkNameInput('');
                      setLinkUrlInput('');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-bold border border-blue-500/40 shrink-0 transition-all"
                >
                  + Thêm Link
                </button>
              </div>
              <div className="space-y-1.5">
                {form.referenceLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#121526] border border-gray-800">
                    <span className="font-bold truncate text-blue-400">🔗 {item.name}: <a href={item.url} target="_blank" rel="noreferrer" className="underline text-gray-300">{item.url}</a></span>
                    <button type="button" onClick={() => setForm({ ...form, referenceLinks: form.referenceLinks.filter((_, i) => i !== idx) })} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadline & Ưu tiên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-300 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Clock size={14} className="text-blue-400" /> Thời gian hoàn thành (24h)
                </label>
                <input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Mức độ ưu tiên</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-black text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  {PRIORITIES.map(p => <option key={p.value} value={p.value} className="bg-[#161a2e] text-white">{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-800/80">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-2xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-extrabold transition-all">
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? 'Đang tạo...' : '✨ Lưu Công Việc'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
