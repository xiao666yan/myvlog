<template>
  <div class="home-container">
    <!-- Welcome Banner -->
    <section class="welcome-banner">
      <div class="welcome-content">
        <h1 class="greeting">{{ greeting }}, <span class="highlight">{{ nickname || 'User' }}</span>!</h1>
        <p class="subtitle">Nice to meet you! Welcome to CodeCanvas.</p>
        <div class="banner-stats">
          <div class="stat-item">
            <span class="stat-num">{{ stats.articleCount }}</span>
            <span class="stat-label">Articles</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats.totalViews }}</span>
            <span class="stat-label">Views</span>
          </div>
        </div>
      </div>
      <div class="welcome-illustration">
        <div class="banner-clock">
          <div class="clock-time">{{ currentTime }}</div>
          <div class="clock-date">{{ currentDate }}</div>
        </div>
        <!-- Abstract shape or illustration -->
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="bg-blob">
          <path fill="#42b983" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-7.1C81.5,6.2,70.2,18.5,60.5,29.6C50.8,40.7,42.7,50.6,33.4,58.3C24.1,66,13.6,71.5,1.7,68.6C-10.2,65.7,-23.5,54.4,-34.5,43.5C-45.5,32.6,-54.2,22.1,-61.4,9.6C-68.6,-2.9,-74.3,-17.4,-70.7,-30.3C-67.1,-43.2,-54.2,-54.5,-40.8,-62.1C-27.4,-69.7,-13.7,-73.6,0.9,-75.1C15.5,-76.6,31,-75.7,44.7,-76.4Z" transform="translate(100 100)" opacity="0.2" />
        </svg>
      </div>
    </section>

    <div class="content-grid">
      <!-- Latest Articles -->
      <section class="latest-articles">
        <div class="section-header">
          <h2>最新文章</h2>
          <router-link to="/articles" class="view-all">查看全部</router-link>
        </div>
        
        <div class="articles-list">
          <div v-for="article in latestArticles" :key="article.id" class="article-card">
            <div class="article-cover" :style="{ backgroundImage: `url(${article.cover})` }"></div>
            <div class="article-info">
              <div class="article-meta">
                <span class="date">{{ article.date }}</span>
                <span class="tag">{{ article.category }}</span>
                <span class="author">{{ article.authorNickname }}</span>
              </div>
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-summary">{{ article.summary }}</p>
              <div class="article-footer">
                <router-link :to="`/articles/${article.id}`" class="read-more">阅读更多 →</router-link>
                <div class="article-stats">
                  <span>字数: {{ article.wordCount }}</span>
                  <span>阅读: {{ article.readingTime }} 分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sidebar Right -->
      <aside class="dashboard-sidebar">
        <!-- Self Introduction -->
        <div class="widget honor-wall-widget">
          <div class="honor-header">
            <span class="honor-icon">👋</span>
            <h3>自我介绍</h3>
          </div>
          <div class="user-intro-box">
            <p class="user-bio">{{ bio }}</p>
          </div>
          <div class="honor-list">
            <div class="honor-item">
              <span class="medal">✨</span>
              <span class="honor-text">热爱编程 · 分享技术 · 记录生活</span>
            </div>
          </div>
        </div>

        <!-- Daily Checklist Widget -->
        <div class="widget todo-widget">
          <div class="widget-header">
            <h3>每日清单</h3>
            <div class="todo-progress">
              <span class="progress-text">{{ completedCount }}/{{ todos.length }}</span>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
              </div>
            </div>
          </div>
          
          <div class="todo-input-group">
            <input 
              v-model="newTodo" 
              type="text" 
              placeholder="添加今天的任务..." 
              @keyup.enter="addTodo"
            />
            <button @click="addTodo" class="add-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <ul class="todo-list">
            <li v-for="(todo, index) in todos" :key="index" :class="{ completed: todo.completed }">
              <div class="todo-item-content" @click="toggleTodo(index)">
                <div class="checkbox" :class="{ checked: todo.completed }">
                  <svg v-if="todo.completed" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span>{{ todo.text }}</span>
              </div>
              <button class="delete-btn" @click="removeTodo(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </li>
          </ul>

          <div class="harvest-section">
            <h4>今日收获 & 总结</h4>
            <textarea 
              v-model="harvest" 
              placeholder="今天有什么收获？写下来吧..."
              rows="3"
            ></textarea>
            <div class="harvest-actions">
              <button @click="generateSummary" class="summary-btn">一键生成今日报</button>
              <button @click="clearCompleted" class="clear-btn">清除已完成</button>
            </div>
          </div>

          <div class="inspiration-box">
            <span class="quote-icon">💡</span>
            <p class="quote-text">{{ currentQuote }}</p>
          </div>
        </div>

        <!-- Clock/Date Widget -->
        <!-- Moved to Banner -->
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getArticles } from '@/api/article';
import { getDashboardStats } from '@/api/dashboard';
import { getProfile } from '@/api/user';
import { showMessage } from '@/utils/message';

