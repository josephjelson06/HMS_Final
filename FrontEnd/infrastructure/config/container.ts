// Dependency Injection Container
// This is the ONLY file that knows which implementation is active.
// Flip USE_MOCK to false when the backend is ready — zero other changes needed.

import type { IHotelRepository } from '../../domain/contracts/IHotelRepository';
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { IKioskRepository } from '../../domain/contracts/IKioskRepository';
import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { IInvoiceRepository } from '../../domain/contracts/IInvoiceRepository';
import type { ITicketRepository } from '../../domain/contracts/ITicketRepository';
import type { IAuthService } from '../../domain/contracts/IAuthService';

import { MockHotelRepository } from '../repositories/mock/MockHotelRepository';
import { MockRoomRepository } from '../repositories/mock/MockRoomRepository';
import { MockUserRepository } from '../repositories/mock/MockUserRepository';
import { MockKioskRepository } from '../repositories/mock/MockKioskRepository';
import { MockPlanRepository } from '../repositories/mock/MockPlanRepository';
import { MockInvoiceRepository } from '../repositories/mock/MockInvoiceRepository';
import { MockTicketRepository } from '../repositories/mock/MockTicketRepository';
import { MockAuthService } from '../services/MockAuthService';

// When backend is ready:
// 1. Create Api*Repository classes in ../repositories/api/
// 2. Import them here
// 3. Set USE_MOCK = false (or use env: process.env.NEXT_PUBLIC_USE_MOCK !== 'false')

const USE_MOCK = true;

export interface Repositories {
  hotels: IHotelRepository;
  rooms: IRoomRepository;
  users: IUserRepository;
  kiosks: IKioskRepository;
  plans: IPlanRepository;
  invoices: IInvoiceRepository;
  tickets: ITicketRepository;
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
    };
  }

  // Future: return API implementations
  // return {
  //   hotels: new ApiHotelRepository(),
  //   rooms: new ApiRoomRepository(),
  //   ...
  // };

  // Fallback to mock until API repos are implemented
  return {
    hotels: new MockHotelRepository(),
    rooms: new MockRoomRepository(),
    users: new MockUserRepository(),
    kiosks: new MockKioskRepository(),
    plans: new MockPlanRepository(),
    invoices: new MockInvoiceRepository(),
    tickets: new MockTicketRepository(),
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = USE_MOCK
  ? new MockAuthService()
  : new MockAuthService(); // swap to ApiAuthService when backend is ready
