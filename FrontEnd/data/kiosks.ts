// Mock data extracted from components/KioskFleet.tsx and components/KioskFirmware.tsx

export const kioskData = [
  { id: 'ATC-K-0402', hotel: 'Hotel Sapphire, Mumbai', status: 'CRITICAL', signal: 12, battery: 8, lastSeen: '2H 14M AGO', paper: 5, firmware: 'v2.1.4', update: true },
  { id: 'ATC-SN-7766', hotel: 'Lemon Tree Premier', status: 'OFFLINE', signal: 0, battery: 0, lastSeen: '45M AGO', paper: 82, firmware: 'v2.2.0', update: false },
  { id: 'ATC-SN-8821', hotel: 'Royal Orchid Bangalore', status: 'ONLINE', signal: 92, battery: 100, lastSeen: '2M AGO', paper: 45, firmware: 'v2.2.0', update: false },
  { id: 'ATC-SN-1204', hotel: 'Ginger Hotel, Panjim', status: 'ONLINE', signal: 65, battery: 85, lastSeen: '5M AGO', paper: 15, firmware: 'v2.1.4', update: true },
  { id: 'ATC-SN-5541', hotel: 'ITC Maratha', status: 'ONLINE', signal: 78, battery: 92, lastSeen: 'JUST NOW', paper: 90, firmware: 'v2.2.0', update: false },
  { id: 'ATC-SN-9901', hotel: 'Taj Palace', status: 'ONLINE', signal: 88, battery: 95, lastSeen: '12M AGO', paper: 60, firmware: 'v2.2.0', update: false },
  { id: 'ATC-K-0801', hotel: 'Novotel Pune', status: 'ONLINE', signal: 82, battery: 88, lastSeen: '1H AGO', paper: 22, firmware: 'v2.2.1', update: true },
  { id: 'ATC-K-0902', hotel: 'Radisson Blu', status: 'ONLINE', signal: 70, battery: 45, lastSeen: '10M AGO', paper: 12, firmware: 'v2.2.0', update: false },
];

export interface FirmwareRelease {
  version: string;
  releaseDate: string;
  channel: 'Stable' | 'Beta' | 'Alpha';
  activeDevices: number;
  status: 'Published' | 'Archived' | 'Deprecated';
  compatibility: string;
}

export const mockFirmware: FirmwareRelease[] = [
  { version: 'v2.2.1', releaseDate: '09 Feb 2026', channel: 'Stable', activeDevices: 12, status: 'Published', compatibility: 'Gen 3 Floor/Desk' },
  { version: 'v2.2.0', releaseDate: '28 Jan 2026', channel: 'Stable', activeDevices: 48, status: 'Published', compatibility: 'All hardware' },
  { version: 'v2.3.0-rc1', releaseDate: '10 Feb 2026', channel: 'Beta', activeDevices: 2, status: 'Published', compatibility: 'Gen 3 Hardware' },
  { version: 'v2.1.4', releaseDate: '15 Dec 2025', channel: 'Stable', activeDevices: 3, status: 'Deprecated', compatibility: 'Gen 1 & 2 only' },
];
