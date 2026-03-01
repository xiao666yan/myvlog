
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Calendar, Eye, Share2, BookOpen, Link2, Check, X, Twitter, FileDown, List
} from 'lucide-react';
import { Article } from '../types';
import { getArticleById } from '../src/api/article';
import { useToast } from '../context/ToastContext';
import { exportArticleToPDFSimple } from '../src/utils/pdfExport';

// 目录项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
}

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
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // 解析内容生成目录
  const generateToc = (content: string): TocItem[] => {
    if (!content) return [];
    
    const items: TocItem[] = [];
    // 匹配 markdown 标题: ## 标题 或 ### 标题
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // ## = 2, ### = 3, #### = 4
      const text = match[2].trim();
      // 生成唯一ID
      const id = `heading-${items.length}`;
      items.push({ id, text, level });
    }
    
    return items;
  };

  // 处理内容，为标题添加ID
  const processContent = (content: string, tocItems: TocItem[]): string => {
    if (!content || tocItems.length === 0) return content;
    
    let index = 0;
    return content.replace(/^(#{2,4})\s+(.+)$/gm, (match, hashes, text) => {
      const id = tocItems[index]?.id || `heading-${index}`;
      index++;
      return `<h${hashes.length} id="${id}" class="scroll-mt-20">${text.trim()}</h${hashes.length}>`;
    });
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await getArticleById(articleId);
        setArticle(res);
        
        // 生成目录
        const content = res.content || res.contentHtml || '';
        const tocItems = generateToc(content);
        setToc(tocItems);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  // 监听滚动，高亮当前目录项
  useEffect(() => {
    if (toc.length === 0) return;
    
    const handleScroll = () => {
      const headings = toc.map(item => document.getElementById(item.id)).filter(Boolean);
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveTocId(toc[i].id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // 点击目录跳转
  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTocId(id);
    }
  };

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

  const handleExportPDF = () => {
    if (!article) return;
    
    try {
      exportArticleToPDFSimple({
        title: article.title,
        content: article.content || article.contentHtml || '',
        author: article.author,
        publishedAt: article.publishedAt,
        createTime: article.createTime,
        category: article.category
      });
      showToast('PDF导出成功', 'success');
    } catch (error) {
      showToast('PDF导出失败', 'error');
    }
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
            <img src={article.author?.avatar || "https://picsum.photos/seed/user/200"} className="w-6 h-6 rounded-full mr-2" />
            <span className="font-medium text-gray-900 dark:text-gray-200">{article.author?.nickname || article.author?.username || '匿名作者'}</span>
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

      {/* Main Content with TOC */}
      <div className="flex gap-8">
        {/* Table of Contents - Sticky Sidebar */}
        {toc.length > 0 && (
          <aside className={`hidden lg:block ${showToc ? 'w-64' : 'w-0'} transition-all duration-300`}>
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                  <List className="w-4 h-4 mr-2" />
                  目录
                </h3>
                <button
                  onClick={() => setShowToc(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTocClick(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeTocId === item.id
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{ paddingLeft: `${(item.level - 2) * 12 + 12}px` }}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <article className={`flex-1 ${toc.length > 0 && !showToc ? 'lg:ml-0' : ''}`}>
          {/* Show TOC toggle button when TOC is hidden */}
          {toc.length > 0 && !showToc && (
            <button
              onClick={() => setShowToc(true)}
              className="hidden lg:flex items-center mb-6 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <List className="w-4 h-4 mr-2" />
              显示目录
            </button>
          )}
          
          <div 
            ref={contentRef}
            className="prose prose-lg dark:prose-invert max-w-none mb-16 text-gray-800 dark:text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: processContent(
                article.content || article.contentHtml || '暂无内容。',
                toc
              ).replace(/\n/g, '<br/>')
            }}
          />
        </article>
      </div>

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

                <button
                  onClick={handleExportPDF}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <FileDown size={24} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">导出PDF</span>
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
