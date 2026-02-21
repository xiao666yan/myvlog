
import { Article, Category, Tag, User, Announcement } from './types';

export const MOCK_USER: User = {
  id: 1,
  username: 'admin',
  nickname: 'Pixel Weaver',
  email: 'admin@blog.com',
  avatar: 'https://picsum.photos/seed/admin/200',
  role: 'ADMIN',
  bio: 'Passionate developer and designer sharing thoughts on modern web tech.',
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '技术' },
  { id: 2, name: '设计' },
  { id: 3, name: '生活' }, // Used for Moments
  { id: 4, name: '教程' },
];

export const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'React' },
  { id: 2, name: 'Tailwind' },
  { id: 3, name: 'NodeJS' },
  { id: 4, name: 'UI/UX' },
  { id: 5, name: 'Gemini AI' },
  { id: 6, name: 'Daily' },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'AI Web 开发的未来',
    summary: '探索大型语言模型如何重塑我们构建应用程序的方式。',
    content: 'Long content here about AI in web development...',
    coverImage: 'https://picsum.photos/seed/tech1/800/400',
    authorId: 1,
    authorName: 'Pixel Weaver',
    categoryId: 1,
    categoryName: 'Technology',
    tags: [MOCK_TAGS[0], MOCK_TAGS[4]],
    views: 1250,
    createTime: '2024-03-20',
    updateTime: '2024-03-21',
    isPublished: true,
  },
  {
    id: 2,
    title: '极简设计原则',
    summary: '如何在数字界面中以少胜多。',
    content: 'Content about minimalism...',
    coverImage: 'https://picsum.photos/seed/design1/800/400',
    authorId: 1,
    authorName: 'Pixel Weaver',
    categoryId: 2,
    categoryName: 'Design',
    tags: [MOCK_TAGS[3]],
    views: 890,
    createTime: '2024-03-15',
    updateTime: '2024-03-15',
    isPublished: true,
  },
  {
    id: 3,
    title: 'Tailwind CSS v4 入门',
    summary: '深入了解实用优先 CSS 框架的最新功能。',
    content: 'Tutorial on Tailwind CSS...',
    coverImage: 'https://picsum.photos/seed/tech2/800/400',
    authorId: 1,
    authorName: 'Pixel Weaver',
    categoryId: 4,
    categoryName: 'Tutorials',
    tags: [MOCK_TAGS[1]],
    views: 2400,
    createTime: '2024-03-10',
    updateTime: '2024-03-12',
    isPublished: true,
  },
  {
    id: 4,
    title: '早晨的咖啡与代码',
    summary: '在世界醒来之前的宁静时刻，有一种神奇的魔力。',
    content: 'Today I woke up at 5 AM. The city was silent, and the only sound was the bubbling of my French press. I spent two hours working on a side project without any notifications...',
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    authorId: 1,
    authorName: 'Pixel Weaver',
    categoryId: 3,
    categoryName: 'Life',
    tags: [MOCK_TAGS[5]],
    views: 450,
    createTime: '2024-03-22',
    updateTime: '2024-03-22',
    isPublished: true,
  },
  {
    id: 5,
    title: '翡翠峰周末徒步',
    summary: '逃离屏幕，重新连接自然。',
    content: 'Spent the whole Saturday hiking. My legs are sore but my mind is clear. Technology is great, but nature is the original operating system...',
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    authorId: 1,
    authorName: 'Pixel Weaver',
    categoryId: 3,
    categoryName: 'Life',
    tags: [MOCK_TAGS[5]],
    views: 320,
    createTime: '2024-03-18',
    updateTime: '2024-03-18',
    isPublished: true,
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: '系统维护',
    content: '我们将于 3 月 30 日进行定期维护。',
    createTime: '2024-03-25'
  }
];
