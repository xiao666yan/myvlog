<template>
  <div class="article-detail-container">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="!article" class="error-state">文章未找到</div>
    <div v-else class="article-content-wrapper">
      <header class="article-header">
        <div class="meta-top">
          <span class="category" v-if="article.category">{{ article.category.name }}</span>
          <span class="date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
        </div>
        
        <h1 class="title">{{ article.title }}</h1>
        
        <div class="meta-bottom">
          <div class="author" v-if="article.author">
            <span class="avatar-placeholder">{{ article.author.nickname?.charAt(0) || 'A' }}</span>
            <span class="author-name">{{ article.author.nickname || article.author.username }}</span>
          </div>
          <div class="stats">
            <span>字数: {{ article.wordCount || 0 }}</span>
            <span>阅读: {{ article.readingTime || 1 }} 分钟</span>
            <span>👁️ {{ article.viewCount || 0 }}</span>
          </div>
        </div>
      </header>

      <img v-if="article.coverImage" :src="article.coverImage" class="cover-image" alt="文章封面" />

      <!-- Article TOC -->
      <div v-if="article.toc && article.toc.length > 0" class="article-toc">
        <div class="toc-title">目录</div>
        <nav class="toc-list">
          <a 
            v-for="(item, index) in article.toc" 
            :key="index" 
            :href="'#' + item.id"
            :class="['toc-item', 'level-' + item.level]"
            @click.prevent="scrollToId(item.id)"
          >
            <span class="toc-dot"></span>
            {{ item.text }}
          </a>
        </nav>
      </div>

      <!-- Render HTML content from backend -->
      <article class="markdown-body" v-html="article.contentHtml"></article>

      <div class="article-footer">
        <div class="tags" v-if="article.tags && article.tags.length">
          <span v-for="tag in article.tags" :key="tag.id" class="tag"># {{ tag.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getArticle, getArticleBySlug } from '@/api/article';

const route = useRoute();
const article = ref(null);
const loading = ref(true);

const fetchArticle = async () => {
  loading.value = true;
  try {
    const param = route.params.id;
    let res;
    // Check if param is purely numeric (ID) or string (Slug)
    if (/^\d+$/.test(param)) {
      res = await getArticle(param);
    } else {
      res = await getArticleBySlug(param);
    }
    article.value = res;
  } catch (error) {
    console.error('Failed to fetch article:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const scrollToId = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Update URL hash without jumping
    history.pushState(null, null, `#${id}`);
  }
};

onMounted(() => {
  fetchArticle();
});
</script>

<style scoped>
.article-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.article-header {
  margin-bottom: 32px;
  text-align: center;
}

.meta-top {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.category {
  color: var(--primary-color);
  font-weight: 600;
  background-color: rgba(66, 185, 131, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.date {
  color: var(--text-secondary);
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.meta-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  color: var(--text-secondary);
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-placeholder {
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
}

.cover-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 40px;
  box-shadow: var(--shadow-md);
  aspect-ratio: 21 / 9;
}

/* TOC Styles */
.article-toc {
  background-color: var(--hover-bg);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
}

.toc-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-title::before {
  content: ' ';
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.95rem;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.5;
}

.toc-item:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}

.toc-dot {
  margin-top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.2s;
}

.toc-item:hover .toc-dot {
  background-color: var(--primary-color);
  transform: scale(1.5);
}

.level-1 { font-weight: 600; color: var(--text-primary); }
.level-2 { padding-left: 16px; }
.level-3 { padding-left: 32px; font-size: 0.9rem; }
.level-4 { padding-left: 48px; font-size: 0.85rem; }
.level-5 { padding-left: 64px; font-size: 0.8rem; }
.level-6 { padding-left: 80px; font-size: 0.8rem; }

.markdown-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Basic Markdown Styling (should ideally use a global markdown css or library style) */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 700;
  color: var(--text-primary);
  scroll-margin-top: 80px; /* Offset for sticky header */
}

.markdown-body :deep(p) {
  margin-bottom: 1.2em;
}

.markdown-body :deep(pre) {
  background-color: var(--hover-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.2em;
}

.markdown-body :deep(code) {
  background-color: var(--hover-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 0 0 1.2em 0;
  padding-left: 16px;
  color: var(--text-secondary);
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1.2em 0;
}

.article-footer {
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag {
  background-color: var(--hover-bg);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tag:hover {
  background-color: var(--primary-color);
  color: white;
}
</style>
