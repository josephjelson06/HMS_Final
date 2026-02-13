// Mock data extracted from components/Invoices.tsx

export interface Invoice {
  id: string;
  hotel: string;
  period: string;
  baseAmount: number;
  gst: number;
  total: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  daysOverdue?: number;
}

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'ATC-INV-2026-02-0047', hotel: 'Royal Orchid Bangalore', period: '01 Feb – 28 Feb 2026', baseAmount: 12711.86, gst: 2288.14, total: 15000, dueDate: '2026-03-05', status: 'paid' },
  { id: 'ATC-INV-2026-02-0048', hotel: 'Lemon Tree Premier', period: '01 Feb – 28 Feb 2026', baseAmount: 21186.44, gst: 3813.56, total: 25000, dueDate: '2026-03-05', status: 'overdue', daysOverdue: 12 },
  { id: 'ATC-INV-2026-02-0049', hotel: 'Ginger Hotel, Panjim', period: '01 Feb – 28 Feb 2026', baseAmount: 7203.39, gst: 1296.61, total: 8500, dueDate: '2026-03-10', status: 'pending' },
  { id: 'ATC-INV-2026-02-0050', hotel: 'Taj Palace', period: '01 Feb – 28 Feb 2026', baseAmount: 38135.59, gst: 6864.41, total: 45000, dueDate: '2026-03-05', status: 'failed' },
  { id: 'ATC-INV-2026-02-0051', hotel: 'ITC Maratha', period: '01 Feb – 28 Feb 2026', baseAmount: 15254.24, gst: 2745.76, total: 18000, dueDate: '2026-03-05', status: 'paid' },
  { id: 'ATC-INV-2026-01-0992', hotel: 'Sayaji Hotel', period: '01 Jan – 31 Jan 2026', baseAmount: 10169.49, gst: 1830.51, total: 12000, dueDate: '2026-02-05', status: 'overdue', daysOverdue: 38 },
];
