import { IBaseRepository, PaginationResult } from './IBaseRepository';
import { Permission, UserPermission } from '../entities/Permission';
import { PermissionFilterParamsDto } from '../dtos/PermissionDtos';

/**
 * Permission Repository Interface
 */
export interface IPermissionRepository extends IBaseRepository<Permission> {
  /**
   * Finds a permission by its code
   * 
   * @param code - Permission code
   * @returns Found permission or null
   */
  findByCode(code: string): Promise<Permission | null>;
  
  /**
   * Finds permissions with advanced filtering options
   * 
   * @param filters - Filter parameters
   * @returns Found permissions with pagination
   */
  findPermissions(filters: PermissionFilterParamsDto): Promise<PaginationResult<Permission>>;
  
  /**
   * Gets all permissions for a user
   * 
   * @param userId - User ID
   * @returns User's permissions
   */
  getUserPermissions(userId: number): Promise<string[]>;
  
  /**
   * Updates permissions for a user
   * 
   * @param userId - User ID
   * @param permissions - Permission codes to assign
   * @param updatedBy - ID of the user performing the update
   * @returns Whether the operation was successful
   */
  updateUserPermissions(userId: number, permissions: string[], updatedBy?: number): Promise<boolean>;
  
  /**
   * Adds a permission to a user
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @param grantedBy - ID of the user granting the permission
   * @returns Created user permission
   */
  addUserPermission(userId: number, permissionCode: string, grantedBy?: number): Promise<UserPermission>;
  
  /**
   * Removes a permission from a user
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @returns Whether the operation was successful
   */
  removeUserPermission(userId: number, permissionCode: string): Promise<boolean>;
  
  /**
   * Checks if a user has a specific permission
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @returns Whether the user has the permission
   */
  hasPermission(userId: number, permissionCode: string): Promise<boolean>;

  /**
   * Seeds default permissions into the database
   * 
   * @returns Promise that resolves when seeding is complete
   * @throws Error if seeding fails
   * @description This method is used to populate the database with default permissions.
   *              It should be called during application initialization or setup.
   * 
   */
  seedDefaultPermissions(): Promise<void>;
}
