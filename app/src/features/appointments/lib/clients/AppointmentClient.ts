/**
 * API-Client for appointment management
 */
import { 
  CreateAppointmentDto, 
  UpdateAppointmentDto, 
  AppointmentResponseDto,
  StatusUpdateDto,
  AppointmentFilterParamsDto,
  AppointmentDetailResponseDto
} from '@/domain/dtos/AppointmentDtos';
import ApiClient, { ApiResponse, ApiRequestError } from '@/core/api/ApiClient';
import { validateId } from '@/shared/utils/validation-utils';

// API base URL for appointments
const APPOINTMENTS_API_URL = '/appointments';

/**
 * Client for appointment API requests
 */
export class AppointmentClient {
  /**
   * Get all appointments with optional filtering
   * 
   * @param params - Optional filter parameters
   *                 Supported date formats: JavaScript Date objects, ISO strings or any string date format
   *                 Boolean values are converted to 'true'/'false' strings
   *                 Arrays are handled by creating multiple entries with the same key
   * @returns API response
   */
  static async getAppointments(params: Record<string, any> = {}): Promise<ApiResponse<AppointmentResponseDto[]>> {
    try {
      // Ensure default sorting if not provided
      const enhancedParams = {
        sortBy: 'appointmentDate',
        sortDirection: 'asc',
        ...params
      };
      
      // Build query string with proper handling of parameter types
      const queryParams = new URLSearchParams();
      
      Object.entries(enhancedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle boolean values properly
          if (typeof value === 'boolean') {
            queryParams.append(key, value ? 'true' : 'false');
          }
          // Handle date objects properly with type safety
          else if (Object.prototype.toString.call(value) === '[object Date]' && 
              typeof value === 'object' && 
              value !== null && 
              'toISOString' in value) {
            queryParams.append(key, (value as Date).toISOString().split('T')[0]);
          }
          // Handle arrays by using multiple entries with the same key
          else if (Array.isArray(value)) {
            value.forEach(item => {
              if (item !== undefined && item !== null) {
                queryParams.append(key, String(item));
              }
            });
          }
          // Handle all other types
          else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      // Force relations to include customer data
      if (!queryParams.has('relations')) {
        queryParams.append('relations', 'customer');
      }
      
      // Build URL and make the request
      const queryString = queryParams.toString();
      const url = `${APPOINTMENTS_API_URL}${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching appointments with URL: ${url}`);
      return await ApiClient.get(url);
    } catch (error: unknown) {
      console.error('Failed to fetch appointments:', error as Error);
      throw new ApiRequestError(
        error instanceof Error ? error.message : 'Failed to fetch appointments',
        500
      );
    }
  }
  
