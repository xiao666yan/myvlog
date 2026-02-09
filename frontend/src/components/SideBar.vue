<template>
  <aside class="sidebar">
    <!-- Profile Card -->
    <div class="profile-card">
      <div class="avatar-container">
        <img :src="avatarUrl || '/avatars/leo.jpg'" alt="Avatar" class="avatar" />
      </div>
      <h3 class="profile-name">{{ nickname || 'CodeCanvas 用户' }}</h3>
      <p class="profile-bio">全栈开发者 | 技术爱好者</p>
      
      <div class="social-links">
        <a href="#" class="social-link" title="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a>
        <a href="#" class="social-link" title="Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
        </a>
        <a href="#" @click.prevent="copyEmail" class="social-link" title="Email">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </a>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" active-class="active" @click="closeStudy">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>首页</span>
      </router-link>

      <div class="nav-group">
        <div class="nav-item" @click="toggleStudy" :class="{ 'active': isStudyRoute }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span class="flex-grow">学习</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ 'rotate': isStudyOpen }">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="isStudyOpen" class="sub-menu">
          <router-link v-for="cat in studyCategories" :key="cat.id" :to="{ path: '/articles', query: { categoryId: cat.id, title: cat.name } }" class="sub-item" active-class="active">
            {{ cat.name }}
          </router-link>
        </div>
      </div>
      
      <router-link :to="momentsRoute" class="nav-item" :class="{ 'active': isMomentsRoute }" @click="closeStudy">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>朋友圈</span>
      </router-link>
      
      <div class="nav-group">
        <div class="nav-item" @click="toggleCreation" :class="{ 'active': route.path === '/create' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span class="flex-grow">创作</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ 'rotate': isCreationOpen }">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="isCreationOpen" class="sub-menu">
          <router-link to="/create" class="sub-item" active-class="active">
            写博客
          </router-link>
          <router-link to="/article-manager" class="sub-item" active-class="active">
            修改博客
          </router-link>
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-item" @click="toggleTools" :class="{ 'active': isToolsRoute }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span class="flex-grow">工具</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ 'rotate': isToolsOpen }">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="isToolsOpen" class="sub-menu">
          <router-link to="/tools/function-graph" class="sub-item" active-class="active">
            函数图像
          </router-link>
          <router-link to="/tools/json" class="sub-item" active-class="active">
            JSON 格式化
          </router-link>
          <router-link to="/tools/regex" class="sub-item" active-class="active">
            正则表达式
          </router-link>
        </div>
      </div>

      <div class="nav-divider"></div>

      <div class="hot-widget">
        <h3 class="widget-title">热门文章</h3>
        <ul class="hot-list">
          <li v-for="(article, index) in hotArticles" :key="article.id" class="hot-item">
            <span class="hot-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <div class="hot-info">
              <span class="hot-title">{{ article.title }}</span>
              <span class="hot-views">🔥 {{ article.views }}</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getArticles } from '@/api/article';
import { getCategories } from '@/api/category';
import { showMessage } from '@/utils/message';

const route = useRoute();
const nickname = ref('');
const avatarUrl = ref('');
const today = new Date();
const todayDay = today.getDate();

const isStudyOpen = ref(false);
const isCreationOpen = ref(false);
const isToolsOpen = ref(false);
const categories = ref([]);

const toggleStudy = () => {
  isStudyOpen.value = !isStudyOpen.value;
};

const toggleCreation = () => {
  isCreationOpen.value = !isCreationOpen.value;
};

const toggleTools = () => {
  isToolsOpen.value = !isToolsOpen.value;
};

const closeStudy = () => {
  isStudyOpen.value = false;
  isCreationOpen.value = false;
  isToolsOpen.value = false;
};

const copyEmail = async () => {
  const email = localStorage.getItem('email');
  if (!email) {
    showMessage('未找到登录用户的邮箱，请先登录', 'error');
    return;
  }
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(email);
      showMessage('邮箱已复制');
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showMessage('邮箱已复制');
    }
  } catch (err) {
    console.error('无法复制邮箱: ', err);
    showMessage('复制失败', 'error');
  }
};

