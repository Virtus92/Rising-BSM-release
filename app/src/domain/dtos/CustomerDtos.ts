import { BaseResponseDto, BaseFilterParamsDto } from './BaseDto';
import { Customer } from '../entities/Customer';
import { CommonStatus, CustomerType } from '../enums/CommonEnums';
import { ActivityLogDto } from './ActivityLogDto';

/**
 * Haupt-DTO für Kunden
 */
export interface CustomerDto {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  notes?: string;
  newsletter: boolean;
  status: CommonStatus;
  type: CustomerType;
  // Added properties to match usage in components
  statusLabel?: string;
  typeLabel?: string;
  vatNumber?: string;
}

/**
 * DTO für die Erstellung eines Kunden
 */
export interface CreateCustomerDto {
  /**
   * Kundenname
   */
  name: string;
  
  /**
   * Firma
   */
  company?: string;
  
  /**
   * E-Mail-Adresse
   */
  email?: string;
  
  /**
   * Telefonnummer
   */
  phone?: string;
  
  /**
   * Adresse
   */
  address?: string;
  
  /**
   * Stadt
   */
  city?: string;
  
  /**
   * Bundesland/Staat
   */
  state?: string;
  
  /**
   * Land
   */
  country?: string;
  
  /**
   * Notizen
   */
  notes?: string;
  
  /**
   * Newsletter-Anmeldung
   */
  newsletter?: boolean;
  
  /**
   * Kundentyp
   */
  type?: CustomerType;

  /**
   * Postleitzahl
   */
  postalCode?: string;
  
  /**
   * Umsatzsteuer-ID
   */
  vatNumber?: string;
  
  /* Support for frontend aliases */
  zipCode?: string; 
  companyName?: string;
  /**
   * Status
   */
  status?: CommonStatus;

  /**
   * Erstellungsdatum
   */
  createdAt?: Date | string;
  /**
   * Aktualisierungsdatum
   */
  updatedAt?: Date | string;
}

/**
 * DTO für die Aktualisierung eines Kunden
 */
export interface UpdateCustomerDto {
  /**
   * Kundenname
   */
  name?: string;
  
  /**
   * Firma
   */
  company?: string;
  
  /**
   * E-Mail-Adresse
   */
  email?: string;
  
  /**
   * Telefonnummer
   */
  phone?: string;
  
  /**
   * Adresse
   */
  address?: string;
  
  /**
   * Postleitzahl
   */
  postalCode?: string;
  
  /**
   * Stadt
   */
  city?: string;
  
  /**
   * Bundesland/Staat
   */
  state?: string;
  
  /**
   * Land
   */
  country?: string;
  
  /**
   * Notizen
   */
  notes?: string;
  
  /**
   * Newsletter-Anmeldung
   */
  newsletter?: boolean;
  
  /**
   * Kundenstatus
   */
  status?: CommonStatus;
  
  /**
   * Kundentyp
   */
  type?: CustomerType;
  
  /**
   * Umsatzsteuer-ID
   */
  vatNumber?: string;
  
  /* Support for frontend aliases */
  zipCode?: string;
  companyName?: string;
}

/**
 * DTO für die Rückgabe eines Kunden
 */
export interface CustomerResponseDto extends BaseResponseDto {
  /**
   * Kundenname
   */
  name: string;
  
  /**
   * Firma
   */
  company?: string;
  
  /**
   * E-Mail-Adresse
   */
  email?: string;
  
  /**
   * Telefonnummer
   */
  phone?: string;
  
  /**
   * Adresse
   */
  address?: string;
  
  /**
   * Postleitzahl
   */
  postalCode?: string;
  
  /**
   * Stadt
   */
  city?: string;
  
  /**
   * Bundesland/Staat
   */
  state?: string;
  
  /**
   * Land
   */
  country: string;
  
  /**
   * Notizen
   */
  notes?: CustomerLogDto[];

  logs?: CustomerLogDto[];
  
