# PROJECT_HANDOFF.md
# Personal Productivity System — Project Handoff Document

> 📌 **AI PHẢI ĐỌC FILE NÀY TRƯỚC KHI BẮT ĐẦU BẤT KỲ TASK NÀO**
> 📌 **AI PHẢI CẬP NHẬT FILE NÀY SAU KHI HOÀN THÀNH MỖI TASK**

---

## Thông tin dự án

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | Personal Productivity System |
| **Mô tả** | Trợ lý công việc AI cá nhân — quản lý toàn bộ quy trình làm việc hằng ngày |
| **Ngày bắt đầu** | 2026-08-06 |
| **Phong cách** | Apple + Linear — Premium, Tối giản, Hiện đại, Mượt |
| **Thư mục gốc** | `C:\Users\Administrator\.gemini\antigravity\scratch\productivity-system` |

---

## Stack công nghệ

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | SQLite (better-sqlite3) |
| **Icons** | Lucide React |
| **Font** | Inter (Google Fonts) |
| **PWA** | Service Worker, Web Push, Background Sync |
| **Animation** | Framer Motion |

---

## Cấu trúc thư mục (dự kiến)

```
/productivity-system
├── AI_GUIDELINES.md          ← Quy tắc AI
├── PROJECT_HANDOFF.md        ← File này
├── /frontend                 ← Next.js 14
│   ├── /app
│   │   ├── layout.tsx
│   │   ├── page.tsx          ← Dashboard
│   │   ├── /tasks
│   │   ├── /calendar
│   │   ├── /kanban
│   │   ├── /notes
│   │   ├── /habits
│   │   ├── /pomodoro
│   │   ├── /stats
│   │   └── /settings
│   ├── /components
│   │   ├── /ui               ← Design system components
│   │   ├── /layout           ← Sidebar, BottomNav, Header
│   │   └── /features         ← Feature-specific components
│   ├── /hooks
│   ├── /lib
│   ├── /public
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   └── /icons
│   ├── tailwind.config.ts
│   └── package.json
└── /backend                  ← Express API
    ├── /src
    │   ├── /routes
    │   ├── /models
    │   ├── /middleware
    │   └── /database
    ├── database.sqlite
    └── package.json
```

---

## Design System

### Màu sắc

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background | `#fafafa` | `#111111` |
| Surface | `#ffffff` | `#1a1a1a` |
| Border | `#e5e7eb` | `#2a2a2a` |
| Primary | `#2563eb` | `#3b82f6` |
| Text | `#111111` | `#f5f5f5` |
| Muted | `#6b7280` | `#9ca3af` |
| Danger | `#ef4444` | `#f87171` |
| Success | `#22c55e` | `#4ade80` |

### Quy tắc thiết kế
- Font: Inter
- Icons: Lucide React
- Border radius: `rounded-xl` (12px), `rounded-2xl` (16px)
- Shadow: nhẹ, không rậm rạp
- Animation: Framer Motion, nhẹ nhàng, 60fps
- Khoảng trắng: rộng rãi
- Không dùng quá nhiều màu
- Không popup liên tục
- Không nhiều nút, nhiều menu

---

## Database Schema

### Bảng `tasks`
| Column | Type | Ghi chú |
|--------|------|---------|
| id | TEXT | UUID |
| title | TEXT | Tiêu đề |
| description | TEXT | Mô tả |
| deadline | DATETIME | Hạn chót |
| priority | TEXT | low / medium / high / urgent |
| category | TEXT | Video / SEO / Thiết kế / Fanpage / Website / Khách hàng / Marketing / AI / Khác |
| status | TEXT | todo / doing / waiting / done / cancelled |
| progress | INTEGER | 0–100 |
| assignee | TEXT | Người thực hiện |
| tags | TEXT | JSON array |
| workflow | TEXT | JSON array |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Bảng `checklist_items`
| Column | Type |
|--------|------|
| id | TEXT |
| task_id | TEXT |
| text | TEXT |
| completed | BOOLEAN |
| order | INTEGER |

### Bảng `activity_logs`
| Column | Type |
|--------|------|
| id | TEXT |
| task_id | TEXT |
| action | TEXT |
| detail | TEXT |
| created_at | DATETIME |