const nickname = ref('');
const bio = ref('');

// Todo List Logic
const todos = ref(JSON.parse(localStorage.getItem('daily_todos') || '[]'));
const harvest = ref(localStorage.getItem('daily_harvest') || '');
const newTodo = ref('');

const quotes = [
  "代码如诗，唯有不断打磨，方能流传。",
  "每一个伟大的架构，都始于一行微不足道的代码。",
  "优秀的代码是最好的文档。",
  "不要仅仅为了完成而工作，要为了卓越而创造。",
  "持续学习，是程序员唯一的保鲜期。",
  "Bug 是通往成长之路的阶梯。"
];
const currentQuote = ref(quotes[Math.floor(Math.random() * quotes.length)]);

const completedCount = computed(() => todos.value.filter(t => t.completed).length);
const progress = computed(() => todos.value.length === 0 ? 0 : Math.round((completedCount.value / todos.value.length) * 100));

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({ text: newTodo.value.trim(), completed: false });
    newTodo.value = '';
    saveTodos();
  }
};

const toggleTodo = (index) => {
  todos.value[index].completed = !todos.value[index].completed;
  saveTodos();
};

const removeTodo = (index) => {
  todos.value.splice(index, 1);
  saveTodos();
};

const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.completed);
  saveTodos();
};

const saveTodos = () => {
  localStorage.setItem('daily_todos', JSON.stringify(todos.value));
};

watch(harvest, (newVal) => {
  localStorage.setItem('daily_harvest', newVal);
});

const generateSummary = () => {
  const date = new Date().toLocaleDateString();
  const completedTasks = todos.value.filter(t => t.completed).map(t => `✅ ${t.text}`).join('\n');
  const pendingTasks = todos.value.filter(t => !t.completed).map(t => `⏳ ${t.text}`).join('\n');
  
  let summaryText = `📅 【每日复盘】 ${date}\n\n`;
  if (completedTasks) {
    summaryText += `✨ 今日完成：\n${completedTasks}\n\n`;
  }
  if (pendingTasks) {
    summaryText += `📝 待办事项：\n${pendingTasks}\n\n`;
  }
  if (harvest.value.trim()) {
    summaryText += `💡 今日收获：\n${harvest.value}\n\n`;
  }
  summaryText += `🌟 进度：${progress.value}% | 收获满满，明天继续加油！`;

  navigator.clipboard.writeText(summaryText).then(() => {
    showMessage('今日报已复制到剪贴板！');
  });
};

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// Stats
const stats = ref({
  articleCount: 0,
  projectCount: 0,
  totalViews: 0
});

const loadStats = async () => {
  try {
    const res = await getDashboardStats();
    if (res) {
      stats.value = res;
    }
  } catch (error) {
    // 静默处理：如果是 401 或其他错误，保持默认的 0 即可，不向控制台抛出严重错误
    console.log('Public stats not available or request failed');
  }
};

// Time & Date
const time = ref(new Date());
let timer = null;

const currentTime = computed(() => {
  return time.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const currentDate = computed(() => {
  return time.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
});

// Mock Data
const latestArticles = ref([]);

const loadLatestArticles = async () => {
  try {
    const res = await getArticles({ page: 1, size: 5, sort: 'newest' });
    if (res && res.records) {
      latestArticles.value = res.records.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        date: item.publishedAt ? item.publishedAt.split('T')[0] : item.createdAt.split('T')[0],
        category: (item.category && item.category.name) ? item.category.name : '默认分类',
        authorNickname: (item.author && item.author.nickname) ? item.author.nickname : (item.author && item.author.username ? item.author.username : '未知作者'),
        cover: item.coverImage || `https://picsum.photos/seed/${item.id}/400/300`,
        wordCount: item.wordCount || 0,
        readingTime: item.readingTime || 0
      }));
    }
  } catch (error) {
    console.error('Failed to load latest articles:', error);
  }
};

const projects = ref([
  { id: 1, name: 'MyVlog', desc: '个人博客系统', initial: 'M', color: '#42b983' },
  { id: 2, name: 'CodeCanvas', desc: '交互式编程平台', initial: 'C', color: '#3f51b5' },
  { id: 3, name: 'Trae AI', desc: 'AI 助手集成', initial: 'T', color: '#9c27b0' }
]);

