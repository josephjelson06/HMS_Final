import type { HotelTicket } from '../entities/HotelTicket';

export interface IHotelHelpRepository {
  getAll(): Promise<HotelTicket[]>;
  getById(id: string): Promise<HotelTicket | null>;
  create(data: Omit<HotelTicket, 'id'>): Promise<HotelTicket>;
  update(id: string, data: Partial<HotelTicket>): Promise<HotelTicket>;
}
