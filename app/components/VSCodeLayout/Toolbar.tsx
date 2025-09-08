'use client';

import styles from './Toolbar.module.css';

interface ToolbarProps {
  toggleSidebarAction: () => void;
}

export default function Toolbar({ toggleSidebarAction }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.menuBar}>
        <div className={styles.menuItem}>File</div>
        <div className={styles.menuItem}>Edit</div>
        <div className={styles.menuItem}>View</div>
        <div className={styles.menuItem}>Go</div>
        <div className={styles.menuItem}>Run</div>
        <div className={styles.menuItem}>Terminal</div>
        <div className={styles.menuItem}>Help</div>
      </div>
      <div className={styles.windowControls}>
        <button className={styles.sidebarToggle} onClick={toggleSidebarAction}>
          ☰
        </button>
      </div>
    </div>
  );
}