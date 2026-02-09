<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名" required />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" type="email" placeholder="请输入邮箱" required />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <div class="login-link">
        已有账号？ <router-link to="/login">去登录</router-link>
      </div>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request';
import { showMessage } from '../utils/message';

const router = useRouter();
const form = reactive({
  username: '',
  email: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');

const handleRegister = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    await request.post('/auth/register', form);
    showMessage('注册成功，请登录');
    router.push('/login');
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || '注册失败，请稍后重试';
    showMessage(msg, 'error');
    errorMsg.value = msg;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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
.login-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}
.login-link a:hover {
  text-decoration: underline;
}
.error {
  color: var(--danger-color);
  text-align: center;
  margin-top: 1rem;
}
</style>
