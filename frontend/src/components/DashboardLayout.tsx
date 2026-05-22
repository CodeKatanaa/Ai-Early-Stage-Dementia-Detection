import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Home, History, Dumbbell, Gamepad2, UserCircle, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const navItems = [
  { title: 'Home', path: '/dashboard', icon: Home },
  { title: 'History', path: '/dashboard/history', icon: History },
  { title: 'Exercise', path: '/dashboard/exercise', icon: Dumbbell },
  { title: 'Memory Games', path: '/dashboard/games', icon: Gamepad2 },
  { title: 'My Profile', path: '/dashboard/profile', icon: UserCircle },
];

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold text-foreground">ScreeningTool</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
