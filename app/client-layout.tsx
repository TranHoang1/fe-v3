'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './components/VSCodeLayout/Sidebar';
import SidebarDetector from './components/Debug/SidebarDetector';
import { isAuthenticated, redirectToLogin } from './lib/auth/authUtils';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if current path is login page
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login/');
  
  // State to track if we've checked authentication
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if we're already redirecting to avoid loops
    const isRedirecting = sessionStorage.getItem('redirecting') === 'true';
    
    // If we're on a non-login page and not authenticated and not already redirecting
    if (!isLoginPage && !isAuthenticated() && !isRedirecting) {
      redirectToLogin();
    } else {
      // Clear the redirecting flag if we're not redirecting
      sessionStorage.removeItem('redirecting');
      console.log('redirecting');
      setAuthChecked(true);
    }
  }, [isLoginPage]);
  
  // If we're on the login page, don't show sidebar
  if (isLoginPage) {
    return <div className="h-screen bg-[#1e1e1e]">{children}</div>;
  }
  
  // If we haven't checked auth yet, show loading
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] text-white">
        Checking authentication...
      </div>
    );
  }
  
  // For authenticated users on non-login pages, show sidebar
  return (
    <>
      <SidebarDetector />
      
      <div className="flex h-screen">
        <div id="main-sidebar" className="flex-shrink-0 bg-[#252526] border-r border-[#3c3c3c] overflow-hidden">
          <Sidebar />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