### Bảng `attachments`
| Column | Type | Ghi chú |
|--------|------|---------|
| id | TEXT | |
| task_id | TEXT | |
| type | TEXT | file / link |
| name | TEXT | |
| url | TEXT | |
| created_at | DATETIME | |

### Bảng `notes`
| Column | Type |
|--------|------|
| id | TEXT |
| title | TEXT |
| content | TEXT (Markdown) |
| tags | TEXT |
| created_at | DATETIME |
| updated_at | DATETIME |

### Bảng `habits`
| Column | Type | Ghi chú |
|--------|------|---------|
| id | TEXT | |
| name | TEXT | |
| icon | TEXT | |
| repeat | TEXT | daily / weekly / monthly / yearly |
| target_days | TEXT | JSON array |
| created_at | DATETIME | |

### Bảng `habit_logs`
| Column | Type |
|--------|------|
| id | TEXT |
| habit_id | TEXT |
| date | DATE |
| completed | BOOLEAN |

### Bảng `pomodoro_sessions`
| Column | Type |
|--------|------|
| id | TEXT |
| task_id | TEXT |
| duration | INTEGER |
| started_at | DATETIME |
| ended_at | DATETIME |

### Bảng `reminders`
| Column | Type |
|--------|------|
| id | TEXT |
| task_id | TEXT |
| remind_at | DATETIME |
| sent | BOOLEAN |

---

## Keyboard Shortcuts

| Phím | Hành động |
|------|-----------|
| `N` | Tạo task mới |
| `/` | Focus search |
| `Ctrl+K` | Command palette |
| `Ctrl+D` | Toggle dark mode |
| `Escape` | Đóng panel/modal |

---

## Trạng thái các Phase

| Phase | Tên | Trạng thái | Files đã tạo |
|-------|-----|------------|-------------|
| 1 | Core Foundation | ✅ Hoàn thành | `package.json`, `backend/src/index.ts`, `backend/src/database/init.ts`, `frontend/app/layout.tsx` |
| 2 | Dashboard | ✅ Hoàn thành | `frontend/app/page.tsx` |
| 3 | Task Management | ✅ Hoàn thành | `frontend/app/tasks/page.tsx`, `TaskCreateModal.tsx`, `TaskDetailPanel.tsx` |
| 4 | Views (Kanban/Calendar/Timeline) | ✅ Hoàn thành | `frontend/app/kanban/page.tsx`, `frontend/app/calendar/page.tsx` |
| 5 | Notes & Workflow | ✅ Hoàn thành | `frontend/app/notes/page.tsx` |
| 6 | Productivity Tools | ✅ Hoàn thành | `frontend/app/pomodoro/page.tsx`, `frontend/app/habits/page.tsx` |
| 7 | AI Assistant & Command Palette | ✅ Hoàn thành | `frontend/components/features/CommandPalette.tsx` |
| 8 | Notifications & Reminders | ✅ Hoàn thành | `backend/src/routes/notifications.ts`, `frontend/public/sw.js` |
| 9 | Search & Filter | ✅ Hoàn thành | `frontend/hooks/useKeyboardShortcuts.ts` |
| 10 | Settings & Security | ✅ Hoàn thành | `frontend/app/settings/page.tsx`, `frontend/app/stats/page.tsx` |

---

## Task Log (Lịch sử công việc)

