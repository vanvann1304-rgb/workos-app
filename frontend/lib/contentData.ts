export interface ContentItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  pillar: 'Storytelling' | 'Room showcase' | 'Couple content' | 'Meme' | 'Khuyến mãi' | 'Branding';
  platform: 'Facebook' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | 'Website';
  assignee: 'Designer' | 'Copywriter' | 'Content Lead' | 'Video Editor' | 'SEO Specialist';
  status: 'Idea' | 'Research' | 'Outline' | 'Writing' | 'Design' | 'Review' | 'Approved' | 'Scheduled' | 'Published';
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  source: 'real' | 'sample'; // 'real' = "Thực tế", 'sample' = "Minh họa"
  campaign: string;
  caption?: string;
  hashtags?: string[];
  kpiTarget?: string;
  actualViews?: number;
}

export interface FilterState {
  campaign: string;
  pillar: string;
  platform: string;
  assignee: string;
  status: string;
}

export const WORKFLOW_STAGES = [
  'Idea',
  'Research',
  'Outline',
  'Writing',
  'Design',
  'Review',
  'Approved',
  'Scheduled',
  'Published'
] as const;

export const CAMPAIGNS = [
  'Couple Staycation - Tháng 8',
  'Benri Signature Romance',
  'Tết 2026 Warm-up',
  'Summer Chillout 2026',
  'Khuyến Mãi Cuối Tuần'
];

export const PILLARS = [
  'Storytelling',
  'Room showcase',
  'Couple content',
  'Meme',
  'Khuyến mãi',
  'Branding'
] as const;

export const PLATFORMS = [
  'Facebook',
  'Instagram',
  'TikTok',
  'LinkedIn',
  'YouTube',
  'Website'
] as const;

export const ASSIGNEES = [
  'Designer',
  'Copywriter',
  'Content Lead',
  'Video Editor',
  'SEO Specialist'
] as const;

