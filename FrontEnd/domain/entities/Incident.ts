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
