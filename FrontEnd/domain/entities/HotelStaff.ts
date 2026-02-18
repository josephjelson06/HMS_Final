export interface HotelStaffMember {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  dateAdded?: string;
}

export interface HotelRole {
  id?: string;
  name: string;
  desc: string;
  userCount: number;
  color: string;
  status: string;
}
