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
// import { MockSubscriptionRepository } from '../repositories/mock/MockSubscriptionRepository';
import { ApiSubscriptionRepository } from '../repositories/api/ApiSubscriptionRepository';

// ... imports
import { ApiHotelRepository } from '../repositories/api/ApiHotelRepository';
import { ApiRoomRepository } from '../repositories/api/ApiRoomRepository';
import { ApiInvoiceRepository } from '../repositories/api/ApiInvoiceRepository';
import { ApiPlanRepository } from '../repositories/api/ApiPlanRepository';
import { ApiUserRepository } from '../repositories/api/ApiUserRepository';
import { ApiIncidentRepository } from '../repositories/api/ApiIncidentRepository';
import { ApiTicketRepository } from '../repositories/api/ApiTicketRepository';

// ... 

// When backend is ready:
// 1. Create Api*Repository classes in ../repositories/api/
// 2. Import them here
// 3. Set USE_MOCK = false (or use env: process.env.NEXT_PUBLIC_USE_MOCK !== 'false')

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'; // Controlled by env now

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
  // Common repositories for now (mock)
  const commonMockRepos = {
      rooms: new ApiRoomRepository(), // Force API repo
      users: new ApiUserRepository(), // Force API repo
      kiosks: new MockKioskRepository(),
      plans: new ApiPlanRepository(), // Force API repo
      invoices: new ApiInvoiceRepository(), // Force API repo
      // tickets: new MockTicketRepository(), // Replaced by ApiTicketRepository
      auditLogs: new MockAuditLogRepository(),
      billing: new MockBillingRepository(),
      bookings: new MockBookingRepository(),
      guests: new MockGuestRepository(),
      hotelAudit: new MockHotelAuditRepository(),
      hotelHelp: new MockHotelHelpRepository(),
      hotelStaff: new MockHotelStaffRepository(),
      incidents: new ApiIncidentRepository(), // Force API repo
      subscriptions: new ApiSubscriptionRepository(), // Force API repo
      tickets: new ApiTicketRepository(), // Force API repo
  };

  if (USE_MOCK) {
    return {
      hotels: new MockHotelRepository(),
      ...commonMockRepos
    };
  }

  // API implementation mixed with mocks (gradual rollout)
  return {
    hotels: new ApiHotelRepository(), // SWAPPED!
    ...commonMockRepos,
    invoices: new ApiInvoiceRepository(), // Override mock
    plans: new ApiPlanRepository(), // Override mock
    users: new ApiUserRepository(), // Override mock
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = USE_MOCK
  ? new MockAuthService()
  : new MockAuthService(); // swap to ApiAuthService when backend is ready
