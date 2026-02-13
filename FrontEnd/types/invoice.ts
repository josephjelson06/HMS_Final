// Invoice domain types

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  hotel: string;
  amount: number;
  status: 'Paid' | 'Overdue' | 'Pending' | 'Draft' | string;
  dueDate: string;
  issuedDate: string;
  items?: LineItem[];
}
