import { NextRequest } from 'next/server';
import { apiAuth } from '@/features/auth/api/middleware';
import { permissionMiddleware } from '@/features/permissions/api/middleware';
import { formatResponse } from '@/core/errors';
import { routeHandler } from '@/core/api/route-handler';
import { getServiceFactory } from '@/core/factories';
import { IRequestService } from '@/domain/services/IRequestService';
import { SystemPermission } from '@/domain/enums/PermissionEnums';
import { LinkRequestToCustomerRequest } from '../models/request-request-models';

/**
 * POST handler for linking a request to an existing customer
 * @param request - Next.js request object
 * @param params - Route parameters with request ID
 * @returns Response with updated request
 */
export const POST = routeHandler(async (request: NextRequest) => {
  // Extract ID from URL path segments
  const urlParts = request.nextUrl.pathname.split('/');
  const id = Number(urlParts[urlParts.length - 2]); // Take the second-to-last segment (the [id] part)
  try {
    if (isNaN(id) || id <= 0) {
      return formatResponse.error('Invalid request ID', 400);
    }

    // Authenticate user
    const auth = await apiAuth(request);
    if (!auth) {
      return formatResponse.error('Authentication required', 401);
    }

    // Verify permissions
    const permissionCheck = await permissionMiddleware.checkPermission(request, [SystemPermission.REQUESTS_EDIT]);
    if (!permissionCheck.success) {
      return formatResponse.error(permissionCheck.message || 'Permission denied', permissionCheck.status || 403);
    }

    // Parse request body
    const data: LinkRequestToCustomerRequest = await request.json();

    // Validate customer ID
    if (!data.customerId || isNaN(data.customerId) || data.customerId <= 0) {
      return formatResponse.error('Invalid customer ID', 400);
    }

    // Get request service
    const serviceFactory = getServiceFactory();
    const requestService = serviceFactory.createRequestService();

    // Import proper auth middleware and get user details from JWT token
    const { extractAuthToken } = await import('@/features/auth/api/middleware/authMiddleware');
    const token = await extractAuthToken(request);
    let userId = 0;
    
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-me';
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, jwtSecret) as any;
        userId = Number(decoded.sub) || 0;
      } catch (e) {
        // Continue with defaults if token decoding fails
      }
    }
    
    // Link request to customer
    const result = await requestService.linkToCustomer(id, data.customerId, data.note, {
      context: {
        userId
      }
    });

    // Return formatted response
    return formatResponse.success(result, 'Request linked to customer successfully', 200);
  } catch (error) {
    return formatResponse.error('An error occurred while linking the request to a customer', 500);
  }
});

