import type { HotelTicket } from '../entities/HotelTicket';

export interface ITicketRepository {
  getHotelTickets(hotelId: string): Promise<HotelTicket[]>;
  createTicket(hotelId: string, data: Partial<HotelTicket>): Promise<HotelTicket>;
  
  // Admin methods
  getAllTickets(): Promise<HotelTicket[]>;
  updateTicket(id: string, data: Partial<HotelTicket>): Promise<HotelTicket>;
}
