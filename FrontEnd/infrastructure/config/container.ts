// Dependency Injection Container
// This is the ONLY file that knows which implementation is active.
// Flip USE_MOCK to false when the backend is ready — zero other changes needed.

// --- Original 7 contracts ---
import type { IHotelRepository } from '../../domain/contracts/IHotelRepository';
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { IInvoiceRepository } from '../../domain/contracts/IInvoiceRepository';
import type { IAuthService } from '../../domain/contracts/IAuthService';
import type { ISettingsRepository } from '../../domain/contracts/ISettingsRepository';

// --- 9 new contracts ---
import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';

// --- API Repositories ---
import { ApiHotelRepository } from '../repositories/HotelRepository';
import { ApiRoomRepository } from '../repositories/RoomRepository';
import { ApiUserRepository } from '../repositories/UserRepository';
import { ApiPlanRepository } from '../repositories/PlanRepository';
import { ApiInvoiceRepository } from '../repositories/InvoiceRepository';
import { ApiHotelStaffRepository } from '../repositories/HotelStaffRepository';
import { ApiSubscriptionRepository } from '../repositories/SubscriptionRepository';
import { ApiSettingsRepository } from '../repositories/SettingsRepository';

import { ApiAuthService } from '../services/ApiAuthService';

export interface Repositories {
  // Original 7
  hotels: IHotelRepository;
  rooms: IRoomRepository;
  users: IUserRepository;
  plans: IPlanRepository;
  invoices: IInvoiceRepository;

  // 9 new
  hotelStaff: IHotelStaffRepository;
  subscriptions: ISubscriptionRepository;
  settings: ISettingsRepository;
}

function createRepositories(): Repositories {
  return {
    // Implemented
    hotels: new ApiHotelRepository(),
    rooms: new ApiRoomRepository(),
    users: new ApiUserRepository(),
    plans: new ApiPlanRepository(),
    invoices: new ApiInvoiceRepository(),
    hotelStaff: new ApiHotelStaffRepository(),
    subscriptions: new ApiSubscriptionRepository(),
    settings: new ApiSettingsRepository(),
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = new ApiAuthService(); 
