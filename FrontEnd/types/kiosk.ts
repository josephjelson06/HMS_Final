// Kiosk domain types

export type KioskStatus = 'ONLINE' | 'OFFLINE' | 'CRITICAL';
export type FleetTab = 'DEVICES' | 'FIRMWARE';

export interface Kiosk {
  id: string;
  hotel: string;
  status: KioskStatus | string;
  signal: number;
  battery: number;
  lastSeen: string;
  paper: number;
  firmware: string;
  update: boolean;
}

export interface KioskFleetProps {
  onNavigateDetail?: (id: string) => void;
}

export interface KioskDetailProps {
  kioskId?: string;
  onBack?: () => void;
}

export interface FirmwareRelease {
  version: string;
  releaseDate: string;
  channel: 'Stable' | 'Beta' | 'Alpha';
  activeDevices: number;
  status: 'Published' | 'Archived' | 'Deprecated';
  compatibility: string;
}
