'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Play, Pause, RotateCcw, SkipForward, Timer,
  Volume2, VolumeX, Flame, Zap, Award
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Phase = 'work' | 'break' | 'long_break';

const PHASES: Record<Phase, { label: string; duration: number; color: string; bg: string }> = {
  work:       { label: 'Tập Trung Cao Độ', duration: 25 * 60, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  break:      { label: 'Nghỉ Ngắn (5p)',   duration: 5 * 60,  color: 'text-success', bg: 'bg-green-50 dark:bg-green-950/20' },
  long_break: { label: 'Nghỉ Dài (15p)',  duration: 15 * 60, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
};

export default function PomodoroPage() {
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(PHASES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { data: tasks } = useSWR('pomodoro-tasks', () => api.tasks.list({ status: 'doing' }));
  const { data: stats, mutate: mutateStats } = useSWR('pomodoro-stats', () => api.pomodoro.getStats());

  const playSound = (freq: number, duration = 0.3) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(); osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const playDoneSound = () => {
    [440, 550, 660].forEach((f, i) => setTimeout(() => playSound(f, 0.4), i * 200));
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionComplete = async () => {
    playDoneSound();
    toast.success(phase === 'work' ? '🎉 Xuất sắc! Phiên tập trung đã hoàn thành!' : '☕ Hết giờ nghỉ! Hãy sẵn sàng tập trung.');
    if (sessionId && phase === 'work') {
      await api.pomodoro.completeSession(sessionId).catch(() => {});
      setSessionCount(c => c + 1);
      mutateStats();
    }
    const nextPhase: Phase = phase === 'work'
      ? (sessionCount > 0 && sessionCount % 3 === 0 ? 'long_break' : 'break')
      : 'work';
    setPhase(nextPhase);
    setTimeLeft(PHASES[nextPhase].duration);
  };

  const handleStart = async () => {
    if (!isRunning && phase === 'work' && timeLeft === PHASES.work.duration) {
      try {
        const session = await api.pomodoro.startSession({
          task_id: selectedTask || null,
          duration: 25,
          type: 'work',
        });
        setSessionId(session.id);
      } catch {}
    }
    playSound(660, 0.15);
    setIsRunning(true);
  };

  const handlePause = () => {
    playSound(440, 0.1);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(PHASES[phase].duration);
    setSessionId(null);
  };

  const handleSkip = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const setPhaseManual = (p: Phase) => {
    setIsRunning(false);
    setPhase(p);
    setTimeLeft(PHASES[p].duration);
    setSessionId(null);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const progress = 1 - timeLeft / PHASES[phase].duration;
  const circumference = 2 * Math.PI * 88;

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-2">
            <Zap size={22} className="text-primary" /> Đồng Hồ Tập Trung Pomodoro
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Kỹ thuật 25 phút tập trung cao độ & 5 phút nghỉ ngơi</p>
        </div>
        <button onClick={() => setSoundEnabled(s => !s)} className="btn-ghost p-2">
          {soundEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-gray-400" />}
        </button>
      </div>

      {/* Phase selector */}
      <div className="flex bg-gray-100 dark:bg-[#2a2a2a] rounded-2xl p-1 gap-1">
        {(Object.entries(PHASES) as [Phase, any][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setPhaseManual(key)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all',
              phase === key
                ? 'bg-[var(--surface)] text-primary shadow-soft'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-60 h-60">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" strokeWidth="8" />
            <motion.circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={phase === 'work' ? '#2563eb' : phase === 'break' ? '#22c55e' : '#9333ea'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transition={{ ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold tabular-nums text-[var(--text)] tracking-tighter">
              {minutes}:{seconds}
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)] mt-1.5 uppercase tracking-wider">{PHASES[phase].label}</span>
            <div className="flex gap-1.5 mt-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={cn('w-2.5 h-2.5 rounded-full transition-all', i < sessionCount % 4 ? 'bg-primary scale-110' : 'bg-gray-200 dark:bg-[#2a2a2a]')} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handleReset} className="btn-ghost p-3.5 rounded-2xl">
          <RotateCcw size={18} />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? handlePause : handleStart}
          className="btn-primary px-10 py-3.5 rounded-2xl text-sm font-bold shadow-card flex items-center gap-2"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Tạm Dừng' : 'Bắt Đầu Tập Trung'}
        </motion.button>
        <button onClick={handleSkip} className="btn-ghost p-3.5 rounded-2xl">
          <SkipForward size={18} />
        </button>
      </div>

      {/* Select Task */}
      <div className="card p-4">
        <label className="label">Gắn phiên làm việc với Công Việc cụ thể</label>
        <select
          value={selectedTask}
          onChange={e => setSelectedTask(e.target.value)}
          className="input text-xs font-medium"
          disabled={isRunning}
        >
          <option value="">Không gắn task cụ thể</option>
          {tasks?.map((t: any) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Hôm nay', value: stats?.today_sessions || 0, sub: 'phiên hoàn thành' },
          { label: 'Tổng thời gian', value: stats?.today_minutes || 0, sub: 'phút tập trung' },
          { label: 'Tuần này', value: stats?.week_sessions || 0, sub: 'phiên đạt được' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold text-[var(--text)]">{value}</p>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">{label}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
