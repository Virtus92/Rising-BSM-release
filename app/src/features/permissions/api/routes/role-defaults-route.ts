/**
 * API Route Handler for Default Permissions by Role
 */
import { NextRequest, NextResponse } from 'next/server';
import { formatResponse } from '@/core/errors';
import { getLogger } from '@/core/logging';
import { getServiceFactory } from '@/core/factories';
import { UserRole } from '@/domain/enums/UserEnums';

/**
 * Get default permissions for a specific role
 */
export async function getRoleDefaultsHandler(
  req: NextRequest,
  role: string
): Promise<NextResponse> {
  const logger = getLogger();
  const serviceFactory = getServiceFactory();

  try {
    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or missing role', 
          data: null,
          error: { code: 'VALIDATION_ERROR' },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate role parameter before proceeding
    // Convert to lowercase for case-insensitive comparison
    const normalizedRole = role.toLowerCase();
    
    // Check if role is valid
    const validRoles = Object.values(UserRole).map(r => r.toLowerCase());
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid role: ${role}. Valid roles are: ${Object.values(UserRole).join(', ')}`, 
          data: null,
          error: { code: 'VALIDATION_ERROR' },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Create permission service
    const permissionService = serviceFactory.createPermissionService();
    
    // Get default permissions for the role
    const permissions = await permissionService.getDefaultPermissionsForRole(normalizedRole);
    
    return NextResponse.json({
      success: true,
      data: {
        role: normalizedRole,
        permissions
      },
      message: 'Default permissions retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching default permissions for role:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      role
    });
    
    return NextResponse.json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to fetch default permissions',
      error: { code: 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
