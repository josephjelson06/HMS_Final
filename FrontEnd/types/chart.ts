import type React from 'react';

// Chart and stat card types

export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subValueColor?: string;
  subtext?: string;
  icon?: React.ReactNode | React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  state?: 'normal' | 'warning' | 'critical';
  badge?: string;
  colorVariant?: string;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}
