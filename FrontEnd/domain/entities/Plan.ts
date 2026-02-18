// Plan domain entity — pure TypeScript, no framework dependencies

export type PlanTheme = 'blue' | 'purple' | 'orange' | string;

export interface PlanData {
  id: string;
  name: string;
  price: number;
  rooms: number;
  kiosks: number;
  subscribers?: number;
  support: string;
  included: string[];
  theme: PlanTheme;
  max_roles?: number;
  max_users?: number;
  isArchived?: boolean;
  is_archived?: boolean;
}

