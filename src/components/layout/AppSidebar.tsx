import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Trophy,
  GraduationCap,
  Wallet,
  CheckSquare,
  Link,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Estudos', path: '/estudos' },
  { icon: Calendar, label: 'Cronograma', path: '/cronograma' },
  { icon: Target, label: 'Treinos & Simulados', path: '/treinos' },
  { icon: Trophy, label: 'Concursos', path: '/concursos' },
  { icon: GraduationCap, label: 'Cursinhos', path: '/cursinhos' },
  { icon: Wallet, label: 'Vida Financeira', path: '/financeiro' },
  { icon: CheckSquare, label: 'Objetivos & Pendências', path: '/objetivos' },
  { icon: Link, label: 'Banco de Links', path: '/banco' },
  { icon: User, label: 'Perfil', path: '/perfil' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm">PRODUTIVIDADE</span>
            <span className="text-xs text-muted-foreground -mt-0.5">MÁXIMA</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    !isActive && 'group-hover:scale-110'
                  )} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse button */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
