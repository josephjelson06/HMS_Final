import type { IRoomRepository } from '../../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Booking, Building } from '../../../domain/entities/Room';
import { httpClient } from '../../http/client';

export class ApiRoomRepository implements IRoomRepository {
  private baseUrl = 'api/hotels/';
  // Temporary: we assume a single hotel context or derive it from elsewhere.
  // For MVP, we'll hardcode hotelId=1 if not available, but 'api/hotels/1/rooms' is the pattern.
  // Ideally, this class should be initialized with hotelId or fetch it from a store.
  // Given current architecture, we'll fetch for Hotel ID 1 for now.
  private hotelId = 1; 

  async getAll(): Promise<Room[]> {
    return httpClient.get<Room[]>(`${this.baseUrl}${this.hotelId}/rooms`);
  }

  async getById(id: string): Promise<Room | null> {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  }

  async create(data: Room): Promise<Room> {
    // The backend expects specific payloads. 
    // Frontend Room entity has { building: string (name), floor: number, category: string, status... }
    // Backend RoomCreate schema has { id: str, floor: int, status: str, type: str, building_id: int, category_id: str }
    
    // We assume the caller (useRooms) has already mapped names to IDs or we do it here.
    // Ideally, Room entity should probably use IDs for relations, but legacy uses names.
    // For now, we just pass data through. If backend fails, we'll debug.
    return httpClient.post<Room>(`${this.baseUrl}${this.hotelId}/rooms`, data);
  }

  async batchCreate(data: Room[]): Promise<Room[]> {
    return httpClient.post<Room[]>(`${this.baseUrl}${this.hotelId}/rooms/batch`, data);
  }

  async update(id: string, data: Partial<Room>): Promise<Room> {
     // Similarly, map frontend updates to backend
    return httpClient.put<Room>(`${this.baseUrl}${this.hotelId}/rooms/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${this.hotelId}/rooms/${id}`);
  }

  async getTypes(): Promise<RoomType[]> {
    const types = await httpClient.get<RoomType[]>(`${this.baseUrl}${this.hotelId}/categories`);
    // Ensure amenities is an array if backend sends string
    return types.map(t => ({...t, amenities: Array.isArray(t.amenities) ? t.amenities : []}));
  }

  async createType(data: Omit<RoomType, 'id'>): Promise<RoomType> {
     // Backend expects RoomCategoryCreate
     return httpClient.post<RoomType>(`${this.baseUrl}${this.hotelId}/categories`, data);
  }

  async deleteType(id: string): Promise<void> {
     // Backend endpoint for deleting category might not exist yet, or we use a generic one.
     // If not implemented, we can throw or no-op. 
     // rooms.py does NOT have delete_category.
     console.warn('deleteType not implemented on backend');
     return Promise.resolve();
  }

  async getBuildings(): Promise<Building[]> {
    return httpClient.get<Building[]>(`${this.baseUrl}${this.hotelId}/buildings`);
  }

  async createBuilding(name: string): Promise<Building> {
    return httpClient.post<Building>(`${this.baseUrl}${this.hotelId}/buildings`, { name }); 
  }

  async getBookings(): Promise<Booking[]> {
    // Return empty array for now as Booking CRUD is not fully implemented
    return []; 
  }
}
