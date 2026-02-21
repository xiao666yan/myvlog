
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Edit2, Lock, Save, FileText, Trash2, Edit3, Eye, Calendar, Plus } from 'lucide-react';
import { MOCK_USER } from '../constants.tsx';
import { getUserProfile, updateUserProfile, updateEmail, updatePassword } from '../src/api/user';
import { getMyArticles, deleteArticle } from '../src/api/article';
import { useToast } from '../context/ToastContext';

interface ProfileProps {
  onUpdate?: (user: any) => void;
  onEditArticle?: (article: any) => void;
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '未知日期';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '未知日期';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

const Profile: React.FC<ProfileProps> = ({ onUpdate, onEditArticle }) => {
  const [profile, setProfile] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myArticles, setMyArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  
  const [passwords, setUpdatePasswords] = useState({ oldPassword: '', newPassword: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  
  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    articleId: null,
    articleTitle: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchMyArticles();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // 检查是否有 token
      const token = sessionStorage.getItem('token');
      if (!token) {
        // 未登录，跳转到登录页面
        window.location.hash = '#login';
        return;
      }
      
      const res = await getUserProfile();
      setProfile(res);
      setNickname(res.nickname || '');
      setEmail(res.email || '');
      setBio(res.bio || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      const localUser = sessionStorage.getItem('user');
      if (localUser) {
        try {
          const user = JSON.parse(localUser);
          setProfile(user);
          setNickname(user.nickname || '');
          setEmail(user.email || '');
          setBio(user.bio || '');
        } catch (e) {
          showToast('获取用户信息失败，请重新登录', 'error');
          window.location.hash = '#login';
        }
      } else {
        showToast('获取用户信息失败，请重新登录', 'error');
        window.location.hash = '#login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await getMyArticles();
      setMyArticles(Array.isArray(res) ? res : ((res as any).data || []));
    } catch (error) {
      console.error('Failed to fetch my articles:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.id, { nickname, bio });
      
      if (email !== profile.email) {
        await updateEmail(profile.id, email);
      }
      
      showToast('个人资料已更新', 'success');
      if (onUpdate) {
        onUpdate({ nickname, bio, email });
      }
      fetchProfile();
    } catch (error) {
      showToast('保存失败，请稍后重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!profile) return;
    if (!passwords.oldPassword || !passwords.newPassword) {
      showToast('请填写完整密码信息', 'error');
      return;
    }
    
    setUpdatingPass(true);
    try {
      await updatePassword(profile.id, passwords);
      showToast('密码已更新', 'success');
      setUpdatePasswords({ oldPassword: '', newPassword: '' });
    } catch (error) {
      showToast('更新密码失败，请检查旧密码', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleDeleteArticle = (id: number, title: string) => {
    setDeleteConfirm({ show: true, articleId: id, articleTitle: title });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.articleId) return;
    
    try {
      await deleteArticle(deleteConfirm.articleId);
      showToast('文章已删除', 'success');
      fetchMyArticles();
      setDeleteConfirm({ show: false, articleId: null, articleTitle: '' });
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const handleEditArticle = (article: any) => {
    if (onEditArticle) {
      onEditArticle(article);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const user = profile || MOCK_USER;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-6 mb-12">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl">
            <img src={user.avatar || "https://picsum.photos/seed/user/200"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-primary-600 text-white rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
            <Camera size={20} />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold mb-2">{user.nickname || user.username}</h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            <Shield size={16} className="mr-2 text-primary-500" /> {user.role?.toUpperCase()} 账户
          </p>
        </div>
      </div>

      {/* My Articles Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center"><FileText size={20} className="mr-2" /> 我的文章</h2>
          <button 
            onClick={() => {
              if (onEditArticle) {
                onEditArticle(null);
              }
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} className="mr-1" /> 新建文章
          </button>
        </div>
        
        {loadingArticles ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : myArticles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">还没有发布任何文章</p>
            <p className="text-sm text-gray-400">点击上方按钮开始创作</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myArticles.map(article => (
              <div 
                key={article.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{article.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      article.status === 'draft' ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {article.status === 'published' ? '已发布' : article.status === 'draft' ? '草稿' : article.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center"><Calendar size={12} className="mr-1" /> {formatDate(article.createTime || article.publishedAt)}</span>
                    <span className="flex items-center"><Eye size={12} className="mr-1" /> {article.viewCount || 0} 阅读</span>
                    {article.categoryName && (
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">{article.categoryName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={() => handleEditArticle(article)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteArticle(article.id, article.title)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center"><User size={20} className="mr-2" /> 公开资料</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">昵称</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <Edit2 size={16} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">邮箱</label>
              <div className="relative">
                <input 
                  type="email"
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">简介</label>
              <textarea 
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 min-h-[100px] resize-none focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="简单介绍一下自己..."
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className={`w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {saving ? '正在保存...' : '保存更改'}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center"><Lock size={20} className="mr-2" /> 安全设置</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">当前密码</label>
              <input 
                type="password"
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="••••••••"
                value={passwords.oldPassword}
                onChange={(e) => setUpdatePasswords({...passwords, oldPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">新密码</label>
              <input 
                type="password"
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="输入新密码"
                value={passwords.newPassword}
                onChange={(e) => setUpdatePasswords({...passwords, newPassword: e.target.value})}
              />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={updatingPass}
              className={`w-full border border-gray-200 dark:border-gray-800 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center ${updatingPass ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {updatingPass && <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin mr-2"></div>}
              {updatingPass ? '正在更新...' : '更新密码'}
            </button>
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-4 uppercase font-bold tracking-widest">双重认证</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">使用 2FA 保护您的账户</span>
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                此操作无法撤销，您确定要删除文章「{deleteConfirm.articleTitle}」吗？
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteConfirm({ show: false, articleId: null, articleTitle: '' })}
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

export default Profile;
