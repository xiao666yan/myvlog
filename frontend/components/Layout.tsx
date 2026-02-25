import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Search, User, Menu, X, LayoutDashboard, LogOut, Home, 
  PenTool, Edit3, Settings, Heart, Code, LogIn, Bell
} from 'lucide-react';
import { MOCK_USER } from '../constants.tsx';
import { logout } from '../src/api/auth';
import { getActiveAnnouncements, markAnnouncementAsRead } from '../src/api/announcement';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, currentUser, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncePopup, setShowAnnouncePopup] = useState(false);
  const [currentAnnounce, setCurrentAnnounce] = useState<any>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        JSON.parse(userStr);
      } catch {
        localStorage.removeItem('user');
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    
    const fetchAnnouncements = async () => {
      try {
        const res = await getActiveAnnouncements();
        const activeList = Array.isArray(res) ? res : (res.data || []);
        setAnnouncements(activeList);

        if (activeList.length > 0) {
          const latest = activeList[0];
          
          if (!latest.hasRead) {
            setHasUnread(true);
            setCurrentAnnounce(latest);
            setShowAnnouncePopup(true);
          } else {
            setHasUnread(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    fetchAnnouncements();

    window.addEventListener('announcement-updated', fetchAnnouncements);
    return () => window.removeEventListener('announcement-updated', fetchAnnouncements);
  }, [currentUser?.id, initialized]);

  const openAnnouncements = async () => {
    if (announcements.length > 0) {
      setCurrentAnnounce(announcements[0]);
      setShowAnnouncePopup(true);
      setHasUnread(false);
      if (currentUser && announcements[0]) {
        try {
          await markAnnouncementAsRead(announcements[0].id);
        } catch (error) {
          console.error('Failed to mark announcement as read:', error);
        }
      }
    }
  };

  const closePopup = async () => {
    setShowAnnouncePopup(false);
    setHasUnread(false);
    if (currentUser && currentAnnounce) {
      try {
        await markAnnouncementAsRead(currentAnnounce.id);
      } catch (error) {
        console.error('Failed to mark announcement as read:', error);
      }
    }
  };

  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'moments', label: '动态', icon: Heart },
    { id: 'archive', label: '归档', icon: Library },
    { id: 'search', label: '搜索', icon: Search },
  ];
  
  // Only add these if user is logged in
  if (currentUser) {
    navItems.push({ id: 'profile', label: '个人中心', icon: User });
    navItems.push({ id: 'create', label: '创作', icon: Edit3 });
    
    if (currentUser.role && currentUser.role.toUpperCase() === 'ADMIN') {
        navItems.push({ id: 'admin', label: '管理后台', icon: LayoutDashboard });
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer group"
                onClick={() => onNavigate('home')}
              >
                <div className="relative w-9 h-9 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-gray-900 shadow-lg group-hover:rotate-6 transition-transform">
                  <Code size={20} strokeWidth={3} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-gray-950"></div>
                </div>
                <div className="ml-3 flex items-baseline">
                  <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                    Code
                  </span>
                  <span className="text-xl font-light tracking-tight text-primary-600 dark:text-primary-400">
                    Canvas
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    activeTab === item.id 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {currentUser ? (
                 <div className="relative group">
                    <img 
                        src={currentUser.avatar || "https://picsum.photos/seed/user/200"} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                        onClick={() => onNavigate('profile')}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.nickname}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <button onClick={() => onNavigate('profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            个人中心
                        </button>
                        <button onClick={openAnnouncements} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center">
                            公告通知 {hasUnread && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            退出登录
                        </button>
                    </div>
                 </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/20"
                >
                  <LogIn size={16} className="mr-2" /> 登录
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-500"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-500"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden glass-effect border-b border-gray-200 dark:border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === item.id 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <item.icon size={18} className="mr-2" />
                {item.label}
              </button>
            ))}
            {!currentUser && (
                <button
                    onClick={() => {
                        onNavigate('login');
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                >
                    <LogIn size={18} className="mr-2" /> 登录
                </button>
            )}
            {currentUser && (
                <button
                    onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut size={18} className="mr-2" /> 退出登录
                </button>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2024 CodeCanvas. 用激情与 AI 构建。
          </p>
        </div>
      </footer>

      {/* Announcement Popup Modal */}
      {showAnnouncePopup && currentAnnounce && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="relative h-32 bg-primary-600 flex items-center justify-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                <Bell size={32} className="animate-bounce-slow" />
              </div>
              <button 
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  currentAnnounce.type === 'important' ? 'bg-red-100 text-red-600' :
                  currentAnnounce.type === 'system_update' ? 'bg-blue-100 text-blue-600' :
                  'bg-primary-100 text-primary-600'
                }`}>
                  {currentAnnounce.type === 'important' ? '重要' : 
                   currentAnnounce.type === 'system_update' ? '更新' : '公告'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(currentAnnounce.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {currentAnnounce.title}
              </h2>
              
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 max-h-64 overflow-y-auto custom-scrollbar mb-8">
                {currentAnnounce.content}
              </div>
              
              <button 
                onClick={closePopup}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
