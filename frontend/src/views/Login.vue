<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名" required />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/auth';
import { showMessage } from '../utils/message';

const router = useRouter();
const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await login(form);
    console.log('登录成功', res);
    
    // 存储 Token
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    localStorage.setItem('id', res.id);
    localStorage.setItem('nickname', res.nickname || res.username);
    localStorage.setItem('email', res.email || '');
    localStorage.setItem('avatar', res.avatar || '');
    localStorage.setItem('role', res.role || '');
    
    showMessage('登录成功！');
    if ((res.role || '').toLowerCase() === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error(error);
    const msg = '登录失败，请检查用户名或密码';
    showMessage(msg, 'error');
    errorMsg.value = msg;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  background-color: var(--card-bg);
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-weight: 700;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}
.form-group input {
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s;
}
.form-group input:focus {
  border-color: var(--primary-color);
  background-color: var(--input-bg-focus);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}
button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.1s;
}
button:hover {
  background-color: var(--primary-dark);
}
button:active {
  transform: scale(0.98);
}
button:disabled {
  background-color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}
.error {
  color: var(--danger-color);
  text-align: center;
  margin-top: 1rem;
}
</style>
