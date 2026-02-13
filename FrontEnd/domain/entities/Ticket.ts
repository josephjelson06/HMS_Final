// Ticket / Helpdesk domain entities — pure TypeScript, no framework dependencies

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending' | 'Waiting on Client';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';

export interface Ticket {
  id: string;
  subject: string;
  hotel: string;
  status: TicketStatus | string;
  priority: TicketPriority | string;
  assignedTo: string;
  createdAt?: string;
  createdDate?: string;
  lastUpdate?: string;
  lastUpdated?: string;
  category?: TicketCategory | string;
  description?: string;
  slaBreached?: boolean;
  linkedKiosk?: string;
}

export interface TicketMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAgent?: boolean;
}

export interface TicketNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}
