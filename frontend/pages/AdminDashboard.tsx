import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, FolderTree, Tag, Users, Bell, 
  Settings, MoreVertical, Edit, Trash2, Plus, 
  TrendingUp, TrendingDown, Clock, Library
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { MOCK_ARTICLES, MOCK_CATEGORIES, MOCK_TAGS, MOCK_ANNOUNCEMENTS } from '../constants.tsx';
import { getDashboardStats } from '../src/api/dashboard';
import { getAdminArticles, deleteArticle } from '../src/api/article';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../src/api/category';
import { getTags, createTag, updateTag, deleteTag } from '../src/api/tag';
import { getUsers, updateUserProfile, deleteUser } from '../src/api/user';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../src/api/announcement';
import { getColumns, getColumnTree, createColumn, updateColumn, deleteColumn } from '../src/api/column';
import { useToast } from '../context/ToastContext';

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '未知';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '未知';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface AdminDashboardProps {
  onEditArticle: (article: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onEditArticle }) => {
  const [activeTab, setActiveTab] = useState('data');
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'tag' | 'column' | 'user' | 'announcement'>('category');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ name: '', slug: '', description: '', title: '', content: '', type: 'general', isActive: true, parentId: '' });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, type: 'article' | 'category' | 'tag' | 'column' | 'user' | 'announcement', id: number | null}>({
    show: false,
    type: 'article',
    id: null
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'data') {
        const res = await getDashboardStats();
        console.log('Dashboard stats:', res);
        console.log('publishFrequency:', res?.publishFrequency);
        console.log('audienceGrowth:', res?.audienceGrowth);
        setStats(res);
      } else if (activeTab === 'articles') {
        const res = await getAdminArticles();
        setArticles(Array.isArray(res) ? res : ((res as any).records || []));
      } else if (activeTab === 'categories') {
        const res = await getCategories();
        setCategories(Array.isArray(res) ? res : ((res as any).data || (res as any).records || res || []));
      } else if (activeTab === 'tags') {
        const res = await getTags();
        setTags(Array.isArray(res) ? res : ((res as any).data || (res as any).records || res || []));
      } else if (activeTab === 'columns') {
        const res = await getColumnTree();
        setColumns(Array.isArray(res) ? res : ((res as any).data || (res as any).records || res || []));
      } else if (activeTab === 'users') {
        const res = await getUsers();
        setUsers(Array.isArray(res) ? res : ((res as any).records || []));
      } else if (activeTab === 'announcements') {
        const res = await getAnnouncements();
        setAnnouncements(Array.isArray(res) ? res : ((res as any).data || res || []));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('获取数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (type: 'article' | 'category' | 'tag' | 'column' | 'user' | 'announcement', id: number) => {
    setDeleteConfirm({ show: true, type, id });
  };

  const executeDelete = async () => {
    const { type, id } = deleteConfirm;
    if (!id) return;

    try {
      if (type === 'article') {
        await deleteArticle(id);
        setArticles(articles.filter(a => a.id !== id));
      } else if (type === 'category') {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } else if (type === 'tag') {
        await deleteTag(id);
        setTags(tags.filter(t => t.id !== id));
      } else if (type === 'column') {
        await deleteColumn(id);
        setColumns(columns.filter(c => c.id !== id));
      } else if (type === 'user') {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } else if (type === 'announcement') {
        await deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
      showToast('删除成功', 'success');
    } catch (error) {
      showToast('删除失败', 'error');
    } finally {
      setDeleteConfirm({ show: false, type: 'article', id: null });
    }
  };

  const handleDeleteArticle = (id: number) => confirmDelete('article', id);
  const handleDeleteCategory = (id: number) => confirmDelete('category', id);
  const handleDeleteTag = (id: number) => confirmDelete('tag', id);
  const handleDeleteColumn = (id: number) => confirmDelete('column', id);
  const handleDeleteUser = (id: number) => confirmDelete('user', id);
  const handleDeleteAnnouncement = (id: number) => confirmDelete('announcement', id);

  const openModal = (type: 'category' | 'tag' | 'column' | 'user' | 'announcement', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'user') {
      setFormData(item ? {
        nickname: item.nickname || '',
        role: item.role || 'user',
        bio: item.bio || '',
        email: item.email || ''
      } : { nickname: '', role: 'user', bio: '', email: '' });
    } else if (type === 'column') {
      setFormData(item ? {
        name: item.name || '',
        description: item.description || '',
        parentId: item.parentId || '',
        coverImage: item.coverImage || ''
      } : { name: '', description: '', parentId: '', coverImage: '' });
    } else if (type === 'announcement') {
      setFormData(item ? {
        title: item.title || '',
        content: item.content || '',
        type: item.type || 'general',
        isActive: item.isActive ?? true
      } : { title: '', content: '', type: 'general', isActive: true });
    } else {
      setFormData(item ? { 
        name: item.name, 
        slug: item.slug || '', 
        description: item.description || '' 
      } : { name: '', slug: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'category') {
        if (editingItem) {
          await updateCategory(editingItem.id, formData);
          showToast('修改成功', 'success');
        } else {
          await createCategory(formData);
          showToast('创建成功', 'success');
        }
        fetchData();
      } else if (modalType === 'tag') {
        if (editingItem) {
          await updateTag(editingItem.id, formData);
          showToast('修改成功', 'success');
        } else {
          await createTag(formData);
          showToast('创建成功', 'success');
        }
        fetchData();
      } else if (modalType === 'column') {
        const submitData = {
          ...formData,
          parentId: formData.parentId ? Number(formData.parentId) : null
        };
        if (editingItem) {
          await updateColumn(editingItem.id, submitData);
          showToast('修改成功', 'success');
        } else {
          await createColumn(submitData);
          showToast('创建成功', 'success');
        }
        fetchData();
      } else if (modalType === 'user') {
        if (editingItem) {
          await updateUserProfile(editingItem.id, formData);
          showToast('修改成功', 'success');
          fetchData();
        }
      } else if (modalType === 'announcement') {
        if (editingItem) {
          await updateAnnouncement(editingItem.id, formData);
          showToast('修改成功', 'success');
        } else {
          await createAnnouncement(formData);
          showToast('创建成功', 'success');
        }
        // Dispatch event to notify Layout to refresh announcements
        window.dispatchEvent(new CustomEvent('announcement-updated'));
        fetchData();
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };

  const menuItems = [
    { id: 'data', label: '概览', icon: BarChart3 },
    { id: 'articles', label: '文章', icon: FileText },
    { id: 'categories', label: '分类', icon: FolderTree },
    { id: 'tags', label: '标签', icon: Tag },
    { id: 'columns', label: '专栏', icon: Library },
    { id: 'users', label: '用户', icon: Users },
    { id: 'announcements', label: '公告', icon: Bell },
  ];

  const quickStats = stats ? [
    { label: '总文章数', value: stats.articleCount || 0, trend: '+0', up: true },
    { label: '项目总数', value: stats.projectCount || 0, trend: '+0', up: true },
    { label: '总浏览量', value: stats.totalViews || 0, trend: '+0', up: true },
    { label: '用户总数', value: stats.userCount || 0, trend: '+0', up: true },
  ] : [
    { label: '总浏览量', value: '...', trend: '+0%', up: true },
    { label: '文章', value: '...', trend: '+0', up: true },
    { label: '用户', value: '...', trend: '+0%', up: false },
    { label: '分类', value: '...', trend: '+0%', up: true },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hidden md:block">
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-primary-600'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel - Added min-w-0 to fix flex child width calculation */}
      <main className="flex-grow p-8 bg-white dark:bg-gray-950 overflow-auto min-w-0">
        
        {/* Render Overview/Data Statistics */}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">管理洞察</h1>
              <div className="flex space-x-2">
                <button className="flex items-center text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <Clock size={14} className="mr-2" /> 最近 7 天
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickStats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-extrabold">{stat.value}</span>
                    <span className={`text-xs font-bold flex items-center ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.up ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Area - Added min-w-0 to card wrappers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 min-w-0">
                <h3 className="text-lg font-bold mb-6">受众增长</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={stats?.audienceGrowth || []}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 min-w-0">
                <h3 className="text-lg font-bold mb-6">发布频率</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={stats?.publishFrequency || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="posts" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Management Table View */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">文章管理</h2>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">标题</th>
                    <th className="px-6 py-4">分类</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4">浏览量</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={article.coverImage || "https://picsum.photos/seed/article/200"} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-semibold line-clamp-1">{article.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{article.category?.name || '未分类'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          article.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{article.views}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => onEditArticle(article)}
                          className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">暂无文章数据</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">分类管理</h2>
              <button 
                onClick={() => openModal('category')}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} className="mr-2" /> 新建分类
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">{cat.name}</h4>
                    <p className="text-gray-500 text-sm">{cat.articleCount || 0} 篇文章</p>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => openModal('category', cat)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">用户管理</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">用户</th>
                    <th className="px-6 py-4">角色</th>
                    <th className="px-6 py-4">邮箱</th>
                    <th className="px-6 py-4">注册时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatar || "https://picsum.photos/seed/user/200"} className="w-10 h-10 rounded-full object-cover" />
                          <span className="font-semibold">{user.nickname || user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt || user.created_at)}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => openModal('user', user)}
                          className="text-primary-600 font-bold text-sm hover:underline"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 font-bold text-sm hover:underline"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tag Management */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">标签管理</h2>
              <button 
                onClick={() => openModal('tag')}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} className="mr-2" /> 新建标签
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tags.map(tag => (
                <div key={tag.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center group relative">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-2">
                    <Tag size={20} />
                  </div>
                  <span className="font-bold text-sm text-center">{tag.name}</span>
                  <span className="text-gray-400 text-[10px] mt-1">/{tag.slug}</span>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button 
                      onClick={() => openModal('tag', tag)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-500"
                    ><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {tags.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 italic">暂无标签数据</div>
              )}
            </div>
          </div>
        )}

        {/* Column Management */}
        {activeTab === 'columns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">专栏管理</h2>
              <button
                onClick={() => openModal('column')}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} className="mr-2" /> 新建专栏
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">专栏名称</th>
                    <th className="px-6 py-4">描述</th>
                    <th className="px-6 py-4">文章数</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(() => {
                    const renderColumnRow = (col: any, level: number = 0): React.ReactNode[] => {
                      const rows: React.ReactNode[] = [];
                      const hasChildren = col.children && col.children.length > 0;
                      
                      rows.push(
                        <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3" style={{ paddingLeft: `${level * 24}px` }}>
                              {hasChildren && (
                                <span className="text-gray-400 text-xs">└─</span>
                              )}
                              {col.coverImage ? (
                                <img src={col.coverImage} alt={col.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center">
                                  <Library size={20} />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold block">{col.name}</span>
                                {level > 0 && (
                                  <span className="text-xs text-gray-400">{level}级子专栏</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{col.description || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                              {col.articleCount || 0} 篇
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openModal('column', col)}
                              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-lg"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(col.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                      
                      // 递归渲染子专栏
                      if (hasChildren) {
                        col.children.forEach((child: any) => {
                          rows.push(...renderColumnRow(child, level + 1));
                        });
                      }
                      
                      return rows;
                    };
                    
                    const allRows: React.ReactNode[] = [];
                    columns.forEach((col: any) => {
                      allRows.push(...renderColumnRow(col, 0));
                    });
                    
                    return allRows.length > 0 ? allRows : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">暂无专栏数据</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Announcement Management */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">公告管理</h2>
              <button 
                onClick={() => openModal('announcement')}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center font-bold shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} className="mr-2" /> 新建公告
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">标题</th>
                    <th className="px-6 py-4">类型</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4">发布时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {announcements.map(ann => (
                    <tr key={ann.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold">{ann.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {ann.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          ann.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {ann.isActive ? '展示中' : '已下线'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(ann.createdAt || ann.created_at)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => openModal('announcement', ann)}
                          className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">暂无公告数据</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'data' && activeTab !== 'articles' && activeTab !== 'categories' && activeTab !== 'users' && activeTab !== 'tags' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Settings size={64} className="mb-4 animate-spin-slow opacity-20" />
            <h3 className="text-xl font-bold">管理 {activeTab}</h3>
            <p>{activeTab} 的管理控件将显示在这里。</p>
          </div>
        )}
      </main>

      {/* Generic Modal for Category/Tag */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? '编辑' : '新建'}
                {modalType === 'category' ? '分类' : modalType === 'tag' ? '标签' : modalType === 'column' ? '专栏' : modalType === 'user' ? '用户' : '公告'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalType === 'user' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">昵称</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">角色</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">普通用户 (user)</option>
                      <option value="vip">高级会员 (vip)</option>
                      <option value="admin">管理员 (admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">个人简介</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </>
              ) : modalType === 'column' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">专栏名称</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">封面图片</label>
                    <div className="space-y-2">
                      {formData.coverImage && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden">
                          <img src={formData.coverImage} alt="封面" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, coverImage: ''})}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Plus size={16} className="rotate-45" />
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="输入图片URL或上传图片"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">父专栏</label>
                    <select
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.parentId}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                    >
                      <option value="">顶级专栏</option>
                      {columns.filter(c => !editingItem || c.id !== editingItem.id).map(col => (
                        <option key={col.id} value={col.id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : modalType === 'announcement' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">标题</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">类型</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="general">普通公告</option>
                      <option value="important">重要通知</option>
                      <option value="system_update">系统更新</option>
                      <option value="maintenance">停机维护</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">内容</label>
                    <textarea 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 resize-none"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">激活展示</label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">名称</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">别名 (Slug)</label>
                    <input 
                      type="text" 
                      placeholder="留空自动生成"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </>
              )}
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">确认删除？</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                此操作无法撤销，您确定要删除这个{
                  deleteConfirm.type === 'article' ? '文章' :
                  deleteConfirm.type === 'category' ? '分类' :
                  deleteConfirm.type === 'tag' ? '标签' :
                  deleteConfirm.type === 'column' ? '专栏' :
                  deleteConfirm.type === 'user' ? '用户' : '公告'
                }吗？
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteConfirm({ show: false, type: 'article', id: null })}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
                >
                  确定删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
