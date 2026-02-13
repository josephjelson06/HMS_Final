// Mock data extracted from components/hotel/HotelHelp.tsx

export type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed';

export interface HotelTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
}

export const mockHotelTickets: HotelTicket[] = [
  { 
    id: 'TKT-77813', subject: 'GST mismatch on invoice #887', category: 'Billing', 
    priority: 'Medium', status: 'Open', createdAt: '10 Feb, 10:45 AM', 
    updatedAt: '10 Feb, 10:45 AM', description: 'The CGST split is calculating incorrectly for Maharashtra state supply.' 
  },
  { 
    id: 'TKT-77601', subject: 'Requesting staff training docs', category: 'General', 
    priority: 'Low', status: 'Resolved', createdAt: '08 Feb, 02:00 PM', 
    updatedAt: '09 Feb, 04:20 PM', description: 'Need updated PDF manuals for the v2.1 platform release.' 
  },
];
