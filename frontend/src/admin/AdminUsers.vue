<template>
  <div class="admin-users">
    <h2>用户管理</h2>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="!users || users.length === 0" class="no-data">暂无用户数据</div>
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.nickname }}</td>
            <td>
              <span :class="['role-badge', user.role]">{{ user.role }}</span>
            </td>
            <td>{{ user.status === 1 ? '正常' : '禁用' }}</td>
            <td>
              <button v-if="user.role !== 'admin'" @click="handleGrantVip(user.id)" class="btn-small">授予 VIP</button>
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
import request from '@/utils/request';
import { showMessage } from '@/utils/message';

const users = ref([]);
const loading = ref(false);
const page = ref(1);
const pages = ref(1);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await request.get('/users', { params: { page: page.value, size: 10 } });
    if (res && res.records) {
      users.value = res.records;
      pages.value = res.pages || 1;
    } else if (Array.isArray(res)) {
      users.value = res;
      pages.value = 1;
    } else {
      users.value = [];
    }
  } catch (e) {
    console.error('获取用户列表失败', e);
    showMessage('获取用户列表失败', 'error');
  } finally {
    loading.value = false;
  }
};

const handleGrantVip = async (userId) => {
  try {
    await request.post(`/users/${userId}/vip`, null, { params: { days: 30 } });
    showMessage(`已成功为用户 ${userId} 授予 30 天 VIP`);
    fetchUsers();
  } catch (e) {
    console.error(e);
    showMessage('操作失败', 'error');
  }
};

watch(page, fetchUsers);
onMounted(fetchUsers);
</script>

<style scoped>
.admin-users {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.user-table th, .user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.user-table th {
  background: var(--hover-bg);
  font-weight: 600;
}
.role-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
}
.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.vip { background: #fef3c7; color: #92400e; }
.role-badge.user { background: #dcfce7; color: #166534; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
.btn-small {
  padding: 4px 8px;
  font-size: 12px;
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
