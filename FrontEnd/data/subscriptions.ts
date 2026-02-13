// Mock data extracted from components/Subscriptions.tsx

export interface Subscription {
  id: string;
  hotel: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  startDate: string;
  renewalDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled';
  autoRenew: boolean;
  price: number;
}

export const mockSubscriptions: Subscription[] = [
  { id: '1', hotel: 'Royal Orchid Bangalore', plan: 'Enterprise', startDate: '2024-06-01', renewalDate: '2025-06-01', status: 'Active', autoRenew: true, price: 15000 },
  { id: '2', hotel: 'Lemon Tree Premier', plan: 'Professional', startDate: '2024-01-15', renewalDate: '2025-02-15', status: 'Expiring Soon', autoRenew: false, price: 8500 },
  { id: '3', hotel: 'Ginger Hotel, Panjim', plan: 'Starter', startDate: '2024-07-20', renewalDate: '2025-01-10', status: 'Expired', autoRenew: false, price: 3000 },
  { id: '4', hotel: 'Sayaji Hotel', plan: 'Enterprise', startDate: '2024-12-20', renewalDate: '2025-12-20', status: 'Active', autoRenew: true, price: 12000 },
  { id: '5', hotel: 'Taj Palace', plan: 'Enterprise', startDate: '2024-10-10', renewalDate: '2025-02-18', status: 'Expiring Soon', autoRenew: true, price: 25000 },
  { id: '6', hotel: 'ITC Maratha', plan: 'Professional', startDate: '2024-02-23', renewalDate: '2025-02-23', status: 'Cancelled', autoRenew: false, price: 18000 },
  { id: '7', hotel: 'Radisson Blu', plan: 'Starter', startDate: '2024-05-15', renewalDate: '2025-05-15', status: 'Active', autoRenew: true, price: 5000 },
];
