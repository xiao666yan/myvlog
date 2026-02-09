/**
 * Axios 网络请求工具类
 * 负责统一配置请求路径、超时时间、请求头 Token 注入以及响应异常处理
 */
import axios from 'axios';

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // 所有请求会自动加上 /api 前缀，由 Vite 代理转发到后端 3060 端口
  timeout: 5000    // 请求超时时间设为 5 秒
});

// 2. Request 拦截器：在请求发送前执行
service.interceptors.request.use(config => {
  // 从本地存储中获取登录时保存的 Token
  const token = localStorage.getItem('token');
  if (token) {
    // 如果存在 Token，则自动注入到 Authorization 请求头中
    // 采用标准的 Bearer Token 格式
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
}, error => {
  // 请求错误处理
  return Promise.reject(error);
});

// 3. Response 拦截器：在收到后端响应后执行
service.interceptors.response.use(
  response => {
    // 检查 Token 是否过期 (由后端 JwtAuthenticationFilter 设置)
    if (response.headers['x-jwt-expired'] === 'true') {
      console.warn('JWT Token expired detected in header');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可选：刷新页面或跳转登录
      // window.location.reload(); 
    }
    // 成功响应：直接返回数据部分 (data)，简化组件内部调用
    return response.data;
  },
  error => {
    // 统一错误处理
    if (error.response) {
      // 针对常见的状态码进行处理
      switch (error.response.status) {
        case 401:
          // 401 Unauthorized：Token 失效或未登录
          // 仅在非公开接口或特定条件下记录错误
          if (!error.config.url.includes('/dashboard/stats')) {
            console.error('登录过期，请重新登录');
          }
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default service;
