<template>
  <div class="admin-categories">
    <div class="header-actions">
      <h2>分类管理</h2>
      <button class="btn-primary" @click="openModal()">新增分类</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="categories.length === 0" class="no-data">暂无分类数据</div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>别名 (Slug)</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td>{{ cat.name }}</td>
            <td><code>{{ cat.slug }}</code></td>
            <td>{{ cat.description || '-' }}</td>
            <td>
              <div class="actions">
                <button class="btn-text" @click="openModal(cat)">编辑</button>
                <button class="btn-text danger" @click="handleDelete(cat.id)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEdit ? '编辑分类' : '新增分类' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" required placeholder="例如：技术分享" />
          </div>
          <div class="form-group">
            <label>别名 (Slug)</label>
            <input v-model="form.slug" required placeholder="例如：tech" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3"></textarea>
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category';
import { showMessage } from '@/utils/message';
import { showConfirm } from '@/utils/confirm';

const categories = ref([]);
const loading = ref(false);
const submitting = ref(false);
const showModal = ref(false);
const isEdit = ref(false);

const form = ref({
  id: null,
  name: '',
  slug: '',
  description: ''
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    categories.value = await getCategories();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const openModal = (cat = null) => {
  if (cat) {
    isEdit.value = true;
    form.value = { ...cat };
  } else {
    isEdit.value = false;
    form.value = { id: null, name: '', slug: '', description: '' };
  }
  showModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateCategory(form.value.id, form.value);
      showMessage('更新成功');
    } else {
      await createCategory(form.value);
      showMessage('创建成功');
    }
    showModal.value = false;
    fetchCategories();
  } catch (e) {
    showMessage('保存失败', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id) => {
  const confirmed = await showConfirm('确定要删除该分类吗？');
  if (confirmed) {
    try {
      await deleteCategory(id);
      showMessage('删除成功');
      fetchCategories();
    } catch (e) {
      showMessage('删除失败', 'error');
    }
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
/* Modal styles removed as they are now global in style.css */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.admin-table th, .admin-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.admin-table th {
  background: var(--hover-bg);
  font-weight: 600;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
}

.btn-text.danger {
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

.form-group input, .form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
}

.form-group input:focus, .form-group textarea:focus {
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