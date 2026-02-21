
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashboard';
import Moments from './pages/Moments';
import AuthPage from './pages/AuthPage';
import { MOCK_ARTICLES } from './constants.tsx';
import { logout } from './src/api/auth';
import { createArticle, getAdminArticles, deleteArticle, updateArticle } from './src/api/article';
import { getCategories, createCategory, updateCategory, deleteCategory } from './src/api/category';
import { getTags, createTag, updateTag, deleteTag } from './src/api/tag';
import { useToast } from './context/ToastContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState<{categoryId?: number; tagId?: number}>({});
  const { showToast } = useToast();

  // Check auth on load
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      // Simple hash routing
      if (hash.startsWith('post/')) {
        const id = parseInt(hash.split('/')[1]);
        setSelectedArticleId(id);
        setActiveTab('detail');
      } else if (hash.startsWith('edit/')) {
        const id = parseInt(hash.split('/')[1]);
        setActiveTab('create'); 
      } else if (hash.startsWith('category/')) {
        const id = parseInt(hash.split('/')[1]);
        setSearchFilters({ categoryId: id, tagId: undefined });
        setActiveTab('search');
      } else if (hash.startsWith('tag/')) {
        const id = parseInt(hash.split('/')[1]);
        setSearchFilters({ categoryId: undefined, tagId: id });
        setActiveTab('search');
      } else {
        setActiveTab(hash);
        if (hash !== 'create') setEditingArticle(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: string) => {
    window.location.hash = tab;
  };

  const handlePostClick = (id: number) => {
    navigateTo(`post/${id}`);
  };

  const handleCategoryClick = (id: number) => {
    navigateTo(`category/${id}`);
  };

  const handleTagClick = (id: number) => {
    navigateTo(`tag/${id}`);
  };
  
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    showToast('已退出登录', 'info');
    navigateTo('home');
  };

  const handleSaveArticle = async (articleData: any) => {
    try {
      if (!articleData.title || !articleData.content) {
        showToast('请填写标题和内容', 'error');
        return;
      }
      
      const payload = {
        title: articleData.title,
        content: articleData.content,
        summary: articleData.content.substring(0, 150),
        categoryId: articleData.category,
        tagIds: articleData.selectedTags || [],
        coverImage: articleData.coverImage || null,
        status: 'published'
      };
      
      console.log('Saving article with payload:', payload);
      
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
        showToast('修改成功！', 'success');
      } else {
        await createArticle(payload);
        showToast('发布成功！', 'success');
      }
      navigateTo('home');
      setEditingArticle(null);
    } catch (error: any) {
      console.error('Failed to save article:', error);
      const errorMessage = error?.message || '操作失败，请检查输入内容';
      showToast(errorMessage, 'error');
    }
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    navigateTo('create');
  };

  const handleProfileUpdate = (updatedUser: any) => {
    const newUser = { ...currentUser, ...updatedUser };
    setCurrentUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onPostClick={handlePostClick} onCategoryClick={handleCategoryClick} onTagClick={handleTagClick} />;
      case 'moments':
        return <Moments onPostClick={handlePostClick} />;
      case 'detail':
        return <PostDetail articleId={selectedArticleId!} onBack={() => navigateTo('home')} />;
      case 'search':
        return <Search onPostClick={handlePostClick} initialCategoryId={searchFilters.categoryId} initialTagId={searchFilters.tagId} />;
      case 'profile':
        return currentUser ? <Profile onUpdate={handleProfileUpdate} onEditArticle={handleEditArticle} /> : <AuthPage onLoginSuccess={(user) => { setCurrentUser(user); navigateTo('home'); }} />;
      case 'create':
        return currentUser ? <Editor initialArticle={editingArticle} onSave={handleSaveArticle} /> : <AuthPage onLoginSuccess={(user) => { setCurrentUser(user); navigateTo('create'); }} />;
      case 'admin':
        return (currentUser && currentUser.role && currentUser.role.toUpperCase() === 'ADMIN') ? <AdminDashboard onEditArticle={handleEditArticle} /> : <div>无权访问</div>;
      case 'login':
        return <AuthPage onLoginSuccess={(user) => { setCurrentUser(user); navigateTo('home'); }} initialMode="login" />;
      case 'register':
        return <AuthPage onLoginSuccess={(user) => { setCurrentUser(user); navigateTo('home'); }} initialMode="register" />;
      default:
        return <Home onPostClick={handlePostClick} onCategoryClick={handleCategoryClick} onTagClick={handleTagClick} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab === 'detail' ? 'home' : activeTab} 
      onNavigate={navigateTo}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
