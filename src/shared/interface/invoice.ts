export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partial"
  | "cancelled";

export interface LineItem {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  linkedExpenseIds: string[];
  totalLinkedExpenses: number;
  profit: number;
  marginPercent: number;
  notes?: string;
  createdAt: string;
}

export interface ZohoLineItem {
  item_order: number;
  item_id?: string;
  rate: string | number;
  name?: string;
  description: string;
  quantity: string;
  discount: string;
  tax_id: string;
  project_id?: string;
  tags: string[];
  account_id?: string;
  item_custom_fields: unknown[];
  unit?: string;
}

export interface CreateInvoicePayload {
  reference_number: string;
  payment_terms: number;
  payment_terms_label: string;
  payment_options: { payment_gateways: string[] };
  customer_id: string;
  contact_persons: string[];
  date: string;
  due_date: string;
  notes: string;
  terms: string;
  is_inclusive_tax: boolean;
  line_items: ZohoLineItem[];
  allow_partial_payments: boolean;
  custom_fields: unknown[];
  is_discount_before_tax: boolean;
  discount: string;
  discount_type: string;
  adjustment: string;
  adjustment_description: string;
  zcrm_potential_id: string;
  zcrm_potential_name: string;
  pricebook_id: string;
  template_id?: string;
  project_id?: string;
  documents: unknown[];
  mail_attachments: unknown[];
  billing_address_id?: string;
  shipping_address_id?: string;
  tax_override_preference: string;
  tds_override_preference: string;
  discount_account_id?: string;
}
