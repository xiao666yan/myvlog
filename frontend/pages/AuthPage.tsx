import React, { useState } from 'react';
import { User, Lock, Mail, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import { login, register } from '../src/api/auth';
import { useToast } from '../context/ToastContext';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(username, password);
        // Backend returns AuthResponse directly on success
        if (user && user.token) {
          sessionStorage.setItem('token', user.token);
          sessionStorage.setItem('user', JSON.stringify(user));
          showToast('欢迎回来！', 'success');
          onLoginSuccess(user);
        } else {
          setError('登录失败：返回数据格式错误');
        }
      } else {
        const res = await register(username, password, email, nickname);
        // Backend returns AuthResponse directly on success, including token
        if (res && res.token) {
           // Auto login after successful registration
           sessionStorage.setItem('token', res.token);
           sessionStorage.setItem('user', JSON.stringify(res));
           showToast('注册成功！已为您自动登录', 'success');
           onLoginSuccess(res);
        } else {
           setError('注册失败：返回数据格式错误');
        }
      }
    } catch (err: any) {
      console.error('Auth error details:', err.response?.data);
      let errorMsg = '操作失败，请重试';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.error) {
          errorMsg = data.error;
        } else if (typeof data === 'object') {
          // Handle validation errors (Map of field -> message)
          errorMsg = Object.values(data).join('; ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm z-0"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {isLogin ? '欢迎回来' : '加入我们'}
            </h2>
            <p className="text-primary-100 text-sm">
              {isLogin ? '登录以继续您的创作之旅' : '创建一个账户开始分享您的故事'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">用户名</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">昵称</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="您的显示名称"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    <UserPlus size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">邮箱</label>
                  <div className="relative">
                    <input 
                      type="email"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">密码</label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>处理中...</span>
              ) : (
                <>
                  {isLogin ? '登录' : '注册'} <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 font-bold text-primary-600 hover:underline"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
