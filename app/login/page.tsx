'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/app/lib/api/apiClient';
import { Loader2, LogIn } from 'lucide-react';

// Define the response type for login
interface LoginResponse {
  data: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect destination if any
  const redirectParam = searchParams?.get('redirectTo') || '/';
  const redirectTo = redirectParam.startsWith('/') && !redirectParam.startsWith('/admin') 
    ? `/admin${redirectParam}` 
    : redirectParam;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if already loading
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      // Use the centralized API client for login
      const response = await apiClient.auth.login(username, password) as LoginResponse;
      // Store authentication token
      if(response.data){
        localStorage.setItem('token', response.data);
      }

      // Set token expiration (e.g., 24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      localStorage.setItem('tokenExpires', expiresAt.toISOString());
      
      // Redirect to the requested page or home
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] p-4">
      <div className="w-full max-w-md bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
        <div className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-[#007acc] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">LD</span>
            </div>
          </div>
          <h2 className="text-2xl text-center text-white">Login</h2>
          <p className="text-center text-gray-400">
            Enter your credentials to access the LuckyDraw system
          </p>
        </div>
        <div className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-white">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#555555] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007acc] text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#555555] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007acc] text-white"
                required
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#007acc] hover:underline">
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit" 
              className={`w-full flex items-center justify-center px-4 py-2 bg-[#007acc] hover:bg-[#0069ac] text-white rounded-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </button>
            
            {/* Add loading overlay when processing */}
            {isLoading && (
              <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" aria-hidden="true">
                <div className="bg-[#252526] p-4 rounded-md flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#007acc]" />
                  <span>Processing...</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
