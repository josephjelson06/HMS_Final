import type { IKioskRepository } from '../../domain/contracts/IKioskRepository';
import type { Kiosk, FirmwareRelease } from '../../domain/entities/Kiosk';
import { kioskData, mockFirmware } from '../../data/kiosks';

export class MockKioskRepository implements IKioskRepository {
  private data: Kiosk[] = [...kioskData] as Kiosk[];

  async getAll(): Promise<Kiosk[]> {
    return this.data;
  }

  async getById(id: string): Promise<Kiosk | null> {
    return this.data.find(k => k.id === id) ?? null;
  }

  async create(input: Omit<Kiosk, 'id'>): Promise<Kiosk> {
    const kiosk: Kiosk = { id: `ATC-K-${Date.now()}`, ...input };
    this.data.push(kiosk);
    return kiosk;
  }

  async update(id: string, input: Partial<Kiosk>): Promise<Kiosk> {
    const idx = this.data.findIndex(k => k.id === id);
    if (idx === -1) throw new Error(`Kiosk ${id} not found`);
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    this.data = this.data.filter(k => k.id !== id);
  }

  async getFirmwareReleases(): Promise<FirmwareRelease[]> {
    return [...mockFirmware];
  }
}
