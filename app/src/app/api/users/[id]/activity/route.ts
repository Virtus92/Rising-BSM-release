import { NextRequest } from 'next/server';
import { formatResponse } from '@/core/errors';
import { routeHandler } from '@/core/api/server/route-handler';
import { prisma } from '@/core/db/index';
import { permissionMiddleware } from '@/features/permissions/api/middleware';
import { SystemPermission } from '@/domain/enums/PermissionEnums';
import { getLogger } from '@/core/logging';

const logger = getLogger();

/**
 * GET /api/users/[id]/activity
 * 
 * Gets activity logs for a user
 * Requires USERS_VIEW permission
 */
export async function GET(req: NextRequest) {
  const handler = routeHandler(async (req: NextRequest) => {
  // Extract ID from URL path
  const userId = parseInt(req.nextUrl.pathname.split('/').pop() || '0');
  if (isNaN(userId)) {
    return formatResponse.error('Invalid user ID', 400);
  }

  // Get query parameters
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const page = parseInt(url.searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    // Check permission
    if (!await permissionMiddleware.hasPermission(
      req.auth?.userId as number, 
      SystemPermission.USERS_VIEW
    )) {
      logger.warn(`Permission denied: User ${req.auth?.userId} does not have permission ${SystemPermission.USERS_VIEW}`);
      return formatResponse.error(
        `You don't have permission to perform this action (requires ${SystemPermission.USERS_VIEW})`, 
        403
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      logger.warn(`Activity requested for non-existent user ID: ${userId}`);
      return formatResponse.error('User not found', 404);
    }

    // Get activity logs for the user
    const [activities, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.userActivity.count({
        where: {
          userId: userId
        }
      })
    ]);

    // Format the response
    return formatResponse.success({
      data: activities,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, 'User activity retrieved successfully');
  } catch (error) {
    logger.error('Error fetching user activity:', error instanceof Error ? error.message : String(error), {
      userId,
      stack: error instanceof Error ? error.stack : undefined
    });
    return formatResponse.error('Failed to fetch user activity', 500);
  }
  }, {
    requiresAuth: true
  });
  return handler(req);
}

export const dynamic = 'force-dynamic';