export const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
  'Idea': { label: 'Idea', bg: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', dotColor: '#94a3b8' },
  'Research': { label: 'Research', bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-800', dotColor: '#06b6d4' },
  'Outline': { label: 'Outline', bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800', dotColor: '#14b8a6' },
  'Writing': { label: 'Writing', bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800', dotColor: '#0284c7' },
  'Design': { label: 'Design', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800', dotColor: '#6366f1' },
  'Review': { label: 'Review', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', dotColor: '#f59e0b' },
  'Approved': { label: 'Approved', bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800', dotColor: '#f97316' },
  'Scheduled': { label: 'Scheduled', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800', dotColor: '#a855f7' },
  'Published': { label: 'Published', bg: 'bg-lime-100 dark:bg-lime-950/60', text: 'text-lime-800 dark:text-lime-300', border: 'border-lime-300 dark:border-lime-800', dotColor: '#84cc16' },
};

export const PILLAR_MAP: Record<string, { bg: string; text: string; borderLeft: string; badgeBg: string }> = {
  'Storytelling': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', borderLeft: 'border-l-purple-500', badgeBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300' },
  'Room showcase': { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', borderLeft: 'border-l-pink-500', badgeBg: 'bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300' },
  'Couple content': { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', borderLeft: 'border-l-indigo-500', badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' },
  'Meme': { bg: 'bg-lime-50 dark:bg-lime-950/30', text: 'text-lime-700 dark:text-lime-300', borderLeft: 'border-l-lime-500', badgeBg: 'bg-lime-100 dark:bg-lime-900/60 text-lime-800 dark:text-lime-300' },
  'Khuyến mãi': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', borderLeft: 'border-l-emerald-500', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' },
  'Branding': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', borderLeft: 'border-l-blue-500', badgeBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' },
};

export const PLATFORM_MAP: Record<string, { icon: string; bg: string; text: string }> = {
  'Facebook': { icon: '📘', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  'Instagram': { icon: '📸', bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
  'TikTok': { icon: '🎵', bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200' },
  'LinkedIn': { icon: '💼', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300' },
  'YouTube': { icon: '▶️', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  'Website': { icon: '🌐', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
};

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cnt-101',
    title: 'Góc bồn tắm sủi bọt — nơi mọi mệt mỏi được xả hết',
    date: '2026-08-02',
    pillar: 'Room showcase',
    platform: 'Instagram',
    assignee: 'Designer',
    status: 'Published',
    priority: 'Trung bình',
    source: 'sample',
    campaign: 'Couple Staycation - Tháng 8',
    caption: 'Chill cùng bồn tắm sủi bọt ngát hương hoa lavender tại Benri Boutique Hotel.',
    hashtags: ['#khachsancouple', '#benriboutiquehotel', '#staycationsaigon'],
    actualViews: 14200
  },
  {
    id: 'cnt-102',
    title: 'Meme 1 (matcha latte & hẹn hò muộn)',
    date: '2026-08-03',
    pillar: 'Meme',
    platform: 'TikTok',
    assignee: 'Copywriter',
    status: 'Published',
    priority: 'Trung bình',
    source: 'real',
    campaign: 'Summer Chillout 2026',
    caption: 'Khi bạn rủ ny đi uống matcha rồi vô tình lạc vào bồn tắm Benri...',
    hashtags: ['#diadiemhenho', '#khachsanthuduc', '#thuduchotel'],
    actualViews: 28900
  },
  {
    id: 'cnt-103',
    title: 'Chuyện đôi giày bỏ quên và hành trình tìm lại chủ nhân',
    date: '2026-08-04',
    pillar: 'Storytelling',
    platform: 'Facebook',
    assignee: 'Content Lead',
    status: 'Published',
    priority: 'Cao',
    source: 'sample',
    campaign: 'Benri Signature Romance',
    caption: 'Một câu chuyện dễ thương được nhân viên Benri ghi lại tuần qua...',
    hashtags: ['#homestaycouple', '#romantichotel', '#checkinhotel'],
    actualViews: 18500
  },
  {
    id: 'cnt-104',
    title: '10 câu hỏi hâm nóng tình cảm cho couple lâu năm',
    date: '2026-08-06',
    pillar: 'Couple content',
    platform: 'Instagram',
    assignee: 'Copywriter',
    status: 'Published',
    priority: 'Trung bình',
    source: 'real',
    campaign: 'Couple Staycation - Tháng 8',
    caption: 'Lưu lại ngay 10 câu hỏi giúp hai bạn hiểu nhau hơn sau 3 năm yêu!',
    hashtags: ['#couplecontent', '#staycationsaigon', '#romantichotel'],
    actualViews: 32000
  },
  {
    id: 'cnt-105',
    title: 'POV: bước vào phòng và ánh đèn vàng đón bạn',
    date: '2026-08-07',
    pillar: 'Room showcase',
    platform: 'TikTok',
    assignee: 'Video Editor',
    status: 'Scheduled',
    priority: 'Cao',
    source: 'real',
    campaign: 'Benri Signature Romance',
    caption: 'Ánh đèn vàng ấm áp cùng champagne mát lạnh sẵn sàng chờ bạn.',
    hashtags: ['#khachsancouple', '#staycation', '#hotelreview'],
  },
  {
    id: 'cnt-106',
    title: 'Checklist chuẩn bị một buổi hẹn hò bất ngờ tại Benri',
    date: '2026-08-13',
    pillar: 'Couple content',
    platform: 'Facebook',
    assignee: 'Content Lead',
    status: 'Approved',
    priority: 'Trung bình',
    source: 'sample',
    campaign: 'Couple Staycation - Tháng 8',
    caption: '3 bước đặt phòng & trang trí hoa hồng cho buổi tối lãng mạn.',
  },
  {
    id: 'cnt-107',
    title: 'Khi khách quen ghé lại lần thứ 10 trong năm',
    date: '2026-08-15',
    pillar: 'Branding',
    platform: 'Facebook',
    assignee: 'Copywriter',
    status: 'Review',
    priority: 'Thấp',
    source: 'sample',
    campaign: 'Benri Signature Romance',
    caption: 'Cảm ơn tình cảm của quý khách luôn chọn Benri làm điểm tựa bình yên.',
  },
  {
    id: 'cnt-108',
    title: 'Trích đoạn tin nhắn cảm ơn từ khách quen',
    date: '2026-08-19',
    pillar: 'Storytelling',
    platform: 'Facebook',
    assignee: 'Copywriter',
    status: 'Design',
    priority: 'Trung bình',
    source: 'real',
    campaign: 'Benri Signature Romance',
    caption: 'Những dòng phản hồi làm ấm lòng tập thể nhân viên Benri Boutique.',
  },
  {
    id: 'cnt-109',
    title: 'Cuộc gọi lúc nửa đêm: "Anh đi phòng còn không?"',
    date: '2026-08-20',
    pillar: 'Storytelling',
    platform: 'TikTok',
    assignee: 'Video Editor',
    status: 'Writing',
    priority: 'Cao',
    source: 'sample',
    campaign: 'Summer Chillout 2026',
    caption: 'Dù 1h sáng Benri vẫn luôn rộng mở chào đón bạn nghỉ ngơi.',
  },
  {
    id: 'cnt-110',
    title: 'Test: bạn và người ấy hợp gu phòng nào?',
    date: '2026-08-21',
    pillar: 'Meme',
    platform: 'Instagram',
    assignee: 'Designer',
    status: 'Outline',
    priority: 'Thấp',
    source: 'sample',
    campaign: 'Couple Staycation - Tháng 8',
    caption: 'Quiz ngắn 4 câu đoán gu lãng mạn của hai bạn!',
  },
  {
    id: 'cnt-111',
    title: 'Ánh sáng mood nào hợp buổi hẹn hò của bạn?',
    date: '2026-08-27',
    pillar: 'Room showcase',
    platform: 'Instagram',
    assignee: 'Designer',
    status: 'Research',
    priority: 'Trung bình',
    source: 'sample',
    campaign: 'Benri Signature Romance',
  },
  {
    id: 'cnt-112',
    title: 'Series Deep talk phần 2: giai đoạn yêu xa',
    date: '2026-08-28',
    pillar: 'Couple content',
    platform: 'TikTok',
    assignee: 'Copywriter',
    status: 'Idea',
    priority: 'Cao',
    source: 'sample',
    campaign: 'Couple Staycation - Tháng 8',
  },
  {
    id: 'cnt-113',
    title: '1001 lý do khách nói "chỉ ghé 2 tiếng thôi" rồi ở tới sáng',
    date: '2026-08-29',
    pillar: 'Meme',
    platform: 'Facebook',
    assignee: 'Copywriter',
    status: 'Idea',
    priority: 'Thấp',
    source: 'sample',
    campaign: 'Summer Chillout 2026',
  },
  {
    id: 'cnt-114',
    title: 'Ưu đãi Đặc Biệt Đặt Phòng Sớm Tết 2026 — Giảm 25%',
    date: '2026-08-30',
    pillar: 'Khuyến mãi',
    platform: 'Website',
    assignee: 'SEO Specialist',
    status: 'Writing',
    priority: 'Cao',
    source: 'real',
    campaign: 'Tết 2026 Warm-up',
    caption: 'Đăng ký phòng nghỉ Tết lãng mạn trước ngày 15/09 để nhận voucher giặt ủi & breakfast mộc.',
  },
  {
    id: 'cnt-115',
    title: 'Video Tour 360 độ Phòng Suite Hoàng Gia Sunset',
    date: '2026-08-31',
    pillar: 'Room showcase',
    platform: 'YouTube',
    assignee: 'Video Editor',
    status: 'Design',
    priority: 'Cao',
    source: 'real',
    campaign: 'Benri Signature Romance',
  },
  {
    id: 'cnt-116',
    title: 'Voucher Đêm Hẹn Hò Thứ 6 — Tặng Chai Rượu Vang Đỏ',
    date: '2026-08-14',
    pillar: 'Khuyến mãi',
    platform: 'Facebook',
    assignee: 'Designer',
    status: 'Approved',
    priority: 'Cao',
    source: 'real',
    campaign: 'Khuyến Mãi Cuối Tuần',
  },
  {
    id: 'cnt-117',
    title: 'Bài viết LinkedIn: Hành trình xây dựng thương hiệu Benri Boutique',
    date: '2026-08-22',
    pillar: 'Branding',
    platform: 'LinkedIn',
    assignee: 'Content Lead',
    status: 'Research',
    priority: 'Trung bình',
    source: 'real',
    campaign: 'Tết 2026 Warm-up',
  },
  {
    id: 'cnt-118',
    title: 'Infographic: 5 Nguyên Tắc Vàng Khi Chọn Khách Sạn Hẹn Hò',
    date: '2026-08-25',
    pillar: 'Branding',
    platform: 'Instagram',
    assignee: 'Designer',
    status: 'Writing',
    priority: 'Trung bình',
    source: 'sample',
    campaign: 'Benri Signature Romance',
  }
];

export const BRAND_HASHTAGS = [
  '#khachsancouple',
  '#benriboutiquehotel',
  '#staycationsaigon',
  '#diadiemhenho',
  '#khachsanthuduc',
  '#thuduchotel',
  '#checkinhotel',
  '#homestaycouple',
  '#romantichotel'
];

export const TEAM_MEMBERS = [
  { name: 'Designer', role: 'UI/UX & Graphics', avatarColor: 'bg-purple-500', total: 6, completed: 4, deadline: '2026-08-25' },
  { name: 'Copywriter', role: 'Kịch bản & Caption', avatarColor: 'bg-pink-500', total: 5, completed: 3, deadline: '2026-08-20' },
  { name: 'Content Lead', role: 'Duyệt bài & Chiến lược', avatarColor: 'bg-blue-500', total: 3, completed: 2, deadline: '2026-08-22' },
  { name: 'Video Editor', role: 'Reels & TikTok Editor', avatarColor: 'bg-amber-500', total: 3, completed: 1, deadline: '2026-08-31' },
  { name: 'SEO Specialist', role: 'Website & Keyword Rank', avatarColor: 'bg-emerald-500', total: 1, completed: 0, deadline: '2026-08-30' },
];

const LOCAL_STORAGE_KEY = 'workos_content_plan_items_v3';

export function getStoredContentItems(): ContentItem[] {
  if (typeof window === 'undefined') return INITIAL_CONTENT_ITEMS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CONTENT_ITEMS));
      return INITIAL_CONTENT_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CONTENT_ITEMS;
  }
}

export function saveStoredContentItems(items: ContentItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving content items:', e);
  }
}
