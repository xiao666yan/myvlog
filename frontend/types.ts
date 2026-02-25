
export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  role: 'ADMIN' | 'USER';
  bio?: string;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Column {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  categoryId: number;
  categoryName: string;
  category?: { id: number; name: string };
  tags: Tag[];
  views: number;
  viewCount?: number;
  createTime: string;
  updateTime: string;
  publishedAt?: string;
  createdAt?: string;
  isPublished: boolean;
  status?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createTime: string;
  createdAt?: string;
}

export interface LearningNote {
  id: number;
  articleId: number;
  userId: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  articleCount: number;
  projectCount: number;
  totalViews: number;
  categoryCount: number;
  userCount: number;
  publishFrequency: DailyStats[];
  audienceGrowth: DailyStats[];
}

export interface DailyStats {
  name: string;
  views: number;
  posts: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  records?: T[];
  total?: number;
}
