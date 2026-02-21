
import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Filter, TrendingUp, X, Clock, Eye } from 'lucide-react';
import { getArticles } from '../src/api/article';
import { getTags } from '../src/api/tag';
import { getCategories } from '../src/api/category';
import { Article } from '../types';
import { MOCK_USER } from '../constants.tsx';

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '未知日期';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '未知日期';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface SearchProps {
  onPostClick: (id: number) => void;
  initialCategoryId?: number;
  initialTagId?: number;
}

const Search: React.FC<SearchProps> = ({ onPostClick, initialCategoryId, initialTagId }) => {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<number | null>(initialTagId || null);
  const [activeCategory, setActiveCategory] = useState<number | null>(initialCategoryId || null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch Tags and Categories
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [tagsRes, categoriesRes] = await Promise.all([
          getTags(),
          getCategories()
        ]);
        setTags(Array.isArray(tagsRes) ? tagsRes : (tagsRes.data || []));
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []));
      } catch (err) {
        console.error('Failed to fetch filters', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch Articles with Debounce
  const fetchResults = useCallback(async (q: string, tId: number | null, cId: number | null) => {
    setLoading(true);
    try {
      const res = await getArticles({
        keyword: q || undefined,
        tagId: tId || undefined,
        categoryId: cId || undefined,
        size: 20
      });
      const records = Array.isArray(res) ? res : ((res as any).records || (res as any).data || []);
      setArticles(records);
      setTotal(Array.isArray(res) ? records.length : ((res as any).total || records.length));
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query, activeTag, activeCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTag, activeCategory, fetchResults]);

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name;
  const activeTagName = tags.find(t => t.id === activeTag)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Active Filters Display */}
      {(activeCategory || activeTag) && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">当前筛选：</span>
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
              分类: {activeCategoryName}
              <button onClick={() => setActiveCategory(null)} className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5">
                <X size={14} />
              </button>
            </span>
          )}
          {activeTag && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
              标签: #{activeTagName}
              <button onClick={() => setActiveTag(null)} className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5">
                <X size={14} />
              </button>
            </span>
          )}
          <button 
            onClick={() => { setActiveCategory(null); setActiveTag(null); }}
            className="text-sm text-gray-500 hover:text-primary-600 underline"
          >
            清除全部
          </button>
        </div>
      )}

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
          <SearchIcon size={24} />
        </div>
        <input 
          type="text"
          placeholder="搜索标题、主题或关键词..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-16 pr-6 py-6 text-xl shadow-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-6 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="space-y-8">
          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center"><Filter size={18} className="mr-2" /> 按分类筛选</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeCategory === null 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' 
                  : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-primary-500'
                }`}
              >
                全部
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' 
                    : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-primary-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center"><Filter size={18} className="mr-2" /> 按标签筛选</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTag(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeTag === null 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                  : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-indigo-500'
                }`}
              >
                全部
              </button>
              {tags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => setActiveTag(tag.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    activeTag === tag.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20' 
                    : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-indigo-500'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl text-white shadow-xl">
            <h3 className="font-bold flex items-center mb-2"><TrendingUp size={18} className="mr-2" /> 搜索小贴士</h3>
            <p className="text-sm opacity-80 mb-4">输入 # 加上标签名（如 #Java）可以进行精确的标签搜索。</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center opacity-90"><span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span> 支持标题和内容检索</li>
              <li className="flex items-center opacity-90"><span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span> 关键词自动高亮显示</li>
              <li className="flex items-center opacity-90"><span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span> 支持多维度组合筛选</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {loading ? '正在搜索...' : `${total} 个结果`}
            </h2>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : articles.length > 0 ? (
              articles.map(article => (
                <div 
                  key={article.id}
                  className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-primary-500/30 transition-all cursor-pointer"
                  onClick={() => onPostClick(article.id)}
                >
                  <div className="w-full md:w-56 h-36 flex-shrink-0 rounded-xl overflow-hidden">
                    <img 
                      src={article.coverImage || `https://picsum.photos/seed/art-${article.id}/400/300`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={article.title}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-[10px] font-bold text-primary-600 uppercase">
                        {article.category?.name || article.categoryName || '未分类'}
                      </span>
                      <span className="flex items-center text-xs text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {formatDate(article.publishedAt || article.createdAt || article.createTime)}
                      </span>
                      <span className="flex items-center text-xs text-gray-400">
                        <Eye size={12} className="mr-1" />
                        {article.viewCount || article.views || 0}
                      </span>
                    </div>
                    <h3 
                      className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors"
                      dangerouslySetInnerHTML={{ __html: article.title }}
                    />
                    <p 
                      className="text-gray-500 text-sm line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.summary }}
                    />
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {article.tags.slice(0, 3).map((tag: any) => (
                          <span key={tag.id} className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">未找到匹配项</h3>
                <p className="text-gray-500">尝试调整您的筛选条件或搜索词。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
