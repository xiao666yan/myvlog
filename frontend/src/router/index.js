import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Home from '../views/Home.vue';
import Articles from '../views/Articles.vue';
import Create from '../views/Create.vue';
import ArticleDetail from '../views/ArticleDetail.vue';
import ArticleManager from '../views/ArticleManager.vue';
import UserProfile from '../views/UserProfile.vue';
import Search from '../views/Search.vue';
import JsonFormatter from '../views/tools/JsonFormatter.vue';
import FunctionGraph from '../views/tools/FunctionGraph.vue';
import RegexTester from '../views/tools/RegexTester.vue';
import AdminLayout from '../admin/AdminLayout.vue';
import AdminDashboard from '../admin/AdminDashboard.vue';
import AdminArticles from '../admin/AdminArticles.vue';
import AdminUsers from '../admin/AdminUsers.vue';
import AdminCategories from '../admin/AdminCategories.vue';
import AdminTags from '../admin/AdminTags.vue';
import AdminComments from '../admin/AdminComments.vue';
import AdminAnnouncements from '../admin/AdminAnnouncements.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/article-manager',
    name: 'ArticleManager',
    component: ArticleManager
  },
  {
    path: '/articles',
    name: 'Articles',
    component: Articles
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/create',
    name: 'Create',
    component: Create
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: Create
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/tools/json',
    name: 'JsonFormatter',
    component: JsonFormatter
  },
  {
    path: '/tools/function-graph',
    name: 'FunctionGraph',
    component: FunctionGraph
  },
  {
    path: '/tools/regex',
    name: 'RegexTester',
    component: RegexTester
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAdmin: true }
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: AdminArticles,
        meta: { requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
        meta: { requiresAdmin: true }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: AdminCategories,
        meta: { requiresAdmin: true }
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: AdminTags,
        meta: { requiresAdmin: true }
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: AdminComments,
        meta: { requiresAdmin: true }
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: AdminAnnouncements,
        meta: { requiresAdmin: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta && record.meta.requiresAdmin)) {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('role') || '').toLowerCase();
    if (!token || role !== 'admin') {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }
  }
  next();
});

export default router;
