<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo Area -->
      <div class="logo-area" @click="goHome">
        <span class="logo-text">CodeCanvas</span>
      </div>

      <!-- Global Search Bar -->
      <div class="search-area">
        <div class="search-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="搜索文章、内容或 #标签..." 
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="actions-area">
        <!-- Announcements Button -->
        <div class="announcement-nav">
          <button @click="showAllAnnouncements = true" class="nav-icon-btn" title="查看系统公告">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
            </div>
            <span class="nav-btn-text">公告</span>
          </button>
        </div>

        <!-- Auth Section -->
        <div v-if="isLoggedIn" class="user-menu">
          <router-link to="/profile" class="user-profile-link">
            <img :src="avatar || '/default-avatar.png'" alt="Avatar" class="nav-avatar" />
            <span class="welcome-text">你好，{{ nickname }}</span>
          </router-link>
          <router-link v-if="isAdmin" to="/admin" class="auth-btn" style="margin-left:8px">后台管理</router-link>
          <button @click="handleLogout" class="auth-btn logout">退出</button>
        </div>
        <div v-else class="auth-buttons">
          <button @click="goToLogin" class="auth-btn login">登录</button>
          <button @click="goToRegister" class="auth-btn register">注册</button>
        </div>

        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" class="theme-toggle" :title="isDarkMode ? '切换到亮色模式' : '切换到深色模式'">
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Announcements Modal -->
    <div v-if="showAllAnnouncements" class="modal-overlay" @click.self="showAllAnnouncements = false">
      <div class="modal-content announcement-modal">
        <div class="modal-header">
          <h3>系统公告</h3>
          <button @click="showAllAnnouncements = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body announcement-scroll">
          <div v-if="announcements.length === 0" class="empty-announcements">
            暂无公告
          </div>
          <div v-for="item in announcements" :key="item.id" class="announcement-card" :class="item.type">
            <div class="card-header">
              <span class="type-tag" :class="item.type">{{ getTypeText(item.type) }}</span>
              <span class="card-title">{{ item.title }}</span>
              <span class="card-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="card-body">
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="markAllAsRead" class="action-btn">全部标注为已读</button>
        </div>
      </div>
    </div>

    <!-- New Announcement Popup (Auto) -->
    <div v-if="showNewPopup" class="new-popup-overlay" @click.self="closeNewPopup">
      <div class="new-popup-content bounce-in">
        <div class="popup-icon">📢</div>
        <div class="popup-title">新公告发布</div>
        <div class="popup-info">
          <span class="type-tag" :class="latestAnnouncement?.type">{{ getTypeText(latestAnnouncement?.type) }}</span>
          <h4>{{ latestAnnouncement?.title }}</h4>
        </div>
        <p class="popup-text">{{ latestAnnouncement?.content }}</p>
        <div class="popup-actions">
          <button @click="viewDetail" class="view-btn">查看详情</button>
          <button @click="closeNewPopup" class="ignore-btn">忽略</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile } from '@/api/user';
import { getActiveAnnouncements } from '@/api/announcement';

const router = useRouter();
const searchQuery = ref('');
const isLoggedIn = ref(false);
const nickname = ref('');
const avatar = ref('');
const isDarkMode = ref(false);
const isAdmin = ref(false);

// Announcements Logic
const announcements = ref([]);
const showAllAnnouncements = ref(false);
const showNewPopup = ref(false);
const latestAnnouncement = ref(null);
const unreadCount = ref(0);

const loadAnnouncements = async () => {
  try {
    const res = await getActiveAnnouncements();
    if (res) {
      announcements.value = res;
      updateUnreadCount();
      checkNewAnnouncement();
    }
  } catch (error) {
    console.error('Failed to load announcements:', error);
  }
};

const updateUnreadCount = () => {
  const readIds = JSON.parse(localStorage.getItem('read_announcements') || '[]');
  unreadCount.value = announcements.value.filter(a => !readIds.includes(a.id)).length;
};

const checkNewAnnouncement = () => {
  if (announcements.value.length > 0) {
    const latest = announcements.value[0];
    const lastSeenId = localStorage.getItem('last_seen_announcement_id');
    
    if (!lastSeenId || parseInt(lastSeenId) < latest.id) {
      latestAnnouncement.value = latest;
      showNewPopup.value = true;
    }
  }
};

const markAllAsRead = () => {
  const allIds = announcements.value.map(a => a.id);
  localStorage.setItem('read_announcements', JSON.stringify(allIds));
  if (announcements.value.length > 0) {
    localStorage.setItem('last_seen_announcement_id', announcements.value[0].id.toString());
  }
  unreadCount.value = 0;
  showAllAnnouncements.value = false;
};

const closeNewPopup = () => {
  if (latestAnnouncement.value) {
    localStorage.setItem('last_seen_announcement_id', latestAnnouncement.value.id.toString());
  }
  showNewPopup.value = false;
  updateUnreadCount();
};

const viewDetail = () => {
  closeNewPopup();
  showAllAnnouncements.value = true;
};

