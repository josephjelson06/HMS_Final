export interface ApiTenantDTO {
  id: string;
  hotel_name: string;
  address?: string | null;
  plan_id?: string | null;
  owner_user_id?: string | null;
  gstin?: string | null;
  pan?: string | null;
  status?: string | null;
  image_url_1?: string | null;
  image_url_2?: string | null;
  image_url_3?: string | null;
}

export interface ApiPlanDTO {
  id: string;
  name: string;
  price: number;
  period_months?: number;
  max_users?: number;
  max_roles?: number;
  max_rooms?: number;
}

export interface ApiPermissionDTO {
  id: string;
  key: string;
  description?: string | null;
}

export interface ApiRoleDTO {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  color?: string | null;
  permissions?: string[];
}

export interface ApiUserDTO {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  mobile?: string | null;
  role?: ApiRoleDTO | null; // Nested object now
  tenant_id?: string | null;
  status?: string | null;
  last_login?: string | null;
  avatar?: string | null;
  date_added?: string | null;
  is_admin?: boolean;
}

export interface ApiSubscriptionDTO {
  id: string;
  tenant_id: string;
  plan_id?: string;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

// Support DTOs
export interface ApiMessageDTO {
  id: string;
  ticket_id: string;
  sender_id?: string | null;
  message: string;
  created_at?: string | null;
  is_internal: boolean;
}

export interface ApiTicketDTO {
  id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  created_at?: string | null;
  messages?: ApiMessageDTO[];
}
