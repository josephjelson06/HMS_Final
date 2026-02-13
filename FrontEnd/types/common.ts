import type React from 'react';

// Common / shared types used across domains

export type ViewMode = 'super' | 'hotel';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface NavigationProps {
  onNavigate: (route: string) => void;
}

// UI component prop types for reusable primitives
export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  clipContent?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  totalItems: number;
}

export interface SummaryCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}
