// Ticket / Helpdesk domain types

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Ticket {
  id: string;
  subject: string;
  hotel: string;
  status: TicketStatus | string;
  priority: TicketPriority | string;
  assignedTo: string;
  createdAt: string;
  lastUpdate: string;
  category?: string;
  description?: string;
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
