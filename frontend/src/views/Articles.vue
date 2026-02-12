<template>
  <div class="articles-container">
    <div class="header-section">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>

    <!-- Article list -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <div v-else class="article-list">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <div class="article-cover-wrapper">
          <img 
            :src="article.coverImage || `https://picsum.photos/seed/${article.id}/400/300`" 
            :alt="article.title" 
            class="article-cover-img"
            loading="lazy"
          />
        </div>
        <div class="article-content">
          <div class="article-meta">
            <span v-if="article.visibility === 'private'" class="visibility-tag private">仅自己可见</span>
            <span v-else-if="article.visibility === 'vip'" class="visibility-tag vip">会员可见</span>
            <span class="category">{{ article.category ? article.category.name : '未分类' }}</span>
            <span class="date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
            <span class="author">{{ (article.author && article.author.nickname) ? article.author.nickname : (article.author && article.author.username ? article.author.username : '未知作者') }}</span>
            <div v-if="article.tags && article.tags.length" class="tags">
              <router-link 
                v-for="tag in article.tags" 
                :key="tag.id" 
                class="tag"
                :to="{ path: '/articles', query: { tagId: tag.id, tagName: tag.name } }"
              >
                #{{ tag.name }}
              </router-link>
            </div>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.summary }}</p>
          <div class="article-footer">
            <div class="footer-left">
              <router-link :to="`/articles/${article.id}`" class="read-more">阅读全文 →</router-link>
            </div>
            <div class="interactions">
              <span>字数: {{ article.wordCount || 0 }}</span>
              <span>阅读: {{ article.readingTime || 0 }} 分钟</span>
              <span>👁️ {{ article.viewCount || 0 }}</span>
              <span>👍 {{ article.likeCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="articles.length === 0" class="no-data">
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getArticles } from '@/api/article';

const route = useRoute();
const articles = ref([]);
const loading = ref(false);

const fetchArticles = async () => {
  loading.value = true;
  try {
    const params = {
      page: 1,
      size: 10,
      sort: 'newest'
    };
    
    if (route.query.categoryId) {
      params.categoryId = route.query.categoryId;
    }
    
    const res = await getArticles(params);
    articles.value = res.records || [];
  } catch (error) {
    console.error('Failed to fetch articles', error);
  } finally {
    loading.value = false;
  }
};

const pageTitle = computed(() => {
  return route.query.title || '学习中心';
});

const pageDesc = computed(() => {
  if (route.query.title) {
    return `查看关于 ${route.query.title} 的精选文章`;
  }
  return '探索技术世界，记录成长点滴。';
});

// Watch query changes
watch(() => route.query.categoryId, () => {
  fetchArticles();
});

onMounted(() => {
  fetchArticles();
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.articles-container {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 40px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.header-section p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.loading-state, .no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-card {
  display: flex;
  border-radius: var(--radius-lg);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border: 1px solid var(--border-color);
  min-height: 220px;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.article-card:hover .article-cover-img {
  transform: scale(1.05);
}

.article-cover-wrapper {
  width: 320px;
  min-height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.article-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.category {
  color: var(--primary-color);
  font-weight: 500;
  background-color: rgba(66, 185, 131, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.visibility-tag {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.visibility-tag.private {
  background-color: #ff4d4f;
  color: white;
}

.visibility-tag.vip {
  background-color: #faad14;
  color: white;
}

.tags {
  display: flex;
  gap: 6px;
}

.tag {
  color: var(--text-secondary);
  font-size: 0.85rem;
  background-color: var(--hover-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.date {
  color: var(--text-secondary);
}

.author {
  margin-left: auto;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.8;
}

h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: var(--text-primary);
  line-height: 1.5;
  
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-content p {
  color: var(--text-secondary);
  margin-bottom: auto;
  line-height: 1.6;
  
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.read-more {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-edit {
  padding: 4px 12px;
  font-size: 0.85rem;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.btn-edit:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.interactions {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
    height: auto;
  }
  
  .article-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
