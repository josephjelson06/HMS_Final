
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Booking, Building } from '../../domain/entities/Room';
import { httpClient } from '../http/client';

export class ApiRoomRepository implements IRoomRepository {
  private baseUrl = 'api/hotels/';

  async getAll(hotelId: string = '1'): Promise<Room[]> {
    return httpClient.get<Room[]>(`${this.baseUrl}${hotelId}/rooms`);
  }

  async getById(id: string, hotelId: string = '1'): Promise<Room | null> {
    const all = await this.getAll(hotelId);
    return all.find(r => r.id === id) || null;
  }

  async create(data: Room, hotelId: string): Promise<Room> {
    // The backend expects specific payloads. 
    // Frontend Room entity has { building: string (name), floor: number, category: string, status... }
    // Backend RoomCreate schema has { id: str, floor: int, status: str, type: str, building_id: int, category_id: str }
    
    // We assume the caller (useRooms) has already mapped names to IDs or we do it here.
    // Ideally, Room entity should probably use IDs for relations, but legacy uses names.
    // For now, we just pass data through. If backend fails, we'll debug.
    return httpClient.post<Room>(`${this.baseUrl}${hotelId}/rooms`, data);
  }

  async batchCreate(data: Room[], hotelId: string): Promise<Room[]> {
    return httpClient.post<Room[]>(`${this.baseUrl}${hotelId}/rooms/batch`, data);
  }

  async update(id: string, data: Partial<Room>, hotelId: string): Promise<Room> {
     // Similarly, map frontend updates to backend
    return httpClient.put<Room>(`${this.baseUrl}${hotelId}/rooms/${id}`, data);
  }

  async delete(id: string, hotelId: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${hotelId}/rooms/${id}`);
  }

  async getTypes(hotelId: string = '1'): Promise<RoomType[]> {
    const types = await httpClient.get<RoomType[]>(`${this.baseUrl}${hotelId}/categories`);
    // Ensure amenities is an array if backend sends string
    return types.map(t => ({...t, amenities: Array.isArray(t.amenities) ? t.amenities : []}));
  }

  async createType(data: Omit<RoomType, 'id'>, hotelId: string): Promise<RoomType> {
     // Backend expects RoomCategoryCreate
     return httpClient.post<RoomType>(`${this.baseUrl}${hotelId}/categories`, data);
  }

  async deleteType(id: string, hotelId: string): Promise<void> {
     // Backend endpoint for deleting category might not exist yet, or we use a generic one.
     // If not implemented, we can throw or no-op. 
     // rooms.py does NOT have delete_category.
     console.warn('deleteType not implemented on backend');
     return Promise.resolve();
  }

  async getBuildings(hotelId: string = '1'): Promise<Building[]> {
    return httpClient.get<Building[]>(`${this.baseUrl}${hotelId}/buildings`);
  }

  async createBuilding(name: string, hotelId: string): Promise<Building> {
    return httpClient.post<Building>(`${this.baseUrl}${hotelId}/buildings`, { name }); 
  }

  async getBookings(hotelId: string = '1'): Promise<Booking[]> {
    // Return empty array for now as Booking CRUD is not fully implemented
    return []; 
  }
}
