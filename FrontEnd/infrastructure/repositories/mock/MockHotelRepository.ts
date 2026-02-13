import type { IHotelRepository } from '../../domain/contracts/IHotelRepository';
import type { Hotel } from '../../domain/entities/Hotel';
import { hotelsData } from '../../data/hotels';

export class MockHotelRepository implements IHotelRepository {
  private data: Hotel[] = [...hotelsData] as Hotel[];

  async getAll(): Promise<Hotel[]> {
    return this.data;
  }

  async getById(id: number): Promise<Hotel | null> {
    return this.data.find(h => h.id === id) ?? null;
  }

  async create(input: Omit<Hotel, 'id'>): Promise<Hotel> {
    const hotel: Hotel = { id: Date.now(), ...input };
    this.data.push(hotel);
    return hotel;
  }

  async update(id: number, input: Partial<Hotel>): Promise<Hotel> {
    const idx = this.data.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hotel ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: number): Promise<void> {
    this.data = this.data.filter(h => h.id !== id);
  }

  async search(query: string): Promise<Hotel[]> {
    const q = query.toLowerCase();
    return this.data.filter(h => h.name.toLowerCase().includes(q));
  }
}
