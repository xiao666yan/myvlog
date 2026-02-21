
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Eye, Share2, BookOpen, Link2, Check, X, Twitter
} from 'lucide-react';
import { Article } from '../types';
import { getArticleById } from '../src/api/article';
import { useToast } from '../context/ToastContext';

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '未知日期';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '未知日期';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface PostDetailProps {
  articleId: number;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ articleId, onBack }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await getArticleById(articleId);
        setArticle(res);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      showToast('链接已复制到剪贴板', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(`推荐阅读：${article?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareToWeibo = () => {
    const text = encodeURIComponent(`推荐阅读：${article?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || '文章分享',
          text: `推荐阅读：${article?.title}`,
          url: getShareUrl(),
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
    }
  };

  const calculateReadingTime = (content: string): number => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime);
  };

  const readingTime = article ? calculateReadingTime(article.content || '') : 1;
  const viewCount = article?.viewCount || article?.views || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-500">文章未找到</h2>
        <button onClick={onBack} className="mt-4 text-primary-600 font-bold hover:underline">返回列表</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 返回列表
      </button>

      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs font-bold uppercase tracking-wider">
            {article.categoryName || article.category?.name || '精选'}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" /> {formatDate(article.createTime || article.publishedAt)}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 border-y border-gray-100 dark:border-gray-800 py-4">
          <div className="flex items-center">
            <img src={article.authorAvatar || "https://picsum.photos/seed/user/200"} className="w-6 h-6 rounded-full mr-2" />
            <span className="font-medium text-gray-900 dark:text-gray-200">{article.authorName || '匿名作者'}</span>
          </div>
          <span className="flex items-center"><Eye size={16} className="mr-1" /> {viewCount} 阅读</span>
          <span className="flex items-center"><BookOpen size={16} className="mr-1" /> {readingTime} 分钟阅读</span>
        </div>
      </header>

      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden shadow-2xl mb-12">
        <img 
          src={article.coverImage || "https://picsum.photos/seed/article/800/400"} 
          alt={article.title} 
          className="w-full h-[450px] object-cover"
        />
      </div>

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {article.content || "暂无内容。"}
        </div>
      </article>

      {/* Tags & Footer */}
      <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
        {article.tags?.map(tag => (
          <span key={tag.id} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm font-medium">
            #{tag.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button 
          onClick={handleNativeShare}
          className="flex items-center text-gray-500 hover:text-primary-600"
        >
          <Share2 size={20} className="mr-1" /> 分享
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg">分享文章</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleShareToTwitter}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <Twitter size={24} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Twitter</span>
                </button>
                
                <button 
                  onClick={handleShareToWeibo}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    微
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">微博</span>
                </button>
                
                <button 
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                    {copied ? <Check size={24} className="text-green-500" /> : <Link2 size={24} />}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{copied ? '已复制' : '复制链接'}</span>
                </button>
              </div>
              
              <div className="mt-4">
                <label className="text-sm text-gray-500 mb-2 block">文章链接</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={getShareUrl()} 
                    readOnly 
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 truncate"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
