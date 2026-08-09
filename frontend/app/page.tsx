'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ContentItem,
  FilterState,
  getStoredContentItems,
  saveStoredContentItems
} from '@/lib/contentData';
import { ContentHeaderBanner } from '@/components/content-dashboard/ContentHeaderBanner';
import { ContentFilterBar } from '@/components/content-dashboard/ContentFilterBar';
import { KPIOverview } from '@/components/content-dashboard/KPIOverview';
import { CampaignSection } from '@/components/content-dashboard/CampaignSection';
import { ContentCalendarView } from '@/components/content-dashboard/ContentCalendarView';
import { KanbanWorkflowBoard } from '@/components/content-dashboard/KanbanWorkflowBoard';
import { AnalyticsChartsSection } from '@/components/content-dashboard/AnalyticsChartsSection';
import { TeamAndHashtagSection } from '@/components/content-dashboard/TeamAndHashtagSection';
import { ContentCardGrid } from '@/components/content-dashboard/ContentCardGrid';
import { ContentAddModal } from '@/components/content-dashboard/ContentAddModal';
import { ContentDetailModal } from '@/components/content-dashboard/ContentDetailModal';

export default function ContentPlanDashboard() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncTime, setSyncTime] = useState('21:13:18');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    campaign: 'All',
    pillar: 'All',
    platform: 'All',
    assignee: 'All',
    status: 'All',
  });

  // Load items from localStorage on mount
  useEffect(() => {
    const data = getStoredContentItems();
    setItems(data);
    setIsLoaded(true);

    const now = new Date();
    setSyncTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  // Save to localStorage when items change
  const updateItemsState = (newItems: ContentItem[]) => {
    setItems(newItems);
    saveStoredContentItems(newItems);
  };

  // Filter handler
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      campaign: 'All',
      pillar: 'All',
      platform: 'All',
      assignee: 'All',
      status: 'All',
    });
    toast.info('🧹 Đã xóa toàn bộ bộ lọc!');
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== 'All');
  }, [filters]);

  // Filter items in real-time
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.campaign !== 'All' && item.campaign !== filters.campaign) return false;
      if (filters.pillar !== 'All' && item.pillar !== filters.pillar) return false;
      if (filters.platform !== 'All' && item.platform !== filters.platform) return false;
      if (filters.assignee !== 'All' && item.assignee !== filters.assignee) return false;
      if (filters.status !== 'All' && item.status !== filters.status) return false;
      return true;
    });
  }, [items, filters]);

  // Actions
  const handleAddPost = (newPost: ContentItem) => {
    const updated = [newPost, ...items];
    updateItemsState(updated);
  };

  const handleUpdatePost = (updatedPost: ContentItem) => {
    const updated = items.map(i => (i.id === updatedPost.id ? updatedPost : i));
    updateItemsState(updated);
  };

  const handleDeletePost = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    updateItemsState(updated);
  };

  const handleDuplicatePost = (post: ContentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cloned: ContentItem = {
      ...post,
      id: `cnt-${Date.now()}`,
      title: `${post.title} (Bản sao)`,
      status: 'Idea',
    };
    const updated = [cloned, ...items];
    updateItemsState(updated);
    toast.success(`📋 Đã nhân bản bài viết "${post.title}" sang trạng thái Idea!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error('Không có dữ liệu để xuất CSV!');
      return;
    }

    const headers = ['ID', 'Tiêu đề', 'Campaign', 'Pillar', 'Platform', 'Assignee', 'Deadline', 'Trạng thái', 'Ưu tiên', 'Nguồn dữ liệu', 'Caption'];
    const rows = filteredItems.map(i => [
      i.id,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${(i.campaign || '').replace(/"/g, '""')}"`,
      i.pillar,
      i.platform,
      i.assignee,
      i.date,
      i.status,
      i.priority,
      i.source === 'real' ? 'Thực tế' : 'Minh họa',
      `"${(i.caption || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Content_Plan_Benri_Hotel_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📊 Đã xuất file CSV thành công!');
  };

  // Sync Data simulation
  const handleSyncData = () => {
    setIsSyncing(true);
    toast.loading('🔄 Đang đồng bộ dữ liệu từ Google Sheets nguồn...');

    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSyncTime(timeStr);
      toast.dismiss();
      toast.success(`✅ Đã đồng bộ dữ liệu mới nhất từ Google Sheets thành công lúc ${timeStr}!`);
    }, 1200);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[var(--text-muted)]">Đang tải Content Command Center Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Topbar Banner: Brand, Subtitle, Sync Status, Quick Actions */}
      <ContentHeaderBanner
        onOpenAddModal={() => setAddModalOpen(true)}
        onExportCSV={handleExportCSV}
        onSyncData={handleSyncData}
        syncTime={syncTime}
        isSyncing={isSyncing}
        totalFiltered={filteredItems.length}
      />

      {/* 2. Filter Bar (1 row, dropdowns + reset) */}
      <ContentFilterBar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalFilteredCount={filteredItems.length}
      />

      {/* 3. KPI Overview (4 KPI cards + Progress bar row) */}
      <KPIOverview items={filteredItems} />

      {/* 4. Active Campaigns Section */}
      <CampaignSection items={filteredItems} />

      {/* 5. Content Calendar View */}
      <ContentCalendarView
        items={filteredItems}
        onSelectPost={(post) => setSelectedPost(post)}
      />

      {/* 6. Production Pipeline (Kanban 9 columns) */}
      <KanbanWorkflowBoard
        items={filteredItems}
        onSelectPost={(post) => setSelectedPost(post)}
        onOpenAddModal={() => setAddModalOpen(true)}
      />

      {/* 7. Analytics Charts (3 cards: Pillar donut, Platform bar, Weekly performance) */}
      <AnalyticsChartsSection items={filteredItems} />

      {/* 8. Team Overview + Hashtag Library (2 cards) */}
      <TeamAndHashtagSection items={filteredItems} />

      {/* 9. Content Card Grid (3 columns, left pillar color border) */}
      <ContentCardGrid
        items={filteredItems}
        onSelectPost={(post) => setSelectedPost(post)}
        onDuplicatePost={handleDuplicatePost}
        onOpenAddModal={() => setAddModalOpen(true)}
      />

      {/* Modals */}
      <ContentAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddPost={handleAddPost}
      />

      <ContentDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdatePost={handleUpdatePost}
        onDeletePost={handleDeletePost}
        onDuplicatePost={handleDuplicatePost}
      />
    </div>
  );
}
