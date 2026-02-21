
import React, { useState, useEffect } from 'react';
import { Share2, MoreHorizontal, Clock } from 'lucide-react';
import { MOCK_USER } from '../constants.tsx';
import { getArticles } from '../src/api/article';
import { getCategories } from '../src/api/category';

interface MomentsProps {
  onPostClick: (id: number) => void;
}

const Moments: React.FC<MomentsProps> = ({ onPostClick }) => {
  const [lifeEssays, setLifeEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold mb-2">动态</h1>
        <p className="text-gray-500 dark:text-gray-400">捕捉日常生活中的美好。</p>
      </div>

      <div className="space-y-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {lifeEssays.map((post) => (
              <article 
                key={post.id} 
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={post.author?.avatar || MOCK_USER.avatar} alt="Author" className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700" />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{post.author?.nickname || MOCK_USER.nickname}</h3>
                      <div className="flex items-center text-xs text-gray-400 space-x-2">
                        <Clock size={12} />
                        <span>{new Date(post.createdAt || post.createTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-primary-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Content Text */}
                <div className="px-6 pb-4">
                  <h4 className="font-bold text-lg mb-2 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => onPostClick(post.id)}>
                    {post.title}
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed cursor-pointer" onClick={() => onPostClick(post.id)}>
                    {post.summary}
                  </p>
                </div>

                {/* Main Image */}
                {post.coverImage && (
                  <div className="cursor-pointer overflow-hidden" onClick={() => onPostClick(post.id)}>
                    <img 
                      src={post.coverImage} 
                      alt="Moment content" 
                      className="w-full aspect-video object-cover transition-transform duration-700 hover:scale-105" 
                    />
                  </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-end">
                  <button className="p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Share2 size={20} />
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
    </div>
  );
};

export default Moments;