### ✅ Đã hoàn thành
| Ngày | Task | Ghi chú |
|------|------|---------|
| 2026-08-06 | Tạo Implementation Plan | File: `implementation_plan.md` |
| 2026-08-06 | Tạo AI_GUIDELINES.md | Quy tắc bắt buộc cho AI |
| 2026-08-06 | Tạo PROJECT_HANDOFF.md | Handoff documentation |
| 2026-08-06 | Setup Monorepo Frontend & Backend | Next.js 14 + Express + SQLite |
| 2026-08-06 | Chuyển SQLite driver từ better-sqlite3 sang sqlite3 | Khắc phục lỗi native build Node 24 Windows |
| 2026-08-06 | Xây dựng full UI & API (Phases 1 - 10) | Verified build 100% thành công |
| 2026-08-06 | Nâng cấp Full UI Tiếng Việt 100% & Trợ Lý AI Panel | Cập nhật Trợ lý AI, Daily Planner, Eisenhower, Notification Center |
| 2026-08-06 | Nâng cấp Lịch Time-grid Kéo thả (Google Calendar / Linear style) | Drag & drop công việc theo giờ, Red indicator line, Color badges |
| 2026-08-06 | AI Chat Lên Lịch Tự Động & Form Tạo Task Mở Rộng | Chat tự động tạo & đẩy task lên Lịch, Form ô Mô tả to rộng, Link mẫu & Thể loại (Ảnh/Video) |
| 2026-08-06 | Tinh chỉnh Form Tạo Task GenZ 2027 | Nút Thể loại (Hình Ảnh & Video) kích thước bé đẹp vừa vặn, Thêm ô Ghi chú tên cho Link |
| 2026-08-06 | Nâng cấp toàn bộ Design System 2027 | Glassmorphism cao cấp, Glowing cards/buttons, Neon Cyberpunk Accent, Micro-animations 60fps |
| 2026-08-06 | Đồng bộ Lịch Kéo Thả 24h Giờ Việt Nam (06:00 ➔ 23:00) | Bỏ hoàn toàn AM/PM, mở rộng mốc giờ từ 06:00 đến 23:00 đồng bộ 100% task |
| 2026-08-06 | Thêm 3 Chế độ Xem Lịch (Ngày \| Tuần \| Tháng) & Date Picker | Tùy chỉnh chọn ngày xem nhanh, switch 3 chế độ xem, căn chỉnh ô lịch cân đối đẹp 100% |
| 2026-08-06 | Cố định Ô Lịch Vuông Vắn & Zoom Xem Chi Tiết Task | Cố định ô lịch H-20 vuông vắn, xuống dòng tối đa 3 dòng (line-clamp-3) & nhấp vào thẻ task mở Modal Zoom Xem Chi Tiết |
| 2026-08-06 | Tính năng Undo / Redo Toàn Website (Ctrl+Z & Ctrl+Shift+Z) | Phím tắt Ctrl+Z (Undo), Ctrl+Shift+Z / Ctrl+Y (Redo), Nút visual Undo/Redo trên Header bar |
| 2026-08-06 | Nâng cấp Lịch Chuẩn Google Calendar 2027 | Giữ lại 100% task cũ/đã xong trên Lịch, Chuyển click Month View ➔ Tuần (Week View), Nút Tròn FAB (+) màu nổi ở góc dưới bên phải |
| 2026-08-06 | Tự Động Đổi Icon Cảnh Báo Quá Hạn (AlertCircle ⚠️) | Khi kéo task quá giờ thực sẽ tự chuyển icon cảnh báo quá hạn ⚠️ màu đỏ rực rỡ; task chưa tới giữ nguyên icon Đồng hồ ⏰ |
| 2026-08-06 | Nút Xóa Task Trực Tiếp Trên Tờ Lịch & Bảng Màu Tùy Chỉnh | Thêm nút Thùng Rác (Trash2 🗑️) xóa task trên Lịch (hỗ trợ Ctrl+Z khôi phục) & Bộ chọn màu sắc tùy chỉnh cho công việc |
| 2026-08-06 | Nhân Bản Task, Đổi Màu Trực Tiếp & Luxury Cyber UI GenZ 2027 | Nút Nhân Bản (Copy 📋) trên Lịch (với Undo Ctrl+Z), Đổi màu sắc task ngay trong Panel & Redesign Modal Luxury Cyber Glassmorphism GenZ 2027 |
| 2026-08-06 | Tinh Chỉnh Ô Màu Sắc Bé Đẹp Vừa Vặn & Đồng Bộ 100% Panel Chi Tiết Task | Ô màu sắc thiết kế inline bé đẹp ôm trọn 8 nút tròn (hệt ảnh 1), Panel Chi Tiết Task hiển thị 100% đầy đủ tất cả trường hệt như ảnh 3 |
| 2026-08-06 | Tách Độc Lập 100% Thể Loại (Hình Ảnh / Video) & Bộ Chọn Màu Tùy Chỉnh | Nút chọn Thể loại (Hình Ảnh / Video) dùng màu active neutral/blue đồng nhất, Bộ chọn 8 màu sắc độc lập 100% hiển thị trên Lịch |
| 2026-08-06 | Sửa Căn Nguyên Lỗi Backend & Khởi Chạy Song Song Backend/Frontend | Biên dịch dist TypeScript backend có cột `color` & kích hoạt lại cả 2 server process daemon 3000 & 4000 100% thông suốt |
| 2026-08-06 | Bỏ Tiền Tố `[Bản sao]` Khi Nhân Bản Task Trên Lịch | Nhân bản task giữ nguyên 100% tiêu đề gốc của công việc, không thêm chữ Bản sao làm mất công xóa |
| 2026-08-06 | Rút Gọn Tiêu Đề Header Trang Lịch | Đổi tiêu đề thành `Lịch Công Việc 24h Việt Nam` tinh tế & tối giản |
| 2026-08-06 | Tái Cấu Trúc DOM Lịch Hàng Giờ Ngang Đồng Bộ 100% | Chuyển sang `HOURS.map` hàng ngang `items-stretch`. Cột giờ bên trái & ranh giới đường kẻ ngang tự động mở rộng đồng bộ tuyệt đối khi có nhiều task || 2026-08-06 | Sửa Lỗi API Routing Vercel & Tự Động Định Dạng Deadline | Cấu hình `next.config.js` & `api.ts` tự định tuyến chuẩn tới `NEXT_PUBLIC_API_URL` Render Backend & Tự động sinh deadline hợp lệ khi tạo task |
| 2026-08-06 | Bổ Sung Xử Lý OPTIONS Preflight CORS Bằng HTTP Test Script | Thêm full `OPTIONS` preflight headers (`app.options('*', cors())`) & `mode: 'cors'` cho trình duyệt web cross-origin |
| 2026-08-06 | Nâng Cấp Trợ Lý AI Tiếng Việt Tự Nhiên & Google Gemini Key | Xử lý chuẩn 100% các cụm từ "6h tối" (18:00), "8h sáng" (08:00), "sáng mai"... & Tích hợp thêm Tab cấu hình Google Gemini API Key miễn phí |
| 2026-08-06 | Bổ Sung Bộ Zoom In/Out Mobile & Tối Ưu Kéo Thả 60fps 0ms | Thêm bộ nút Zoom Phóng to/Thu nhỏ ô lịch cho Điện thoại & Tối ưu mảng tra cứu O(1) + Optimistic UI 0ms loại bỏ hoàn toàn đơ khựng 1s khi di chuyển task |

