'use client';

import { useEffect } from 'react';

export default function SidebarDetector() {
  useEffect(() => {
    // Find all sidebars on the page
    const sidebars = document.querySelectorAll('.h-full.flex.flex-col');
    console.log('Found', sidebars.length, 'potential sidebars');
    
    // Add special border to all found sidebars to make them visually identifiable
    sidebars.forEach((sidebar, index) => {
      sidebar.setAttribute('data-sidebar-index', String(index));
      if (index > 0) {
        console.warn('Duplicate sidebar detected!', sidebar);
        sidebar.classList.add('duplicate-sidebar-detected');
        // Add a bright red border to make it obvious
        (sidebar as HTMLElement).style.border = '2px solid red';
        (sidebar as HTMLElement).style.boxShadow = '0 0 10px red';
      }
    });
    
    return () => {
      // Clean up
      document.querySelectorAll('.duplicate-sidebar-detected').forEach(el => {
        el.classList.remove('duplicate-sidebar-detected');
        (el as HTMLElement).style.border = '';
        (el as HTMLElement).style.boxShadow = '';
      });
    };
  }, []);
  
  return null; // This component doesn't render anything
}
