import { IBaseRepository, PaginationResult } from './IBaseRepository';
import { ContactRequest } from '../entities/ContactRequest';
import { Appointment } from '../entities/Appointment';
import { Customer } from '../entities/Customer';
import { RequestNote } from '../entities/RequestNote';
import { ConvertToCustomerDto, RequestStatusUpdateDto, RequestFilterParamsDto } from '../dtos/RequestDtos';

/**
 * Repository-Interface für Kontaktanfragen
 */
export interface IRequestRepository extends IBaseRepository<ContactRequest> {
  /**
   * Findet Anfragen basierend auf Kriterien
   * 
   * @param criteria - Suchkriterien
   * @returns Array von Anfragen, die den Kriterien entsprechen
   */
  find(criteria: Record<string, any>): Promise<ContactRequest[]>;
  
  /**
   * Prüft, ob eine Anfrage existiert
   * 
   * @param id - Anfrage-ID
   * @returns true, wenn die Anfrage existiert, sonst false
   */
  exists(id: number): Promise<boolean>;

  /**
   * Findet Notizen zu einer Anfrage
   * 
   * @param requestId - Anfrage-ID
   * @returns Notizen zur Anfrage
   */
  findNotes(requestId: number): Promise<RequestNote[]>;

  /**
   * Findet eine Anfrage mit allen Beziehungen
   * 
   * @param id - Anfrage-ID
   * @returns Anfrage mit Beziehungen
   */
  findByIdWithRelations(id: number): Promise<ContactRequest | null>;
  /**
   * Findet Anfragen mit erweiterten Filteroptionen
   * 
   * @param filters - Filterparameter
   * @returns Gefundene Anfragen mit Paginierung
   */
  findRequests(criteria: Record<string, any>, options?: any): Promise<PaginationResult<ContactRequest>>;
  /**
   * Aktualisiert den Status einer Kontaktanfrage
   * 
   * @param id - ID der Anfrage
   * @param data - Status-Update-Daten
   * @returns Aktualisierte Anfrage
   */
  updateStatus(id: number, data: RequestStatusUpdateDto): Promise<ContactRequest>;
  
  /**
   * Fügt eine Notiz zu einer Kontaktanfrage hinzu
   * 
   * @param id - ID der Anfrage
   * @param userId - ID des Benutzers
   * @param userName - Name des Benutzers
   * @param text - Notiztext
   * @returns Erstellte Notiz
   */
  addNote(id: number, userId: number, userName: string, text: string): Promise<RequestNote>;

  /**
   * Ruft alle Notizen zu einer Kontaktanfrage ab
   * 
   * @param id - ID der Anfrage
   * @returns Liste der Notizen
   */
  getNotes(id: number): Promise<RequestNote[]>;

  /**
   * Löscht eine Notiz von einer Kontaktanfrage
   * 
   * @param id - ID der Anfrage
   * @param noteId - ID der Notiz
   * @returns Erfolgsstatus
   */
  deleteNote(id: number, noteId: number): Promise<boolean>;

  
  
  /**
   * Weist eine Kontaktanfrage einem Benutzer zu
   * 
   * @param id - ID der Anfrage
   * @param userId - ID des Benutzers
   * @param note - Optionale Notiz
   * @returns Aktualisierte Anfrage
   */
  assignTo(id: number, userId: number, note?: string): Promise<ContactRequest>;
  
  /**
   * Konvertiert eine Kontaktanfrage in einen Kunden
   * 
   * @param data - Konvertierungsdaten
   * @returns Ergebnis der Konvertierung
   */
  convertToCustomer(data: ConvertToCustomerDto): Promise<{
    customer: Customer;
    appointment?: Appointment;
    request: ContactRequest;
  }>;
  
  /**
   * Verknüpft eine Kontaktanfrage mit einem bestehenden Kunden
   * 
   * @param requestId - ID der Anfrage
   * @param customerId - ID des Kunden
   * @param note - Optionale Notiz
   * @returns Aktualisierte Anfrage
   */
  linkToCustomer(requestId: number, customerId: number, note?: string): Promise<ContactRequest>;
  
  /**
   * Erstellt einen Termin für eine Kontaktanfrage
   * 
   * @param requestId - ID der Anfrage
   * @param appointmentData - Termindaten
   * @param note - Optionale Notiz
   * @returns Erstellter Termin
   */
  createAppointment(requestId: number, appointmentData: Partial<Appointment>, note?: string): Promise<Appointment>;
  
  /**
   * Ruft Statistiken zu Kontaktanfragen ab
   * 
   * @param period - Zeitraum (week, month, year)
   * @returns Statistiken
   */
  getRequestStats(period?: string): Promise<{
    totalRequests: number;
    newRequests: number;
    inProgressRequests: number;
    completedRequests: number;
    cancelledRequests: number;
    conversionRate: number;
  }>;

  /**
   * Aktualisiert mehrere Anfragen auf einmal
   * 
   * @param ids - Array von Anfrage-IDs
   * @param data - Zu aktualisierende Daten
   * @returns Anzahl der aktualisierten Anfragen
   */
  bulkUpdate(ids: number[], data: Partial<ContactRequest>): Promise<number>;

  /**
   * Aktualisiert den Status einer Anfrage
   * 
   * @param id - Anfrage-ID
   * @param status - Neuer Status
   * @param updatedBy - ID des Benutzers, der die Änderung durchführt
   * @returns Aktualisierte Anfrage
   */
  updateStatus(id: number, status: string, updatedBy?: number): Promise<ContactRequest>;
}