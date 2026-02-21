import axios, { AxiosRequestConfig } from 'axios';

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
});

service.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    
    if (res.code && res.code !== 200) {
      console.error('API Error:', res.message || 'Error');
      
      if (res.code === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.hash = '#login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  error => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Only handle 401 errors by redirecting to login
      // 403 errors might be due to insufficient permissions, not authentication issues
      if (error.response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.hash = '#login';
      }
      
      const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);

export default service as {
  <T = any>(config: AxiosRequestConfig): Promise<T>;
  request<T = any>(config: AxiosRequestConfig): Promise<T>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
};
