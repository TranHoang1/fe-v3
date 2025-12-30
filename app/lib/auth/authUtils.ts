// Authentication utilities

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('token');
  
  // If no token exists, user is not authenticated
  if (!token) {
    return false;
  }
  
  // Check token expiration if available
  const tokenExpires = localStorage.getItem('tokenExpires');
  if (tokenExpires) {
    const expiresAt = new Date(tokenExpires);
    const now = new Date();
    return expiresAt > now;
  }
  
  // If no expiration is set but token exists, consider authenticated
  return true;
};

/**
 * Get the authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
};

/**
 * Logout the user
 */
export const logout = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpires');
  
  // Force a hard redirect to login page
  window.location.href = '/luckydraw/admin/login/';
};

/**
 * Force redirect to login page
 */
export const redirectToLogin = (currentPath: string = window.location.pathname) => {
  if(requiresAuth(currentPath)){
  // Set a session storage flag to indicate we're redirecting
  sessionStorage.setItem('redirecting', 'true');
  // Force a hard redirect
  window.location.href = `/luckydraw/admin/login/`;
  }
};

/**
 * Check if the current path requires authentication
 * All paths require authentication except login
 */
export const requiresAuth = (path: string): boolean => {
  return !path.includes('/luckydraw/admin/login/');
};