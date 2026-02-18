// Invoice domain entities — pure TypeScript, no framework dependencies

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  invoice_number?: string;
  hotel: string;
  hotel_id?: string;
  hotel_name?: string;
  amount?: number;
  baseAmount?: number;
  gst?: number;
  total?: number;
  period?: string;
  period_start?: string;
  period_end?: string;
  status: 'Paid' | 'Overdue' | 'Pending' | 'Draft' | 'paid' | 'pending' | 'overdue' | 'failed' | string;
  dueDate: string;
  due_date?: string;
  issuedDate?: string; // Optional in entities, required in types?
  generated_on?: string;
  daysOverdue?: number;
  items?: LineItem[];
}

