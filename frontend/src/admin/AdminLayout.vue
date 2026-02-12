<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-brand">Admin Console</div>
      <nav class="admin-nav">
        <router-link to="/admin" class="admin-link" active-class="active">仪表盘</router-link>
        <router-link to="/admin/articles" class="admin-link" active-class="active">文章管理</router-link>
        <router-link to="/admin/categories" class="admin-link" active-class="active">分类管理</router-link>
        <router-link to="/admin/tags" class="admin-link" active-class="active">标签管理</router-link>
        <router-link to="/admin/comments" class="admin-link" active-class="active">评论管理</router-link>
        <router-link to="/admin/announcements" class="admin-link" active-class="active">公告管理</router-link>
        <router-link to="/admin/users" class="admin-link" active-class="active">用户管理</router-link>
      </nav>
    </aside>
    <main class="admin-content">
      <header class="admin-header">
        <div class="spacer"></div>
        <button class="logout" @click="logout">退出</button>
      </header>
      <section class="admin-view">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('id');
  localStorage.removeItem('nickname');
  localStorage.removeItem('role');
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.admin-sidebar {
  background: var(--nav-bg);
  border-right: 1px solid var(--border-color);
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.admin-brand {
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--primary-color);
  font-size: 1.2rem;
}
.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.admin-link {
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}
.admin-link.active {
  color: var(--primary-color);
  background: var(--hover-bg);
  font-weight: 600;
}
.admin-link:hover:not(.active) {
  background: var(--hover-bg);
}
.admin-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f9fafb;
}
.admin-header {
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
  background: #fff;
}
.logout {
  padding: 8px 16px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.logout:hover {
  background: #fecaca;
}
.admin-view {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
