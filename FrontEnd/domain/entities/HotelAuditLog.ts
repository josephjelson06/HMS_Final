export type HotelActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'CHECKOUT' | 'VOID' | 'REFUND' | 'SHIFT_CLOSE' | 'NIGHT_AUDIT';
export type HotelModule = 'Guest Registry' | 'Room Management' | 'Billing' | 'Kiosk Settings' | 'Staff Management' | 'System';

export interface HotelAuditLog {
  id: string;
  timestamp: string;
  user: string;
  isImpersonated: boolean;
  action: HotelActionType;
  module: HotelModule;
  description: string;
  ip: string;
}
