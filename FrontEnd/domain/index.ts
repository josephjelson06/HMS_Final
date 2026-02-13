// Domain barrel export — import from '@/domain' for all entities and contracts

// Entities
export * from './entities/Hotel';
export * from './entities/Room';
export * from './entities/User';
export * from './entities/Kiosk';
export * from './entities/Plan';
export * from './entities/Invoice';
export * from './entities/Ticket';
export * from './entities/common';

// Contracts
export type { IHotelRepository } from './contracts/IHotelRepository';
export type { IRoomRepository } from './contracts/IRoomRepository';
export type { IUserRepository } from './contracts/IUserRepository';
export type { IKioskRepository } from './contracts/IKioskRepository';
export type { IPlanRepository } from './contracts/IPlanRepository';
export type { IInvoiceRepository } from './contracts/IInvoiceRepository';
export type { ITicketRepository } from './contracts/ITicketRepository';
export type { IAuthService } from './contracts/IAuthService';
