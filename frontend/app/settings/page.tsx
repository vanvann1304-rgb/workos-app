'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Bell, Download, Upload, Palette, Settings as SettingsIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: settings, mutate } = useSWR('settings', () => api.settings.get());
  const [exporting, setExporting] = useState(false);

  const updateSetting = async (key: string, value: string) => {
    try {
      await api.settings.update({ [key]: value });
      mutate();
      toast.success('Đã cập nhật cài đặt');
    } catch (e: any) { toast.error(e.message); }
  };

  const exportBackup = async () => {
    setExporting(true);
    try {
      const data = await api.backup.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workos-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('🎉 Đã xuất dữ liệu Backup thành công!');
    } catch (e: any) { toast.error(e.message); }
    finally { setExporting(false); }
  };

  const THEME_OPTIONS = [
    { value: 'light', label: 'Chế độ Sáng', icon: Sun },
    { value: 'dark', label: 'Chế độ Tối', icon: Moon },
    { value: 'system', label: 'Theo Hệ Thống', icon: Monitor },
  ] as const;

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold flex items-center gap-2">
          <SettingsIcon size={22} className="text-primary" /> Cài Đặt Hệ Thống
        </h1>
        <p className="text-xs text-[var(--text-muted)]">Tùy chỉnh giao diện, thông báo và sao lưu dữ liệu cá nhân</p>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
              <Palette size={16} className="text-primary" />
            </div>
            <h2 className="font-bold text-sm text-[var(--text)]">Giao Diện & Chế Độ Màn Hình</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  theme === value
                    ? 'border-primary bg-primary/5 text-primary shadow-soft'
                    : 'border-[var(--border)] hover:border-gray-300 dark:hover:border-[#333] text-[var(--text-muted)]'
                )}
              >
                <Icon size={22} />
                <span className="text-xs font-bold">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
              <Bell size={16} className="text-primary" />
            </div>
            <h2 className="font-bold text-sm text-[var(--text)]">Cấu Hình Thông Báo & Âm Thanh</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'notification_enabled', label: 'Thông báo Push Notification', desc: 'Nhận cảnh báo khi công việc sắp đến hạn hoặc quá hạn' },
              { key: 'sound_enabled', label: 'Âm thanh nhắc nhở', desc: 'Phát âm thanh thông báo khi đến hạn và kết thúc Pomodoro' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-none">
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">{label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => updateSetting(key, settings?.[key] === '1' ? '0' : '1')}
                  className={cn(
                    'w-11 h-6 rounded-full transition-all relative shrink-0',
                    settings?.[key] === '1' ? 'bg-primary' : 'bg-gray-200 dark:bg-[#2a2a2a]'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-all',
                    settings?.[key] === '1' ? 'left-[22px]' : 'left-0.5'
                  )} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pomodoro Config */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <h2 className="font-bold text-sm text-[var(--text)] mb-4">⏱ Cấu Hình Thời Gian Pomodoro</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'pomodoro_work', label: 'Tập trung (phút)' },
              { key: 'pomodoro_break', label: 'Nghỉ ngắn (phút)' },
              { key: 'pomodoro_long_break', label: 'Nghỉ dài (phút)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  min={1} max={60}
                  defaultValue={settings?.[key] || '25'}
                  onBlur={e => updateSetting(key, e.target.value)}
                  className="input text-center font-extrabold text-sm"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Backup Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
              <Download size={16} className="text-primary" />
            </div>
            <h2 className="font-bold text-sm text-[var(--text)]">Sao Lưu & Khôi Phục Dữ Liệu</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={exportBackup} disabled={exporting} className="btn-ghost flex-1 justify-center text-xs font-bold">
              <Download size={15} />
              {exporting ? 'Đang xuất file...' : 'Xuất File Backup (JSON)'}
            </button>
            <button
              onClick={() => toast.info('Tính năng Import sẽ tự động đồng bộ từ file JSON')}
              className="btn-ghost flex-1 justify-center text-xs font-bold"
            >
              <Upload size={15} /> Nhập File Backup
            </button>
          </div>
        </motion.div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs font-bold text-[var(--text-muted)]">WorkOS v1.0.0 · Personal Productivity System</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Dữ liệu được lưu trữ an toàn tại SQLite Localhost</p>
        </div>
      </div>
    </div>
  );
}
