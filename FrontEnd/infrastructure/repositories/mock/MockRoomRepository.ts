import type { IRoomRepository } from '../../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Booking, Building } from '../../../domain/entities/Room';
import { mockRooms, INITIAL_BOOKINGS } from '../../../data/rooms';

export class MockRoomRepository implements IRoomRepository {
  private data: Room[] = [...mockRooms];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private roomTypes: RoomType[] = [
    { id: 'STD', name: 'Standard Non-AC', rate: 2500, occupancy: 2, units: 12, amenities: ['Fan', 'TV'] },
    { id: 'DLX', name: 'Deluxe AC', rate: 4500, occupancy: 2, units: 24, amenities: ['AC', 'TV', 'WiFi'] },
    { id: 'SUI', name: 'Executive Suite', rate: 8500, occupancy: 4, units: 6, amenities: ['AC', 'Bathtub', 'Minibar', 'View'] },
    { id: 'FAM', name: 'Family Room', rate: 6000, occupancy: 4, units: 8, amenities: ['AC', '2 Beds', 'Kitchenette'] },
  ];
  private buildings: Building[] = [
    { id: 1, name: 'Building 01', hotel_id: 1 },
    { id: 2, name: 'Building 02', hotel_id: 1 }
  ];

  async getAll(): Promise<Room[]> {
    return this.data;
  }

  async getById(id: string): Promise<Room | null> {
    return this.data.find(r => r.id === id) ?? null;
  }

  async create(room: Room): Promise<Room> {
    this.data.push(room);
    return room;
  }

  async batchCreate(rooms: Room[]): Promise<Room[]> {
    this.data.push(...rooms);
    return rooms;
  }

  async update(id: string, input: Partial<Room>): Promise<Room> {
    const idx = this.data.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Room ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(r => r.id !== id);
  }

  async getTypes(): Promise<RoomType[]> {
    return this.roomTypes;
  }

  async createType(data: Omit<RoomType, 'id'>): Promise<RoomType> {
    const newType: RoomType = { id: `RT-${Date.now()}`, ...data };
    this.roomTypes.push(newType);
    return newType;
  }

  async deleteType(id: string): Promise<void> {
    this.roomTypes = this.roomTypes.filter(t => t.id !== id);
  }

  async getBuildings(): Promise<Building[]> {
    return this.buildings;
  }

  async createBuilding(name: string): Promise<Building> {
    const newBuilding: Building = { id: Date.now(), name, hotel_id: 1 };
    this.buildings.push(newBuilding);
    return newBuilding;
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings;
  }
}
