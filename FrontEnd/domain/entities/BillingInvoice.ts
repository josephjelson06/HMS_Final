export type BillingInvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Void';

// Backward-compat alias used by presentation layer
export type InvoiceStatus = BillingInvoiceStatus;

export interface BillingInvoice {
  id: string;
  guestName: string;
  companyName?: string;
  companyGstin?: string;
  room: string;
  checkOutDate: string;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: BillingInvoiceStatus;
  bookingRef: string;
  rateAudited?: boolean;
}
