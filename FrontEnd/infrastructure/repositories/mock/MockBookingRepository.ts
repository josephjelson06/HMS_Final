import type { IBookingRepository } from '@/domain/contracts/IBookingRepository';
import type { BookingBlock, BookingRoom } from '@/domain/entities/Booking';
import { BOOKING_ENGINE_BOOKINGS, ROOMS_DATA } from '@/data/bookings';

export class MockBookingRepository implements IBookingRepository {
  async getAllBookings(): Promise<BookingBlock[]> {
    return BOOKING_ENGINE_BOOKINGS;
  }

  async getAllRooms(): Promise<BookingRoom[]> {
    return ROOMS_DATA;
  }

  async getBookingById(id: string): Promise<BookingBlock | null> {
    return BOOKING_ENGINE_BOOKINGS.find((b) => b.id === id) ?? null;
  }

  async create(data: Omit<BookingBlock, 'id'>): Promise<BookingBlock> {
    return { id: `b${Date.now()}`, ...data };
  }

  async update(id: string, data: Partial<BookingBlock>): Promise<BookingBlock> {
    const existing = BOOKING_ENGINE_BOOKINGS.find((b) => b.id === id);
    return { ...(existing ?? BOOKING_ENGINE_BOOKINGS[0]), ...data } as BookingBlock;
  }

  async delete(_id: string): Promise<void> {
    /* no-op in mock */
  }
}
