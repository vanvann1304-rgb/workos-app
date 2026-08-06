'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  X, CheckSquare, Square, Trash2, Plus, Calendar, Clock, Tag,
  AlertCircle, ChevronRight, User, Paperclip, MessageSquare, Play, Sparkles, Palette,
  Image as ImageIcon, Video as VideoIcon, Save
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const CATEGORIES = ['Video', 'SEO', 'Thiết kế', 'Fanpage', 'Website', 'Khách hàng', 'Marketing', 'AI', 'Khác'];
const PRIORITIES = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
  { value: 'urgent', label: 'Khẩn cấp 🚨' },
];

const COLOR_OPTIONS = [
  { name: 'Tím Neon', value: 'bg-purple-600 dark:bg-purple-700 text-white' },
  { name: 'Xanh Cyber', value: 'bg-blue-600 dark:bg-blue-700 text-white' },
  { name: 'Xanh Ngọc', value: 'bg-emerald-600 dark:bg-emerald-700 text-white' },
  { name: 'Vàng Hổ Phách', value: 'bg-amber-500 dark:bg-amber-600 text-white' },
  { name: 'Cam Cháy', value: 'bg-orange-600 dark:bg-orange-700 text-white' },
  { name: 'Đỏ Ruby', value: 'bg-rose-600 dark:bg-rose-700 text-white' },
  { name: 'Hồng Fuchsia', value: 'bg-pink-600 dark:bg-pink-700 text-white' },
  { name: 'Xám Khói', value: 'bg-gray-600 dark:bg-gray-700 text-white' },
];

