import { NextRequest } from 'next/server';
import { routeHandler } from '@/core/api/server/route-handler';
import { formatSuccess, formatError } from '@/core/errors/index';
import { getLogger } from '@/core/logging';
import { getServiceFactory } from '@/core/factories';
import { generateMonthlyStats } from '@/shared/utils/statistics-utils';
import { AppointmentResponseDto } from '@/domain/dtos/AppointmentDtos';
import { AppointmentStatus } from '@/domain/enums/CommonEnums';

/**
 * GET /api/appointments/stats/monthly
 * Returns monthly appointment statistics for the past 12 months
 */
export const GET = routeHandler(async (request: NextRequest) => {
  const logger = getLogger();
  
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const lookbackMonths = parseInt(url.searchParams.get('months') || '12', 10);
    
    const serviceFactory = getServiceFactory();
    const appointmentService = serviceFactory.createAppointmentService();
    
    // Get all appointments
    const appointmentsResponse = await appointmentService.findAll({
      limit: 1000, // High limit to get all appointments
      context: {
        userId: request.auth?.userId
      },
      // Add custom options as additional property using type assertion
      ...({
        includeDetails: false // Optimize by excluding details
      } as any)
    });
    
    // Safely extract appointment data from response
    let appointments: AppointmentResponseDto[] = [];
    
    if (appointmentsResponse) {
      // Use type assertion to avoid 'never' type issues
      const typedResponse = appointmentsResponse as Record<string, any>;
      
      if (typedResponse.success) {
        if (typedResponse.data && Array.isArray(typedResponse.data)) {
          appointments = typedResponse.data;
        } else if (typedResponse.data && typeof typedResponse.data === 'object') {
          const typedData = typedResponse.data as Record<string, any>;
          if (typedData.data && Array.isArray(typedData.data)) {
            appointments = typedData.data;
          }
        }
      }
    }
    
    // Log appointments count for debugging
    console.log(`Generating monthly stats for ${appointments.length} appointments`);
    
    // Generate monthly stats using our utility function
    const monthlyStats = generateMonthlyStats(
      appointments,
      (appointment: AppointmentResponseDto) => appointment.appointmentDate,
      lookbackMonths
    );
    
    // Enrich with additional data needed for the UI
    const enrichedStats = monthlyStats.map(stat => {
      // Filter appointments for this period
      const periodAppointments = appointments.filter(apt => {
        const appointmentDate = new Date(apt.appointmentDate);
        return appointmentDate >= new Date(stat.startDate) && 
               appointmentDate <= new Date(stat.endDate);
      });
      
      // Count by status
      const completed = periodAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
      const cancelled = periodAppointments.filter(a => a.status === AppointmentStatus.CANCELLED).length;
      const planned = periodAppointments.filter(a => a.status === AppointmentStatus.PLANNED).length;
      const confirmed = periodAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length;
      
      return {
        ...stat,
        month: stat.period.split(' ')[0], // Extract month name
        appointments: stat.count,
        completed,
        cancelled,
        planned,
        confirmed
      };
    });
    
    return formatSuccess(
      enrichedStats, 
      'Monthly appointment statistics retrieved successfully'
    );
  } catch (error) {
    logger.error('Error generating monthly appointment stats:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return formatError(
      error instanceof Error ? error.message : 'Failed to retrieve monthly appointment statistics',
      500
    );
  }
}, {
  // Secure this endpoint
  requiresAuth: true
});
