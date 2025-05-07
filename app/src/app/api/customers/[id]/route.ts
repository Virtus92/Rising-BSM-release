import { NextRequest } from 'next/server';
import { routeHandler } from '@/core/api/server/route-handler';
import { formatSuccess, formatError, formatNotFound, formatValidationError } from '@/core/errors/index';
import { getServiceFactory } from '@/core/factories';
import { UpdateCustomerDto } from '@/domain/dtos/CustomerDtos';
import { getLogger } from '@/core/logging';
import { withPermission } from '@/features/permissions/api/middleware/permissionMiddleware';
import { permissionMiddleware } from '@/features/permissions/api/middleware';
import { SystemPermission } from '@/domain/enums/PermissionEnums';
import { validateId } from '@/shared/utils/validation-utils';

/**
 * GET /api/customers/[id]
 * 
 * Retrieves a single customer by ID
 */
export const GET = routeHandler(async (req: NextRequest) => {
  const logger = getLogger();
  // Get ID from params (provided by Next.js route handler)
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const serviceFactory = getServiceFactory();
  
  try {
    // Check permission using consistent pattern
    if (!await permissionMiddleware.hasPermission(
      req.auth?.userId as number, 
      SystemPermission.CUSTOMERS_VIEW
    )) {
      logger.warn(`Permission denied: User ${req.auth?.userId} does not have permission ${SystemPermission.CUSTOMERS_VIEW}`);
      return formatError(
        `You don't have permission to view customer details`, 
        403
      );
    }
    
    if (!id) {
      logger.error('No customer ID provided');
      return formatError('No customer ID provided', 400);
    }
    
    // Use consistent ID validation
    const customerId = validateId(id);
    if (customerId === null) {
      logger.error(`Invalid customer ID: ${id}`);
      return formatError(`Invalid customer ID: ${id} - must be a positive number`, 400);
    }
    
    // Log request details for debugging
    logger.debug(`Fetching customer details for ID: ${customerId}`, {
      userId: req.auth?.userId
    });
    
    // Get customer service from factory
    const customerService = serviceFactory.createCustomerService();
    
    // Get relations from request URL if specified
    const url = new URL(req.url);
    const relationsParam = url.searchParams.get('relations');
    const relations = relationsParam ? relationsParam.split(',') : ['appointments'];
    
    // Retrieve customer with the specified ID and relations
    const customer = await customerService.getById(customerId, {
      relations: relations,
      context: {
        userId: req.auth?.userId
      }
    });
    
    if (!customer) {
      logger.warn(`Customer not found: ${customerId}`);
      return formatNotFound('Customer not found');
    }
    
    // Log successful retrieval
    logger.debug(`Successfully retrieved customer: ${customerId}`);
    
    // Success response
    return formatSuccess(customer, 'Customer retrieved successfully');
    
  } catch (error) {
    logger.error('Error fetching customer:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id,
      userId: req.auth?.userId
    });
    
    return formatError(
      error instanceof Error ? error.message : 'Error retrieving the customer',
      500
    );
  }
}, {
  requiresAuth: true
});

/**
 * PUT /api/customers/[id]
 * 
 * Updates a customer by ID
 */
export const PUT = routeHandler(async (req: NextRequest) => {
  const logger = getLogger();
  // Get ID from params (provided by Next.js route handler)
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const serviceFactory = getServiceFactory();
  
  try {
    // Check permission using consistent pattern
    if (!await permissionMiddleware.hasPermission(
      req.auth?.userId as number, 
      SystemPermission.CUSTOMERS_EDIT
    )) {
      logger.warn(`Permission denied: User ${req.auth?.userId} does not have permission ${SystemPermission.CUSTOMERS_EDIT}`);
      return formatError(
        `You don't have permission to edit customer information`, 
        403
      );
    }
    
    if (!id) {
      logger.error('No customer ID provided');
      return formatError('No customer ID provided', 400);
    }
    
    // Use consistent ID validation
    const customerId = validateId(id);
    if (customerId === null) {
      logger.error(`Invalid customer ID: ${id}`);
      return formatError(`Invalid customer ID: ${id} - must be a positive number`, 400);
    }
    
    // Parse request body as JSON
    const data = await req.json() as UpdateCustomerDto;
    
    // Get customer service
    const customerService = serviceFactory.createCustomerService();
    
    // Check if customer exists
    const existingCustomer = await customerService.getById(customerId);
    
    if (!existingCustomer) {
      logger.warn(`Customer not found during update: ${customerId}`);
      return formatNotFound('Customer not found');
    }
    
    // Update customer
    const updatedCustomer = await customerService.update(customerId, data, {
      context: {
        userId: req.auth?.userId,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    });
    
    // Success response
    return formatSuccess(updatedCustomer, 'Customer updated successfully');
    
  } catch (error) {
    logger.error('Error updating customer:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id,
      userId: req.auth?.userId
    });
    
    // Handle validation errors
    if (error instanceof Error && 'validationErrors' in error) {
      return formatValidationError(
        (error as any).validationErrors,
        'Customer validation failed'
      );
    }
    
    return formatError(
      error instanceof Error ? error.message : 'Error updating the customer',
      500
    );
  }
}, {
  requiresAuth: true
});

/**
 * DELETE /api/customers/[id]
 * 
 * Deletes a customer by ID
 */
export const DELETE = routeHandler(async (req: NextRequest) => {
  const logger = getLogger();
  // Get ID from params (provided by Next.js route handler)
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const serviceFactory = getServiceFactory();
  
  try {
    // Check permission using consistent pattern
    if (!await permissionMiddleware.hasPermission(
      req.auth?.userId as number, 
      SystemPermission.CUSTOMERS_DELETE
    )) {
      logger.warn(`Permission denied: User ${req.auth?.userId} does not have permission ${SystemPermission.CUSTOMERS_DELETE}`);
      return formatError(
        `You don't have permission to delete customers`, 
        403
      );
    }
    
    if (!id) {
      logger.error('No customer ID provided');
      return formatError('No customer ID provided', 400);
    }
    
    // Use consistent ID validation
    const customerId = validateId(id);
    if (customerId === null) {
      logger.error(`Invalid customer ID: ${id}`);
      return formatError(`Invalid customer ID: ${id} - must be a positive number`, 400);
    }
    
    // Get customer service
    const customerService = serviceFactory.createCustomerService();
    
    // Check if customer exists
    const existingCustomer = await customerService.getById(customerId);
    
    if (!existingCustomer) {
      logger.warn(`Customer not found during delete: ${customerId}`);
      return formatNotFound('Customer not found');
    }
    
    // Check for appointment dependencies
    if ((existingCustomer as any).appointments?.length > 0) {
      logger.warn(`Customer ${customerId} has ${(existingCustomer as any).appointments.length} appointments and cannot be deleted directly`);
      return formatError('This customer has appointments and cannot be deleted. Please delete the appointments first or archive the customer instead.', 400);
    }
    
    // Delete customer
    const deleted = await customerService.delete(customerId, {
      context: {
        userId: req.auth?.userId,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    });
    
    // Success response
    return formatSuccess({ deleted }, 'Customer deleted successfully');
    
  } catch (error) {
    logger.error('Error deleting customer:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      customerId: id,
      userId: req.auth?.userId
    });
    
    return formatError(
      error instanceof Error ? error.message : 'Error deleting the customer',
      500
    );
  }
}, {
  requiresAuth: true
});
