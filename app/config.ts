/**
 * Application configuration
 * Contains environment-specific settings and API endpoints
 */

// Base API URL for backend services
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8094/api';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh-token`,
  USER_INFO: `${API_BASE_URL}/auth/me`,
};

// API endpoints for different entity types
export const API_ENDPOINTS = {
  EVENTS: `${API_BASE_URL}/table-data/fetch/events`,
  PARTICIPANTS: `${API_BASE_URL}/table-data/fetch/participants`,
  REWARDS: `${API_BASE_URL}/table-data/fetch/rewards`,
  REGIONS: `${API_BASE_URL}/table-data/fetch/regions`,
  PROVINCES: `${API_BASE_URL}/table-data/fetch/provinces`,
  GOLDEN_HOURS: `${API_BASE_URL}/table-data/fetch/goldenHours`,
  USERS: `${API_BASE_URL}/table-data/fetch/users`,
  ROLES: `${API_BASE_URL}/table-data/fetch/roles`,
  AUDIT_LOGS: `${API_BASE_URL}/table-data/fetch/auditLogs`,
  SPIN_HISTORIES: `${API_BASE_URL}/table-data/fetch/spinHistories`,
  DASHBOARD: `${API_BASE_URL}/table-data/fetch/dashboard`,
  
  // New wheel-specific endpoints
  WHEEL_SPIN: `${API_BASE_URL}/events/spin`,
  WHEEL_REMAINING_SPINS: `${API_BASE_URL}/events/{eventId}/participants/{participantId}/spins-remaining`,
  WHEEL_HISTORY: `${API_BASE_URL}/events/{eventId}/spins`,
  WHEEL_CLAIM_REWARD: `${API_BASE_URL}/rewards/claim/{spinId}`,
};

// Map entity types to their API endpoints - corrected keys to match the backend enum values
export const ENTITY_API_MAP: Record<string, string> = {
  // Update keys to match the exact case in the ObjectType enum
  Event: API_ENDPOINTS.EVENTS,
  Participant: API_ENDPOINTS.PARTICIPANTS,
  Reward: API_ENDPOINTS.REWARDS,
  Region: API_ENDPOINTS.REGIONS,
  Province: API_ENDPOINTS.PROVINCES,
  GoldenHour: API_ENDPOINTS.GOLDEN_HOURS,
  User: API_ENDPOINTS.USERS,
  Role: API_ENDPOINTS.ROLES,
  AuditLog: API_ENDPOINTS.AUDIT_LOGS,
  SpinHistory: API_ENDPOINTS.SPIN_HISTORIES,
  
};

// Feature flags
export const FEATURES = {
  // Use the environment variable, default to false
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false,
  ENABLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true' || true,
};
