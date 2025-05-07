'use client';

/**
 * Token Management Module
 * Client-side implementation 
 */

// Export core types
export * from './interfaces/ITokenManager';

// Export ClientTokenManager as TokenManager for compatibility
export { ClientTokenManager as TokenManager } from './ClientTokenManager';

// Export ClientTokenManager functionality
export { ClientTokenManager } from './ClientTokenManager';
export { default as createTokenManager } from './ClientTokenManager';

// Re-export utility functions (using ClientTokenManager directly)
import { ClientTokenManager } from './ClientTokenManager';

/**
 * Get token
 * Alias for getAccessToken for compatibility
 * @returns Token or null
 */
export async function getToken(): Promise<string | null> {
  return await ClientTokenManager.getAccessToken();
}

/**
 * Get access token
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
  return await ClientTokenManager.getAccessToken();
}

/**
 * Refresh the current access token
 * @returns Refresh result
 */
export async function refreshAccessToken(): Promise<boolean> {
  return await ClientTokenManager.refreshAccessToken();
}

/**
 * Validate token and refresh if needed
 * @param forceRefresh Whether to force a token refresh
 * @returns True if token is valid or was successfully refreshed
 */
export async function synchronizeTokens(forceRefresh: boolean = false): Promise<boolean> {
  return await ClientTokenManager.synchronizeTokens(forceRefresh);
}

/**
 * Get user information from token
 * @param token JWT token
 * @returns User information or null
 */
export function getUserFromToken(token: string) {
  const jwtDecode = require('jwt-decode');
  
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.sub) return null;
    
    // Extract user information
    let userId: number;
    if (typeof decoded.sub === 'number') {
      userId = decoded.sub;
    } else if (typeof decoded.sub === 'string') {
      userId = parseInt(decoded.sub, 10);
    } else {
      return null;
    }
    
    if (isNaN(userId)) return null;
    
    return {
      id: userId,
      name: decoded.name || '',
      email: decoded.email || '',
      role: decoded.role || ''
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Clear all tokens from client
 */
export async function clearTokens(): Promise<void> {
  await ClientTokenManager.clearTokens();
}

/**
 * Notify about authentication changes
 * @param isAuthenticated Whether user is authenticated
 */
export async function notifyAuthChange(isAuthenticated: boolean): Promise<void> {
  await ClientTokenManager.notifyAuthChange(isAuthenticated);
}

/**
 * Notify specifically about logout events
 */
export async function notifyLogout(): Promise<void> {
  await ClientTokenManager.notifyLogout();
}

export default {
  getToken,
  getAccessToken,
  refreshAccessToken,
  synchronizeTokens,
  getUserFromToken,
  clearTokens,
  notifyAuthChange,
  notifyLogout
};