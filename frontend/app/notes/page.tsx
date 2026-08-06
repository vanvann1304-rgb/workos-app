'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Pin, Trash2, Edit3, X, Workflow, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { cn, formatTimeAgo, truncate } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const { data: notes, mutate } = useSWR('notes', () => api.notes.list());

  const filtered = notes?.filter((n: any) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const createNote = async () => {
    try {
      const note = await api.notes.create({ title: 'Ghi chú mới', content: '' });
      mutate();
      setSelectedNote(note);
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(true);
    } catch (e: any) { toast.error(e.message); }
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    try {
      await api.notes.update(selectedNote.id, { title: editTitle, content: editContent });
      mutate();
      setIsEditing(false);
      setSelectedNote((prev: any) => ({ ...prev, title: editTitle, content: editContent }));
      toast.success('Đã lưu ghi chú');
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá ghi chú này?')) return;
    try {
      await api.notes.delete(id);
      mutate();
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success('Đã xoá ghi chú');
    } catch (e: any) { toast.error(e.message); }
  };

  const togglePin = async (note: any) => {
    try {
      await api.notes.update(note.id, { pinned: !note.pinned });
      mutate();
    } catch (e: any) { toast.error(e.message); }
  };

  const selectNote = (note: any) => {
    if (isEditing && selectedNote) saveNote();
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  // Sample Workflow Pipeline template insert
  const insertWorkflowTemplate = () => {
    const template = `## 🔄 Quy Trình Sản Xuất Nội Dung (Workflow Pipeline)

Ý Tưởng → Viết Prompt → Sinh Ảnh → Render → Edit Video → Subtitle → Upload → Tối Ưu SEO → Đăng Bài → Hoàn Thành

- [ ] **Bước 1**: Lên Ý Tưởng & Kịch Bản Chi Tiết
- [ ] **Bước 2**: Viết Prompt AI & Sinh Hình Ảnh / Asset
- [ ] **Bước 3**: Render Video Mẫu & Chỉnh Sửa Âm Thanh
- [ ] **Bước 4**: Thêm Subtitle & Hiệu Ứng Chuyển Cảnh
- [ ] **Bước 5**: Upload Lên Youtube / TikTok / Facebook
- [ ] **Bước 6**: Kiểm Duyệt & Đăng Bài Đúng Khung Giờ`;
    setEditContent(prev => prev ? `${prev}\n\n${template}` : template);
    setIsEditing(true);
    toast.success('Đã chèn mẫu Workflow Pipeline vào ghi chú');
  };

  return (
    <div className="animate-fade-in flex gap-5 h-[calc(100vh-80px)]">
      {/* Sidebar List */}
      <div className={cn('flex flex-col w-full lg:w-72 shrink-0 space-y-3', selectedNote && 'hidden lg:flex')}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm ghi chú, nội dung..." className="input pl-9 text-xs font-medium"
            />
          </div>
          <button onClick={createNote} className="btn-primary px-3 py-2 shrink-0">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered?.length === 0 && (
            <div className="text-center py-10">
              <FileText size={36} className="text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-muted)]">Chưa có ghi chú nào</p>
              <button onClick={createNote} className="mt-2 text-xs text-primary font-bold hover:underline">
                + Tạo Ghi Chú Mới
              </button>
            </div>
          )}
          {filtered?.map((note: any) => (
            <motion.div
              key={note.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectNote(note)}
              className={cn(
                'p-3.5 rounded-2xl cursor-pointer transition-all group border',
                selectedNote?.id === note.id
                  ? 'bg-primary/10 border-primary/40 shadow-soft'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-primary/20'
              )}
            >
              <div className="flex items-start gap-2">
                {note.pinned && <Pin size={12} className="text-primary mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text)] truncate">{note.title || 'Ghi chú mới'}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                    {truncate(note.content?.replace(/[#*`\[\]]/g, '') || '', 70)}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2">{formatTimeAgo(note.updated_at)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); togglePin(note); }} className="p-1 hover:text-primary rounded">
                    <Pin size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }} className="p-1 hover:text-danger rounded">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor & Viewer */}
      <AnimatePresence>
        {selectedNote ? (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 card flex flex-col overflow-hidden border border-[var(--border)]"
          >
            {/* Header Toolbar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)] bg-gray-50/50 dark:bg-[#1f1f1f]">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="flex-1 text-sm font-bold bg-transparent outline-none text-[var(--text)]"
                  placeholder="Tiêu đề ghi chú..."
                />
              ) : (
                <h2 className="flex-1 text-sm font-bold text-[var(--text)] truncate">
                  {selectedNote.title || 'Ghi chú chưa đặt tên'}
                </h2>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={insertWorkflowTemplate}
                  className="btn-ghost text-xs font-semibold px-2.5 py-1.5 text-indigo-600 dark:text-indigo-400"
                  title="Chèn quy trình mẫu"
                >
                  <Workflow size={14} /> Chèn Workflow
                </button>
                {isEditing ? (
                  <button onClick={saveNote} className="btn-primary text-xs px-3 py-1.5 font-bold">
                    Lưu Ghi Chú
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-ghost text-xs px-3 py-1.5 font-bold">
                    <Edit3 size={14} /> Sửa
                  </button>
                )}
                <button onClick={() => setSelectedNote(null)} className="btn-ghost p-1.5 !rounded-lg lg:hidden">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Note Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder={`Viết nội dung ghi chú bằng Markdown...\n\n# Tiêu đề lớn\n- [ ] Mục cần làm\n- [x] Mục đã xong\n\`\`\`code\`\`\``}
                  className="w-full h-full min-h-[420px] bg-transparent text-xs text-[var(--text)] outline-none resize-none font-mono leading-relaxed"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedNote.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNote.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic">Chưa có nội dung. Nhấn nút "Sửa" để bắt đầu viết.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="text-[var(--text-muted)] opacity-30 mx-auto mb-3" />
              <p className="text-xs font-semibold text-[var(--text-muted)]">Chọn một ghi chú ở cột bên trái để xem hoặc sửa</p>
              <button onClick={createNote} className="mt-3 btn-primary text-xs font-bold">
                <Plus size={14} /> Tạo Ghi Chú Mới
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
