// Dependency Injection Container
// This is the ONLY file that knows which implementation is active.
// Flip USE_MOCK to false when the backend is ready — zero other changes needed.

// --- Original 7 contracts ---
import type { IHotelRepository } from '../../domain/contracts/IHotelRepository';
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { IKioskRepository } from '../../domain/contracts/IKioskRepository';
import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { IInvoiceRepository } from '../../domain/contracts/IInvoiceRepository';
import type { ITicketRepository } from '../../domain/contracts/ITicketRepository';
import type { IAuthService } from '../../domain/contracts/IAuthService';

// --- 9 new contracts ---
import type { IAuditLogRepository } from '../../domain/contracts/IAuditLogRepository';
import type { IBillingRepository } from '../../domain/contracts/IBillingRepository';
import type { IBookingRepository } from '../../domain/contracts/IBookingRepository';
import type { IGuestRepository } from '../../domain/contracts/IGuestRepository';
import type { IHotelAuditRepository } from '../../domain/contracts/IHotelAuditRepository';
import type { IHotelHelpRepository } from '../../domain/contracts/IHotelHelpRepository';
import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { IIncidentRepository } from '../../domain/contracts/IIncidentRepository';
import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';

// --- API Repositories ---
import { ApiHotelRepository } from '../repositories/HotelRepository';
import { ApiRoomRepository } from '../repositories/RoomRepository';
import { ApiUserRepository } from '../repositories/UserRepository';
import { ApiPlanRepository } from '../repositories/PlanRepository';
import { ApiInvoiceRepository } from '../repositories/InvoiceRepository';
import { ApiTicketRepository } from '../repositories/TicketRepository';
import { ApiHotelStaffRepository } from '../repositories/HotelStaffRepository';
import { ApiIncidentRepository } from '../repositories/IncidentRepository';
import { ApiSubscriptionRepository } from '../repositories/SubscriptionRepository';
// import { ApiSettingsRepository } from '../repositories/SettingsRepository'; // If exists

// --- Placeholder for missing implementations ---
import { ApiPlaceholderRepository } from '../repositories/ApiPlaceholderRepository';
import { ApiAuthService } from '../services/ApiAuthService';

export interface Repositories {
  // Original 7
  hotels: IHotelRepository;
  rooms: IRoomRepository;
  users: IUserRepository;
  kiosks: IKioskRepository;
  plans: IPlanRepository;
  invoices: IInvoiceRepository;
  tickets: ITicketRepository;
  // 9 new
  auditLogs: IAuditLogRepository;
  billing: IBillingRepository;
  bookings: IBookingRepository;
  guests: IGuestRepository;
  hotelAudit: IHotelAuditRepository;
  hotelHelp: IHotelHelpRepository;
  hotelStaff: IHotelStaffRepository;
  incidents: IIncidentRepository;
  subscriptions: ISubscriptionRepository;
}

function createRepositories(): Repositories {
  return {
    // Implemented
    hotels: new ApiHotelRepository(),
    rooms: new ApiRoomRepository(),
    users: new ApiUserRepository(),
    plans: new ApiPlanRepository(),
    invoices: new ApiInvoiceRepository(),
    tickets: new ApiTicketRepository(),
    hotelStaff: new ApiHotelStaffRepository(),
    incidents: new ApiIncidentRepository(),
    subscriptions: new ApiSubscriptionRepository(),

    // Missing / Placeholders (Cast to any to satisfy TS interface)
    kiosks: new ApiPlaceholderRepository() as any,
    auditLogs: new ApiPlaceholderRepository() as any,
    billing: new ApiPlaceholderRepository() as any,
    bookings: new ApiPlaceholderRepository() as any,
    guests: new ApiPlaceholderRepository() as any,
    hotelAudit: new ApiPlaceholderRepository() as any,
    hotelHelp: new ApiPlaceholderRepository() as any,
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = new ApiAuthService(); 
