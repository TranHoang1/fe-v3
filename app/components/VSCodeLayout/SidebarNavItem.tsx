'use client';

import React, { memo } from 'react';
import Link from 'next/link';

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: (e: React.MouseEvent) => void;
  prefetch?: boolean;
}

// Memoize SidebarNavItem to prevent unnecessary re-renders
export default memo(function SidebarNavItem({
  href,
  icon,
  label,
  isActive,
  collapsed,
  onClick,
  prefetch = false
}: SidebarNavItemProps) {
  return (
    <li>
      <Link 
        href={href} 
        prefetch={prefetch}
        onClick={onClick}
        className={`flex items-center p-2 rounded-md ${
          isActive 
            ? 'bg-[#37373d] text-white' 
            : 'text-gray-300 hover:bg-[#2a2d2e] hover:text-white'
        }`}
      >
        <span className="flex-shrink-0">
          {React.cloneElement(icon as React.ReactElement, { 
            size: collapsed ? 20 : 18
          })}
        </span>
        {!collapsed && (
          <span className="ml-3">{label}</span>
        )}
      </Link>
    </li>
  );
});
