/**
 * Permission Utilities for API Routes
 * 
 * Provides consistent permission checking methods to be used across API routes
 */

import { getLogger } from '@/core/logging';
import { getServiceFactory } from '@/core/factories/serviceFactory.server';
import { SystemPermission } from '@/domain/enums/PermissionEnums';
import { permissionMiddleware } from '@/features/permissions/api/middleware/permissionMiddleware';

/**
 * Checks if a user has a specific permission
 * 
 * @param userId - User ID to check permissions for
 * @param permission - Permission code to check
 * @returns Promise resolving to boolean indicating if user has permission
 */
export async function checkUserPermission(
  userId: number,
  permission: SystemPermission | string
): Promise<boolean> {
  const logger = getLogger();
  
  try {
    // Validate inputs
    if (!userId || isNaN(userId) || userId <= 0) {
      logger.warn('Invalid user ID provided for permission check', { userId });
      return false;
    }
    
    if (!permission || typeof permission !== 'string' || permission.trim() === '') {
      logger.warn('Invalid permission code provided for permission check', { permission });
      return false;
    }
    
    return await permissionMiddleware.hasPermission(userId, permission);
  } catch (error) {
    logger.error('Error checking user permission:', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      permission
    });
    return false; // Fail closed - deny permission if there's an error
  }
}

/**
 * Checks if a user has any of the specified permissions
 * 
 * @param userId - User ID to check permissions for
 * @param permissions - Array of permission codes
 * @returns Promise resolving to boolean indicating if user has any permission
 */
export async function checkUserHasAnyPermission(
  userId: number,
  permissions: (SystemPermission | string)[]
): Promise<boolean> {
  const logger = getLogger();
  
  // Validate inputs
  if (!userId || isNaN(userId) || userId <= 0) {
    logger.warn('Invalid user ID provided for permission check', { userId });
    return false;
  }
  
  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    logger.warn('No permissions specified for checkUserHasAnyPermission');
    return false;
  }
  
  try {
    // Check if user role is admin (admin has all permissions)
    const userRepository = (await import('@/core/factories/repositoryFactory')).getRepositoryFactory().createUserRepository();
    const user = await userRepository.findById(userId);
    
    if (user?.role?.toLowerCase() === 'admin') {
      return true; // Admin has all permissions
    }
    
    // Get all user permissions
    const serviceFactory = getServiceFactory();
    const permissionService = serviceFactory.createPermissionService();
    const userPermissionsResponse = await permissionService.getUserPermissions(userId);
    
    if (!userPermissionsResponse || !userPermissionsResponse.permissions) {
      return false;
    }
    
    // Check if user has any of the specified permissions
    const userPermissions = userPermissionsResponse.permissions;
    return permissions.some(permission => userPermissions.includes(permission));
  } catch (error) {
    logger.error('Error checking user permissions:', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      permissions
    });
    return false; // Fail closed - deny permission if there's an error
  }
}

/**
 * Checks if a user has all of the specified permissions
 * 
 * @param userId - User ID to check permissions for
 * @param permissions - Array of permission codes
 * @returns Promise resolving to boolean indicating if user has all permissions
 */
export async function checkUserHasAllPermissions(
  userId: number,
  permissions: (SystemPermission | string)[]
): Promise<boolean> {
  const logger = getLogger();
  
  if (!permissions || permissions.length === 0) {
    logger.warn('No permissions specified for checkUserHasAllPermissions');
    return false;
  }
  
  try {
    // Get all user permissions
    const serviceFactory = getServiceFactory();
    const permissionService = serviceFactory.createPermissionService();
    const userPermissionsResponse = await permissionService.getUserPermissions(userId);
    
    if (!userPermissionsResponse || !userPermissionsResponse.permissions) {
      return false;
    }
    
    // Check if user has all of the specified permissions
    const userPermissions = userPermissionsResponse.permissions;
    return permissions.every(permission => userPermissions.includes(permission));
  } catch (error) {
    logger.error('Error checking user permissions:', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      permissions
    });
    return false; // Fail closed - deny permission if there's an error
  }
}

/**
 * Permission utilities export
 */
export const permissionUtils = {
  checkUserPermission,
  checkUserHasAnyPermission,
  checkUserHasAllPermissions
};

export default permissionUtils;
