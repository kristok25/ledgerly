export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft'

export type Currency = 'EUR' | 'USD'

export interface Workspace {
  id: string
  name: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  currency: Currency
  initials: string
  color: string
}

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  country: string
  createdAt: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  customerName: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  items: LineItem[]
  taxRate: number
  notes?: string
  total: number
}

export type Role = 'admin' | 'viewer'

export interface User {
  name: string
  email: string
  role: Role
}

export interface InvoiceQuery {
  search?: string
  status?: InvoiceStatus | 'all'
  sortBy?: keyof Pick<Invoice, 'number' | 'customerName' | 'issueDate' | 'dueDate' | 'total' | 'status'>
  sortDir?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export interface Paginated<T> {
  rows: T[]
  total: number
  pageCount: number
}

export interface DashboardStats {
  revenue: number
  revenueChange: number
  outstanding: number
  outstandingCount: number
  overdue: number
  overdueCount: number
  paidRate: number
  monthly: { month: string; revenue: number; invoiced: number }[]
  byStatus: { status: InvoiceStatus; count: number; amount: number }[]
  topCustomers: { id: string; name: string; amount: number }[]
}

export type LiveEventType = 'invoice.paid' | 'invoice.created' | 'invoice.overdue' | 'customer.created'

export interface LiveEvent {
  id: string
  type: LiveEventType
  at: string
  message: string
  amount?: number
  invoiceId?: string
}

export type NewInvoiceInput = Omit<Invoice, 'id' | 'number' | 'customerName' | 'total'>
