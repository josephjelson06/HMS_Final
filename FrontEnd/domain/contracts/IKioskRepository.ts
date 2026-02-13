import type { Kiosk, FirmwareRelease } from '../entities/Kiosk';

export interface IKioskRepository {
  getAll(): Promise<Kiosk[]>;
  getById(id: string): Promise<Kiosk | null>;
  create(data: Omit<Kiosk, 'id'>): Promise<Kiosk>;
  update(id: string, data: Partial<Kiosk>): Promise<Kiosk>;
  delete(id: string): Promise<void>;
  getFirmwareReleases(): Promise<FirmwareRelease[]>;
}
