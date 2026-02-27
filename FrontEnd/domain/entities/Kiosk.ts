// Kiosk domain entities — matches kiosk_devices and kiosk_sessions in code.sql

export type KioskStatus = 'online' | 'offline' | 'maintenance';
export type KioskFinalState = 'COMPLETE' | 'IDLE' | 'ERROR';

export interface KioskDevice {
    id: string;
    tenantId: string;
    deviceCode: string;            // mapped from device_code (unique per tenant)
    name?: string;
    location?: string;
    status: KioskStatus | string;  // default: 'online'
    lastHeartbeat?: string;        // mapped from last_heartbeat
    config: Record<string, unknown>; // JSONB
    createdAt?: string;
    updatedAt?: string;
}

export interface KioskSession {
    id: string;
    tenantId: string;
    deviceId?: string;             // mapped from device_id
    sessionToken: string;          // mapped from session_token (unique)
    language: string;              // default: 'en'
    startedAt: string;             // mapped from started_at
    endedAt?: string;
    finalState?: KioskFinalState | string;
    createdAt?: string;
}
