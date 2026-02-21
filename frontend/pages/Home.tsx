import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, Calendar, Tag as TagIcon, ChevronRight } from 'lucide-react';
import { MOCK_ARTICLES, MOCK_CATEGORIES, MOCK_TAGS, MOCK_USER } from '../constants.tsx';
import { Article } from '../types';
import { getArticles } from '../src/api/article';
import { getCategories } from '../src/api/category';
import { getTags } from '../src/api/tag';
import { getUserProfile } from '../src/api/user';

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '未知日期';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '未知日期';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface HomeProps {
  onPostClick: (id: number) => void;
  onCategoryClick: (id: number) => void;
  onTagClick: (id: number) => void;
}

const Home: React.FC<HomeProps> = ({ onPostClick, onCategoryClick, onTagClick }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(MOCK_USER);
  const [loading, setLoading] = useState(true);
  const [lifeEssayCategoryId, setLifeEssayCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 分别获取数据，确保即使某个请求失败，其他数据仍能加载
        // 1. 获取分类
        const categoriesRes = await getCategories().catch(() => []);
        const allCategories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);
        setCategories(allCategories);
        
        const lifeCategory = allCategories.find((c: any) => c.name === '生活随笔');
        if (lifeCategory) {
          setLifeEssayCategoryId(lifeCategory.id);
        }
        
        // 2. 获取文章
        const articlesRes = await getArticles({ size: 20 }).catch(() => []);
        const allArticles = Array.isArray(articlesRes) ? articlesRes : (articlesRes.records || []);
        setArticles(allArticles);
        
        // 3. 获取标签
        const tagsRes = await getTags().catch(() => []);
        setTags(Array.isArray(tagsRes) ? tagsRes : ((tagsRes as any).records || (tagsRes as any).data || []));
        
        // 4. 获取用户信息（可选，失败时使用模拟数据）
        try {
          const profileRes = await getUserProfile();
          if (profileRes && !(profileRes as any).message) {
            setUserProfile(profileRes);
          }
        } catch (error) {
          console.log('User not logged in, using mock profile');
          // 保持使用 MOCK_USER，不需要额外设置
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const filteredArticles = articles.filter(article => {
    if (!lifeEssayCategoryId) return true;
    return article.categoryId !== lifeEssayCategoryId && article.category?.name !== '生活随笔';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const featuredPost = filteredArticles[0] || MOCK_ARTICLES[0];
  const recentPosts = filteredArticles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Featured Hero */}
          {featuredPost && (
            <section>
              <h2 className="text-3xl font-bold mb-6 tracking-tight">精选故事</h2>
              <div 
                className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all"
                onClick={() => onPostClick(featuredPost.id)}
              >
                <div className="relative h-96 overflow-hidden">
                  <img 
                    src={featuredPost.coverImage || "https://picsum.photos/seed/article/800/400"} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold uppercase tracking-wider">
                      {featuredPost.categoryName || featuredPost.category?.name || '精选'}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                    {featuredPost.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center"><Eye size={16} className="mr-1" /> {featuredPost.viewCount || featuredPost.views || 0}</span>
                      <span className="flex items-center"><Calendar size={16} className="mr-1" /> {formatDate(featuredPost.createTime || featuredPost.publishedAt)}</span>
                    </div>
                    <span className="flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      阅读故事 <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recent Posts Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-6">最近文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.length > 0 ? recentPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="group cursor-pointer bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  onClick={() => onPostClick(post.id)}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.coverImage || "https://picsum.photos/seed/article/400/200"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-primary-500 uppercase">{post.categoryName || post.category?.name || '文章'}</span>
                    <h3 className="text-xl font-bold my-2 group-hover:text-primary-600 transition-colors line-clamp-1">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDate(post.createTime || post.publishedAt)}</span>
                      <span className="flex items-center"><Eye size={12} className="mr-1" /> {post.viewCount || post.views || 0}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-10 text-gray-500 italic">暂无更多文章</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Categories */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              分类
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {categories.filter(c => c.name !== '生活随笔').length > 0 ? categories.filter(c => c.name !== '生活随笔').map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 transition-colors"
                >
                  <span>{cat.name}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">{cat.articleCount || 0}</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              )) : MOCK_CATEGORIES.filter(c => c.name !== '生活随笔').map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 transition-colors"
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <TagIcon size={18} className="mr-2" /> 热门标签
            </h3>
            <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2 content-start pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {tags.length > 0 ? tags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => onTagClick(tag.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  #{tag.name}
                </button>
              )) : MOCK_TAGS.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => onTagClick(tag.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter / Profile Teaser */}
          <div className="bg-primary-600 rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white/50 overflow-hidden">
              <img src={userProfile.avatar || "https://picsum.photos/seed/user/200"} alt="Author" />
            </div>
            <h4 className="font-bold text-lg mb-1">{userProfile.nickname || userProfile.username || '匿名用户'}</h4>
            <p className="text-primary-100 text-sm mb-4 line-clamp-2">{userProfile.bio || '这个用户很懒，什么都没留下。'}</p>
            <button 
              className="bg-white text-primary-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors"
              onClick={() => (window.location.hash = '#profile')}
            >
              联系
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
