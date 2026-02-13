// Mock data extracted from components/Plans.tsx

export interface PlanData {
  id: string;
  name: string;
  price: number;
  rooms: number;
  kiosks: number;
  subscribers: number;
  support: string;
  included: string[];
  theme: 'blue' | 'purple' | 'orange';
  isArchived?: boolean;
}

export const INITIAL_PLANS: PlanData[] = [
  { id: 'p1', name: 'Starter', price: 3000, rooms: 30, kiosks: 1, subscribers: 28, support: "Email Only", included: ["Front Desk Operations", "Guest KYC Registry", "Basic Billing Engine", "Daily Shift Reports"], theme: 'blue' },
  { id: 'p2', name: 'Professional', price: 12000, rooms: 100, kiosks: 5, subscribers: 14, support: "Standard (Phone + Email)", included: ["Everything in Starter", "Room Inventory Manager", "Incident Tracking System", "Advanced Analytics"], theme: 'purple' },
  { id: 'p3', name: 'Enterprise', price: 45000, rooms: 250, kiosks: 15, subscribers: 5, support: "Priority 24/7", included: ["Everything in Professional", "API & Webhook Access", "Custom Property Branding", "Priority Hardware Logic"], theme: 'orange' },
];
