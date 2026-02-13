// Mock data extracted from components/hotel/IncidentsRecord.tsx

export type IncidentCategory = 'Maintenance' | 'Housekeeping' | 'Guest Complaint' | 'Security' | 'IT' | 'Other';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Incident {
  id: string;
  category: IncidentCategory;
  subject: string;
  room: string;
  bookingRef?: string;
  guestName?: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  slaBreached: boolean;
  description: string;
}

export const mockIncidents: Incident[] = [
  { id: 'INC-2026-0089', category: 'Maintenance', subject: 'Bathroom ceiling leak — active water drip', room: '412', guestName: 'Abhishek Sharma', bookingRef: 'BK-0042', priority: 'Critical', status: 'In Progress', reportedBy: 'Riya Mehta', assignedTo: 'Maintenance — Suresh K.', createdAt: '10 Feb, 03:15 PM', updatedAt: '10 Feb, 03:45 PM', slaBreached: false, description: 'Guest reports water leaking from the AC ducting in the bathroom ceiling. Potential pipe burst on Floor 5.' },
  { id: 'INC-2026-0090', category: 'Guest Complaint', subject: 'Room 305: Slow WiFi connectivity', room: '305', guestName: 'Arjun Sharma', bookingRef: 'BK-8821', priority: 'Medium', status: 'Open', reportedBy: 'Front Desk', assignedTo: 'IT Support', createdAt: '10 Feb, 02:20 PM', updatedAt: '10 Feb, 02:20 PM', slaBreached: true, description: 'Guest unable to join video call. Tested speed: 2Mbps. Normal is 50Mbps.' },
  { id: 'INC-2026-0091', category: 'Housekeeping', subject: 'Extra bedding not delivered', room: '102', guestName: 'Meera L.', bookingRef: 'BK-1102', priority: 'Low', status: 'Resolved', reportedBy: 'System', assignedTo: 'Housekeeping Team', createdAt: '10 Feb, 11:30 AM', updatedAt: '10 Feb, 12:15 PM', slaBreached: false, description: 'Automated request for extra pillows and blanket.' },
  { id: 'INC-2026-0092', category: 'Security', subject: 'Unrecognized vehicle in VIP parking', room: 'Lobby', priority: 'High', status: 'Closed', reportedBy: 'Guard 1', assignedTo: 'Security Mgr', createdAt: '10 Feb, 08:45 AM', updatedAt: '10 Feb, 09:30 AM', slaBreached: false, description: 'White SUV blocking the fire exit lane. Vehicle removed after announcement.' },
  { id: 'INC-2026-0093', category: 'Maintenance', subject: 'AC malfunctioning in Room 204', room: '204', guestName: 'Robert Mitchell', bookingRef: 'BK-1102', priority: 'High', status: 'Open', reportedBy: 'Riya Mehta', assignedTo: 'Suresh Kumar', createdAt: '10 Feb, 04:00 PM', updatedAt: '10 Feb, 04:00 PM', slaBreached: false, description: 'AC compressor making heavy noise. Cooling is insufficient.' },
];
