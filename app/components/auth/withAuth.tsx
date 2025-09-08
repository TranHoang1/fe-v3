'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/lib/auth/authUtils';

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        const redirectPath = currentPath.replace(/^\/admin/, '');
        
        // Redirect to login
        router.push(`/login?redirectTo=${encodeURIComponent(redirectPath)}`);
      } else {
        setLoading(false);
      }
    }, [router]);

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] text-white">
          Checking authentication...
        </div>
      );
    }

    return <Component {...props} />;
  };
}