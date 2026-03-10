import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSelector } from '@/contexts/ClientContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  RefreshCw,
  Building2,
  Megaphone,
  Upload,
  Users,
  Plug
} from 'lucide-react';
import { MetaIcon, GoogleIcon, TikTokIcon } from '@/components/icons/PlatformIcons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getLastUpdate } from '@/lib/mockData';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: 'Visão Geral', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Instagram/Meta', href: '/dashboard/meta', icon: <MetaIcon size={20} className="text-[hsl(214,100%,45%)]" /> },
  { label: 'Google Ads', href: '/dashboard/google', icon: <GoogleIcon size={20} /> },
  { label: 'TikTok Ads', href: '/dashboard/tiktok', icon: <TikTokIcon size={20} className="text-[hsl(180,76%,48%)]" /> },
  { label: 'Relatórios', href: '/dashboard/reports', icon: <FileText size={20} /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Clientes', href: '/dashboard/admin/clients', icon: <Building2 size={20} /> },
  { label: 'Campanhas', href: '/dashboard/admin/campaigns', icon: <Megaphone size={20} /> },
  { label: 'Importar Métricas', href: '/dashboard/admin/import', icon: <Upload size={20} /> },
  { label: 'Usuários', href: '/dashboard/admin/users', icon: <Users size={20} /> },
  { label: 'Integrações', href: '/dashboard/integrations', icon: <Plug size={20} /> },
];

const bottomNavItems: NavItem[] = [
  { label: 'Configurações', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedClientId, setSelectedClientId, clients } = useClientSelector();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-auto flex flex-col">
        <div className="h-16 flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 font-semibold text-foreground">Portal de Resultados</div>
        </div>
        {clients.length > 1 && (
          <div className="px-4 pb-3">
            <Select
              value={selectedClientId || '__all__'}
              onValueChange={(val) => setSelectedClientId(val === '__all__' ? null : val)}
            >
              <SelectTrigger className="w-full">
                <Building2 size={14} className="mr-2 shrink-0" />
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {user?.role === 'admin' && (
                  <SelectItem value="__all__">Todos os clientes</SelectItem>
                )}
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={18} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Racun Analytics</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
          </span>
          {user?.clientNames && user.clientNames.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clientes</p>
              <div className="flex flex-wrap gap-1">
                {user.clientNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                  >
                    <Building2 size={12} className="mr-1 shrink-0" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.href) && <ChevronRight size={16} className="ml-auto text-primary" />}
            </Link>
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Administração
                </span>
              </div>
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive(item.href) && <ChevronRight size={16} className="ml-auto text-primary" />}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {/* Top Bar */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw size={14} />
              <span>Última atualização: {getLastUpdate()}</span>
            </div>
            {clients.length > 1 && (
              <Select
                value={selectedClientId || '__all__'}
                onValueChange={(val) => setSelectedClientId(val === '__all__' ? null : val)}
              >
                <SelectTrigger className="w-56">
                  <Building2 size={14} className="mr-2 shrink-0" />
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {user?.role === 'admin' && (
                    <SelectItem value="__all__">Todos os clientes</SelectItem>
                  )}
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
