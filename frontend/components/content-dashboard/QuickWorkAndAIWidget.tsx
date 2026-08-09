'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bot, Sparkles, CheckCircle2, Clock, AlertTriangle, Send, Calendar, Mail, FileText, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface DailyTask {
  id: string;
  title: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  date: string;
  status: 'Chưa làm' | 'Đang làm' | 'Hoàn thành';
  isOverdue?: boolean;
}

export function QuickWorkAndAIWidget() {
  const [tasks, setTasks] = useState<DailyTask[]>([
    { id: '1', title: 'Check Calendar cho Benri', priority: 'Cao', date: '2026-08-08', status: 'Chưa làm', isOverdue: true },
    { id: '2', title: 'Soạn direction cho Hannah Lash & Brows', priority: 'Trung bình', date: '2026-08-21', status: 'Chưa làm' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [filterTab, setFilterTab] = useState<'Tất cả' | 'Chưa làm' | 'Đang làm' | 'Hoàn thành'>('Tất cả');

  // AI prompt state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: DailyTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority,
      date: dueDate,
      status: 'Chưa làm',
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    toast.success('🎉 Đã thêm công việc mới hôm nay!');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Hoàn thành' ? 'Chưa làm' : 'Hoàn thành';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    toast.loading('🤖 AI đang phân tích lịch trình & công việc...');
    setTimeout(() => {
      toast.dismiss();
      setAiResponse(`🤖 **Gợi ý AI cho "${aiQuestion}":**\n- Bạn nên ưu tiên hoàn thành 2 bài đăng TikTok cho Benri Boutique trước 15:00.\n- Sau đó duyệt caption kịch bản "1001 góc check-in" do Copywriter gửi.`);
      setAiQuestion('');
    }, 800);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterTab === 'Chưa làm') return t.status === 'Chưa làm';
    if (filterTab === 'Đang làm') return t.status === 'Đang làm';
    if (filterTab === 'Hoàn thành') return t.status === 'Hoàn thành';
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 columns: Công việc hôm nay (matching screenshot 1 & 2) */}
      <div className="lg:col-span-2 rounded-3xl bg-[var(--surface)] p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-sm font-black tracking-tight text-[var(--text)] uppercase">
              Công việc hôm nay
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#151724] p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {(['Tất cả', 'Chưa làm', 'Đang làm', 'Hoàn thành'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterTab === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form thêm task inline (Matching screenshot 2) */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Tên công việc mới..."
            className="flex-1 w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[var(--text)] outline-none focus:border-purple-500 transition-all"
          />

          <select
            value={priority}
            onChange={e => setPriority(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none shrink-0"
          >
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none shrink-0"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1"
          >
            <span>Thêm</span>
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2 pt-2">
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-center py-6 text-[var(--text-muted)] italic font-semibold">Chưa có công việc nào trong danh sách này.</p>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTask(t.id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  t.status === 'Hoàn thành'
                    ? 'bg-gray-50 dark:bg-[#121420] border-slate-200/50 dark:border-slate-800/50 opacity-60 line-through'
                    : 'bg-gray-50/80 dark:bg-[#161826] border-slate-200/80 dark:border-slate-800 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={t.status === 'Hoàn thành'}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-[var(--text)] truncate">{t.title}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold">
                  {/* Priority Tag */}
                  <span className={`px-2 py-0.5 rounded-full ${
                    t.priority === 'Cao' ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400' : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {t.priority}
                  </span>

                  {/* Overdue / Date Tag */}
                  {t.isOverdue ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      Quá hạn · {t.date}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[var(--text-muted)] font-mono">
                      {t.date}
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right column: AI Assistant Card (Matching screenshot 1 & 2) */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white p-6 shadow-xl shadow-purple-500/20 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                AI Assistant <Sparkles size={13} className="text-amber-300 animate-pulse" />
              </h3>
              <p className="text-[10px] font-bold text-purple-100/80">Gợi ý ưu tiên cho hôm nay</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-50 space-y-2 leading-relaxed">
            <p>Hiện tại bạn có công việc cần theo dõi tiến độ sản xuất nội dung chiến dịch <span className="font-bold text-amber-300">Couple Staycation</span>.</p>
            <p className="text-[11px] text-purple-100/90">Gợi ý: Hãy dành 10 phút vào sáng nay để duyệt 2 kịch bản TikTok và kiểm tra lịch đăng bồn tắm sủi bọt.</p>

            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 pt-2 border-t border-white/20 text-white text-[11px]"
              >
                {aiResponse}
              </motion.div>
            )}
          </div>
        </div>

        {/* Ask AI Input */}
        <form onSubmit={handleAskAI} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
            placeholder="Hỏi AI về lịch trình hôm nay..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/20 text-xs font-semibold text-white placeholder-purple-200 outline-none backdrop-blur-md"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-white text-purple-900 font-extrabold text-xs shadow-md hover:bg-pink-50 transition-all shrink-0"
          >
            Hỏi
          </button>
        </form>
      </div>
    </div>
  );
}
