<template>
  <div class="create-container">
    <form @submit.prevent="submitArticle" class="create-form">
      <!-- Top Bar: Title & Actions -->
      <div class="top-bar">
        <input 
          v-model="form.title" 
          type="text" 
          placeholder="请输入文章标题..." 
          class="title-input"
          required 
        />
        <div class="top-actions">
          <button type="button" class="btn-icon-text" @click="showSettings = !showSettings">
            <span class="icon">{{ showSettings ? '▲' : '▼' }}</span>
            {{ showSettings ? '收起设置' : '展开设置' }}
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? '提交中...' : (isEditMode ? '更新' : '发布') }}
          </button>
        </div>
      </div>

      <!-- Collapsible Settings Panel -->
      <div v-show="showSettings" class="settings-panel">
        <div class="form-row">
          <div class="form-group half">
            <label>分类 <span class="required">*</span></label>
            <select v-model="form.categoryId" required>
              <option value="" disabled>请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>标签</label>
            <div class="tags-wrapper">
              <select v-model="selectedTag" @change="addTag" class="tag-select">
                <option value="" disabled selected>选择标签...</option>
                <option v-for="tag in availableTags" :key="tag.id" :value="tag">
                  {{ tag.name }}
                </option>
              </select>
              <div class="selected-tags">
                <span v-for="tag in form.tags" :key="tag.id" class="tag-chip">
                  {{ tag.name }}
                  <span class="remove-tag" @click="removeTag(tag.id)">×</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label>发布状态</label>
            <select v-model="form.status">
              <option value="draft">草稿</option>
              <option value="published">立即发布</option>
            </select>
          </div>
          <div class="form-group half">
            <label>可见性</label>
            <select v-model="form.visibility">
              <option value="public">公开</option>
              <option value="private">私有 (仅自己可见)</option>
              <option value="vip">会员可见</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>摘要</label>
          <textarea v-model="form.summary" rows="2" placeholder="请输入文章摘要（可选）"></textarea>
        </div>

        <div class="form-group">
          <label>文章封面</label>
          <div class="cover-upload-area compact">
            <div v-if="form.coverImage" class="cover-preview-wrapper compact-preview">
              <img :src="form.coverImage" class="cover-image-preview" alt="封面预览" />
              <div class="cover-overlay">
                <button type="button" class="btn-icon" @click="clearCover" title="移除封面">
                  <span class="icon">×</span>
                </button>
              </div>
            </div>
            <div v-else class="upload-placeholder compact-placeholder" @click="triggerFileInput">
              <span class="upload-icon-small">📷</span>
              <span>点击上传封面</span>
            </div>
          </div>
          
          <div class="cover-actions" v-if="!form.coverImage">
            <input ref="fileInput" type="file" accept="image/*" @change="onCoverFileChange" style="display: none" />
            <div class="cover-url-row">
              <input v-model="coverUrl" type="text" placeholder="或输入图片 URL" />
              <button type="button" class="btn-secondary" @click="applyCoverUrl">确认</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor Area -->
      <div class="editor-area">
        <MdEditor v-model="form.content" class="full-editor" @onUploadImg="onUploadImg" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { createArticle, getArticle, updateArticle } from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import request from '@/utils/request';
import { showMessage } from '@/utils/message';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditMode.value ? '编辑文章' : '开始创作');
const showSettings = ref(false);

const form = reactive({
  title: '',
  content: '',
  summary: '',
  categoryId: '',
  status: 'draft',
  visibility: 'public',
  tags: [],
  coverImage: ''
});

// Categories & Tags
const categories = ref([]);
const availableTags = ref([]);
const selectedTag = ref("");
const coverUrl = ref("");
const fileInput = ref(null);

onMounted(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    showMessage('请先登录', 'error');
    router.push('/login');
    return;
  }
  
  try {
    const [catRes, tagRes] = await Promise.all([
      getCategories(),
      getTags()
    ]);
    categories.value = catRes;
    availableTags.value = tagRes;

    // Load article if in edit mode
    if (isEditMode.value) {
      await loadArticle(route.params.id);
    }
  } catch (error) {
    console.error('Failed to load initial data', error);
  }
});

const loadArticle = async (id) => {
  try {
    loading.value = true;
    const res = await getArticle(id);
    // Populate form
    form.title = res.title;
    form.content = res.content;
    form.summary = res.summary;
    form.categoryId = res.category ? res.category.id : (res.categoryId || '');
    form.status = res.status;
    form.visibility = res.visibility || 'public';
    form.tags = res.tags || [];
    form.coverImage = res.coverImage || '';
  } catch (error) {
    console.error('Failed to load article', error);
    showMessage('加载文章失败', 'error');
    router.push('/');
  } finally {
    loading.value = false;
  }
};

