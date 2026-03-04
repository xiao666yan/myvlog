
import React, { useState, useEffect } from 'react';
import { Share2, MoreHorizontal, Clock, X, Check, Link2, Twitter } from 'lucide-react';
import { MOCK_USER } from '../constants.tsx';
import { getArticles } from '../src/api/article';
import { getCategories } from '../src/api/category';
import { useToast } from '../context/ToastContext';

interface MomentsProps {
  onPostClick: (id: number) => void;
}

const Moments: React.FC<MomentsProps> = ({ onPostClick }) => {
  const [lifeEssays, setLifeEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleShare = (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    setSharePost(post);
    setShareModalOpen(true);
  };

  const getShareUrl = () => {
    if (!sharePost) return '';
    return `${window.location.origin}/article/${sharePost.id}`;
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
    const text = encodeURIComponent(`查看这条动态：${sharePost?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareToWeibo = () => {
    const text = encodeURIComponent(`查看这条动态：${sharePost?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
  };

  const handleNativeShare = async (post: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || '动态分享',
          text: post.summary || '',
          url: `${window.location.origin}/article/${post.id}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleShare({ stopPropagation: () => {} } as any, post);
    }
  };

  useEffect(() => {
    const fetchLifeEssays = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories to find the ID of "生活随笔"
        const categoriesRes = await getCategories().catch(() => []);
        const categories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);
        const lifeCategory = categories.find((c: any) => c.name === '生活随笔');

        if (lifeCategory) {
          const articlesRes = await getArticles({ categoryId: lifeCategory.id, size: 50 }).catch(() => []);
          const articles = Array.isArray(articlesRes) ? articlesRes : ((articlesRes as any).records || (articlesRes as any).data || []);
          setLifeEssays(articles);
        } else {
          setLifeEssays([]);
        }
      } catch (error) {
        console.error('Failed to fetch life essays:', error);
        setLifeEssays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeEssays();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold mb-3">动态</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">捕捉日常生活中的美好。</p>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {lifeEssays.map((post) => (
              <article 
                key={post.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={post.author?.avatar || MOCK_USER.avatar} alt="Author" className="w-11 h-11 rounded-full border border-gray-100 dark:border-gray-700" />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight text-base">{post.author?.nickname || MOCK_USER.nickname}</h3>
                      <div className="flex items-center text-sm text-gray-400 space-x-2">
                        <Clock size={14} />
                        <span>{new Date(post.createdAt || post.createTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-primary-600 p-2">
                    <MoreHorizontal size={22} />
                  </button>
                </div>

                {/* Content Text */}
                <div className="px-5 pb-4">
                  <h4 className="font-bold text-xl mb-3 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => onPostClick(post.id)}>
                    {post.title}
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed cursor-pointer text-base line-clamp-4" onClick={() => onPostClick(post.id)}>
                    {post.summary}
                  </p>
                </div>

                {/* Main Image */}
                {post.coverImage && (
                  <div className="cursor-pointer overflow-hidden" onClick={() => onPostClick(post.id)}>
                    <img 
                      src={post.coverImage} 
                      alt="Moment content" 
                      className="w-full aspect-[16/9] object-cover transition-transform duration-700 hover:scale-105 max-h-[500px]" 
                    />
                  </div>
                )}

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-50 dark:border-gray-800 flex items-center justify-end">
                  <button 
                    onClick={(e) => handleShare(e, post)}
                    className="p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Share2 size={22} />
                  </button>
                </div>
              </article>
            ))}

            {lifeEssays.length === 0 && (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">暂无动态</h3>
                <p className="text-gray-500">分享您的第一篇生活随笔，它将显示在这里！</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && sharePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg">分享动态</h3>
              <button 
                onClick={() => setShareModalOpen(false)}
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
                <label className="text-sm text-gray-500 mb-2 block">分享链接</label>
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

export default Moments;
