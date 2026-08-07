const RENDER_BACKEND_URL = 'https://workos-backend-q7bl.onrender.com';

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || RENDER_BACKEND_URL;
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

// Persistent Local Backup Key chống mất dữ liệu vĩnh viễn khi Server Render sleep/reset
const LOCAL_PERSISTENT_TASKS_KEY = 'workos_persistent_tasks_backup_v2';

function saveLocalTasksBackup(tasks: any[]) {
  if (typeof window !== 'undefined' && Array.isArray(tasks)) {
    try {
      localStorage.setItem(LOCAL_PERSISTENT_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }
}

function getLocalTasksBackup(): any[] {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(LOCAL_PERSISTENT_TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBase();
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Lỗi máy chủ (${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    console.error('Fetch error details:', err);
    throw new Error(err.message || 'Không thể kết nối máy chủ');
  }
}

// Tasks Client Persistence Manager
export const api = {
  tasks: {
    list: async (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      try {
        const serverTasks = await request<any[]>(`/tasks${q}`);
        const localBackup = getLocalTasksBackup();

        // Nếu máy chủ backend Render vừa sleep/reset trả về rỗng nhưng máy khách có dữ liệu ➔ TỰ KHÔI PHỤC VĨNH VIỄN!
        if (serverTasks.length === 0 && localBackup.length > 0) {
          console.log('🔄 Đang tự động khôi phục vĩnh viễn dữ liệu task từ Local Backup...');
          for (const oldTask of localBackup) {
            try {
              await request<any>('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                  title: oldTask.title,
                  description: oldTask.description || '',
                  deadline: oldTask.deadline || null,
                  priority: oldTask.priority || 'medium',
                  category: oldTask.category || 'Khác',
                  status: oldTask.status || 'todo',
                  color: oldTask.color || null,
                  tags: oldTask.tags || [],
                  checklist: oldTask.checklist || [],
                  attachments: oldTask.attachments || [],
                }),
              });
            } catch (e) {}
          }
          const restoredTasks = await request<any[]>(`/tasks${q}`);
          saveLocalTasksBackup(restoredTasks);
          return restoredTasks;
        }

        saveLocalTasksBackup(serverTasks);
        return serverTasks;
      } catch (err) {
        // Nếu sập mạng ➔ Trả về bản sao lưu vĩnh viễn trên thiết bị người dùng
        return getLocalTasksBackup();
      }
    },
    get: (id: string) => request<any>(`/tasks/${id}`),
    create: async (data: any) => {
      const newTask = await request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) });
      const current = getLocalTasksBackup();
      saveLocalTasksBackup([newTask, ...current.filter(t => t.id !== newTask.id)]);
      return newTask;
    },
    update: async (id: string, data: any) => {
      const updated = await request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      const current = getLocalTasksBackup();
      saveLocalTasksBackup(current.map(t => (t.id === id ? { ...t, ...updated } : t)));
      return updated;
    },
    delete: async (id: string) => {
      const res = await request<any>(`/tasks/${id}`, { method: 'DELETE' });
      const current = getLocalTasksBackup();
      saveLocalTasksBackup(current.filter(t => t.id !== id));
      return res;
    },
    
    // Checklist
    getChecklist: (id: string) => request<any[]>(`/tasks/${id}/checklist`),
    addChecklistItem: (id: string, text: string) => request<any>(`/tasks/${id}/checklist`, { method: 'POST', body: JSON.stringify({ text }) }),
    updateChecklistItem: (taskId: string, itemId: string, data: any) => request<any>(`/tasks/${taskId}/checklist/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteChecklistItem: (taskId: string, itemId: string) => request<any>(`/tasks/${taskId}/checklist/${itemId}`, { method: 'DELETE' }),
    
    // Attachments
    addAttachment: (taskId: string, data: any) => request<any>(`/tasks/${taskId}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
    deleteAttachment: (taskId: string, attachId: string) => request<any>(`/tasks/${taskId}/attachments/${attachId}`, { method: 'DELETE' }),
  },
  notes: {
    list: () => request<any[]>('/notes'),
    get: (id: string) => request<any>(`/notes/${id}`),
    create: (data: any) => request<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>('/notes', { method: 'DELETE' }),
  },
  habits: {
    list: () => request<any[]>('/habits'),
    create: (data: any) => request<any>('/habits', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/habits/${id}`, { method: 'DELETE' }),
    getLogs: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any[]>(`/habits/logs${q}`);
    },
    toggleLog: (habitId: string, date: string) => request<any>(`/habits/${habitId}/log`, { method: 'POST', body: JSON.stringify({ date }) }),
  },
  pomodoro: {
    getSessions: () => request<any[]>('/pomodoro/sessions'),
    startSession: (data: any) => request<any>('/pomodoro/sessions', { method: 'POST', body: JSON.stringify(data) }),
    completeSession: (id: string) => request<any>(`/pomodoro/sessions/${id}/complete`, { method: 'PATCH' }),
    getStats: () => request<any>('/pomodoro/stats'),
  },
  stats: {
    get: () => request<any>('/stats'),
  },
  settings: {
    get: () => request<Record<string, string>>('/settings'),
    update: (data: Record<string, string>) => request<any>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  notifications: {
    subscribe: (sub: any) => request<any>('/notifications/subscribe', { method: 'POST', body: JSON.stringify(sub) }),
    getUpcoming: () => request<any[]>('/notifications/upcoming'),
    getOverdue: () => request<any[]>('/notifications/overdue'),
  },
  backup: {
    export: () => request<any>('/backup'),
  },
};
