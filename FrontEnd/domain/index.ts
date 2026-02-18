// Domain barrel export — import from '@/domain' for all entities and contracts

// Entities (kept)
export * from './entities/Hotel';
export * from './entities/Room';
export * from './entities/User';
export * from './entities/Plan';
export * from './entities/Invoice';
export * from './entities/common';
export * from './entities/HotelStaff';
export * from './entities/Subscription';

// Contracts (original 8)
export type { IHotelRepository } from './contracts/IHotelRepository';
export type { IRoomRepository } from './contracts/IRoomRepository';
export type { IUserRepository } from './contracts/IUserRepository';
export type { IPlanRepository } from './contracts/IPlanRepository';
export type { IInvoiceRepository } from './contracts/IInvoiceRepository';
export type { IAuthService } from './contracts/IAuthService';

// Contracts (9 new)
export type { IHotelStaffRepository } from './contracts/IHotelStaffRepository';
export type { ISubscriptionRepository } from './contracts/ISubscriptionRepository';

