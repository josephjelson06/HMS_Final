// Plan domain entity — pure TypeScript, no framework dependencies

export type PlanTheme = 'blue' | 'purple' | 'orange';

export interface PlanData {
  id: string;
  name: string;
  price: number;
  rooms: number;
  kiosks: number;
  subscribers: number;
  support: string;
  included: string[];
  theme: PlanTheme;
  isArchived?: boolean; // From types/plan.ts
}

