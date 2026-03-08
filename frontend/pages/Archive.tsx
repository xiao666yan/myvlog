import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronDown, BookOpen, FileText, Menu, X, Edit3, Save, Clock, Library, Trash2, Share2, Link2, Check, Twitter } from 'lucide-react';
import { getColumns, getColumnTree, getArticlesByColumnId } from '../src/api/column';
import { getArticleById } from '../src/api/article';
import { getNotesByArticleId, createNote, deleteNote } from '../src/api/learningNote';
import { Article, Column, LearningNote } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface ArchiveProps {
  onPostClick?: (id: number) => void;
}

const Archive: React.FC<ArchiveProps> = ({ onPostClick }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [columnArticles, setColumnArticles] = useState<Record<string, Article[]>>({});
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'preview' | 'detail'>('list');

  const [expandedCols, setExpandedCols] = useState<Set<string>>(new Set());
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    if (selectedArticle) {
      return `${window.location.origin}/article/${selectedArticle.id}`;
    }
    return window.location.href;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('复制失败');
    }
  };

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(`推荐阅读：${selectedArticle?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareToWeibo = () => {
    const text = encodeURIComponent(`推荐阅读：${selectedArticle?.title}`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://service.weibo.com/share/share.php?title=${text}&url=${url}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedArticle?.title || '文章分享',
          text: `推荐阅读：${selectedArticle?.title}`,
          url: getShareUrl(),
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  useEffect(() => {
    if (selectedColumnId) {
      const loadArticles = async () => {
        await fetchArticlesForColumn(selectedColumnId);
        setArticles(columnArticles[selectedColumnId] || []);
      };
      loadArticles();
    }
  }, [selectedColumnId]);

  useEffect(() => {
    if (selectedColumnId && columnArticles[selectedColumnId]) {
      setArticles(columnArticles[selectedColumnId]);
    }
  }, [columnArticles, selectedColumnId]);

  const fetchColumns = async () => {
    try {
      const data = await getColumnTree();
      setColumns(data);
      const roots = data.filter((c: Column) => !c.parentId).map((c: Column) => c.id.toString());
      setExpandedCols(new Set(roots));
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticlesForColumn = async (columnId: string) => {
    if (columnArticles[columnId]) {
      return;
    }
    try {
      const articleIds = await getArticlesByColumnId(Number(columnId));
      const articlesData = await Promise.all(
        articleIds.map(async (id: number) => {
          try {
            return await getArticleById(id);
          } catch (e) {
            return null;
          }
        })
      );
      const validArticles = articlesData.filter(Boolean) as Article[];
      setColumnArticles(prev => ({ ...prev, [columnId]: validArticles }));
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setColumnArticles(prev => ({ ...prev, [columnId]: [] }));
    }
  };

  const toggleArticleExpand = async (columnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(columnId)) {
      newExpanded.delete(columnId);
    } else {
      newExpanded.add(columnId);
      await fetchArticlesForColumn(columnId);
    }
    setExpandedArticles(newExpanded);
  };

  useEffect(() => {
    if (selectedArticle) {
      fetchNotes(selectedArticle.id);
    }
  }, [selectedArticle]);

  const fetchNotes = async (articleId: number) => {
    try {
      const data = await getNotesByArticleId(articleId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes([]);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = Math.max(200, Math.min(e.clientX, window.innerWidth - 300));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle immediately for instant feedback
    setExpandedCols(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Also fetch articles when expanding for the first time
        if (!prev.has(id)) {
          fetchArticlesForColumn(id);
        }
      }
      return next;
    });
  };

  const handleColumnClick = async (id: string) => {
    setSelectedColumnId(id);
    setSelectedArticle(null); // Clear selected article
    setViewMode('list'); // Switch to column info view
    
    // Auto expand the clicked column immediately for better UX
    setExpandedCols(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Fetch articles for this column to display in sidebar
    // Don't await, let it load in background for better responsiveness
    fetchArticlesForColumn(id);
    
    if (window.innerWidth < 768) setIsSidebarOpenMobile(false);
  };

  const handleArticleClick = async (article: Article) => {
    // 使用 hash 路由跳转到文章详情页
    window.location.hash = `post/${article.id}`;
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedArticle) return;
    try {
      const note = await createNote(selectedArticle.id, { content: newNoteText });
      setNotes(prev => [...prev, note]);
      setNewNoteText('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '未知日期';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '未知日期';
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper to find a column by ID recursively
  const findColumnById = (cols: Column[], id: string): Column | undefined => {
    for (const col of cols) {
      if (col.id.toString() === id) return col;
      if (col.children && col.children.length > 0) {
        const found = findColumnById(col.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedColumn = selectedColumnId ? findColumnById(columns, selectedColumnId) : undefined;

  const renderColumnNode = (col: Column, level: number = 0) => {
    // Only render articles if this column is expanded
    const isExpanded = expandedCols.has(col.id.toString());
    const isSelected = selectedColumnId === col.id.toString();
    
    // Get articles for this column (they are fetched when column is clicked)
    const articlesForThisColumn = columnArticles[col.id.toString()] || [];
    
    // Check if column has children or articles (now articles are also children in the view)
    const hasChildren = (col.children && col.children.length > 0) || articlesForThisColumn.length > 0;
    
    return (
      <li key={col.id} className="select-none">
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg transition-all cursor-pointer ${
            isSelected 
            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={(e) => {
            // If clicking the expand icon area (if it has children), toggle expand
            // Otherwise select the column
            if (hasChildren && (e.target as HTMLElement).closest('.expand-btn')) {
              return;
            }
            handleColumnClick(col.id.toString());
          }}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <div className="flex items-center min-w-0 flex-1">
            {hasChildren ? (
              <button 
                className={`expand-btn p-0.5 mr-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  isSelected ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
                onClick={(e) => toggleExpand(col.id.toString(), e)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5 mr-1.5" /> 
            )}
            
            <div className={`mr-2 ${isSelected ? 'text-white' : 'text-primary-500'}`}>
              {level === 0 ? <Library size={16} /> : <BookOpen size={16} />}
            </div>
            
            <span className="truncate text-sm font-medium">{col.name}</span>
          </div>
          
          {col.articleCount !== undefined && col.articleCount > 0 && (
            <span className={`ml-2 p-1 rounded-lg transition-colors ${
              isSelected 
              ? 'bg-white/20 text-white' 
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            }`} title={`${col.articleCount} 篇文章`}>
              <FileText size={12} />
            </span>
          )}
        </div>

        {/* Render children columns recursively */}
        {isExpanded && (
          <ul className="mt-1 space-y-1">
            {/* Render Sub-columns */}
            {col.children && col.children.length > 0 && col.children.map(child => renderColumnNode(child, level + 1))}
            
            {/* Render Articles as sub-items */}
            {articlesForThisColumn.length > 0 && articlesForThisColumn.map(article => (
              <li key={`art-${article.id}`} className="select-none">
                 <div
                   className={`flex items-center py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                     selectedArticle?.id === article.id
                       ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500'
                       : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                   }`}
                   style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }}
                   onClick={(e) => {
                     e.stopPropagation();
                     handleArticleClick(article);
                   }}
                 >
                   <FileText size={14} className="mr-2 flex-shrink-0 opacity-70" />
                   <span className="truncate text-sm">{article.title}</span>
                 </div>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const buildTree = (): React.ReactNode => {
    if (columns.length === 0) return null;

    return (
      <ul className="space-y-1">
        {columns.map(col => renderColumnNode(col, 0))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
      <div className="md:hidden fixed top-16 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 z-20 shadow-sm">
        <button onClick={() => setIsSidebarOpenMobile(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <Menu size={24} />
        </button>
        <h1 className="ml-2 font-semibold text-primary-600 dark:text-primary-400">归档专栏</h1>
      </div>

      {isSidebarOpenMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpenMobile(false)}
        />
      )}

      <div
        ref={sidebarRef}
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? sidebarWidth : 280 }}
        className={`fixed md:relative top-0 bottom-0 left-0 z-[60] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-lg text-primary-600 dark:text-primary-400 flex items-center">
            <Library className="mr-2" size={20} />
            专栏
          </h2>
          <button className="md:hidden p-1 text-gray-500 dark:text-gray-400" onClick={() => setIsSidebarOpenMobile(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {buildTree()}
        </div>

      </div>

      <div
        className="hidden md:block w-1 cursor-col-resize hover:bg-primary-500 active:bg-primary-600 transition-colors z-10"
        onMouseDown={handleMouseDown}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden pt-14 md:pt-0 bg-gray-50 dark:bg-gray-900">
        {selectedColumnId ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {columns.find(c => c.id.toString() === selectedColumnId)?.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {articles.length} 篇文章
                </p>
              </div>

              {viewMode === 'list' && (
                <div className="max-w-5xl mx-auto">
                  {/* Column Information View */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Cover Image */}
                      {selectedColumn?.coverImage ? (
                        <div className="w-full md:w-1/3 rounded-2xl overflow-hidden shadow-md">
                          <img 
                            src={selectedColumn.coverImage} 
                            alt={selectedColumn.name}
                            className="w-full h-auto object-cover aspect-[4/3]"
                          />
                        </div>
                      ) : (
                        <div className="w-full md:w-1/3 aspect-[4/3] bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                          <Library size={64} className="text-primary-300 dark:text-primary-700" />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold rounded-full uppercase tracking-wider">
                            专栏
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedColumn?.slug || ''}
                          </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                          {selectedColumn?.name}
                        </h1>
                        
                        <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300">
                          {selectedColumn?.description || '暂无描述'}
                        </div>
                        
                        <div className="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex flex-col">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {articles.length}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">文章</span>
                          </div>
                          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                           <div className="flex flex-col">
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                {(() => {
                                  const countSubColumns = (c: Column): number => {
                                    let count = 0;
                                    if (c.children && c.children.length > 0) {
                                      count += c.children.length;
                                      c.children.forEach(child => {
                                        count += countSubColumns(child);
                                      });
                                    }
                                    return count;
                                  };
                                  return selectedColumn ? countSubColumns(selectedColumn) : 0;
                                })()}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">子专栏</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub Columns Grid */}
                    {(() => {
                      if (!selectedColumn || !selectedColumn.children || selectedColumn.children.length === 0) return null;
                      
                      return (
                        <div className="mt-12">
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Library size={20} className="text-primary-600" />
                            子专栏
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedColumn.children.map(subCol => (
                              <div 
                                key={subCol.id}
                                className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition-all group overflow-hidden"
                              >
                                {/* Parent Column (Level 2) */}
                                <div 
                                  className="p-6 cursor-pointer flex-1"
                                  onClick={() => handleColumnClick(subCol.id.toString())}
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                      <BookOpen size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                      {subCol.name}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-10">
                                    {subCol.description || '暂无描述'}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                                    <span>{subCol.articleCount || 0} 篇文章</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                  </div>
                                  
                                  {/* Grandchildren Columns (Level 3) */}
                                  {subCol.children && subCol.children.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                      {subCol.children.map(grandChild => (
                                        <div 
                                          key={grandChild.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleColumnClick(grandChild.id.toString());
                                          }}
                                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group/grand"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover/grand:bg-primary-500"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover/grand:text-primary-600 dark:group-hover/grand:text-primary-400">
                                              {grandChild.name}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                            {grandChild.articleCount || 0}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'detail') && selectedArticle && (
                <div className="h-full flex flex-col">
                  <div className="flex-shrink-0 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      onClick={() => setViewMode('list')}
                      className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-3 transition-colors"
                    >
                      <ChevronRight size={24} className="rotate-180" />
                      <span className="text-xl font-bold">{selectedArticle.title}</span>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full">
                      {/* Main Content - column (3/4) */}
                      <div className="xl:col-span-3 flex flex-col overflow-hidden">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
                          <div className="flex-1 overflow-y-auto p-10 md:p-14 lg:p-16">
                            {/* Article Header */}
                            <div className="mb-8">
                              {/* Cover Image */}
                              <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={selectedArticle.coverImage || `https://picsum.photos/seed/article${selectedArticle.id}/800/400`}
                                  alt={selectedArticle.title}
                                  className="w-full h-48 md:h-64 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/article${selectedArticle.id}/800/400`;
                                  }}
                                />
                              </div>

                              <div className="flex items-center gap-4 mb-6">
                                {selectedArticle.columns && selectedArticle.columns.length > 0 && (
                                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold uppercase tracking-wider">
                                    {selectedArticle.columns[0].name}
                                  </span>
                                )}
                                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                  <Clock size={16} />
                                  预计阅读 8 分钟
                                </span>
                              </div>

                              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                {selectedArticle.title}
                              </h1>
                              
                              <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                    {selectedArticle.author?.avatar ? (
                                      <img src={selectedArticle.author.avatar} alt="Author" className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{(selectedArticle.author?.nickname || selectedArticle.authorName || '作者').charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedArticle.author?.nickname || selectedArticle.authorName || '文章作者'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(selectedArticle.publishedAt || selectedArticle.createdAt)} 发布</p>
                                  </div>
                                </div>
                                <button
                                  onClick={handleNativeShare}
                                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                >
                                  <Share2 size={18} />
                                  <span className="text-sm font-medium">分享</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Article Content */}
                            <div className="pb-8">
                              {viewMode === 'preview' ? (
                                <div className="space-y-8">
                                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    <MarkdownRenderer content={selectedArticle.summary || '暂无摘要'} className="prose-lg" />
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                      最后更新于 {formatDate(selectedArticle.updatedAt || selectedArticle.publishedAt || selectedArticle.createdAt)}
                                    </span>
                                    <button
                                      onClick={() => handleArticleClick(selectedArticle)}
                                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                      阅读全文
                                      <ChevronRight size={18} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="max-w-none">
                                  <MarkdownRenderer content={selectedArticle.content || '加载中...'} className="prose-lg" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sidebar - Notes column (1/3) */}
                      <div className="xl:col-span-1 flex flex-col overflow-hidden">
                        {/* Notes Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">学习笔记</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">记录你的学习心得</p>
                              </div>
                            </div>
                            <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                              {notes.length} 条
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col">
                            <textarea
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="在此记录你的学习心得..."
                              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-blue-500 rounded-xl text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none min-h-[160px] transition-all"
                            />
                            <button
                              onClick={handleAddNote}
                              disabled={!newNoteText.trim()}
                              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                            >
                              <Save size={18} />
                              保存笔记
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">笔记列表</h4>
                              {notes.length > 0 ? (
                                <div className="space-y-4">
                                  {notes.map((note, index) => (
                                    <div key={note.id} className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="flex gap-3 flex-1">
                                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {index + 1}
                                          </span>
                                          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{note.content}</p>
                                        </div>
                                        <button
                                          onClick={() => handleDeleteNote(note.id)}
                                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                          title="删除笔记"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 ml-9">
                                        {note.createdAt ? new Date(note.createdAt).toLocaleString('zh-CN') : ''}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
                                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 dark:text-gray-400">暂无笔记，开始记录吧！</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Share Modal */}
              {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">分享文章</h3>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <X size={20} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={handleShareToTwitter}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <Twitter size={24} />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Twitter</span>
                        </button>

                        <button
                          onClick={handleShareToWeibo}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            微
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">微博</span>
                        </button>

                        <button
                          onClick={handleCopyLink}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
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
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 truncate"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
            <Library size={64} className="mb-6 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">欢迎来到归档专栏</h2>
            <p className="text-center max-w-md">从左侧选择一个专栏，开始你的学习之旅</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
