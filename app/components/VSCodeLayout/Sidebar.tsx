'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Users, Gift, Clock, Map, BarChart2, Settings, History, 
  FileText, ChevronsRight, ChevronsLeft, Lock, Shield,
  Circle, Database, Upload
} from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';

interface SidebarProps {
  minimized?: boolean;
  onToggle?: () => void;
}

// Memoize the Sidebar component to prevent unnecessary re-renders
export default memo(function Sidebar({ minimized = false, onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(minimized);
  const pathname = usePathname();
  const router = useRouter();
  
  // Handle toggle from external control
  useEffect(() => {
    setCollapsed(minimized);
  }, [minimized]);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle();
  };
  
  // Use useCallback to memoize the navigation handler to prevent recreation on each render
  const handleNavigation = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    
    // Only navigate if we're not already on that page
    if (pathname !== href) {
      router.push(href);
    }
  }, [router, pathname]);
  
  // Define sidebar navigation items - moved outside of the component render cycle
  const navItems = [
    { href: '/', icon: <Home />, label: 'Home' },
    { href: '/events', icon: <FileText />, label: 'Events' },
    { href: '/event-locations', icon: <FileText />, label: 'Event Locations' },
    { href: '/participants', icon: <Users />, label: 'Participants' },
    { href: '/rewards', icon: <Gift />, label: 'Rewards' },
    { href: '/golden-hours', icon: <Clock />, label: 'Golden Hours' },
    { href: '/regions', icon: <Map />, label: 'Regions' },
    { href: '/provinces', icon: <Map />, label: 'Provinces' },
    { href: '/dynamic-data', icon: <Database />, label: 'Dynamic Data' },
    { href: '/spin-history', icon: <History />, label: 'Spin History' },
    { href: '/import-history', icon: <Upload />, label: 'Import History' },
    { href: '/statistics', icon: <BarChart2 />, label: 'Statistics' },
    { href: '/audit-log', icon: <FileText />, label: 'Audit Log' },
    { href: '/users', icon: <Users />, label: 'Users' },
    { href: '/roles', icon: <Shield />, label: 'Roles' },
    { href: '/wheel', icon: <Circle />, label: 'Wheel' },
    { href: '/reward-distribute', icon: <Circle />, label: 'Reward Distribute' },
  ];
  
  return (
    <aside className={`h-full flex flex-col bg-[#252526] border-r border-[#3c3c3c] ${collapsed ? 'w-[56px]' : 'w-[240px]'}`}>
      <div className="p-3">
        <button 
          className="w-full flex items-center justify-center p-2 bg-[#3c3c3c] text-white rounded hover:bg-[#4c4c4c] transition-all duration-200"
          onClick={handleToggle}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <SidebarNavItem 
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
              collapsed={collapsed}
              onClick={(e) => handleNavigation(item.href, e)}
              prefetch={false} // Disable prefetching to prevent API calls
            />
          ))}
        </ul>
      </nav>
      
      <div className="p-3">
        <div className={`flex items-center text-gray-400 ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <Lock size={16} />
          {!collapsed && <span className="ml-2 text-xs">v1.0.0</span>}
        </div>
      </div>
    </aside>
  );
});