const isStudyRoute = computed(() => {
  return route.path === '/articles' && route.query.categoryId && route.query.title !== '朋友圈';
});

const isMomentsRoute = computed(() => {
  return route.path === '/articles' && route.query.title === '朋友圈';
});

const isToolsRoute = computed(() => {
  return route.path.startsWith('/tools');
});

const momentsRoute = computed(() => {
  const lifeCat = categories.value.find(c => c.name === '生活随笔');
  if (lifeCat) {
    return { path: '/articles', query: { categoryId: lifeCat.id, title: '朋友圈' } };
  }
  return '/articles';
});

const studyCategories = computed(() => {
  return categories.value.filter(c => c.name !== '生活随笔');
});

const hotArticles = ref([]);

const loadHotArticles = async () => {
  try {
    const res = await getArticles({ page: 1, size: 3, sort: 'hottest' });
    if (res && res.records) {
      hotArticles.value = res.records.map(item => ({
        id: item.id,
        title: item.title,
        views: item.viewCount
      }));
    }
  } catch (error) {
    console.error('Failed to load hot articles:', error);
  }
};

const loadCategories = async () => {
  try {
    const res = await getCategories();
    categories.value = res;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

const currentDate = computed(() => {
    return today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
});

const updateUserInfo = () => {
    const storedNickname = localStorage.getItem('nickname');
    const storedUsername = localStorage.getItem('username');
    nickname.value = storedNickname || storedUsername || '';
    avatarUrl.value = localStorage.getItem('avatar') || '';
};

onMounted(() => {
    updateUserInfo();
    window.addEventListener('storage', updateUserInfo);
    
    loadHotArticles();
    loadCategories();
});

onUnmounted(() => {
    window.removeEventListener('storage', updateUserInfo);
});
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: calc(100vh - 64px);
  position: fixed;
  top: 64px;
  left: 0;
  background-color: var(--nav-bg);
  border-right: 1px solid var(--border-color);
  padding: 24px 16px;
  overflow-y: auto;
  transition: all 0.3s;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.avatar-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 12px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--primary-color);
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-name {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 4px;
    color: var(--text-primary);
}

.profile-bio {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.social-links {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.social-link {
    color: var(--text-secondary);
    transition: color 0.2s;
    padding: 6px;
    border-radius: 6px;
}

.social-link:hover {
    color: var(--primary-color);
    background-color: var(--hover-bg);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.nav-divider {
    height: 1px;
    background-color: var(--border-color);
    margin: 16px 0;
}

.hot-widget {
    padding: 0 8px;
    margin-bottom: 16px;
}

.widget-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 12px;
    padding-left: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.hot-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hot-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
    cursor: pointer;
}

.hot-item:hover {
    background-color: var(--hover-bg);
}

.hot-rank {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-secondary);
    min-width: 16px;
    text-align: center;
    font-style: italic;
    margin-top: 2px;
}

.rank-1 { color: #ff4757; }
.rank-2 { color: #ffa502; }
.rank-3 { color: #2ed573; }

.hot-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    overflow: hidden;
}

.hot-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.hot-views {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.calendar-widget {
    background-color: var(--hover-bg);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
}

.calendar-header {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.calendar-grid span {
    display: block;
    padding: 4px 0;
    border-radius: 4px;
}

.calendar-grid span.today {
    background-color: var(--primary-color);
    color: white;
    font-weight: bold;
}

.nav-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.flex-grow {
    flex-grow: 1;
}

.chevron {
    transition: transform 0.3s ease;
}

.chevron.rotate {
    transform: rotate(90deg);
}

.sub-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
    margin-bottom: 4px;
    padding-left: 0;
    position: relative;
}

.sub-menu::before {
    content: '';
    position: absolute;
    left: 26px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background-color: var(--border-color);
    border-radius: 1px;
    opacity: 0.5;
}

.sub-item {
    display: flex;
    align-items: center;
    padding: 8px 12px 8px 36px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
    position: relative;
}

.sub-item:hover {
    color: var(--primary-color);
    background-color: var(--hover-bg);
}

.sub-item.active {
    color: var(--primary-color);
    background-color: rgba(66, 185, 131, 0.1);
    font-weight: 500;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
}
</style>
