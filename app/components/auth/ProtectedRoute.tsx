'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get current path
    const currentPath = window.location.pathname;
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      const redirectPath = currentPath.replace(/^\/admin/, '');
      // Don't redirect if already on login page
      if (!currentPath.includes('/login')) {
      setIsLoading(false);
        // Remove the /admin prefix for the redirectTo parameter
        router.push(`/login?redirectTo=${redirectPath}`);
      } else {
        router.push(`/login`);
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] text-white">
        Checking authentication...
      </div>
    );
  }
  
  return <>{children}</>;
}