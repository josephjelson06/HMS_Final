import type { BookingBlock, BookingRoom } from '../entities/Booking';

export interface IBookingRepository {
  getAllBookings(): Promise<BookingBlock[]>;
  getAllRooms(): Promise<BookingRoom[]>;
  getBookingById(id: string): Promise<BookingBlock | null>;
  create(data: Omit<BookingBlock, 'id'>): Promise<BookingBlock>;
  update(id: string, data: Partial<BookingBlock>): Promise<BookingBlock>;
  delete(id: string): Promise<void>;
}