const loadUserProfile = async () => {
  try {
    const data = await getProfile();
    if (data) {
      nickname.value = data.nickname || data.username;
      bio.value = data.bio || '还没有填写个人介绍哦~';
      localStorage.setItem('nickname', data.nickname);
    }
  } catch (error) {
    console.log('User profile not available');
    const storedNickname = localStorage.getItem('nickname');
    const storedUsername = localStorage.getItem('username');
    nickname.value = storedNickname || storedUsername || '用户';
    bio.value = '欢迎来到我的博客！';
  }
};

onMounted(() => {
  loadUserProfile();
  loadLatestArticles();
  loadStats();

  timer = setInterval(() => {
    time.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.home-container {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, var(--nav-bg) 0%, var(--hover-bg) 100%);
  border-radius: 24px;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.welcome-content {
  z-index: 1;
}

.greeting {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.highlight {
  color: var(--primary-color);
}

.subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.banner-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.welcome-illustration {
  width: 300px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bg-blob {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.banner-clock {
  position: relative;
  z-index: 1;
  text-align: right;
  color: var(--text-primary);
}

.clock-time {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.1;
  font-family: monospace;
  color: var(--primary-color);
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.clock-date {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* Content Layout */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.view-all {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Articles List */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-card {
  display: flex;
  background-color: var(--nav-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 200px;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.article-cover {
  width: 280px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  min-height: 200px;
}

.article-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.author {
  margin-left: auto;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.8;
}

.tag {
  color: var(--primary-color);
  font-weight: 600;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
  line-height: 1.5;
}

.article-summary {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.article-stats {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
}

.read-more {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.read-more:hover {
  opacity: 0.8;
}

/* Dashboard Sidebar */
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.widget {
  background-color: var(--nav-bg);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.widget h3,
.project-intro-header {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.project-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.project-details h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.project-details p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Todo Widget Styles */
.todo-widget {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px !important;
}

.widget-header h3 {
  margin-bottom: 0 !important;
}

.todo-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  width: 80px;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar-bg {
  width: 100%;
  height: 4px;
  background-color: var(--hover-bg);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.todo-input-group {
  display: flex;
  gap: 8px;
}

.todo-input-group input {
  flex: 1;
  background-color: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.todo-input-group input:focus {
  border-color: var(--primary-color);
}

.add-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-btn:hover {
  opacity: 0.9;
}

.todo-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: var(--hover-bg);
  border-radius: 10px;
  transition: transform 0.1s;
}

.todo-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.todo-list li span {
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.2s;
}

.todo-list li.completed span {
  color: var(--text-secondary);
  text-decoration: line-through;
  opacity: 0.7;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.todo-list li:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ff4757;
  background-color: rgba(255, 71, 87, 0.1);
}

.harvest-section {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.harvest-section h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.harvest-section textarea {
  width: 100%;
  background-color: var(--hover-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px;
  font-size: 0.85rem;
  color: var(--text-primary);
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.harvest-section textarea:focus {
  border-color: var(--primary-color);
}

.harvest-actions {
  display: flex;
  gap: 10px;
}

.summary-btn {
  flex: 2;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.clear-btn {
  flex: 1;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--text-secondary);
  background-color: var(--hover-bg);
}

.inspiration-box {
  background: linear-gradient(to right, rgba(66, 185, 131, 0.05), transparent);
  border-left: 3px solid var(--primary-color);
  padding: 12px 16px;
  border-radius: 0 12px 12px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.quote-icon {
  font-size: 1.2rem;
}

.quote-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
  line-height: 1.5;
}

/* Honor Wall Styling */
.honor-wall-widget {
  background: linear-gradient(to bottom right, var(--nav-bg), var(--hover-bg));
  border: 1px solid var(--border-color);
}

/* Announcement Widget Styling */
.announcement-widget {
  border-top: 4px solid var(--primary-color);
}

.announcement-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.announcement-header h3 {
  margin-bottom: 0 !important;
}

.announcement-icon {
  font-size: 1.2rem;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-color);
}

.announcement-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.announcement-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.announcement-content {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
  white-space: pre-wrap;
}

.announcement-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.type-tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-tag.update { background-color: #e3f2fd; color: #2196f3; }
.type-tag.maintenance { background-color: #fff3e0; color: #ff9800; }
.type-tag.important { background-color: #ffebee; color: #f44336; }

.honor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.honor-header h3 {
  margin-bottom: 0 !important;
}

.honor-icon {
  font-size: 1.4rem;
}

.user-intro-box {
  background-color: rgba(66, 185, 131, 0.05);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid var(--primary-color);
}

.user-bio {
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.honor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.honor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: var(--bg-color);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.honor-item:hover {
  transform: translateX(4px);
  color: var(--text-primary);
}

.medal {
  font-size: 1.2rem;
}

/* Projects Widget Styling Fix (Keeping some legacy for reference if needed) */

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .article-card {
    height: auto;
    flex-direction: column;
  }
  
  .article-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
