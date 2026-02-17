// Kiosk domain entities — pure TypeScript, no framework dependencies

export type KioskStatus = 'ONLINE' | 'OFFLINE' | 'CRITICAL';

export interface Kiosk {
  id: string;
  hotel: string;
  status: KioskStatus | string;
  signal: number;
  battery: number;
  lastSeen: string;
  paper: number;
  firmware: string;
  update: boolean; // From types/kiosk.ts
}


export interface FirmwareRelease {
  version: string;
  releaseDate: string;
  channel: 'Stable' | 'Beta' | 'Alpha';
  activeDevices: number;
  status: 'Published' | 'Archived' | 'Deprecated';
  compatibility: string;
}
