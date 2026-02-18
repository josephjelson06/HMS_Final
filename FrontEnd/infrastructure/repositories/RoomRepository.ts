
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Building } from '../../domain/entities/Room';
import { httpClient } from '../http/client';

export class ApiRoomRepository implements IRoomRepository {
  private baseUrl = 'api/hotels/';

  async getAll(hotelId: string): Promise<Room[]> {
    return httpClient.get<Room[]>(`${this.baseUrl}${hotelId}/rooms`);
  }

  async getById(id: string, hotelId: string): Promise<Room | null> {
    const all = await this.getAll(hotelId);
    return all.find(r => r.id === id) || null;
  }

  private toRoomPayload(data: Room): Record<string, unknown> {
    const buildingId = data.building_id;
    const categoryId = data.category_id;

    if (buildingId === undefined || categoryId === undefined) {
      throw new Error('Room payload must include building_id and category_id.');
    }

    return {
      id: data.id,
      floor: data.floor,
      status: data.status,
      type: data.type,
      building_id: buildingId,
      category_id: categoryId
    };
  }

  async create(data: Room, hotelId: string): Promise<Room> {
    return httpClient.post<Room>(`${this.baseUrl}${hotelId}/rooms`, this.toRoomPayload(data));
  }

  async batchCreate(data: Room[], hotelId: string): Promise<Room[]> {
    return httpClient.post<Room[]>(`${this.baseUrl}${hotelId}/rooms/batch`, data.map(room => this.toRoomPayload(room)));
  }

  async update(id: string, data: Partial<Room>, hotelId: string): Promise<Room> {
    const payload: Record<string, unknown> = {};
    if (data.floor !== undefined) payload.floor = data.floor;
    if (data.status !== undefined) payload.status = data.status;
    if (data.type !== undefined) payload.type = data.type;
    if (data.building_id !== undefined) payload.building_id = data.building_id;
    if (data.category_id !== undefined) payload.category_id = data.category_id;

    return httpClient.put<Room>(`${this.baseUrl}${hotelId}/rooms/${id}`, payload);
  }

  async delete(id: string, hotelId: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${hotelId}/rooms/${id}`);
  }

  async getTypes(hotelId: string): Promise<RoomType[]> {
    const types = await httpClient.get<RoomType[]>(`${this.baseUrl}${hotelId}/categories`);
    // Ensure amenities is an array if backend sends string
    return types.map(t => ({...t, amenities: Array.isArray(t.amenities) ? t.amenities : []}));
  }

  async createType(data: Omit<RoomType, 'id'>, hotelId: string): Promise<RoomType> {
    const { units, ...payload } = data;
    return httpClient.post<RoomType>(`${this.baseUrl}${hotelId}/categories`, payload);
  }

  async deleteType(id: string, hotelId: string): Promise<void> {
     return httpClient.delete(`${this.baseUrl}${hotelId}/categories/${id}`);
  }

  async getBuildings(hotelId: string): Promise<Building[]> {
    return httpClient.get<Building[]>(`${this.baseUrl}${hotelId}/buildings`);
  }

  async createBuilding(name: string, hotelId: string): Promise<Building> {
    return httpClient.post<Building>(`${this.baseUrl}${hotelId}/buildings`, { name }); 
  }
}
