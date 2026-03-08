import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Save, Image as ImageIcon, Tag as TagIcon, Sparkles, Layout, Eye, Edit3, Code, 
  Bold, Italic, List, ListOrdered, Quote, Link, Heading1, Heading2, Heading3,
  Strikethrough, Table, Minus, CheckSquare, Image, FileCode, Subscript, Superscript,
  Highlighter, Maximize2, Minimize2, Copy, Download, Undo, Redo, Info, Columns, X, Loader2
} from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_TAGS } from '../constants.tsx';
import { suggestTags } from '../services/geminiService.ts';
import { useToast } from '../context/ToastContext';
import { getCategories } from '../src/api/category';
import { getTags } from '../src/api/tag';
import { getColumns } from '../src/api/column';
import { uploadFile } from '../src/api/upload';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface EditorProps {
  initialArticle?: any;
  onSave: (article: any) => void;
}

const Editor: React.FC<EditorProps> = ({ initialArticle, onSave }) => {
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [category, setCategory] = useState<number | null>(initialArticle?.categoryId ?? null);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialArticle?.tags?.map((t: any) => t.id) || []);
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<number[]>(initialArticle?.columnIds || initialArticle?.columns?.map((c: any) => c.id) || []);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<string[]>([initialArticle?.content || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const isScrolling = useRef(false);

  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title || '');
      setContent(initialArticle.content || '');
      // 编辑文章时保持原有分类，不强制设置为0
      if (initialArticle.categoryId !== undefined && initialArticle.categoryId !== null) {
        setCategory(initialArticle.categoryId);
      } else if (initialArticle.category?.id) {
        // 兼容 category 对象形式
        setCategory(initialArticle.category.id);
      }
      setSelectedTags(initialArticle.tags?.map((t: any) => t.id) || initialArticle.tagIds || []);
      setSelectedColumns(initialArticle.columnIds || initialArticle.columns?.map((c: any) => c.id) || []);
      setCoverImage(initialArticle.coverImage || '');
      setHistory([initialArticle.content || '']);
      setHistoryIndex(0);
    } else {
      setTitle('');
      setContent('');
      setCategory(null);
      setSelectedTags([]);
      setSelectedColumns([]);
      setCoverImage('');
      setHistory(['']);
      setHistoryIndex(0);
    }
  }, [initialArticle]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, tagsRes, columnsRes] = await Promise.all([
          getCategories(),
          getTags(),
          getColumns()
        ]);
        const fetchedCategories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []);
        const fetchedTags = Array.isArray(tagsRes) ? tagsRes : (tagsRes.records || tagsRes.data || tagsRes || []);
        const fetchedColumns = Array.isArray(columnsRes) ? columnsRes : ((columnsRes as any).data || (columnsRes as any).records || []);
        setCategories(fetchedCategories);
        setTags(fetchedTags);
        setColumns(fetchedColumns);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // 单独处理新建文章的默认分类选择
  useEffect(() => {
    // 只在新建文章、分类列表已加载、且当前没有分类时，选择第一个分类
    // 注意：编辑文章时不要覆盖原有分类，即使 categories 加载较晚
    if (!initialArticle && categories.length > 0 && category === null) {
      setCategory(categories[0].id);
    }
  }, [initialArticle, categories, category]);

  // 滚动同步功能
  useEffect(() => {
    if (viewMode !== 'split') return;

    const editorContainer = editorContainerRef.current;
    const preview = previewRef.current;
    if (!editorContainer || !preview) return;

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isScrolling.current) return;
      isScrolling.current = true;

      const sourceScrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight || 1);
      const targetScrollTop = sourceScrollRatio * (target.scrollHeight - target.clientHeight || 1);
      
      target.scrollTop = targetScrollTop;

      setTimeout(() => {
        isScrolling.current = false;
      }, 50);
    };

    const handleEditorScroll = () => {
      syncScroll(editorContainer, preview);
    };

    const handlePreviewScroll = () => {
      syncScroll(preview, editorContainer);
    };

    editorContainer.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editorContainer.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [viewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertMarkdown('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('*', '*');
            break;
          case 'k':
            e.preventDefault();
            insertMarkdown('[', '](url)');
            break;
          case 's':
            e.preventDefault();
            onSave({ title, content, category, selectedTags, selectedColumns });
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, title, category, selectedTags]);

  const pushToHistory = useCallback((newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleAITagSuggestions = async () => {
    if (!title || !content) return showToast('请先输入标题和内容', 'error');
    setIsSuggesting(true);
    const suggestions = await suggestTags(title, content);
    showToast("AI 建议标签：" + suggestions.join(', '), 'info');
    setIsSuggesting(false);
  };

  const toggleTag = (id: number) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const insertMarkdown = (prefix: string, suffix: string = prefix, wrapLine: boolean = false, needBlankLine: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent: string;
    let newCursorStart: number;
    let newCursorEnd: number;

    if (wrapLine) {
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = content.indexOf('\n', end);
      const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;
      const lineContent = content.substring(lineStart, actualLineEnd);

      // 检查是否需要在前面添加空行
      let blankLinePrefix = '';
      if (needBlankLine && lineStart > 0) {
        const charBeforeLine = content.substring(lineStart - 1, lineStart);
        if (charBeforeLine !== '\n') {
          blankLinePrefix = '\n';
        }
      }

      newContent = content.substring(0, lineStart) + blankLinePrefix + prefix + lineContent + suffix + content.substring(actualLineEnd);
      newCursorStart = lineStart + blankLinePrefix.length + prefix.length;
      newCursorEnd = newCursorStart + lineContent.length;
    } else {
      newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      newCursorStart = start + prefix.length;
      newCursorEnd = newCursorStart + selectedText.length;
    }

    setContent(newContent);
    pushToHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const insertBlock = (block: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);
    
    const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const prefix = needsNewline ? '\n' : '';
    const newContent = beforeCursor + prefix + block + afterCursor;
    
    setContent(newContent);
    pushToHistory(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + block.indexOf('|') + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertImage = () => {
    // 触发文件选择
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndInsertImage(file);
  };

  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      showToast('图片大小不能超过 15MB', 'error');
      return;
    }
    
    setUploading(true);
    try {
      const res = await uploadFile(file);
      const imageUrl = typeof res === 'string' ? res : (res as any).url;
      const alt = file.name.replace(/\.[^/.]+$/, '');
      insertMarkdown(`![${alt}](${imageUrl})`, '');
      showToast('图片上传成功', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('图片上传失败，请重试', 'error');
    } finally {
      setUploading(false);
      // 重置文件输入
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 检查是否是图片
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadAndInsertImage(file);
        }
        return;
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error');
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      showToast('图片大小不能超过 15MB', 'error');
      return;
    }
    
    setUploading(true);
    try {
      const res = await uploadFile(file);
      const imageUrl = typeof res === 'string' ? res : (res as any).url;
      setCoverImage(imageUrl);
      showToast('封面上传成功', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('上传失败，请重试', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeCover = () => {
    setCoverImage('');
  };

  const insertLink = () => {
    const url = prompt('请输入链接URL:');
    if (url) {
      insertMarkdown('[', `](${url})`);
    }
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('文件已下载', 'success');
  };

  const getWordCount = () => {
    const text = content.trim();
    if (!text) return { chars: 0, words: 0, lines: 0 };
    const chars = text.length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    return { chars, words, lines };
  };

  const wordCount = getWordCount();

  const toolbarGroups = [
    {
      title: '历史',
      buttons: [
        { icon: Undo, title: '撤销 (Ctrl+Z)', action: undo, disabled: historyIndex === 0 },
        { icon: Redo, title: '重做 (Ctrl+Shift+Z)', action: redo, disabled: historyIndex === history.length - 1 },
      ]
    },
    {
      title: '标题',
      buttons: [
        { icon: Heading1, title: '一级标题', action: () => insertMarkdown('# ', '', true, true) },
        { icon: Heading2, title: '二级标题', action: () => insertMarkdown('## ', '', true, true) },
        { icon: Heading3, title: '三级标题', action: () => insertMarkdown('### ', '', true, true) },
      ]
    },
    {
      title: '文本样式',
      buttons: [
        { icon: Bold, title: '粗体 (Ctrl+B)', action: () => insertMarkdown('**', '**') },
        { icon: Italic, title: '斜体 (Ctrl+I)', action: () => insertMarkdown('*', '*') },
        { icon: Strikethrough, title: '删除线', action: () => insertMarkdown('~~', '~~') },
        { icon: Highlighter, title: '高亮', action: () => insertMarkdown('==', '==') },
        { icon: Subscript, title: '下标', action: () => insertMarkdown('~', '~') },
        { icon: Superscript, title: '上标', action: () => insertMarkdown('^', '^') },
      ]
    },
    {
      title: '代码',
      buttons: [
        { icon: Code, title: '行内代码', action: () => insertMarkdown('`', '`') },
        { icon: FileCode, title: '代码块', action: () => insertBlock('```language\n|\n```') },
      ]
    },
    {
      title: '列表',
      buttons: [
        { icon: List, title: '无序列表', action: () => insertMarkdown('- ', '', true, true) },
        { icon: ListOrdered, title: '有序列表', action: () => insertMarkdown('1. ', '', true, true) },
        { icon: CheckSquare, title: '任务列表', action: () => insertMarkdown('- [ ] ', '', true, true) },
      ]
    },
    {
      title: '插入',
      buttons: [
        { icon: Quote, title: '引用', action: () => insertMarkdown('> ', '', true, true) },
        { icon: Link, title: '链接 (Ctrl+K)', action: insertLink },
        { icon: Image, title: '图片', action: insertImage },
        { icon: Table, title: '表格', action: () => insertBlock('| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |') },
        { icon: Minus, title: '分割线', action: () => insertBlock('\n---\n') },
      ]
    },
    {
      title: '工具',
      buttons: [
        { icon: Copy, title: '复制 Markdown', action: copyMarkdown },
        { icon: Download, title: '下载 .md 文件', action: downloadMarkdown },
        { icon: isFullscreen ? Minimize2 : Maximize2, title: isFullscreen ? '退出全屏' : '全屏编辑', action: () => setIsFullscreen(!isFullscreen) },
      ]
    },
  ];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-950' : 'max-w-7xl mx-auto'} px-4 py-12`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">{initialArticle ? '编辑文章' : '新建文章'}</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            >
              <Edit3 size={14} /> 编辑
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'split' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            >
              <Columns size={14} /> 分屏
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            >
              <Eye size={14} /> 预览
            </button>
          </div>
          <button 
            onClick={() => onSave({ title, content, category, selectedTags, selectedColumns, coverImage, status: 'published' })}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center"
          >
            <Save size={18} className="mr-2" /> 发布
          </button>
        </div>
      </div>

      <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-8`}>
        <div className={`${isFullscreen ? '' : 'lg:col-span-3'} space-y-6`}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <input 
              type="text"
              placeholder="文章标题"
              className="w-full px-8 py-6 text-3xl font-bold bg-transparent border-b border-gray-100 dark:border-gray-800 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {viewMode !== 'preview' && (
              <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
                <div className="flex items-center gap-1 px-4 py-2 flex-wrap">
                  {toolbarGroups.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <div className="flex items-center gap-0.5">
                        {group.buttons.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={btn.action}
                            title={btn.title}
                            disabled={btn.disabled}
                            className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            <btn.icon size={16} />
                          </button>
                        ))}
                      </div>
                      {gIdx < toolbarGroups.length - 1 && (
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`flex ${viewMode === 'split' ? 'flex-row' : 'flex-col'}`}>
              {viewMode !== 'preview' && (
                <div ref={editorContainerRef} className={`${viewMode === 'split' ? 'w-1/2 border-r border-gray-100 dark:border-gray-800' : 'w-full'} h-[600px] overflow-auto`}>
                  <textarea
                    ref={textareaRef}
                    name="markdown-editor"
                    placeholder="使用 Markdown 编写您的文章...&#10;支持直接粘贴图片或点击工具栏插入图片"
                    className="w-full px-6 py-6 min-h-full bg-transparent resize-none focus:outline-none leading-relaxed text-lg font-mono"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                    }}
                    onBlur={() => pushToHistory(content)}
                    onPaste={handlePaste}
                  />
                  <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>字符: {wordCount.chars}</span>
                      <span>单词: {wordCount.words}</span>
                      <span>行数: {wordCount.lines}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info size={12} />
                      <span>Ctrl+B 粗体 | Ctrl+I 斜体 | Ctrl+K 链接 | Ctrl+Z 撤销</span>
                    </div>
                  </div>
                </div>
              )}
              
              {viewMode !== 'edit' && (
                <div ref={previewRef} className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-[600px] overflow-auto`}>
                  <div className="px-6 py-6 min-h-full">
                    {content ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-gray-400 italic">预览区域 - 开始输入内容查看效果</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isFullscreen && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-bold mb-4 flex items-center"><ImageIcon size={18} className="mr-2" /> 封面图片</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              {/* 文章图片上传 input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {coverImage ? (
                <div className="relative group">
                  <img 
                    src={coverImage} 
                    alt="封面预览" 
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button 
                      onClick={removeCover}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl h-40 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:text-primary-400'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={32} className="animate-spin text-primary-500" />
                      <span className="mt-2 text-sm font-medium">上传中...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} />
                      <span className="mt-2 text-sm font-medium">上传图片</span>
                      <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 15MB</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-bold mb-4 flex items-center"><Layout size={18} className="mr-2" /> 分类</h3>
              <select
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2"
                value={category || ''}
                onChange={(e) => setCategory(Number(e.target.value))}
              >
                <option value="">请选择分类</option>
                {categories.length > 0 ? categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                )) : MOCK_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center"><TagIcon size={18} className="mr-2" /> 标签</h3>
                <button 
                  onClick={handleAITagSuggestions}
                  disabled={isSuggesting}
                  className="text-xs text-primary-600 font-bold hover:underline flex items-center"
                >
                  <Sparkles size={12} className="mr-1" /> {isSuggesting ? '思考中...' : 'AI 建议'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? tags.map(tag => (
                  <button 
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {tag.name}
                  </button>
                )) : MOCK_TAGS.map(tag => (
                  <button 
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Column Selection */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-900 dark:text-white font-bold">
                  <Columns size={18} className="mr-2 text-primary-600" />
                  所属专栏
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {columns.length > 0 ? columns.map(column => (
                  <button
                    key={column.id}
                    onClick={() => {
                      if (selectedColumns.includes(column.id)) {
                        setSelectedColumns(selectedColumns.filter(id => id !== column.id));
                      } else {
                        setSelectedColumns([...selectedColumns, column.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedColumns.includes(column.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {column.name}
                  </button>
                )) : (
                  <span className="text-sm text-gray-400">暂无专栏，请在管理后台创建</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
