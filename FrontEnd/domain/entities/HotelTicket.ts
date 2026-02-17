export type HotelTicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';
export type HotelTicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type HotelTicketStatus = 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed' | 'Pending';

export interface HotelTicket {
  id: string;
  subject: string;
  category: HotelTicketCategory | string;
  priority: HotelTicketPriority | string;
  status: HotelTicketStatus | string;
  createdAt: string;
  updatedAt: string;
  description: string;
  hotelId?: number; // Optional as it might not be relevant for hotel view
  hotelName?: string; // Optional for admin view
  // From types/ticket.ts
  hotel?: string; // Legacy?
  assignedTo?: string;
  lastUpdate?: string; // Use updatedAt?
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

