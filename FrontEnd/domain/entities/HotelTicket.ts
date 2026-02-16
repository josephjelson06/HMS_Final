export type HotelTicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';
export type HotelTicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type HotelTicketStatus = 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed';

export interface HotelTicket {
  id: string;
  subject: string;
  category: HotelTicketCategory;
  priority: HotelTicketPriority;
  status: HotelTicketStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
  hotelId?: number; // Optional as it might not be relevant for hotel view
  hotelName?: string; // Optional for admin view
}
