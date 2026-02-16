import type { Room, RoomType, Booking, Building } from '../entities/Room';

export interface IRoomRepository {
  getAll(hotelId?: string): Promise<Room[]>;
  getById(id: string, hotelId?: string): Promise<Room | null>;
  create(data: Room, hotelId: string): Promise<Room>;
  batchCreate(data: Room[], hotelId: string): Promise<Room[]>;
  update(id: string, data: Partial<Room>, hotelId: string): Promise<Room>;
  delete(id: string, hotelId: string): Promise<void>;
  getTypes(hotelId?: string): Promise<RoomType[]>;
  createType(data: Omit<RoomType, 'id'>, hotelId: string): Promise<RoomType>;
  deleteType(id: string, hotelId: string): Promise<void>;
  getBuildings(hotelId?: string): Promise<Building[]>;
  createBuilding(name: string, hotelId: string): Promise<Building>;
  getBookings(hotelId?: string): Promise<Booking[]>;
}
