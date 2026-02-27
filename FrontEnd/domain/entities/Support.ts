// SupportTicket domain entity
// Note: SupportMessage was removed — messaging not implemented in current scope.

export type SupportPriority = 'low' | 'medium' | 'high';
export type SupportStatus = 'open' | 'in_progress' | 'closed';

export interface SupportTicket {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  category?: string;
  priority: SupportPriority | string;
  status: SupportStatus | string;
  createdAt: string;
}
