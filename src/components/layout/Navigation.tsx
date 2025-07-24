import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Plus, 
  FileText, 
  Settings, 
  User,
  LogOut,

} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: t('navigation.dashboard'),
      roles: ['agent', 'supervisor', 'admin']
    },
    {
      path: '/new-report',
      icon: Plus,
      label: t('navigation.newReport'),
      roles: ['agent', 'supervisor', 'admin']
    },
    {
      path: '/reports',
      icon: FileText,
      label: t('navigation.reports'),
      roles: ['agent', 'supervisor', 'admin']
    },
    {
      path: '/administration',
      icon: Settings,
      label: t('navigation.administration'),
      roles: ['admin']
    },
    {
      path: '/profile',
      icon: User,
      label: t('navigation.profile'),
      roles: ['agent', 'supervisor', 'admin']
    }
  ];

  const visibleItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Top Header */}
      <header className="navbar safe-area-top">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-tamboura-500 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">{t('app.name')}</h1>
            {user && (
              <p className="text-gray-400 text-xs">
                {user.firstName} {user.lastName} - {t(`roles.${user.role}`)}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-white rounded-lg"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-area-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg touch-manipulation ${
                  active 
                    ? 'text-tamboura-500 bg-tamboura-500/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-20 safe-area-bottom"></div>
    </>
  );
};