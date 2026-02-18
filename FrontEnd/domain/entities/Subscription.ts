export type SubscriptionStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended';
export type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise';

export interface Subscription {
  id: string;
  hotel: string;
  plan: SubscriptionPlan;
  startDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  price: number;
}
