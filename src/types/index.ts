export type Role = 'SECRETARY' | 'ENGINEER' | 'TECH_DIRECTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  created_at?: string;
  bio?: string;
  missions?: string;
  roles_description?: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  address?: string;
  isAccountClient: boolean;
}

export type ProjectStatus = 'NOUVEAU' | 'EN_COURS' | 'TERMINE';
export type BillingType = 'FORFAIT' | 'REGIE';

export interface Project {
  id: string;
  name: string;
  type: string;
  clientId: string;
  status: ProjectStatus;
  billingType: BillingType;
  deadline: string;
  progress: number;
  createdAt: string;
}

export type LotStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface Lot {
  id: string;
  projectId: string;
  name: string;
  deadline: string;
  status: LotStatus;
  engineerIds: string[];
}

export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'A_VALIDER' | 'TERMINE';

export interface Task {
  id: string;
  lotId: string;
  name: string;
  deadline: string;
  status: TaskStatus;
  progress: number;
  engineerIds: string[];
  validatedByDT: boolean;
}

// --- Professional Billing Types ---

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED';
export type ProfessionalInvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface LineItem {
  id: string;
  documentId: string; // Refers to Quote or Invoice ID
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g., 20 for 20%
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'TRANSFER' | 'CHECK' | 'MOBILE_MONEY';
  note?: string;
}

export interface Quote {
  id: string;
  number: string; // ex: DEV-2026-001
  clientId: string;
  projectId?: string;
  status: QuoteStatus;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  notes?: string;
  lineItems?: LineItem[];
}

export interface ProfessionalInvoice {
  id: string;
  number: string; // ex: FAC-2026-001
  clientId: string;
  projectId?: string;
  quoteId?: string; // If converted from a quote
  status: ProfessionalInvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  notes?: string;
  lineItems?: LineItem[];
  payments?: Payment[];
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  email: string;
  phone: string;
  taxId?: string;
}

// Legacy types for compatibility (will be migrated)
export type InvoiceType = 'QUOTE' | 'INVOICE';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  type: InvoiceType;
  number: string;
  clientId: string;
  projectId?: string;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  isAccountClient: boolean;
  installmentsCount?: number;
}

export interface Installment {
  id: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
}

export type AlertColor = 'noir' | 'vert' | 'bleu' | 'orange' | 'jaune' | 'rouge';

export interface Alert {
  id: string;
  type: string;
  message: string;
  colorCode: AlertColor;
  date: string;
  read: boolean;
}