### 🔄 Đang làm
| Task | Assignee | Ghi chú |
|------|----------|---------|
| Running Production Server Daemons & Cloud Deployments | AI | Frontend Vercel (`workos-app-frontend.vercel.app`), Backend Render (`workos-backend-q7bl.onrender.com`) |

### 📋 Chưa bắt đầu
| Task | Priority | Ghi chú |
|------|----------|---------|
| _(Tất cả các phase chính đã hoàn thành 100%)_ | | |

---

## Các quyết định kỹ thuật đã được thống nhất

| Quyết định | Chi tiết | Ngày |
|------------|----------|------|
| Kiến trúc | Monorepo: `/frontend` (Next.js 14) + `/backend` (Express + SQLite) | 2026-08-06 |
| AI Feature | Dùng mock AI responses giai đoạn đầu, tích hợp API key sau | 2026-08-06 |
| Database | SQLite (`sqlite3` prebuilt binary cho Node 24 Windows) | 2026-08-06 |
| PWA | Service Worker + Web Push + Background Sync | 2026-08-06 |

---

## Các vấn đề đang theo dõi (Known Issues)

| ID | Mô tả | Trạng thái |
|----|-------|------------|
| _(chưa có issues nào)_ | | |

---

## Ghi chú quan trọng cho AI

1. **Luôn đọc file này trước** khi bắt đầu bất kỳ task nào
2. **Kiểm tra "Đang làm" và "Đã hoàn thành"** để không làm trùng
3. **Cập nhật bảng Task Log** sau mỗi task
4. **Cập nhật bảng Phase Status** khi hoàn thành phase
5. **Ghi lại các file đã tạo** trong cột "Files đã tạo"
6. **Không bao giờ sửa file đã hoàn thành** mà không hỏi người dùng
7. **Tham chiếu AI_GUIDELINES.md** để biết các quy tắc hành vi

---

*Cập nhật lần cuối: 2026-08-06 10:21 (GMT+7)*