export function TaskDetailPanel({
  taskId,
  onClose,
  onUpdated,
}: {
  taskId: string;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const { data: task, mutate } = useSWR(taskId ? `task-detail-${taskId}` : null, () => api.tasks.get(taskId));

  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'Video',
    priority: 'medium',
    mediaType: 'video' as 'image' | 'video',
    color: COLOR_OPTIONS[0].value,
  });

  const [newCheckItem, setNewCheckItem] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      let currentTags: string[] = [];
      if (Array.isArray(task.tags)) {
        currentTags = task.tags;
      } else if (typeof task.tags === 'string') {
        try { currentTags = JSON.parse(task.tags); } catch { currentTags = []; }
      }

      const isImg = currentTags.includes('Ảnh');
      setForm({
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        category: task.category || 'Video',
        priority: task.priority || 'medium',
        mediaType: isImg ? 'image' : 'video',
        color: task.color || COLOR_OPTIONS[0].value,
      });
    }
  }, [task]);

  if (!task) return <div className="p-6 text-center text-xs text-[var(--text-muted)]">Đang tải chi tiết công việc...</div>;

  const handleSaveField = async (updatedFields: Partial<typeof form>) => {
    setSaving(true);
    try {
      const payload: any = { ...updatedFields };
      if ('deadline' in updatedFields) {
        if (updatedFields.deadline) {
          const parsedDate = new Date(updatedFields.deadline);
          payload.deadline = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
        } else {
          payload.deadline = null;
        }
      }
      // Loại bỏ mediaType khỏi payload gửi backend vì thể loại lưu dạng tags
      delete payload.mediaType;

      await api.tasks.update(taskId, payload);
      toast.success('🎉 Đã lưu thay đổi!');
      mutate();
      onUpdated?.();
    } catch (err: any) {
      console.error('Task update error:', err);
      toast.error('Lỗi khi cập nhật công việc');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMediaType = async (type: 'image' | 'video') => {
    setForm(prev => ({ ...prev, mediaType: type }));
    try {
      let currentTags: string[] = [];
      if (Array.isArray(task.tags)) {
        currentTags = task.tags;
      } else if (typeof task.tags === 'string') {
        try { currentTags = JSON.parse(task.tags); } catch { currentTags = []; }
      }

      const filteredTags = currentTags.filter((t: string) => t !== 'Ảnh' && t !== 'Video');
      const newTag = type === 'image' ? 'Ảnh' : 'Video';
      const updatedTags = [...filteredTags, newTag];

      await api.tasks.update(taskId, { tags: updatedTags });
      toast.success(`🎉 Đã đổi thể loại sang ${type === 'image' ? 'Hình Ảnh' : 'Video'}!`);
      mutate();
      onUpdated?.();
    } catch (err: any) {
      console.error('Media type error:', err);
      toast.error('Lỗi khi đổi thể loại công việc');
    }
  };

  const handleToggleChecklist = async (itemId: string, completed: boolean) => {
    try {
      await api.tasks.updateChecklistItem(taskId, itemId, { completed });
      mutate();
      onUpdated?.();
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật checklist');
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    try {
      await api.tasks.addChecklistItem(taskId, newCheckItem.trim());
      setNewCheckItem('');
      mutate();
      onUpdated?.();
    } catch (err: any) {
      toast.error('Lỗi khi thêm checklist');
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;
    try {
      await api.tasks.addAttachment(taskId, {
        type: 'link',
        name: newLinkName.trim() || newLinkUrl.trim(),
        url: newLinkUrl.trim(),
      });
      setNewLinkName('');
      setNewLinkUrl('');
      mutate();
      onUpdated?.();
    } catch (err: any) {
      toast.error('Lỗi khi thêm link mẫu');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    try {
      await api.tasks.delete(taskId);
      toast.success('Đã xóa công việc');
      onClose();
      onUpdated?.();
    } catch (err: any) {
      toast.error('Lỗi khi xóa công việc');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e1b] text-white overflow-y-auto no-scrollbar border-l border-blue-500/20">
      {/* Top Header Bar */}
      <div className="p-5 border-b border-gray-800/80 flex items-center justify-between sticky top-0 bg-[#0b0e1b]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 uppercase tracking-wider">
            Chi Tiết Công Việc
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors" title="Xóa task">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Form — ĐỒNG BỘ 100% ĐẦY ĐỦ NHƯ HÌNH 3 */}
      <div className="p-6 space-y-5 flex-1">
        {/* Tiêu đề công việc */}
        <div>
          <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Tiêu đề công việc (*)</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onBlur={() => handleSaveField({ title: form.title })}
            className="w-full px-4 py-3 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-sm font-black text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Thể loại nội dung & Danh mục chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Thể loại nội dung</label>
            <div className="flex items-center gap-2 bg-[#121526] p-1.5 rounded-2xl border border-gray-800">
              <button
                type="button"
                onClick={() => handleToggleMediaType('image')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                  form.mediaType === 'image'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon size={13} /> Hình Ảnh
              </button>
              <button
                type="button"
                onClick={() => handleToggleMediaType('video')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                  form.mediaType === 'video'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <VideoIcon size={13} /> Video
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Danh mục chính</label>
            <select
              value={form.category}
              onChange={e => { setForm({ ...form, category: e.target.value }); handleSaveField({ category: e.target.value }); }}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-black text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#161a2e] text-white">{c}</option>)}
            </select>
          </div>
        </div>

        {/* BỘ CHỌN MÀU SẮC THẺ TASK (BÉ ĐẸP VỪA VẶN 100%) */}
        <div>
          <label className="block text-xs font-black text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Palette size={14} className="text-blue-400" /> Chọn Màu Sắc Thẻ Task
          </label>
          <div className="inline-flex items-center gap-2 bg-[#121526] p-2 rounded-2xl border border-gray-800 shadow-inner">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => { setForm({ ...form, color: c.value }); handleSaveField({ color: c.value }); }}
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

        {/* Mô tả chi tiết kịch bản */}
        <div>
          <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Mô tả chi tiết kịch bản</label>
          <textarea
            rows={4}
            placeholder="Ghi chú chi tiết kịch bản, nội dung công việc..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            onBlur={() => handleSaveField({ description: form.description })}
            className="w-full px-4 py-3 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-y shadow-inner"
          />
        </div>

        {/* Link mẫu đính kèm */}
        <div>
          <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Link mẫu đính kèm</label>
          <div className="space-y-2 mb-2">
            {task.attachments?.map((att: any) => (
              <div key={att.id} className="p-2.5 rounded-xl bg-[#121526] border border-gray-800 flex items-center justify-between text-xs font-bold">
                <span className="truncate text-blue-400">🔗 {att.name}: <a href={att.url} target="_blank" rel="noreferrer" className="underline text-gray-300">{att.url}</a></span>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddLink} className="flex gap-2">
            <input
              type="text"
              placeholder="Tên link..."
              value={newLinkName}
              onChange={e => setNewLinkName(e.target.value)}
              className="w-1/3 px-3 py-2 rounded-xl bg-[#161a2e]/90 border border-gray-700/70 text-xs text-white placeholder-gray-500"
            />
            <input
              type="url"
              placeholder="URL link mẫu..."
              value={newLinkUrl}
              onChange={e => setNewLinkUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#161a2e]/90 border border-gray-700/70 text-xs text-white placeholder-gray-500"
            />
            <button type="submit" className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-bold border border-blue-500/40 shrink-0 transition-all">
              + Thêm
            </button>
          </form>
        </div>

        {/* Deadline 24h & Mức độ ưu tiên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-300 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Clock size={14} className="text-blue-400" /> Thời gian hoàn thành (24h)
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => { setForm({ ...form, deadline: e.target.value }); handleSaveField({ deadline: e.target.value }); }}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Mức độ ưu tiên</label>
            <select
              value={form.priority}
              onChange={e => { setForm({ ...form, priority: e.target.value }); handleSaveField({ priority: e.target.value }); }}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#161a2e]/90 border border-gray-700/70 text-xs font-black text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {PRIORITIES.map(p => <option key={p.value} value={p.value} className="bg-[#161a2e] text-white">{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* Checklist công việc con */}
        <div>
          <label className="block text-xs font-black text-gray-300 mb-1.5 uppercase tracking-wider">Checklist Công Việc Con</label>
          <div className="space-y-2 mb-2">
            {task.checklist?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id, !item.completed)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121526] hover:bg-gray-800/80 cursor-pointer text-xs font-bold transition-colors border border-gray-800"
              >
                {item.completed ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} className="text-gray-400" />}
                <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-200'}>{item.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddChecklist} className="flex gap-2">
            <input
              type="text"
              placeholder="Thêm mục checklist con..."
              value={newCheckItem}
              onChange={e => setNewCheckItem(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-[#161a2e]/90 border border-gray-700/70 text-xs text-white placeholder-gray-500"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-bold border border-blue-500/40 shrink-0 transition-all">
              + Thêm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
