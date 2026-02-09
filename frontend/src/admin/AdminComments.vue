<template>
  <div class="admin-comments">
    <div class="header-actions">
      <h2>评论与互动管理</h2>
      <div class="filters">
        <select v-model="statusFilter" @change="fetchComments">
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="spam">垃圾评论</option>
        </select>
        <button class="btn-secondary" @click="fetchComments">刷新</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="comments.length === 0" class="no-data">暂无评论数据</div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>文章</th>
            <th>用户/访客</th>
            <th>内容</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.id">
            <td>{{ comment.id }}</td>
            <td class="article-cell">
              <router-link :to="`/articles/${comment.articleId}`" target="_blank">
                {{ comment.articleTitle || '未知文章' }}
              </router-link>
            </td>
            <td>
              <div v-if="comment.userId">
                <strong>{{ comment.userNickname || comment.username }}</strong>
                <span class="user-id">({{ comment.username }})</span>
              </div>
              <div v-else>
                <strong>{{ comment.guestName }}</strong>
                <span class="guest-label">访客</span>
                <div class="guest-email">{{ comment.guestEmail }}</div>
              </div>
            </td>
            <td class="content-cell">
              <div class="comment-content" :title="comment.content">
                {{ comment.content }}
              </div>
              <div v-if="comment.ipAddress" class="ip-info">
                IP: {{ comment.ipAddress }}
              </div>
            </td>
            <td>
              <span :class="['status-badge', comment.status.toLowerCase()]">
                {{ formatStatus(comment.status) }}
              </span>
            </td>
            <td>{{ formatDate(comment.createdAt) }}</td>
            <td>
              <div class="actions">
                <button 
                  v-if="comment.status === 'PENDING'" 
                  class="btn-text success" 
                  @click="handleAudit(comment.id, 'approved')"
                >通过</button>
                <button 
                  v-if="comment.status === 'PENDING'" 
                  class="btn-text warning" 
                  @click="handleAudit(comment.id, 'spam')"
                >标记垃圾</button>
                <button class="btn-text danger" @click="handleDelete(comment.id)">删除</button>
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
import { getAdminComments, auditComment, deleteComment } from '@/api/comment';
import { showMessage } from '@/utils/message';
import { showConfirm } from '@/utils/confirm';

const comments = ref([]);
const loading = ref(false);
const page = ref(1);
const pages = ref(1);
const statusFilter = ref('');

const fetchComments = async () => {
  loading.value = true;
  try {
    const res = await getAdminComments({ 
      page: page.value, 
      size: 10, 
      status: statusFilter.value 
    });
    if (res && res.records) {
      comments.value = res.records;
      pages.value = res.pages || 1;
    } else {
      comments.value = [];
    }
  } catch (e) {
    console.error('获取评论失败', e);
  } finally {
    loading.value = false;
  }
};

const handleAudit = async (id, status) => {
  try {
    await auditComment(id, status);
    showMessage('操作成功');
    fetchComments();
  } catch (e) {
    showMessage('操作失败', 'error');
  }
};

const handleDelete = async (id) => {
  const confirmed = await showConfirm('确定要删除这条评论吗？');
  if (confirmed) {
    try {
      await deleteComment(id);
      showMessage('删除成功');
      fetchComments();
    } catch (e) {
      showMessage('删除失败', 'error');
    }
  }
};

const formatStatus = (status) => {
  const map = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'SPAM': '垃圾评论'
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

watch([page, statusFilter], fetchComments);
onMounted(fetchComments);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 12px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.admin-table th, .admin-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.admin-table th {
  background: var(--hover-bg);
  font-weight: 600;
  color: var(--text-secondary);
}

.article-cell {
  max-width: 200px;
}

.article-cell a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.user-id {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-left: 4px;
}

.guest-label {
  font-size: 0.75rem;
  background: var(--hover-bg);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.guest-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.content-cell {
  max-width: 300px;
}

.comment-content {
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ip-info {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #dcfce7; color: #166534; }
.status-badge.spam { background: #fee2e2; color: #991b1b; }

.actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
}

.btn-text.success { color: #10b981; }
.btn-text.warning { color: #f59e0b; }
.btn-text.danger { color: var(--danger-color); }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
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