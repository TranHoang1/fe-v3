'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import styles from './VSCodeLayout.module.css';

interface VSCodeLayoutProps {
  children: ReactNode;
}

export default function VSCodeLayout({ children }: VSCodeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.vscodeContainer}>
      <Toolbar toggleSidebarAction={toggleSidebar} />
      <div className={styles.mainContent}>
        <Sidebar />
        <div className={styles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
}