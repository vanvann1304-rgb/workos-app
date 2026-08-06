'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send, CheckCircle, Clock, Lightbulb, ListTodo, Calendar, ArrowRight, Loader2, MessageSquare, PlusCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface ScheduledProposal {
  title: string;
  hour: number;
  category: string;
  timeString: string;
}

export function AIAssistantDrawer({ open, onClose, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'chat' | 'suggest' | 'breakdown'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; proposals?: ScheduledProposal[] }>>([
    {
      sender: 'ai',
      text: '👋 Xin chào! Tôi là Trợ Lý AI của bạn.\n\nHãy nhắn cho tôi những việc bạn muốn làm hôm nay (ví dụ: *"Hôm nay làm 5 nội dung AI: 1 là Canva miễn phí, 2 là tạo video AI..."*). Tôi sẽ tự động phân bổ khung giờ hợp lý và lên lịch cho bạn ngay!'
    }
  ]);

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  // Parse natural chat input and create time proposals
  const handleSendMessage = () => {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setPrompt('');

    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    setTimeout(() => {
      // Split user input by numbers (1 là..., 2 là... or newlines)
      const rawLines = userMsg.split(/(?:\d+[\.\:\)\-]|[\n\r]+)/).map(s => s.trim()).filter(s => s.length > 2);

      let tasksFound: string[] = [];
      if (rawLines.length >= 2) {
        tasksFound = rawLines;
      } else {
        // Fallback if user typed comma separated or bullet list
        tasksFound = userMsg.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 2);
      }

      const availableHours = [8, 10, 11, 14, 15, 16, 17, 19, 20];
      const proposals: ScheduledProposal[] = tasksFound.map((item, idx) => {
        const hour = availableHours[idx % availableHours.length];
        const timeString = `${hour < 10 ? '0' : ''}${hour}:00`;
        let category = 'AI';
        if (item.toLowerCase().includes('canva') || item.toLowerCase().includes('thiết kế')) category = 'Thiết kế';
        else if (item.toLowerCase().includes('video')) category = 'Video';
        else if (item.toLowerCase().includes('seo')) category = 'SEO';
        else if (item.toLowerCase().includes('fanpage') || item.toLowerCase().includes('đăng bài')) category = 'Fanpage';

        return {
          title: item,
          hour,
          category,
          timeString,
        };
      });

      const responseText = `🤖 Tôi đã tự động phân tích và phân bổ **${proposals.length} công việc** của bạn vào khung giờ làm việc tối ưu nhất hôm nay.\n\nNhấn nút **"Áp Dụng Tất Cả Vào Lịch"** bên dưới để đẩy trực tiếp lên Lịch Time-grid!`;

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText, proposals }]);
      setLoading(false);
    }, 700);
  };

  // Bulk Apply Proposals to Database with Real Deadlines
  const handleApplyProposals = async (proposals: ScheduledProposal[]) => {
    setLoading(true);
    try {
      const today = new Date();
      for (const prop of proposals) {
        const deadline = new Date(today);
        deadline.setHours(prop.hour, 0, 0, 0);

        await api.tasks.create({
          title: prop.title,
          description: `Công việc tự động phân bổ bởi Trợ lý AI vào lúc ${prop.timeString}`,
          deadline: deadline.toISOString(),
          priority: prop.hour <= 10 ? 'high' : 'medium',
          category: prop.category,
          status: 'todo',
        });
      }

      toast.success(`🎉 Đã tạo & đẩy ${proposals.length} công việc lên Lịch Time-grid thành công!`);
      onRefresh?.();
      onClose();
    } catch (err: any) {
      toast.error('Lỗi khi áp dụng lịch tự động');
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggest = async (type: string) => {
    setLoading(true);
    setAiResponse(null);
    try {
      const tasks = await api.tasks.list();
      const overdue = tasks.filter((t: any) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
      const urgent = tasks.filter((t: any) => t.priority === 'urgent' && t.status !== 'done');

      setTimeout(() => {
        if (type === 'summary') {
          setAiResponse(`📊 **Tóm tắt Công việc Hôm nay:**\n\n- Bạn có **${tasks.length}** công việc tổng cộng.\n- **${overdue.length}** công việc đã quá hạn cần xử lý gấp.\n- **${urgent.length}** công việc mức độ Khẩn cấp.\n\n💡 *Khuyên dùng:* Hãy tập trung xử lý công việc Khẩn cấp trước 11:00 sáng!`);
        } else if (type === 'next') {
          const nextTask = urgent[0] || overdue[0] || tasks.find((t: any) => t.status === 'doing') || tasks[0];
          setAiResponse(`🚀 **Gợi ý Công việc Tiếp theo:**\n\nCông việc tối ưu nhất để thực hiện ngay lúc này là:\n👉 **"${nextTask ? nextTask.title : 'Tạo task mới cho ngày hôm nay'}"**\n\n*Lý do:* ${nextTask?.priority === 'urgent' ? 'Đây là task có mức độ ưu tiên Khẩn cấp nhất.' : 'Task này đang trong tiến trình làm việc tốt nhất.'}`);
        } else if (type === 'schedule') {
          setAiResponse(`⏰ **Lịch Trình Tối Ưu Hôm Nay:**\n\n- **08:30 - 10:30**: Tập trung cao độ (Pomodoro 25p) cho công việc chính.\n- **10:30 - 11:30**: Kiểm tra email, Fanpage và xử lý tin nhắn.\n- **14:00 - 16:00**: Thiết kế & Render Video / Nội dung.\n- **16:30 - 17:30**: Tổng kết và lên kế hoạch cho ngày mai.`);
        }
        setLoading(false);
      }, 600);
    } catch (e: any) {
      toast.error('Lỗi khi tải dữ liệu AI');
      setLoading(false);
    }
  };

  const handleBreakdownProject = () => {
    if (!projectTitle.trim()) return toast.error('Vui lòng nhập tên dự án');
    setLoading(true);
    setTimeout(() => {
      setSubtasks([
        `1. Lên ý tưởng & kịch bản chi tiết cho ${projectTitle}`,
        `2. Chuẩn bị tài nguyên hình ảnh & video mẫu`,
        `3. Thực hiện thiết kế / sản xuất nội dung`,
        `4. Kiểm duyệt chất lượng & Render sản phẩm`,
        `5. Upload & tối ưu SEO nội dung`,
        `6. Đăng bài lên Fanpage / TikTok & báo cáo`
      ]);
      setLoading(false);
    }, 600);
  };

  const handleCreateSubtasks = async () => {
    if (!projectTitle.trim() || subtasks.length === 0) return;
    try {
      await api.tasks.create({
        title: projectTitle,
        description: 'Dự án đã được AI tự động phân rã thành checklist',
        priority: 'high',
        category: 'AI',
        checklist: subtasks.map(s => s.replace(/^\d+\.\s*/, '')),
      });
      toast.success('🎉 Đã tạo Dự án kèm Checklist AI!');
      setProjectTitle('');
      setSubtasks([]);
      onRefresh?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[var(--surface)] z-50 border-l border-[var(--border)] shadow-modal flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-blue-600/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-soft text-white">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                    Trợ Lý AI Lên Lịch Tự Động <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">Nhắn mục tiêu ➔ AI tự động lên lịch khung giờ</p>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost p-1.5 !rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] bg-gray-50/50 dark:bg-[#1a1a1a]">
              {[
                { id: 'chat', label: '💬 Nhắn tin lên Lịch', icon: MessageSquare },
                { id: 'suggest', label: 'Gợi ý thông minh', icon: Lightbulb },
                { id: 'breakdown', label: 'Chia nhỏ Dự án', icon: ListTodo },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    'flex-1 py-2.5 px-2 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border-b-2',
                    activeTab === id
                      ? 'border-primary text-primary bg-[var(--surface)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                  )}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full justify-between space-y-4">
                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={cn('flex flex-col space-y-2', msg.sender === 'user' ? 'items-end' : 'items-start')}>
                        <div className={cn(
                          'p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] whitespace-pre-line shadow-soft',
                          msg.sender === 'user'
                            ? 'bg-primary text-white font-medium rounded-br-none'
                            : 'bg-gray-100 dark:bg-[#252525] text-[var(--text)] rounded-bl-none border border-[var(--border)]'
                        )}>
                          {msg.text}
                        </div>

                        {/* Proposals List Card */}
                        {msg.proposals && msg.proposals.length > 0 && (
                          <div className="w-full card p-3 border border-primary/30 bg-blue-50/20 dark:bg-blue-950/20 space-y-2">
                            <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                              <Calendar size={13} /> Khung giờ AI đề xuất cho Lịch hôm nay:
                            </p>
                            <div className="space-y-1.5">
                              {msg.proposals.map((prop, pIdx) => (
                                <div key={pIdx} className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{prop.timeString}</span>
                                    <span className="font-semibold text-[var(--text)]">{prop.title}</span>
                                  </div>
                                  <span className="text-[10px] text-[var(--text-muted)] font-medium">{prop.category}</span>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => handleApplyProposals(msg.proposals!)}
                              disabled={loading}
                              className="btn-primary w-full justify-center text-xs font-bold py-2 mt-2"
                            >
                              {loading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                              Áp Dụng Tất Cả Vào Lịch Time-grid
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-2">
                        <Loader2 size={14} className="animate-spin text-primary" />
                        <span>AI đang suy nghĩ và sắp xếp khung giờ...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Chat Box */}
                  <div className="pt-2 border-t border-[var(--border)] flex gap-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ví dụ: Hôm nay làm 5 nội dung: 1 Canva, 2 Video AI..."
                      className="input text-xs flex-1"
                    />
                    <button onClick={handleSendMessage} disabled={loading || !prompt.trim()} className="btn-primary px-4 py-2 shrink-0">
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'suggest' && (
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Thao Tác AI Nhanh</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { type: 'summary', title: 'Tóm tắt công việc hôm nay', desc: 'Phân tích tổng quan khối lượng việc & tiến độ', icon: CheckCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
                      { type: 'next', title: 'Gợi ý việc tiếp theo', desc: 'Tìm công việc quan trọng nhất cần làm ngay', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
                      { type: 'schedule', title: 'Tối ưu lịch trình', desc: 'Sắp xếp khung giờ làm việc theo năng suất', icon: Clock, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
                    ].map(({ type, title, desc, icon: Icon, color }) => (
                      <button
                        key={type}
                        onClick={() => handleAISuggest(type)}
                        disabled={loading}
                        className="flex items-start gap-3 p-3 rounded-2xl border border-[var(--border)] hover:border-primary/40 hover:shadow-card bg-[var(--surface)] text-left transition-all group"
                      >
                        <div className={cn('p-2.5 rounded-xl shrink-0', color)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text)] group-hover:text-primary transition-colors">{title}</p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </button>
                    ))}
                  </div>

                  {loading && (
                    <div className="card p-6 flex flex-col items-center justify-center gap-2 text-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <p className="text-xs font-medium text-[var(--text-muted)]">AI đang phân tích dữ liệu công việc của bạn...</p>
                    </div>
                  )}

                  {aiResponse && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-transparent dark:from-blue-950/20 border border-primary/20 space-y-2 text-xs text-[var(--text)] leading-relaxed whitespace-pre-line"
                    >
                      {aiResponse}
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'breakdown' && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Tên Dự án hoặc Mục tiêu lớn</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder="Ví dụ: Sản xuất Video Tết 2026..."
                      className="input text-xs"
                    />
                  </div>

                  <button
                    onClick={handleBreakdownProject}
                    disabled={loading || !projectTitle.trim()}
                    className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {loading ? 'AI đang tự động phân rã...' : 'Yêu cầu AI phân rã thành Checklist'}
                  </button>

                  {subtasks.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Kết quả phân rã Checklist từ AI</p>
                      <ul className="space-y-2">
                        {subtasks.map((task, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-[var(--text)] p-2.5 rounded-xl bg-gray-50 dark:bg-[#222] border border-[var(--border)] font-medium">
                            <CheckCircle size={14} className="text-success shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={handleCreateSubtasks}
                        className="btn-primary w-full justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white mt-4 text-xs font-bold"
                      >
                        Tạo Task Dự án kèm Checklist này ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
