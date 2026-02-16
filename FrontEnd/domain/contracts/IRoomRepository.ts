import type { Room, RoomType, Booking, Building } from '../entities/Room';

export interface IRoomRepository {
  getAll(): Promise<Room[]>;
  getById(id: string): Promise<Room | null>;
  create(data: Room): Promise<Room>;
  batchCreate(data: Room[]): Promise<Room[]>;
  update(id: string, data: Partial<Room>): Promise<Room>;
  delete(id: string): Promise<void>;
  getTypes(): Promise<RoomType[]>;
  createType(data: Omit<RoomType, 'id'>): Promise<RoomType>;
  deleteType(id: string): Promise<void>;
  getBuildings(): Promise<Building[]>;
  createBuilding(name: string): Promise<Building>;
  getBookings(): Promise<Booking[]>;
}