const addTag = () => {
  if (!selectedTag.value) return;
  
  // Check if already selected
  const exists = form.tags.find(t => t.id === selectedTag.value.id);
  if (!exists) {
    form.tags.push(selectedTag.value);
  }
  
  // Reset selection
  selectedTag.value = "";
};

const removeTag = (tagId) => {
  form.tags = form.tags.filter(t => t.id !== tagId);
};

const onCoverFileChange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showMessage('图片大小不能超过 10MB', 'error');
    return;
  }

  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await request.post('/upload', fd);
    form.coverImage = res.url;
    coverUrl.value = res.url;
    showMessage('封面上传成功');
  } catch (err) {
    console.error('封面上传失败', err);
    showMessage('封面上传失败，请重试', 'error');
  }
};

const applyCoverUrl = () => {
  if (!coverUrl.value) return;
  form.coverImage = coverUrl.value.trim();
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const clearCover = () => {
  form.coverImage = '';
  coverUrl.value = '';
};

const onUploadImg = async (files, callback) => {
  console.log('MdEditor: onUploadImg called', files);
  try {
    const res = await Promise.all(
      files.map((file) => {
        return new Promise(async (resolve, reject) => {
          // Check file size (10MB)
          if (file.size > 10 * 1024 * 1024) {
            const errorMsg = `${file.name} 大小超过 10MB 限制`;
            showMessage(errorMsg, 'error');
            reject(new Error(errorMsg));
            return;
          }

          try {
            const fd = new FormData();
            fd.append('file', file);
            console.log(`Uploading file: ${file.name}`);
            const res = await request.post('/upload', fd);
            console.log(`Upload success for ${file.name}:`, res);
            resolve(res.url);
          } catch (err) {
            console.error(`Upload failed for ${file.name}`, err);
            const errorDetail = err.response?.data?.message || err.message || '未知错误';
            showMessage(`图片上传失败: ${errorDetail}`, 'error');
            reject(err);
          }
        });
      })
    );

    console.log('All files uploaded successfully:', res);
    callback(res);
  } catch (error) {
    console.error('onUploadImg batch error:', error);
  }
};

const submitArticle = async () => {
  if (!form.title || !form.content || !form.categoryId) {
    showMessage('请填写完整必填信息', 'error');
    return;
  }

  loading.value = true;
  try {
    // Prepare payload with tagIds
    const payload = {
      ...form,
      categoryId: form.categoryId || null, // Convert empty string to null
      tagIds: form.tags.map(t => t.id)
    };
    // Remove tags array from payload as backend expects tagIds
    delete payload.tags;
    
    console.log('Submitting article payload:', payload);
    
    if (isEditMode.value) {
      await updateArticle(route.params.id, payload);
      showMessage('文章更新成功！');
    } else {
      await createArticle(payload);
      showMessage('文章发布成功！');
    }
    router.push('/');
  } catch (error) {
    console.error(error);
    showMessage(error.response?.data?.message || (isEditMode.value ? '更新失败' : '发布失败'), 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-container {
  width: 100%;
  height: calc(100vh - 64px); /* Exact height of available space (100vh - navbar) */
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--bg-color);
  box-sizing: border-box; /* Ensure padding doesn't affect width */
  overflow: hidden; /* Prevent page-level scroll */
}

.create-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%; /* Ensure form takes full width of container */
  gap: 0;
  background-color: var(--card-bg);
  border-radius: 0; /* Remove radius for full-screen feel */
  box-shadow: none; /* Remove shadow for cleaner look */
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px; /* Increased left padding to prevent overlap */
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
  z-index: 10;
}

.title-input {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  margin-right: 24px;
}

.title-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.top-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-icon-text {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-icon-text:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

/* Settings Panel */
.settings-panel {
  padding: 24px;
  background-color: var(--bg-color); /* Slightly different bg to distinguish */
  border-bottom: 1px solid var(--border-color);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.half {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.required {
  color: #ff4d4f;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
}

/* Editor Area */
.editor-area {
  flex: 1;
  overflow: hidden; /* Prevent double scrollbars */
  display: flex;
  flex-direction: column;
  padding-left: 20px; /* Prevent overlap with sidebar */
}

.full-editor {
  height: 100% !important;
  border: none !important;
}

/* Tags & Chips */
.tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.remove-tag {
  margin-left: 6px;
  cursor: pointer;
}

/* Compact Cover Upload */
.compact-placeholder {
  height: 100px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.compact-placeholder:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.upload-icon-small {
  font-size: 1.5rem;
}

.compact-preview {
  height: 120px;
  width: 213px; /* 16:9 aspect */
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cover-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.compact-preview:hover .cover-overlay {
  opacity: 1;
}

.btn-icon {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-actions {
  margin-top: 8px;
}

.cover-url-row {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background-color: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
