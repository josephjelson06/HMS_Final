// Mock data extracted from components/Helpdesk.tsx

export type HelpdeskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type HelpdeskStatus = 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed';
export type HelpdeskCategory = 'Hardware' | 'Software' | 'Billing' | 'General';

export interface HelpdeskTicket {
  id: string;
  hotel: string;
  subject: string;
  category: HelpdeskCategory;
  priority: HelpdeskPriority;
  status: HelpdeskStatus;
  assignedTo: string;
  createdDate: string;
  lastUpdated: string;
  slaBreached: boolean;
  linkedKiosk?: string;
}

export const mockTickets: HelpdeskTicket[] = [
  { id: 'TKT-2026-00412', hotel: 'Lemon Tree Premier', subject: 'Kiosk printer not working - Jammed', category: 'Hardware', priority: 'High', status: 'Open', assignedTo: 'Vijay Kumar', createdDate: '09 Feb 2026, 08:00 AM', lastUpdated: '12m ago', slaBreached: true, linkedKiosk: 'ATC-SN-7766' },
  { id: 'TKT-2026-00413', hotel: 'Royal Orchid Bangalore', subject: 'Requesting API documentation for PMS sync', category: 'Software', priority: 'Medium', status: 'In Progress', assignedTo: 'Aditya Sharma', createdDate: '09 Feb 2026, 09:30 AM', lastUpdated: '1h ago', slaBreached: false },
  { id: 'TKT-2026-00414', hotel: 'Ginger Hotel, Panjim', subject: 'Invoice #INV-992 amount mismatch', category: 'Billing', priority: 'Low', status: 'Waiting on Client', assignedTo: 'Suman Rao', createdDate: '08 Feb 2026, 04:00 PM', lastUpdated: '5h ago', slaBreached: false },
  { id: 'TKT-2026-00415', hotel: 'Taj Palace', subject: 'Kiosk touchscreen unresponsive', category: 'Hardware', priority: 'Critical', status: 'In Progress', assignedTo: 'Vijay Kumar', createdDate: '09 Feb 2026, 11:15 AM', lastUpdated: 'Just now', slaBreached: false, linkedKiosk: 'ATC-SN-9901' },
  { id: 'TKT-2026-00416', hotel: 'Sayaji Hotel', subject: 'Unable to login to admin panel', category: 'Software', priority: 'High', status: 'Open', assignedTo: 'Unassigned', createdDate: '09 Feb 2026, 10:20 AM', lastUpdated: '40m ago', slaBreached: false },
  { id: 'TKT-2026-00417', hotel: 'ITC Maratha', subject: 'Staff training for new kiosk firmware', category: 'General', priority: 'Medium', status: 'Resolved', assignedTo: 'Neha Singh', createdDate: '07 Feb 2026, 02:00 PM', lastUpdated: 'Yesterday', slaBreached: false },
  { id: 'TKT-2026-00418', hotel: 'Sayaji Hotel', subject: 'API endpoint timing out', category: 'Software', priority: 'High', status: 'Open', assignedTo: 'Aditya Sharma', createdDate: '09 Feb 2026, 01:20 PM', lastUpdated: '5m ago', slaBreached: false },
];
