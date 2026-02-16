import type { BookingBlock, BookingRoom } from '../entities/Booking';

export interface IBookingRepository {
  getAllBookings(hotelId: string): Promise<BookingBlock[]>;
  getAllRooms(hotelId: string): Promise<BookingRoom[]>;
  getBookingById(id: string, hotelId: string): Promise<BookingBlock | null>;
  create(data: Omit<BookingBlock, 'id'>, hotelId: string): Promise<BookingBlock>;
  update(id: string, data: Partial<BookingBlock>, hotelId: string): Promise<BookingBlock>;
  delete(id: string, hotelId: string): Promise<void>;
}