const getTypeText = (type) => {
  const map = {
    'system_update': '更新',
    'maintenance': '维护',
    'important': '重要'
  };
  return map[type] || '通知';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Check login status
const checkLoginStatus = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
    const storedNickname = localStorage.getItem('nickname');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedAvatar = localStorage.getItem('avatar');
    
    nickname.value = storedNickname || storedUsername || '用户';
    avatar.value = storedAvatar || '';
    const role = (localStorage.getItem('role') || '').toLowerCase();
    isAdmin.value = role === 'admin';

    // If email or avatar is missing (old session), fetch profile to sync
    if (!storedEmail || !storedAvatar) {
      try {
        const profile = await getProfile();
        if (profile) {
          localStorage.setItem('email', profile.email || '');
          localStorage.setItem('nickname', profile.nickname || profile.username);
          localStorage.setItem('avatar', profile.avatar || '');
          nickname.value = profile.nickname || profile.username;
          avatar.value = profile.avatar || '';
        }
      } catch (e) {
        console.error('Failed to sync profile:', e);
      }
    }
  } else {
    isLoggedIn.value = false;
    nickname.value = '';
    avatar.value = '';
    isAdmin.value = false;
  }
};

// Dark Mode Logic
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  updateTheme();
};

const updateTheme = () => {
  const html = document.documentElement;
  if (isDarkMode.value) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

const initTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true;
  } else {
    isDarkMode.value = false;
  }
  updateTheme();
};

// Navigation
const goHome = () => router.push('/');
const goToLogin = () => router.push('/login');
const goToRegister = () => router.push('/register'); // Assuming register route exists or will exist

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('id');
  localStorage.removeItem('nickname');
  localStorage.removeItem('email');
  localStorage.removeItem('avatar');
  localStorage.removeItem('role');
  isLoggedIn.value = false;
  isAdmin.value = false;
  router.push('/login');
};

const handleSearch = () => {
  if (!searchQuery.value.trim()) return;
  router.push({ name: 'Search', query: { q: searchQuery.value } });
};

onMounted(() => {
  checkLoginStatus();
  initTheme();
  loadAnnouncements();
  
  // Listen for storage changes (in case of login/logout in other tabs or components)
  window.addEventListener('storage', checkLoginStatus);
});

// Watch for route changes to re-check auth status (e.g. after login redirect)
watch(() => router.currentRoute.value, () => {
  checkLoginStatus();
});

</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: var(--nav-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  z-index: 1000;
  transition: background-color 0.3s, border-color 0.3s;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo-area {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #42b983);
  letter-spacing: -0.5px;
}

.search-area {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary, #9ca3af);
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #e5e7eb);
  background-color: var(--input-bg, #f3f4f6);
  color: var(--text-primary, #1f2937);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary-color, #42b983);
  background-color: var(--input-bg-focus, #ffffff);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.actions-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.user-profile-link:hover {
  background-color: var(--hover-bg);
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.welcome-text {
  font-size: 0.9rem;
  color: var(--text-primary, #1f2937);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.welcome-text:hover {
  color: var(--primary-color, #42b983);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.auth-btn.login {
  background-color: transparent;
  color: var(--text-primary, #1f2937);
}

.auth-btn.login:hover {
  background-color: var(--hover-bg, #f3f4f6);
}

.auth-btn.register {
  background-color: var(--primary-color, #42b983);
  color: white;
}

.auth-btn.register:hover {
  background-color: var(--primary-dark, #3aa876);
}

.auth-btn.logout {
  background-color: var(--danger-color, #ef4444);
  color: white;
}

.auth-btn.logout:hover {
  background-color: var(--danger-dark, #dc2626);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary, #1f2937);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--hover-bg, #f3f4f6);
}

/* Announcements Button */
.announcement-nav {
  margin-right: 8px;
}

.nav-icon-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
  gap: 2px;
}

.nav-icon-btn:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ff4757;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  border: 2px solid var(--nav-bg);
}

.nav-btn-text {
  font-size: 0.7rem;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--nav-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.announcement-card {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid var(--primary-color);
}

.announcement-card.important { border-left-color: #f44336; }
.announcement-card.maintenance { border-left-color: #ff9800; }
.announcement-card.system_update { border-left-color: #2196f3; }

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.type-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.type-tag.important { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
.type-tag.maintenance { background-color: rgba(255, 152, 0, 0.1); color: #ff9800; }
.type-tag.system_update { background-color: rgba(33, 150, 243, 0.1); color: #2196f3; }

.card-title {
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

.card-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.card-body p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.action-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* New Popup Styles */
.new-popup-overlay {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 3000;
}

.new-popup-content {
  background-color: var(--nav-bg);
  border-radius: 20px;
  width: 320px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  position: relative;
}

.popup-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.popup-info h4 {
  margin: 4px 0 12px 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.popup-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.view-btn {
  flex: 1;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.ignore-btn {
  background-color: var(--hover-bg);
  color: var(--text-secondary);
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Dark Mode Overrides within Component scope if needed, 
   but ideally handled by global vars */
</style>
