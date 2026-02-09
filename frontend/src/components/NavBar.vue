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
  </nav>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile } from '@/api/user';

const router = useRouter();
const searchQuery = ref('');
const isLoggedIn = ref(false);
const nickname = ref('');
const avatar = ref('');
const isDarkMode = ref(false);
const isAdmin = ref(false);

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

/* Dark Mode Overrides within Component scope if needed, 
   but ideally handled by global vars */
</style>
