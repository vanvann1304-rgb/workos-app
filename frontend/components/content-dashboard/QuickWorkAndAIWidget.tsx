'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Bot, Sparkles, CheckCircle2, Clock, AlertTriangle, Send,
  Mail, FileText, Calendar as CalendarIcon, CheckSquare, Zap, AlertCircle
} from 'lucide-react';
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
    { id: '1', title: 'Check Calendar cho Benri', priority: 'Cao', date: '2026-07-10', status: 'Chưa làm', isOverdue: true },
    { id: '2', title: 'Soạn direction cho Hannah Lash & Brows', priority: 'Trung bình', date: '2026-07-21', status: 'Chưa làm' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');
  const [dueDate, setDueDate] = useState('2026-07-10');
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
      setAiResponse(`🤖 **Gợi ý AI cho "${aiQuestion}":**\n- Hãy dành 10 phút vào sáng nay để liệt kê 3-5 nhiệm vụ ưu tiên.\n- Lịch hôm nay của bạn còn trống và không có email chưa đọc.`);
      setAiQuestion('');
    }, 800);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterTab === 'Chưa làm') return t.status === 'Chưa làm';
    if (filterTab === 'Đang làm') return t.status === 'Đang làm';
    if (filterTab === 'Hoàn thành') return t.status === 'Hoàn thành';
    return true;
  });

  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'Hoàn thành').length;
  const doingCount = tasks.filter(t => t.status === 'Đang làm').length;
  const overdueCount = tasks.filter(t => t.isOverdue && t.status !== 'Hoàn thành').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Action Pills Row (Matching Screenshot 1) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)]">
              Chào buổi tối, Quỳnh 👋
            </h1>
            <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
              Chủ Nhật, 12/07/2026 - 21:11
            </p>
          </div>
        </div>

        {/* Action Pills Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toast.info('✦ Mở bảng tạo task mới!')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={15} /> Tạo Task
          </button>

          <button
            onClick={() => toast.info('✉ Chức năng gửi Email')}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#1a1c2e] text-[var(--text)] font-bold text-xs border border-purple-200/80 dark:border-slate-800 hover:bg-purple-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Mail size={14} className="text-purple-500" /> Gửi Email
          </button>

          <button
            onClick={() => toast.info('📄 Chức năng tạo Ghi chú')}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#1a1c2e] text-[var(--text)] font-bold text-xs border border-purple-200/80 dark:border-slate-800 hover:bg-purple-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileText size={14} className="text-purple-500" /> Tạo Ghi chú
          </button>

          <button
            onClick={() => toast.info('📅 Chức năng đặt lịch họp')}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#1a1c2e] text-[var(--text)] font-bold text-xs border border-purple-200/80 dark:border-slate-800 hover:bg-purple-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CalendarIcon size={14} className="text-purple-500" /> Đặt lịch họp
          </button>

          <button
            onClick={() => toast.info('✦ Trợ lý AI đang sẵn sàng!')}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#1a1c2e] text-[var(--text)] font-bold text-xs border border-purple-200/80 dark:border-slate-800 hover:bg-purple-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-500 animate-pulse" /> Hỏi AI
          </button>
        </div>
      </div>

      {/* 2. 4 Large White KPI Cards in a row (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng công việc */}
        <div className="rounded-3xl bg-white dark:bg-[#151726] p-6 border border-purple-100/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/30">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="text-4xl font-black text-[var(--text)] tracking-tight">{totalCount}</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">Tổng công việc</p>
          </div>
        </div>

        {/* Card 2: Đã hoàn thành */}
        <div className="rounded-3xl bg-white dark:bg-[#151726] p-6 border border-purple-100/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-[#a3e635] text-slate-900 flex items-center justify-center font-bold shadow-md shadow-lime-500/30">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-4xl font-black text-[var(--text)] tracking-tight">{doneCount}</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">Đã hoàn thành</p>
          </div>
        </div>

        {/* Card 3: Đang thực hiện */}
        <div className="rounded-3xl bg-white dark:bg-[#151726] p-6 border border-purple-100/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-4xl font-black text-[var(--text)] tracking-tight">{doingCount}</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">Đang thực hiện</p>
          </div>
        </div>

        {/* Card 4: Quá hạn */}
        <div className="rounded-3xl bg-white dark:bg-[#151726] p-6 border border-purple-100/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/30">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-4xl font-black text-[var(--text)] tracking-tight">{overdueCount}</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">Quá hạn</p>
          </div>
        </div>
      </div>

      {/* 3. Progress Bar Row (Matching Screenshot 1) */}
      <div className="rounded-3xl bg-white dark:bg-[#151726] p-5 border border-purple-100/60 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--text)]">Tiến độ</span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1c1e30] p-1 rounded-2xl">
            <button className="px-3 py-1 rounded-xl bg-white dark:bg-[#25283d] text-purple-600 dark:text-purple-400 font-bold text-xs shadow-sm">
              Hôm nay
            </button>
            <button className="px-3 py-1 rounded-xl text-[var(--text-muted)] font-bold text-xs hover:text-[var(--text)]">
              Tuần này
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-purple-100 dark:border-slate-800">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '0%' }} />
          </div>
          <span className="text-sm font-black text-[var(--text)] font-mono">0%</span>
        </div>
      </div>

      {/* 4. Bottom Row: Công việc hôm nay (Left 2 cols) & AI Assistant (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Công việc hôm nay */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#151726] p-6 border border-purple-100/60 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <CheckSquare size={15} />
              </div>
              <h2 className="text-sm font-black tracking-tight text-[var(--text)] uppercase">
                Công việc hôm nay
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1c1e30] p-1 rounded-2xl">
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

          {/* Form thêm task inline (Matching Screenshot 2) */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Tên công việc mới..."
              className="flex-1 w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#181a28] border border-purple-100 dark:border-slate-800 text-xs font-bold text-[var(--text)] outline-none focus:border-purple-500 transition-all"
            />

            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#181a28] border border-purple-100 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none shrink-0"
            >
              <option value="Cao">Cao</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Thấp">Thấp</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#181a28] border border-purple-100 dark:border-slate-800 text-xs font-semibold text-[var(--text)] outline-none shrink-0"
            />

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1"
            >
              <span>Thêm</span>
            </button>
          </form>

          {/* List items (Matching Screenshot 2) */}
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
                      : 'bg-gray-50/70 dark:bg-[#181a28] border-purple-100/60 dark:border-slate-800 hover:border-purple-400'
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
                    <span className={`px-2 py-0.5 rounded-full ${
                      t.priority === 'Cao' ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400' : 'bg-amber-500/15 text-amber-600'
                    }`}>
                      {t.priority}
                    </span>

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

        {/* Right 1 col: AI Assistant Card (Matching Screenshot 1 & 2) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] text-white p-6 shadow-xl shadow-purple-500/25 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                  AI Assistant <Sparkles size={13} className="text-amber-300 animate-pulse" />
                </h3>
                <p className="text-[10px] font-bold text-purple-200">Gợi ý ưu tiên cho hôm nay</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-50 space-y-2 leading-relaxed">
              <p>Hiện tại bạn chưa có công việc nào trong danh sách, vì vậy hãy bắt đầu bằng cách thêm những việc cần làm hôm nay để có thể theo dõi tiến độ.</p>
              <p className="text-[11px] text-purple-100/90">Lịch hôm nay của bạn còn trống và không có email chưa đọc, đây là cơ hội tốt để lên kế hoạch cho ngày sắp tới mà không bị gián đoạn.</p>
              <p className="text-[11px] font-semibold text-amber-200">Gợi ý: Hãy dành 10 phút vào sáng nay để liệt kê 3-5 nhiệm vụ ưu tiên, sau đó sắp xếp thứ tự theo mức độ quan trọng.</p>

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
              className="px-5 py-2.5 rounded-2xl bg-white text-purple-900 font-black text-xs shadow-md hover:bg-purple-50 transition-all shrink-0"
            >
              Hỏi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
