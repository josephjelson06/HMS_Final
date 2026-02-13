import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Booking } from '../../domain/entities/Room';
import { mockRooms, INITIAL_BOOKINGS } from '../../data/rooms';

export class MockRoomRepository implements IRoomRepository {
  private data: Room[] = [...mockRooms];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];

  async getAll(): Promise<Room[]> {
    return this.data;
  }

  async getById(id: string): Promise<Room | null> {
    return this.data.find(r => r.id === id) ?? null;
  }

  async create(input: Omit<Room, 'id'>): Promise<Room> {
    const room: Room = { id: `R-${Date.now()}`, ...input };
    this.data.push(room);
    return room;
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
    return [
      { id: 'rt1', name: 'Standard', rate: 2500, occupancy: 2, units: 20, amenities: ['WiFi', 'TV', 'AC'] },
      { id: 'rt2', name: 'Deluxe', rate: 4500, occupancy: 2, units: 15, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
      { id: 'rt3', name: 'Suite', rate: 8000, occupancy: 4, units: 5, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi'] },
    ];
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings;
  }
}
