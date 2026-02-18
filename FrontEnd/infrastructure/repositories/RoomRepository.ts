import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { Room, RoomType, Building } from '../../domain/entities/Room';
import { httpClient } from '../http/client';
import type { ApiBuildingDTO, ApiRoomCategoryDTO, ApiRoomDTO } from '../dto/backend';

type RoomTypeCreateInput = Omit<RoomType, 'id'> & Partial<Pick<RoomType, 'id'>>;

export class ApiRoomRepository implements IRoomRepository {
  private baseUrl = 'api/hotels/';

  private mapRoom(data: ApiRoomDTO, hotelId: string): Room {
    return {
      id: String(data.id),
      floor: data.floor ?? 0,
      status: data.status ?? 'CLEAN_VACANT',
      type: data.type ?? 'Hostel Room',
      hotel_id: data.hotel_id ?? data.tenant_id ?? hotelId,
      building_id: data.building_id,
      category_id: data.category_id,
      building: data.building ?? undefined,
      category: data.category ?? undefined,
    };
  }

  private mapRoomType(data: ApiRoomCategoryDTO, hotelId: string): RoomType {
    return {
      id: String(data.id),
      name: data.name ?? '',
      rate: data.rate ?? 0,
      occupancy: data.occupancy ?? 0,
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      hotel_id: data.hotel_id ?? data.tenant_id ?? hotelId,
    };
  }

  private mapBuilding(data: ApiBuildingDTO, hotelId: string): Building {
    return {
      id: Number(data.id),
      name: data.name ?? '',
      hotel_id: String(data.hotel_id ?? data.tenant_id ?? hotelId),
    };
  }

  private toRoomCreatePayload(data: Room): Record<string, unknown> {
    if (data.building_id === undefined || data.category_id === undefined) {
      throw new Error('Room payload must include building_id and category_id.');
    }

    return {
      id: data.id,
      floor: data.floor,
      status: data.status,
      type: data.type,
      building_id: data.building_id,
      category_id: data.category_id,
    };
  }

  private toRoomUpdatePayload(data: Partial<Room>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (data.floor !== undefined) payload.floor = data.floor;
    if (data.status !== undefined) payload.status = data.status;
    if (data.type !== undefined) payload.type = data.type;
    if (data.building_id !== undefined) payload.building_id = data.building_id;
    if (data.category_id !== undefined) payload.category_id = data.category_id;
    return payload;
  }

  private toCategoryPayload(data: RoomTypeCreateInput): Record<string, unknown> {
    return {
      id: data.id ?? `RT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      name: data.name,
      rate: data.rate,
      occupancy: data.occupancy,
      amenities: data.amenities ?? [],
    };
  }

  async getAll(hotelId: string): Promise<Room[]> {
    const data = await httpClient.get<ApiRoomDTO[]>(`${this.baseUrl}${hotelId}/rooms`);
    return data.map((room) => this.mapRoom(room, hotelId));
  }

  async getById(id: string, hotelId: string): Promise<Room | null> {
    const all = await this.getAll(hotelId);
    return all.find((r) => r.id === id) || null;
  }

  async create(data: Room, hotelId: string): Promise<Room> {
    const payload = this.toRoomCreatePayload(data);
    const result = await httpClient.post<ApiRoomDTO>(`${this.baseUrl}${hotelId}/rooms`, payload);
    return this.mapRoom(result, hotelId);
  }

  async batchCreate(data: Room[], hotelId: string): Promise<Room[]> {
    const payload = data.map((room) => this.toRoomCreatePayload(room));
    const result = await httpClient.post<ApiRoomDTO[]>(`${this.baseUrl}${hotelId}/rooms/batch`, payload);
    return result.map((room) => this.mapRoom(room, hotelId));
  }

  async update(id: string, data: Partial<Room>, hotelId: string): Promise<Room> {
    const payload = this.toRoomUpdatePayload(data);
    const result = await httpClient.put<ApiRoomDTO>(`${this.baseUrl}${hotelId}/rooms/${id}`, payload);
    return this.mapRoom(result, hotelId);
  }

  async delete(id: string, hotelId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${hotelId}/rooms/${id}`);
  }

  async getTypes(hotelId: string): Promise<RoomType[]> {
    const data = await httpClient.get<ApiRoomCategoryDTO[]>(`${this.baseUrl}${hotelId}/categories`);
    return data.map((type) => this.mapRoomType(type, hotelId));
  }

  async createType(data: Omit<RoomType, 'id'>, hotelId: string): Promise<RoomType> {
    const payload = this.toCategoryPayload(data as RoomTypeCreateInput);
    const result = await httpClient.post<ApiRoomCategoryDTO>(`${this.baseUrl}${hotelId}/categories`, payload);
    return this.mapRoomType(result, hotelId);
  }

  async deleteType(id: string, hotelId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${hotelId}/categories/${id}`);
  }

  async getBuildings(hotelId: string): Promise<Building[]> {
    const data = await httpClient.get<ApiBuildingDTO[]>(`${this.baseUrl}${hotelId}/buildings`);
    return data.map((building) => this.mapBuilding(building, hotelId));
  }

  async createBuilding(name: string, hotelId: string): Promise<Building> {
    const result = await httpClient.post<ApiBuildingDTO>(`${this.baseUrl}${hotelId}/buildings`, { name });
    return this.mapBuilding(result, hotelId);
  }
}
