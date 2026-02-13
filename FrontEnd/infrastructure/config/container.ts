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

// --- Original 7 mock repos ---
import { MockHotelRepository } from '../repositories/mock/MockHotelRepository';
import { MockRoomRepository } from '../repositories/mock/MockRoomRepository';
import { MockUserRepository } from '../repositories/mock/MockUserRepository';
import { MockKioskRepository } from '../repositories/mock/MockKioskRepository';
import { MockPlanRepository } from '../repositories/mock/MockPlanRepository';
import { MockInvoiceRepository } from '../repositories/mock/MockInvoiceRepository';
import { MockTicketRepository } from '../repositories/mock/MockTicketRepository';
import { MockAuthService } from '../services/MockAuthService';

// --- 9 new mock repos ---
import { MockAuditLogRepository } from '../repositories/mock/MockAuditLogRepository';
import { MockBillingRepository } from '../repositories/mock/MockBillingRepository';
import { MockBookingRepository } from '../repositories/mock/MockBookingRepository';
import { MockGuestRepository } from '../repositories/mock/MockGuestRepository';
import { MockHotelAuditRepository } from '../repositories/mock/MockHotelAuditRepository';
import { MockHotelHelpRepository } from '../repositories/mock/MockHotelHelpRepository';
import { MockHotelStaffRepository } from '../repositories/mock/MockHotelStaffRepository';
import { MockIncidentRepository } from '../repositories/mock/MockIncidentRepository';
import { MockSubscriptionRepository } from '../repositories/mock/MockSubscriptionRepository';

// When backend is ready:
// 1. Create Api*Repository classes in ../repositories/api/
// 2. Import them here
// 3. Set USE_MOCK = false (or use env: process.env.NEXT_PUBLIC_USE_MOCK !== 'false')

const USE_MOCK = true;

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
  if (USE_MOCK) {
    return {
      hotels: new MockHotelRepository(),
      rooms: new MockRoomRepository(),
      users: new MockUserRepository(),
      kiosks: new MockKioskRepository(),
      plans: new MockPlanRepository(),
      invoices: new MockInvoiceRepository(),
      tickets: new MockTicketRepository(),
      auditLogs: new MockAuditLogRepository(),
      billing: new MockBillingRepository(),
      bookings: new MockBookingRepository(),
      guests: new MockGuestRepository(),
      hotelAudit: new MockHotelAuditRepository(),
      hotelHelp: new MockHotelHelpRepository(),
      hotelStaff: new MockHotelStaffRepository(),
      incidents: new MockIncidentRepository(),
      subscriptions: new MockSubscriptionRepository(),
    };
  }

  // Future: return API implementations
  // Fallback to mock until API repos are implemented
  return {
    hotels: new MockHotelRepository(),
    rooms: new MockRoomRepository(),
    users: new MockUserRepository(),
    kiosks: new MockKioskRepository(),
    plans: new MockPlanRepository(),
    invoices: new MockInvoiceRepository(),
    tickets: new MockTicketRepository(),
    auditLogs: new MockAuditLogRepository(),
    billing: new MockBillingRepository(),
    bookings: new MockBookingRepository(),
    guests: new MockGuestRepository(),
    hotelAudit: new MockHotelAuditRepository(),
    hotelHelp: new MockHotelHelpRepository(),
    hotelStaff: new MockHotelStaffRepository(),
    incidents: new MockIncidentRepository(),
    subscriptions: new MockSubscriptionRepository(),
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = USE_MOCK
  ? new MockAuthService()
  : new MockAuthService(); // swap to ApiAuthService when backend is ready