  /**
   * Newsletter-Anmeldung
   */
  newsletter: boolean;
  
  /**
   * Kundenstatus
   */
  status: CommonStatus;
  
  /**
   * Kundentyp
   */
  type: CustomerType;
  
  /**
   * Vollständige Adresse
   */
  fullAddress?: string;

  /**
   * Firmenname
   */
  companyName?: string;
  
  /**
   * Postleitzahl (alias für postalCode)
   */
  zipCode?: string;
  
  /**
   * Umsatzsteuer-ID
   */
  vatNumber?: string;

  /**
   * Status-Label für die Anzeige
   */
  statusLabel?: string;
  
  /**
   * Type-Label für die Anzeige
   */
  typeLabel?: string;
}

/**
 * DTO für detaillierte Kundeninformationen
 */
export interface CustomerDetailResponseDto extends CustomerResponseDto {
  /**
   * Zugehörige Termine
   */
  appointments?: any[];
  
  /**
   * Aktivitätsprotokoll
   */
  activityLogs?: ActivityLogDto[];
  
  /**
   * Kontaktanfragen
   */
  contactRequests?: any[];
}

/**
 * Konvertiert ein Kundenobjekt in ein DTO
 * 
 * @param customer - Kundenobjekt
 * @returns CustomerDto
 */
export function mapCustomerToDto(customer: Customer): CustomerDto {
  // Create base DTO with all standard properties
  const dto: CustomerDto = {
    id: customer.id,
    name: customer.name,
    company: customer.company,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    postalCode: customer.postalCode,
    city: customer.city,
    country: customer.country,
    notes: customer.notes,
    newsletter: customer.newsletter,
    status: customer.status,
    type: customer.type,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
  
  // Add display labels for status and type
  dto.statusLabel = getStatusLabel(customer.status);
  dto.typeLabel = getTypeLabel(customer.type);
  
  return dto;
}

/**
 * Helper function to get a human-readable status label
 */
function getStatusLabel(status: CommonStatus): string {
  switch (status) {
    case CommonStatus.ACTIVE:
      return 'Active';
    case CommonStatus.INACTIVE:
      return 'Inactive';
    case CommonStatus.PENDING:
      return 'Pending';
    case CommonStatus.DELETED:
      return 'Deleted';
    default:
      return status; // Fallback to the enum value as string
  }
}

/**
 * Helper function to get a human-readable type label
 */
function getTypeLabel(type: CustomerType): string {
  switch (type) {
    case CustomerType.PRIVATE:
      return 'Private';
    case CustomerType.BUSINESS:
      return 'Business';
    default:
      return type; // Fallback to the enum value as string
  }
}

/**
 * DTO für Kundenprotokolle
 */
export interface CustomerLogDto extends ActivityLogDto {
  /**
   * Kunden-ID
   */
  customerId: number;
  
  /**
   * Kundenname
   */
  customerName: string;

  /**
   * Text representation of details for display purposes
   * Uses undefined instead of null to be compatible with the rest of the system
   */
  text?: string;
}

/**
 * DTO für die Statusänderung eines Kunden
 */
export interface UpdateCustomerStatusDto {
  /**
   * Neuer Status
   */
  status: CommonStatus;
  
  /**
   * Grund für die Statusänderung
   */
  reason?: string;
}

/**
 * Filterparameter für Kundenabfragen
 */
export interface CustomerFilterParamsDto extends BaseFilterParamsDto {
  /**
   * Kundenstatus
   */
  status?: CommonStatus;
  
  /**
   * Kundentyp
   */
  type?: CustomerType;
  
  /**
   * Stadt
   */
  city?: string;
  
  /**
   * Land
   */
  country?: string;
  
  /**
   * Postleitzahl
   */
  postalCode?: string;
  
  /**
   * Newsletter-Anmeldung
   */
  newsletter?: boolean;

  /**
   * Filter for customers created after this date
   */
  createdAfter?: string;

  /**
   * Filter for customers created before this date
   */
  createdBefore?: string;
}
