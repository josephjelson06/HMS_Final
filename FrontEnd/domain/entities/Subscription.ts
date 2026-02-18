export type SubscriptionStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended' | string;
export type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise' | string;

export interface Subscription {
  id: string;
  hotelId?: string;
  hotel_id?: string;
  hotel: string;
  plan: SubscriptionPlan;
  startDate?: string;
  renewalDate?: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  price: number;
}
