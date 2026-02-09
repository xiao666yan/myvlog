<template>
  <div class="admin-tags">
    <div class="header-actions">
      <h2>标签管理</h2>
      <button class="btn-primary" @click="openModal()">新增标签</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="tags.length === 0" class="no-data">暂无标签数据</div>
      <div v-else class="tag-grid">
        <div v-for="tag in tags" :key="tag.id" class="tag-card">
          <div class="tag-info">
            <span class="tag-name"># {{ tag.name }}</span>
            <code class="tag-slug">{{ tag.slug }}</code>
          </div>
          <div class="tag-actions">
            <button @click="openModal(tag)">编辑</button>
            <button class="danger" @click="handleDelete(tag.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEdit ? '编辑标签' : '新增标签' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" required placeholder="例如：Vue3" />
          </div>
          <div class="form-group">
            <label>别名 (Slug)</label>
            <input v-model="form.slug" required placeholder="例如：vue3" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showModal = false">取消</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? '提交中...' : '确定' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTags, createTag, updateTag, deleteTag } from '@/api/tag';
import { showMessage } from '@/utils/message';
import { showConfirm } from '@/utils/confirm';

const tags = ref([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const isEdit = ref(false);

const form = ref({
  id: null,
  name: '',
  slug: ''
});

const fetchTags = async () => {
  loading.value = true;
  try {
    tags.value = await getTags();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const openModal = (tag = null) => {
  if (tag) {
    isEdit.value = true;
    form.value = { ...tag };
  } else {
    isEdit.value = false;
    form.value = { id: null, name: '', slug: '' };
  }
  showModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateTag(form.value.id, form.value);
      showMessage('更新成功');
    } else {
      await createTag(form.value);
      showMessage('创建成功');
    }
    showModal.value = false;
    fetchTags();
  } catch (e) {
    showMessage('操作失败', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id) => {
  const confirmed = await showConfirm('确定要删除该标签吗？');
  if (confirmed) {
    try {
      await deleteTag(id);
      showMessage('删除成功');
      fetchTags();
    } catch (e) {
      showMessage('删除失败', 'error');
    }
  }
};

onMounted(fetchTags);
</script>

<style scoped>
/* Modal styles removed as they are now global in style.css */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.tag-card {
  background: var(--card-bg);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s;
}

.tag-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.tag-name {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.tag-slug {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.tag-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.tag-actions button {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.tag-actions button:hover {
  color: var(--primary-color);
}

.tag-actions button.danger:hover {
  color: var(--danger-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
}

.form-group input:focus {
  border-color: var(--primary-color);
  background: var(--input-bg-focus);
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
  border: none;
  padding: 8px 16px;
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