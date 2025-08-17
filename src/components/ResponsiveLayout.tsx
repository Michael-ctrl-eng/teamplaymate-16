import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationProvider, useNotifications } from '../contexts/NotificationContext';
import { toast } from 'sonner';
import ThemeSelector from './ThemeSelector';
import NotificationPanel from './NotificationPanel';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Database,
  Bot,
  LogOut,
  User,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayoutContent: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
      toast.success(t('auth.logoutSuccess'));
    } catch (error) {
      toast.error(t('auth.logoutError'));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = JSON.parse(localStorage.getItem('match_actions') || '[]');
      const recentActions = actions.filter((action: any) => {
        const actionTime = new Date(action.timestamp).getTime();
        const now = new Date().getTime();
        return (now - actionTime) < 300000;
      });
      setNotificationCount(recentActions.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { 
      name: t('sidebar.dashboard'), 
      icon: Home, 
      path: '/dashboard',
      badge: null 
    },
    { 
      name: t('sidebar.players'), 
      icon: Users, 
      path: '/players',
      badge: null 
    },
    { 
      name: t('sidebar.matches'), 
      icon: Calendar, 
      path: '/matches',
      badge: null 
    },
    { 
      name: t('sidebar.analytics'), 
      icon: BarChart3, 
      path: '/advanced-analytics',
      badge: 'New' 
    },
    { 
      name: t('sidebar.training'), 
      icon: BarChart3, 
      path: '/training',
      badge: null 
    },
    { 
      name: t('sidebar.aiAssistant'), 
      icon: Bot, 
      path: '/ai-assistant',
      badge: 'AI' 
    },
    { 
      name: t('sidebar.dataManagement'), 
      icon: Database, 
      path: '/data-management',
      badge: null 
    },
    { 
      name: t('sidebar.settings'), 
      icon: Settings, 
      path: '/settings',
      badge: null 
    }
  ];

  return (
    <div className="min-h-screen pwa-safe-area bg-gray-900 text-white">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
         `fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out scroll-smooth-mobile bg-gray-800 border-r border-gray-700`,
         sidebarOpen ? "translate-x-0" : "-translate-x-full",
         sidebarCollapsed ? "w-16" : "w-64",
         "md:translate-x-0"
       )}>
        <div className="flex flex-col h-full">
          <div className={cn(
             "flex items-center justify-between p-4 border-b border-gray-700",
             sidebarCollapsed && "justify-center px-2"
           )}>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold gradient-text-primary truncate">
                TeamPlaymate
              </h1>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex touch-target focus-enhanced"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden touch-target focus-enhanced"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scroll-smooth-mobile">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 touch-target focus-enhanced transition-all duration-200",
                    sidebarCollapsed ? "px-2" : "px-3",
                    isActive && "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs truncate text-gray-400">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <header className="sticky top-0 z-30 backdrop-blur safe-area-top bg-gray-800/95 supports-[backdrop-filter]:bg-gray-800/90 border-b border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-3 sm:p-4 container-responsive">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden touch-target focus-enhanced text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Menu size={20} />
              </Button>
              
              <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md lg:max-w-lg">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 focus-enhanced text-responsive-base bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600 focus:border-gray-500"
                  />
                </div>
              </form>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/search')}
                className="sm:hidden touch-target focus-enhanced text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Search size={18} />
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="touch-target focus-enhanced text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Globe size={16} />
                    <span className="ml-1 sm:ml-2 hidden sm:inline text-responsive-sm">{currentLanguage.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')}>
                    Español
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')}>
                    Français
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeSelector />

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                className="relative touch-target focus-enhanced text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 sm:gap-2 touch-target focus-enhanced text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-responsive-sm truncate max-w-[100px] text-white">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Notification Panel */}
        <NotificationPanel 
          isOpen={notificationPanelOpen} 
          onClose={() => setNotificationPanelOpen(false)} 
        />

        <main className="flex-1 safe-area-bottom scroll-smooth-mobile flex bg-gray-900">
          <div className="flex-1 container-responsive spacing-responsive py-4 sm:py-6 text-white">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <ResponsiveLayoutContent>{children}</ResponsiveLayoutContent>
    </NotificationProvider>
  );
};

export default ResponsiveLayout;