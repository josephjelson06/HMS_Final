// Hotel domain types

export type HotelStatus = 'Active' | 'Suspended' | 'Onboarding' | 'Past Due';
export type HotelPlan = 'Starter' | 'Professional' | 'Enterprise';

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
}

export interface HotelsProps {
  onNavigate: (route: string) => void;
  onLoginAsAdmin?: (hotelName: string) => void;
}

export interface HotelDetailsProps {
  onNavigate?: (route: string) => void;
}
