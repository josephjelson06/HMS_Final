export interface ApiKioskDTO {
  id?: string;
  serial_number: string;
  location: string;
  hotel_id?: string | null;
}

export interface ApiHotelDTO {
  id: string;
  name: string;
  gstin?: string | null;
  owner?: string | null;
  email?: string | null;
  mobile?: string | null;
  pan?: string | null;
  legal_name?: string | null;
  logo?: string | null;
  plan?: string | null;
  kiosks: number;
  status: string;
  mrr: number;
  address?: string | null;
  kiosk_list?: ApiKioskDTO[] | null;
}

export interface ApiPlanDTO {
  id: string;
  name?: string | null;
  price?: number | null;
  rooms?: number | null;
  kiosks?: number | null;
  support?: string | null;
  included?: string[] | null;
  theme?: string | null;
  max_roles?: number | null;
  max_users?: number | null;
  is_archived?: boolean | null;
  subscribers?: number | null;
}

export interface ApiUserDTO {
  id: string;
  email: string;
  name?: string | null;
  employee_id?: string | null;
  tenant_id?: string | null;
  hotel_id?: string | null;
  role?: string | null;
  user_type?: string | null;
  avatar?: string | null;
  status?: string | null;
  date_added?: string | null;
  mobile?: string | null;
  department?: string | null;
  last_login?: string | null;
}

export interface ApiRoleDTO {
  id: string;
  name: string;
  description?: string | null;
  desc?: string | null;
  color?: string | null;
  status?: string | null;
  userCount?: number | null;
}

export interface ApiPermissionDTO {
  id: string;
  permission_key: string;
  description?: string | null;
}

export interface ApiRolePermissionsDTO {
  role_id: string;
  role_name: string;
  permissions: string[];
}

export interface ApiBuildingDTO {
  id: number;
  name: string;
  hotel_id?: string | null;
  tenant_id?: string | null;
}

export interface ApiRoomCategoryDTO {
  id: string;
  name: string;
  rate?: number | null;
  occupancy?: number | null;
  amenities?: string[] | null;
  hotel_id?: string | null;
  tenant_id?: string | null;
}

export interface ApiRoomDTO {
  id: string;
  floor: number;
  status: string;
  type: string;
  building_id: number;
  category_id: string;
  hotel_id?: string | null;
  tenant_id?: string | null;
  building?: string | null;
  category?: string | null;
}

export interface ApiSubscriptionDTO {
  id: string;
  hotel_id: string;
  hotel: string;
  plan: string;
  startDate?: string | null;
  renewalDate?: string | null;
  status: string;
  autoRenew: boolean;
  price: number;
}

export interface ApiSubscriptionUpdateDTO {
  plan?: string;
  is_auto_renew?: boolean;
  subscription_end_date?: string;
  mrr?: number;
  invoice_amount?: number;
  invoice_status?: string;
}

export interface ApiInvoiceDTO {
  id: string;
  hotel_id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  generated_on?: string | null;
  due_date: string;
  hotel_name?: string | null;
  invoice_number?: string | null;
}

export interface ApiSettingsDTO {
  id?: string;
  name: string;
  owner?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  email?: string | null;
  mobile?: string | null;
  legal_name?: string | null;
  logo?: string | null;
  plan?: string | null;
  kiosks?: number | null;
  status?: string | null;
  mrr?: number | null;
}
