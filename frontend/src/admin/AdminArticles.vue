<template>
  <div class="admin-articles">
    <h2>文章管理</h2>
    <div class="toolbar">
      <button @click="reload">刷新</button>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="!records || records.length === 0" class="no-data">暂无文章数据</div>
      <table v-else class="article-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in records" :key="item.id">
            <td>{{ item.id }}</td>
            <td class="title-cell">{{ item.title }}</td>
            <td>{{ item.category?.name || '-' }}</td>
            <td>
              <span :class="['status-badge', item.status]">{{ item.status }}</span>
            </td>
            <td>{{ item.viewCount }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <div class="actions">
                <router-link :to="`/articles/${item.id}`" class="btn-link">查看</router-link>
                <router-link :to="`/edit/${item.id}`" class="btn-link">编辑</router-link>
                <button @click="handleDelete(item.id)" class="btn-danger-small">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button :disabled="page <= 1" @click="page--">上一页</button>
        <span>第 {{ page }} / {{ pages }} 页</span>
        <button :disabled="page >= pages" @click="page++">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAdminArticles, deleteArticle } from '@/api/article';
import { showMessage } from '@/utils/message';
import { showConfirm } from '@/utils/confirm';

const page = ref(1);
const pages = ref(1);
const records = ref([]);
const loading = ref(false);

const reload = async () => {
  loading.value = true;
  try {
    const res = await getAdminArticles({ page: page.value, size: 10 });
    console.log('Articles API response:', res);
    if (res && res.records) {
      records.value = res.records;
      pages.value = res.pages || 1;
    } else if (Array.isArray(res)) {
      records.value = res;
      pages.value = 1;
    } else {
      records.value = [];
    }
  } catch (e) {
    console.error('加载文章失败', e);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  const confirmed = await showConfirm('确定要删除这篇文章吗？');
  if (confirmed) {
    try {
      await deleteArticle(id);
      showMessage('删除成功');
      reload();
    } catch (e) {
      console.error(e);
      showMessage('删除失败', 'error');
    }
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

watch(page, reload);
onMounted(reload);
</script>

<style scoped>
.admin-articles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
}
.article-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.article-table th, .article-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.article-table th {
  background: var(--hover-bg);
  font-weight: 600;
}
.title-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-badge.published { background: #dcfce7; color: #166534; }
.status-badge.draft { background: #f3f4f6; color: #374151; }

.actions {
  display: flex;
  gap: 12px;
}
.btn-link {
  color: var(--primary-color);
  text-decoration: none;
}
.btn-danger-small {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
.no-data {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}
</style>
