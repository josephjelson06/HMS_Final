// Domain barrel export — import from '@/domain' for all entities and contracts

// Entities (original 7 + common)
export * from './entities/Hotel';
export * from './entities/Room';
export * from './entities/User';
export * from './entities/Kiosk';
export * from './entities/Plan';
export * from './entities/Invoice';
export * from './entities/Ticket';
export * from './entities/common';

// Entities (9 new)
export * from './entities/AuditLog';
export * from './entities/BillingInvoice';
export * from './entities/Booking';
export * from './entities/Guest';
export * from './entities/HotelAuditLog';
export * from './entities/HotelTicket';
export * from './entities/HotelStaff';
export * from './entities/Incident';
export * from './entities/Subscription';

// Contracts (original 8)
export type { IHotelRepository } from './contracts/IHotelRepository';
export type { IRoomRepository } from './contracts/IRoomRepository';
export type { IUserRepository } from './contracts/IUserRepository';
export type { IKioskRepository } from './contracts/IKioskRepository';
export type { IPlanRepository } from './contracts/IPlanRepository';
export type { IInvoiceRepository } from './contracts/IInvoiceRepository';
export type { ITicketRepository } from './contracts/ITicketRepository';
export type { IAuthService } from './contracts/IAuthService';

// Contracts (9 new)
export type { IAuditLogRepository } from './contracts/IAuditLogRepository';
export type { IBillingRepository } from './contracts/IBillingRepository';
export type { IBookingRepository } from './contracts/IBookingRepository';
export type { IGuestRepository } from './contracts/IGuestRepository';
export type { IHotelAuditRepository } from './contracts/IHotelAuditRepository';
export type { IHotelHelpRepository } from './contracts/IHotelHelpRepository';
export type { IHotelStaffRepository } from './contracts/IHotelStaffRepository';
export type { IIncidentRepository } from './contracts/IIncidentRepository';
export type { ISubscriptionRepository } from './contracts/ISubscriptionRepository';

