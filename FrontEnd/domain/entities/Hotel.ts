// Hotel domain entity — pure TypeScript, no framework dependencies

export type HotelStatus = 'Active' | 'Suspended' | 'Onboarding' | 'Past Due';
export type HotelPlan = 'Starter' | 'Professional' | 'Enterprise';

export interface Kiosk {
  id: number;
  serial_number: string;
  location: string;
  hotel_id: number;
}

export interface Hotel {
  id: number;
  name: string;
  gstin: string;
  owner: string;
  email: string;
  mobile: string;
  plan: HotelPlan | string;
  kiosks: number;
  status: HotelStatus | string;
  mrr: number;
  address: string;
  pan?: string;
  legal_name?: string;
  logo?: string;
  kiosk_list?: Kiosk[];
}