  /**
   * Get an appointment by ID
   * 
   * @param id - Appointment ID
   * @param relations - Optional relations to include (e.g., 'customer', 'notes')
   * @returns API response
   */
  static async getById(id: number | string, relations: string[] = ['customer', 'notes']): Promise<ApiResponse<AppointmentDetailResponseDto>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(id);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid appointment ID format - must be a positive number', 400);
      }
      
      // Build URL parameters
      const params = new URLSearchParams();
      
      // Add relations parameter if provided - filter out invalid relations to prevent injection
      if (relations && Array.isArray(relations) && relations.length > 0) {
        // Allow only safe relation names
        const validRelations = ['customer', 'notes', 'user', 'createdBy'];
        const filteredRelations = relations.filter(rel => 
          typeof rel === 'string' && validRelations.includes(rel.toLowerCase())
        );
        
        if (filteredRelations.length > 0) {
          params.append('relations', filteredRelations.join(','));
        }
      }
      
      // Build the final URL with properly formatted parameters
      const url = `${APPOINTMENTS_API_URL}/${validatedId}${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log(`Fetching appointment with URL: ${url}`);
      
      // Make the API request
      return await ApiClient.get(url);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to fetch appointment with ID ${id}`,
        500
      );
    }
  }
  
  /**
   * Legacy alias for getById method
   * 
   * @param id - Appointment ID
   * @param relations - Optional relations to include
   * @returns API response
   * @deprecated Use getById() instead
   */
  static async getAppointmentById(id: number | string, relations: string[] = ['customer', 'notes']): Promise<ApiResponse<AppointmentDetailResponseDto>> {
    return this.getById(id, relations);
  }
  
  /**
   * Get an appointment by ID - this method exists for backwards compatibility
   * 
   * @param id - Appointment ID
   * @param relations - Optional relations to include
   * @returns API response
   */
  static async getAppointment(id: number | string, relations: string[] = ['customer', 'notes']): Promise<ApiResponse<AppointmentDetailResponseDto>> {
    try {
      return await this.getById(id, relations);
    } catch (error: unknown) {
      console.error(`Error in AppointmentClient.getAppointment(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Create a new appointment
   * 
   * @param data - Appointment data
   * @returns API response
   */
  static async create(data: CreateAppointmentDto): Promise<ApiResponse<AppointmentResponseDto>> {
    try {
      return await ApiClient.post(APPOINTMENTS_API_URL, data);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : 'Failed to create appointment',
        500
      );
    }
  }
  
  /**
   * Legacy alias for create method
   * 
   * @param data - Appointment data
   * @returns API response
   * @deprecated Use create() instead
   */
  static async createAppointment(data: CreateAppointmentDto): Promise<ApiResponse<AppointmentResponseDto>> {
    return this.create(data);
  }
  
  /**
   * Update an appointment
   * 
   * @param id - Appointment ID
   * @param data - Update data
   * @returns API response
   */
  static async update(id: number | string, data: UpdateAppointmentDto): Promise<ApiResponse<AppointmentResponseDto>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(id);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid appointment ID format - must be a positive number', 400);
      }
      
      console.log(`Updating appointment with ID: ${validatedId}`);
      
      return await ApiClient.put(`${APPOINTMENTS_API_URL}/${validatedId}`, data);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to update appointment with ID ${id}`,
        500
      );
    }
  }
  
  /**
   * Legacy alias for update method
   * 
   * @param id - Appointment ID
   * @param data - Update data
   * @returns API response
   * @deprecated Use update() instead
   */
  static async updateAppointment(id: number | string, data: UpdateAppointmentDto): Promise<ApiResponse<AppointmentResponseDto>> {
    return this.update(id, data);
  }
  
  /**
   * Delete an appointment
   * 
   * @param id - Appointment ID
   * @returns API response
   */
  static async deleteAppointment(id: number | string): Promise<ApiResponse<void>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(id);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid appointment ID format - must be a positive number', 400);
      }
      
      console.log(`Deleting appointment with ID: ${validatedId}`);
      
      return await ApiClient.delete(`${APPOINTMENTS_API_URL}/${validatedId}`);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to delete appointment with ID ${id}`,
        500
      );
    }
  }
  
  /**
   * Update an appointment's status
   * 
   * @param id - Appointment ID
   * @param statusData - Status data
   * @returns API response
   */
  static async updateStatus(id: number | string, statusData: StatusUpdateDto): Promise<ApiResponse<AppointmentResponseDto>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(id);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid appointment ID format - must be a positive number', 400);
      }
      
      console.log(`Updating status for appointment with ID: ${validatedId}`);
      
      return await ApiClient.put(`${APPOINTMENTS_API_URL}/${validatedId}/status`, statusData);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to update status for appointment with ID ${id}`,
        500
      );
    }
  }
  
  /**
   * Legacy alias for updateStatus method
   * 
   * @param id - Appointment ID
   * @param statusData - Status data
   * @returns API response
   * @deprecated Use updateStatus() instead
   */
  static async updateAppointmentStatus(id: number | string, statusData: StatusUpdateDto): Promise<ApiResponse<AppointmentResponseDto>> {
    return this.updateStatus(id, statusData);
  }
  
  /**
   * Add a note to an appointment
   * 
   * @param id - Appointment ID
   * @param note - Note text
   * @returns API response
   */
  static async addNote(id: number | string, note: string): Promise<ApiResponse<any>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(id);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid appointment ID format - must be a positive number', 400);
      }
      
      // Validate note content
      if (!note || typeof note !== 'string' || !note.trim()) {
        throw new ApiRequestError('Note text is required', 400);
      }
      
      console.log(`Adding note to appointment with ID: ${validatedId}`);
      
      try {
        return await ApiClient.post(`${APPOINTMENTS_API_URL}/${validatedId}/notes`, { note });
      } catch (apiError) {
        console.error('API error adding note:', apiError);
        // Try once more with slight delay - useful for intermittent connection issues
        await new Promise(resolve => setTimeout(resolve, 500));
        return await ApiClient.post(`${APPOINTMENTS_API_URL}/${validatedId}/notes`, { note });
      }
    } catch (error: unknown) {
      console.error('Error adding note to appointment:', error as Error);
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to add note to appointment with ID ${id}`,
        500
      );
    }
  }
  
  /**
   * Legacy alias for addNote method
   * 
   * @param id - Appointment ID
   * @param note - Note text
   * @returns API response
   * @deprecated Use addNote() instead
   */
  static async addAppointmentNote(id: number | string, note: string): Promise<ApiResponse<any>> {
    return this.addNote(id, note);
  }
  
  /**
   * Get appointments by customer ID
   * 
   * @param customerId - Customer ID
   * @returns API response
   */
  static async getAppointmentsByCustomer(customerId: number | string): Promise<ApiResponse<AppointmentResponseDto[]>> {
    try {
      // Use the validateId utility function for consistent ID validation
      const validatedId = validateId(customerId);
      
      // Check if ID is valid
      if (validatedId === null) {
        throw new ApiRequestError('Invalid customer ID format - must be a positive number', 400);
      }
      
      // Use the filter parameter with validated ID
      const params = new URLSearchParams();
      params.append('customerId', String(validatedId));
      
      return await ApiClient.get(`${APPOINTMENTS_API_URL}?${params.toString()}`);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to fetch appointments for customer with ID ${customerId}`,
        500
      );
    }
  }
  
  /**
   * Get appointments for a date range
   * 
   * @param startDate - Start date (JavaScript Date object or string in YYYY-MM-DD format)
   *                    Date objects will be converted to YYYY-MM-DD format strings
   * @param endDate - End date (JavaScript Date object or string in YYYY-MM-DD format)
   *                  Date objects will be converted to YYYY-MM-DD format strings
   * @returns API response with appointment data
   */
  static async getAppointmentsByDateRange(
    startDate: string | Date, 
    endDate: string | Date
  ): Promise<ApiResponse<AppointmentResponseDto[]>> {
    try {
      const params = new URLSearchParams();
      
      // Format dates consistently without using isDateObject
      const formattedStartDate = (typeof startDate === 'object' && 
                              startDate !== null && 
                              Object.prototype.toString.call(startDate) === '[object Date]' &&
                              'toISOString' in startDate)
        ? (startDate as Date).toISOString().split('T')[0] 
        : String(startDate);
      
      const formattedEndDate = (typeof endDate === 'object' && 
                            endDate !== null && 
                            Object.prototype.toString.call(endDate) === '[object Date]' &&
                            'toISOString' in endDate)
        ? (endDate as Date).toISOString().split('T')[0] 
        : String(endDate);
      
      params.append('startDate', formattedStartDate);
      params.append('endDate', formattedEndDate);
      
      return await ApiClient.get(`${APPOINTMENTS_API_URL}?${params.toString()}`);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : `Failed to fetch appointments for date range ${startDate} to ${endDate}`,
        500
      );
    }
  }
  
  /**
   * Get upcoming appointments
   * 
   * @param limit - Optional limit on number of appointments
   * @returns API response
   */
  static async getUpcomingAppointments(limit?: number): Promise<ApiResponse<AppointmentResponseDto[]>> {
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      return await ApiClient.get(`${APPOINTMENTS_API_URL}/upcoming${queryParams}`);
    } catch (error: unknown) {
      throw new ApiRequestError(
        error instanceof Error ? error.message : 'Failed to fetch upcoming appointments',
        500
      );
    }
  }
}

export default AppointmentClient;