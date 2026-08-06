const RENDER_BACKEND_URL = 'https://workos-backend-q7bl.onrender.com';

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || RENDER_BACKEND_URL;
    return `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

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

// Tasks
export const api = {
  tasks: {
    list: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any[]>(`/tasks${q}`);
    },
    get: (id: string) => request<any>(`/tasks/${id}`),
    create: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),
    
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
    delete: (id: string) => request<any>(`/notes/${id}`, { method: 'DELETE' }),
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
