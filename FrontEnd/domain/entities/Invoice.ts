// Invoice domain entities — pure TypeScript, no framework dependencies

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  hotel: string;
  amount?: number;
  baseAmount?: number;
  gst?: number;
  total?: number;
  period?: string;
  status: 'Paid' | 'Overdue' | 'Pending' | 'Draft' | 'paid' | 'pending' | 'overdue' | 'failed' | string;
  dueDate: string;
  issuedDate?: string;
  daysOverdue?: number;
  items?: LineItem[];
}
