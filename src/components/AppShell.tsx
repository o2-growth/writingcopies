import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  PenTool,
  Library,
  Clock,
  Building2,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { to: '/create',   label: 'Criar',      icon: PenTool },
  { to: '/library',  label: 'Biblioteca', icon: Library },
  { to: '/history',  label: 'Histórico',  icon: Clock },
  { to: '/controle', label: 'Controle',   icon: BarChart3 },
];

const adminItems = [
  { to: '/admin/company',     label: 'Empresa',      icon: Building2 },
  { to: '/admin/products',    label: 'Produtos',     icon: Package },
  { to: '/admin/copywriters', label: 'Copywriters',  icon: Users },
];

const SIDEBAR_KEY = 'sidebar_collapsed';

export default function AppShell() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

  const isDark = theme === 'dark';

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active = location.pathname === item.to;
    const linkClass = cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
      active
        ? 'bg-primary text-primary-foreground shadow-apple-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
      collapsed && 'justify-center px-2'
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.to} onClick={() => setMobileOpen(false)} className={linkClass}>
              <item.icon className="h-5 w-5 shrink-0" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link to={item.to} onClick={() => setMobileOpen(false)} className={linkClass}>
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  };

  const NavContent = ({ forMobile = false }: { forMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center p-4 border-b border-border', collapsed && !forMobile ? 'justify-center' : 'justify-between')}>
        {(!collapsed || forMobile) && (
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Copy<span className="text-primary">Lab</span>
          </h1>
        )}
        {!forMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setCollapsed(c => !c)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 space-y-1', collapsed && !forMobile ? 'px-2' : 'px-3')}>
        {!collapsed || forMobile ? (
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Principal
          </p>
        ) : null}
        {navItems.map(item => <NavLink key={item.to} item={item} />)}

        <div className={cn('pt-5', (!collapsed || forMobile) && 'mt-2')}>
          {!collapsed || forMobile ? (
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Admin
            </p>
          ) : <div className="border-t border-border mb-2" />}
          {adminItems.map(item => <NavLink key={item.to} item={item} />)}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn('p-3 border-t border-border space-y-1', collapsed && !forMobile && 'px-2')}>
        {collapsed && !forMobile ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full rounded-xl h-10 text-muted-foreground" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground rounded-xl"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex border-r border-border bg-card flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-card border-r border-border shadow-apple-md">
            <NavContent forMobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">
              Copy<span className="text-primary">Lab</span>
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Desktop top bar with theme toggle */}
        <header className="hidden md:flex items-center justify-end px-8 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
