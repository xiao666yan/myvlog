<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <h2>个人信息设置</h2>
        <p>管理您的基本信息</p>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="tab-btn" 
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Basic Profile Form -->
      <form v-if="currentTab === 'profile'" @submit.prevent="handleSaveProfile" class="profile-form">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="profileForm.avatar || '/default-avatar.png'" alt="Avatar" class="profile-avatar" />
            <div class="avatar-edit-overlay" @click="$refs.fileInput.click()">
              <span class="edit-icon">📷</span>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept="image/*" 
            @change="handleAvatarChange"
          />
          <p class="avatar-hint">点击图片更换头像</p>
        </div>

        <div class="form-group">
          <label>用户 ID</label>
          <input :value="userId" type="text" disabled class="disabled-input" />
        </div>
        
        <div class="form-group">
          <label>用户名</label>
          <input :value="username" type="text" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>昵称</label>
          <input 
            v-model="profileForm.nickname" 
            type="text" 
            placeholder="请输入您的昵称" 
            required 
            minlength="2"
            maxlength="20"
          />
          <span class="help-text">昵称将显示在文章作者和评论中</span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>

      <!-- Security Form (Email & Password) -->
      <div v-if="currentTab === 'security'" class="security-forms">
        <!-- Email Update -->
        <form @submit.prevent="handleUpdateEmail" class="sub-form">
          <h3>修改邮箱</h3>
          <div class="form-group">
            <label>新邮箱</label>
            <input 
              v-model="emailForm.email" 
              type="email" 
              placeholder="请输入新邮箱" 
              required 
            />
          </div>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? '更新邮箱' : '更新邮箱' }}
          </button>
        </form>

        <div class="divider"></div>

        <!-- Password Update -->
        <form @submit.prevent="handleUpdatePassword" class="sub-form">
          <h3>修改密码</h3>
          <div class="form-group">
            <label>当前密码</label>
            <input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              placeholder="请输入当前密码" 
              required 
            />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="请输入新密码（至少6位）" 
              required 
              minlength="6"
            />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码" 
              required 
              minlength="6"
            />
          </div>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? '修改密码' : '修改密码' }}
          </button>
        </form>
      </div>

      <div class="form-actions bottom-actions">
        <button type="button" class="btn-back" @click="$router.back()">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { updateNickname, updateEmail, updatePassword, updateAvatar } from '../api/user';
import { uploadFile } from '../api/upload';
import { useRouter } from 'vue-router';
import { showMessage } from '../utils/message';

const router = useRouter();
const loading = ref(false);
const userId = ref('');
const username = ref('');
const currentTab = ref('profile');
const fileInput = ref(null);

const tabs = [
  { id: 'profile', name: '基本信息' },
  { id: 'security', name: '账号安全' }
];

const profileForm = reactive({
  nickname: '',
  avatar: ''
});

const emailForm = reactive({
  email: ''
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

onMounted(() => {
  userId.value = localStorage.getItem('id') || '';
  username.value = localStorage.getItem('username') || '';
  profileForm.nickname = localStorage.getItem('nickname') || '';
  profileForm.avatar = localStorage.getItem('avatar') || '';
  
  if (!userId.value) {
    showMessage('请先登录', 'error');
    router.push('/login');
  }
});

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Check file type
  if (!file.type.startsWith('image/')) {
    showMessage('请选择图片文件', 'error');
    return;
  }

  // Check file size (e.g., 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showMessage('图片大小不能超过 2MB', 'error');
    return;
  }

  loading.value = true;
  try {
    // 1. Upload file
    const uploadRes = await uploadFile(file);
    const avatarUrl = uploadRes.url;

    // 2. Update user avatar in backend
    await updateAvatar(userId.value, avatarUrl);

    // 3. Update local state and storage
    profileForm.avatar = avatarUrl;
    localStorage.setItem('avatar', avatarUrl);
    window.dispatchEvent(new Event('storage'));
    
    showMessage('头像修改成功！');
  } catch (error) {
    console.error(error);
    showMessage('头像修改失败，请稍后重试', 'error');
  } finally {
    loading.value = false;
    if (event.target) event.target.value = ''; // Reset input
  }
};

const handleSaveProfile = async () => {
  if (!profileForm.nickname.trim()) return;
  
  loading.value = true;
  try {
    await updateNickname(userId.value, profileForm.nickname);
    localStorage.setItem('nickname', profileForm.nickname);
    window.dispatchEvent(new Event('storage'));
    showMessage('昵称修改成功！');
  } catch (error) {
    console.error(error);
    showMessage(error.response?.data?.message || '修改失败，请稍后重试', 'error');
  } finally {
    loading.value = false;
  }
};

const handleUpdateEmail = async () => {
  if (!emailForm.email.trim()) return;
  
  loading.value = true;
  try {
    await updateEmail(userId.value, emailForm.email);
    localStorage.setItem('email', emailForm.email); // Update local storage
    showMessage('邮箱更新成功！');
    emailForm.email = ''; // Clear input
  } catch (error) {
    console.error(error);
    showMessage(error.response?.data || '更新失败，请稍后重试', 'error'); // Backend might return string directly
  } finally {
    loading.value = false;
  }
};

const handleUpdatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showMessage('两次输入的密码不一致', 'error');
    return;
  }
  
  loading.value = true;
  try {
    await updatePassword(userId.value, passwordForm.oldPassword, passwordForm.newPassword);
    showMessage('密码修改成功！请重新登录');
    // Logout user
    localStorage.clear();
    router.push('/login');
  } catch (error) {
    console.error(error);
    showMessage(error.response?.data || '修改失败，请检查当前密码是否正确', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.profile-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.profile-header {
  margin-bottom: 24px;
  text-align: center;
}

.profile-header h2 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.profile-header p {
  color: var(--text-secondary);
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--bg-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-wrapper:hover .profile-avatar {
  transform: scale(1.1);
}

.edit-icon {
  font-size: 24px;
  color: white;
}

.avatar-hint {
  margin-top: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Tabs */
.tabs {
  display: flex;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

/* Forms */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.disabled-input {
  background-color: var(--hover-bg) !important;
  cursor: not-allowed;
  color: var(--text-secondary) !important;
}

.help-text {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.bottom-actions {
  margin-top: 40px;
  justify-content: center;
}

.btn-save {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: var(--secondary-color);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-back {
  padding: 10px 32px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: var(--hover-bg);
}

/* Security Section */
.security-forms {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sub-form h3 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-primary);
  border-left: 4px solid var(--primary-color);
  padding-left: 12px;
}

.divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}
</style>