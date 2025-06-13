import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // メニューの開閉
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // メニューを閉じる
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // ログアウト処理
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // ページ遷移処理（スクロール位置をリセット）
  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
    closeMenu();
  };
  
  // 認証済みユーザー向けのメニュー項目
  const authenticatedItems = [
    { name: 'ダッシュボード', path: '/dashboard' },
    { name: '関係改善のヒント', path: '/relationship-tips' },
  ];

  return (
    <header className="sticky top-0 z-10 bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <div
            onClick={() => handleNavigation('/')}
            className="flex items-center space-x-2 text-blue-600 cursor-pointer"
          >
            <Heart className="h-8 w-8" />
            <span className="text-xl font-bold">Family Lab</span>
          </div>
          
          {/* 認証ボタン / ユーザーメニュー */}
          <div className="hidden items-center space-x-4 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ログアウト</span>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation('/login')}
                >
                  ログイン
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavigation('/register')}
                >
                  新規登録
                </Button>
              </>
            )}
          </div>
          
          {/* モバイルメニューボタン */}
          <button
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-6 pt-2 md:hidden">
          <nav>
            <ul className="space-y-4 py-4">
              {isAuthenticated && authenticatedItems.map((item) => (
                <li key={item.path}>
                  <span
                    className={`block text-base font-medium cursor-pointer ${
                      location.pathname === item.path
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <>
                  <div 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleNavigation('/login')}
                  >
                    ログイン
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleNavigation('/register')}
                  >
                    新規登録
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};