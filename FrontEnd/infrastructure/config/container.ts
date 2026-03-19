// Dependency Injection Container
// This is the ONLY file that knows which implementation is active.
// Flip USE_MOCK to false when the backend is ready — zero other changes needed.

// --- Contracts ---
import type { ITenantRepository } from '../../domain/contracts/ITenantRepository';
import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { IAuthService } from '../../domain/contracts/IAuthService';
import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { ISupportRepository } from '../../domain/contracts/ISupportRepository';
import type { ISettingsRepository } from '../../domain/contracts/ISettingsRepository';

// --- API Repositories ---
import { ApiTenantRepository } from '../repositories/TenantRepository';
import { ApiUserRepository } from '../repositories/UserRepository';
import { ApiPlanRepository } from '../repositories/PlanRepository';
import { ApiHotelStaffRepository } from '../repositories/HotelStaffRepository';
import { ApiSubscriptionRepository } from '../repositories/SubscriptionRepository';
import { ApiSupportRepository } from '../repositories/SupportRepository';
import { ApiSettingsRepository } from '../repositories/SettingsRepository';

import { ApiAuthService } from '../services/ApiAuthService';

export interface Repositories {
  tenants: ITenantRepository;
  users: IUserRepository;
  plans: IPlanRepository;
  hotelStaff: IHotelStaffRepository;
  subscriptions: ISubscriptionRepository;
  support: ISupportRepository;
  settings: ISettingsRepository;
}

function createRepositories(): Repositories {
  return {
    tenants: new ApiTenantRepository(),
    users: new ApiUserRepository(),
    plans: new ApiPlanRepository(),
    hotelStaff: new ApiHotelStaffRepository(),
    subscriptions: new ApiSubscriptionRepository(),
    support: new ApiSupportRepository(),
    settings: new ApiSettingsRepository(),
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = new ApiAuthService(); 
