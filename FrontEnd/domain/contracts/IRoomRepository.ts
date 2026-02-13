import type { Room, RoomType, Booking } from '../entities/Room';

export interface IRoomRepository {
  getAll(): Promise<Room[]>;
  getById(id: string): Promise<Room | null>;
  create(data: Omit<Room, 'id'>): Promise<Room>;
  update(id: string, data: Partial<Room>): Promise<Room>;
  delete(id: string): Promise<void>;
  getTypes(): Promise<RoomType[]>;
  getBookings(): Promise<Booking[]>;
}
