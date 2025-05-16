
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Archive, 
  Bell, 
  Book, 
  Calendar, 
  ClipboardCheck, 
  Database, 
  FileCheck, 
  LogOut, 
  Settings, 
  User
} from 'lucide-react';

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine if sidebar is collapsed based on state
  const collapsed = state === "collapsed";
  
  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) => {
    return isActive(path)
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end text-sidebar-foreground hover:text-sidebar-primary" />
      
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-4'} mb-8`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-md bg-booze-amber flex items-center justify-center text-white font-bold">BC</div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-booze-amber flex items-center justify-center text-white font-bold mr-2">BC</div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Booze Cruiser</h1>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/dashboard")}>
                  <Link to="/dashboard" className="flex items-center p-2">
                    <Database className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/operations")}>
                  <Link to="/operations" className="flex items-center p-2">
                    <Book className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Operations Log</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/spirits")}>
                  <Link to="/spirits" className="flex items-center p-2">
                    <Archive className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Spirits & Batches</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Reporting</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/reports/5110-40")}>
                  <Link to="/reports/5110-40" className="flex items-center p-2">
                    <FileCheck className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Form 5110.40</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/reports/5110-28")}>
                  <Link to="/reports/5110-28" className="flex items-center p-2">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Form 5110.28</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={getNavClass("/reports/5110-11")}>
                  <Link to="/reports/5110-11" className="flex items-center p-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Form 5110.11</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={getNavClass("/settings")}>
                    <Link to="/settings" className="flex items-center p-2">
                      <Settings className="h-5 w-5 mr-2" />
                      {!collapsed && <span>Settings</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
            <SidebarTrigger className="md:hidden" />
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell size={20} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 flex items-center gap-2">
                    <span className="hidden md:inline-block">{user?.name}</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <User size={16} />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="text-xs font-medium">{user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="capitalize">{user?.role} at {user?.organization.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
