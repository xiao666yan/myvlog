<template>
  <div class="search-page">
    <div class="container">
      <!-- Search Header & Filters -->
      <div class="search-header">
        <h1 class="page-title">
          搜索结果: <span class="highlight-query">{{ searchQuery }}</span>
        </h1>
        
        <div class="filters">
          <div class="filter-group">
            <label>分类:</label>
            <select v-model="selectedCategory" @change="handleFilterChange">
              <option value="">全部</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>标签:</label>
            <select v-model="selectedTag" @change="handleFilterChange">
              <option value="">全部</option>
              <option v-for="tag in tags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results List -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在搜索...</p>
      </div>

      <div v-else-if="articles.length > 0" class="results-list">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <div class="article-content">
            <h2 class="article-title">
              <router-link :to="'/articles/' + article.slug || article.id">
                <!-- Use v-html for highlighted title -->
                <span v-html="article.title"></span>
              </router-link>
            </h2>
            
            <div class="article-meta">
              <span class="meta-item date">
                <i class="icon-calendar"></i> {{ formatDate(article.publishedAt) }}
              </span>
              <span class="meta-item category" v-if="article.category">
                <i class="icon-folder"></i> {{ article.category.name }}
              </span>
              <span class="meta-item views">
                <i class="icon-eye"></i> {{ article.viewCount }} 阅读
              </span>
              <span class="meta-item author-nickname" v-if="article.author">
                {{ article.author.nickname }}
              </span>
            </div>
            
            <div class="article-summary" v-html="article.summary"></div>
            
            <div class="article-tags" v-if="article.tags && article.tags.length">
              <span v-for="tag in article.tags" :key="tag.id" class="tag">#{{ tag.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到相关文章</h3>
        <p>换个关键词试试，或者浏览<router-link to="/articles">所有文章</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchArticles } from '@/api/search';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const articles = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const pageSize = ref(10);

// Filters
const categories = ref([]);
const tags = ref([]);
const selectedCategory = ref('');
const selectedTag = ref('');

const initFilters = async () => {
  try {
    const [catRes, tagRes] = await Promise.all([getCategories(), getTags()]);
    categories.value = catRes.data || catRes;
    tags.value = tagRes.data || tagRes;
  } catch (error) {
    console.error('Failed to load filters:', error);
  }
};

const fetchData = async () => {
  searchQuery.value = route.query.q || '';
  // Check if filters are in query, otherwise use current selected
  // Ideally, filters should also be in URL query to be shareable
  // But for now we just sync local state -> fetch
  
  loading.value = true;
  try {
    const params = {
      q: searchQuery.value,
      page: currentPage.value,
      size: pageSize.value,
      categoryId: selectedCategory.value || undefined,
      tagId: selectedTag.value || undefined
    };
    
    const res = await searchArticles(params);
    articles.value = res.records;
    totalPages.value = res.pages;
    currentPage.value = res.current;
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchData();
};

const changePage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchData();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

onMounted(() => {
  initFilters();
  // Sync filters from route if needed (optional enhancement)
  fetchData();
});

watch(() => route.query, () => {
  currentPage.value = 1; // Reset page on new search
  fetchData();
});
</script>

<style scoped>
.search-page {
  padding: 80px 20px 40px;
  min-height: 100vh;
  background-color: var(--bg-color, #f9fafb);
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 30px;
  background: var(--card-bg, #ffffff);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--text-primary, #111827);
}

.highlight-query {
  color: var(--primary-color, #42b983);
  font-weight: 700;
}

.filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background-color: var(--input-bg, #fff);
  color: var(--text-primary, #374151);
  outline: none;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  background: var(--card-bg, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.article-title {
  font-size: 1.25rem;
  margin-bottom: 12px;
}

.article-title a {
  color: var(--text-primary, #111827);
  text-decoration: none;
  transition: color 0.2s;
}

.article-title a:hover {
  color: var(--primary-color, #42b983);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 16px;
}

.author-nickname {
  margin-left: auto;
  font-weight: 500;
}

.article-summary {
  color: var(--text-secondary, #4b5563);
  line-height: 1.6;
  margin-bottom: 16px;
}

.article-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background-color: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--card-bg, #fff);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary, #6b7280);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-secondary, #e5e7eb);
  border-top-color: var(--primary-color, #42b983);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Highlight styling */
:deep(mark) {
  background-color: rgba(66, 185, 131, 0.2);
  color: var(--primary-color, #42b983);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
