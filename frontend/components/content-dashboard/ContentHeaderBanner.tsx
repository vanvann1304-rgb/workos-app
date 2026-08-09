'use client';

import { useState } from 'react';
import { Plus, FileSpreadsheet, Download, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onSyncData: () => void;
  syncTime: string;
  isSyncing: boolean;
  totalFiltered: number;
}

export function ContentHeaderBanner({
  onOpenAddModal,
  onExportCSV,
  onSyncData,
  syncTime,
  isSyncing,
  totalFiltered
}: Props) {
  const handleOpenGoogleSheet = () => {
    window.open('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit', '_blank');
    toast.info('🚀 Đang mở Google Sheet nguồn...');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-purple-500/15">
      {/* Decorative ambient glows inside header */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -top-10 w-48 h-48 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-pink-200 border border-white/20 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-300 animate-pulse" /> Content Command Center
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
              <CheckCircle2 size={12} /> Sync Status: Real-time
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            Benri Boutique Hotel — Content Command Center
          </h1>

          <p className="text-xs sm:text-sm text-purple-100/90 font-medium mt-1.5 max-w-2xl leading-relaxed">
            Content Plan Tháng 8 · đồng bộ từ Google Sheets/Docs · <span className="font-semibold text-pink-200">đã xác nhận dữ liệu Tháng 8 lúc {syncTime}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-white text-purple-900 font-extrabold text-xs hover:bg-pink-50 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={16} className="text-purple-700 font-black" />
            <span>Thêm bài viết</span>
          </button>

          <button
            onClick={handleOpenGoogleSheet}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} />
            <span>Mở Google Sheet</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Download size={15} />
            <span>Xuất Excel (CSV)</span>
          </button>

          <button
            onClick={onSyncData}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
