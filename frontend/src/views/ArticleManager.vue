<template>
  <div class="article-manager-container">
    <h1 class="page-title">文章管理</h1>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="Object.keys(groupedArticles).length === 0" class="empty-state">
      暂无文章，快去<router-link to="/create">创作</router-link>吧！
    </div>
    
    <div v-else class="category-groups">
      <div v-for="(articles, categoryName) in groupedArticles" :key="categoryName" class="category-group">
        <h2 class="category-title">{{ categoryName }}</h2>
        <ul class="article-list">
          <li v-for="article in articles" :key="article.id" class="article-item">
            <div class="article-info">
              <span class="article-title">{{ article.title }}</span>
              <span class="article-meta">
                <span class="status" :class="article.status">{{ formatStatus(article.status) }}</span>
                <span class="date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              </span>
            </div>
            <div class="article-actions">
              <button @click="editArticle(article.id)" class="btn-edit">修改文章</button>
              <button @click="confirmDelete(article.id)" class="btn-delete">删除文章</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyArticles, deleteArticle } from '@/api/article';
import { showMessage } from '@/utils/message';
import { showConfirm } from '@/utils/confirm';

const router = useRouter();
const loading = ref(true);
const groupedArticles = ref({});

const loadArticles = async () => {
  loading.value = true;
  try {
    const res = await getMyArticles();
    // Group by category
    const groups = {};
    
    // Sort all by publishedAt desc first (though backend might have done it, good to ensure)
    const sorted = res.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return dateB - dateA;
    });

    sorted.forEach(article => {
      const catName = article.category?.name || '未分类';
      if (!groups[catName]) {
        groups[catName] = [];
      }
      groups[catName].push(article);
    });
    
    groupedArticles.value = groups;
  } catch (error) {
    console.error('Failed to load articles:', error);
  } finally {
    loading.value = false;
  }
};

const editArticle = (id) => {
  router.push(`/edit/${id}`);
};

const confirmDelete = async (id) => {
  const confirmed = await showConfirm('确定要删除这篇文章吗？此操作不可恢复。');
  if (confirmed) {
    try {
      await deleteArticle(id);
      showMessage('删除成功');
      // Reload
      await loadArticles();
    } catch (error) {
      console.error('Delete failed:', error);
      showMessage('删除失败', 'error');
    }
  }
};

const formatStatus = (status) => {
  const map = {
    'PUBLISHED': '已发布',
    'DRAFT': '草稿',
    'HIDDEN': '隐藏',
    'SCHEDULED': '定时',
    'PENDING': '审核中',
    'REJECTED': '已拒绝'
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    showMessage('请先登录', 'error');
    router.push('/login');
    return;
  }
  loadArticles();
});
</script>

<style scoped>
.article-manager-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
}

.category-group {
  margin-bottom: 40px;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--primary-color);
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  background-color: var(--bg-secondary);
  padding-left: 10px;
  padding-right: 10px;
  margin-left: -10px;
  margin-right: -10px;
  border-radius: 6px;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.article-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.article-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
  align-items: center;
}

.status {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  font-size: 0.75rem;
}

.status.PUBLISHED { color: #10b981; background-color: rgba(16, 185, 129, 0.1); }
.status.DRAFT { color: #f59e0b; background-color: rgba(245, 158, 11, 0.1); }

.article-actions {
  display: flex;
  gap: 12px;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-edit {
  background-color: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  background-color: var(--primary-dark);
}

.btn-delete {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-delete:hover {
  background-color: #ef4444;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border-radius: 12px;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
