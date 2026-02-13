export interface HotelStaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  dateAdded: string;
}

export interface HotelRole {
  name: string;
  desc: string;
  userCount: number;
  color: string;
  status: string;
}
