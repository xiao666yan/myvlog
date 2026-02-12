<template>
  <div class="admin-announcements">
    <div class="header">
      <h2>公告管理</h2>
      <button class="btn-add" @click="showAddModal = true">发布新公告</button>
    </div>

    <div class="announcement-list">
      <div v-for="item in announcements" :key="item.id" class="announcement-card">
        <div class="card-content">
          <div class="title-row">
            <span :class="['type-tag', item.type]">{{ getTypeText(item.type) }}</span>
            <h4>{{ item.title }}</h4>
          </div>
          <p class="content">{{ item.content }}</p>
          <div class="footer">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
            <div class="actions">
              <button class="btn-delete" @click="handleDelete(item.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal">
        <h3>发布新公告</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="form.title" placeholder="公告标题" required />
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="form.type">
              <option value="general">普通公告</option>
              <option value="system_update">系统更新</option>
              <option value="maintenance">维护通知</option>
              <option value="important">重要通知</option>
            </select>
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="form.content" placeholder="公告内容" rows="5" required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false">取消</button>
            <button type="submit" class="btn-save">确认发布</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getActiveAnnouncements, createAnnouncement, deleteAnnouncement } from '@/api/announcement';
import { showMessage } from '@/utils/message';

const announcements = ref([]);
const showAddModal = ref(false);
const form = reactive({
  title: '',
  type: 'general',
  content: '',
  isActive: true
});

const loadData = async () => {
  try {
    const res = await getActiveAnnouncements();
    announcements.value = res;
  } catch (error) {
    console.error(error);
  }
};

const getTypeText = (type) => {
  const maps = {
    general: '普通',
    system_update: '更新',
    maintenance: '维护',
    important: '重要'
  };
  return maps[type] || '普通';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

const handleSubmit = async () => {
  try {
    await createAnnouncement(form);
    showMessage('发布成功');
    showAddModal.value = false;
    form.title = '';
    form.content = '';
    loadData();
  } catch (error) {
    showMessage('发布失败', 'error');
  }
};

const handleDelete = async (id) => {
  if (!confirm('确定删除此公告吗？')) return;
  try {
    await deleteAnnouncement(id);
    showMessage('删除成功');
    loadData();
  } catch (error) {
    showMessage('删除失败', 'error');
  }
};

onMounted(loadData);
</script>

<style scoped>
.admin-announcements {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-add {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.announcement-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.announcement-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.type-tag {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.type-tag.system_update { background: #e3f2fd; color: #2196f3; }
.type-tag.maintenance { background: #fff3e0; color: #ff9800; }
.type-tag.important { background: #ffebee; color: #f44336; }
.type-tag.general { background: #f5f5f5; color: #666; }

.content {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.btn-delete {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-save {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
}
</style>
