/**
 * Mock REST API.
 *
 * Behaves like a real backend from the UI's point of view: async, with network
 * latency, server-side filtering/sorting/pagination and optional failures —
 * so loading, error and empty states are all real, not faked in components.
 */
import { format } from 'date-fns'
import { WORKSPACES, calcTotal, monthStarts, seedWorkspace } from './seed'
import type {
  Customer,
  DashboardStats,
  Invoice,
  InvoiceQuery,
  InvoiceStatus,
  NewInvoiceInput,
  Paginated,
} from './types'

interface Db {
  customers: Customer[]
  invoices: Invoice[]
}

const dbs = new Map<string, Db>()

export function getDb(workspaceId: string): Db {
  let db = dbs.get(workspaceId)
  if (!db) {
    const index = WORKSPACES.findIndex((w) => w.id === workspaceId)
    const ws = WORKSPACES[Math.max(0, index)]
    db = seedWorkspace(ws, Math.max(0, index))
    dbs.set(workspaceId, db)
  }
  return db
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const networkConfig = {
  latency: 450,
  failureRate: 0,
}

async function request<T>(fn: () => T): Promise<T> {
  const jitter = Math.random() * networkConfig.latency * 0.6
  await new Promise((r) => setTimeout(r, networkConfig.latency * 0.7 + jitter))
  if (Math.random() < networkConfig.failureRate) {
    throw new ApiError('The server could not be reached. Please try again.', 503)
  }
  // Return copies so callers can never mutate the "server" state by accident
  return structuredClone(fn())
}

const sumBy = <T,>(arr: T[], fn: (x: T) => number) => arr.reduce((s, x) => s + fn(x), 0)

export const api = {
  listInvoices(workspaceId: string, q: InvoiceQuery): Promise<Paginated<Invoice>> {
    return request(() => {
      const { invoices } = getDb(workspaceId)
      const search = q.search?.trim().toLowerCase()
      let rows = invoices.filter((inv) => {
        if (q.status && q.status !== 'all' && inv.status !== q.status) return false
        if (search && !`${inv.number} ${inv.customerName}`.toLowerCase().includes(search)) return false
        return true
      })
      const key = q.sortBy ?? 'issueDate'
      const dir = q.sortDir === 'asc' ? 1 : -1
      rows = [...rows].sort((a, b) => {
        const av = a[key]
        const bv = b[key]
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av).localeCompare(String(bv)) * dir
      })
      const start = q.page * q.pageSize
      return {
        rows: rows.slice(start, start + q.pageSize),
        total: rows.length,
        pageCount: Math.max(1, Math.ceil(rows.length / q.pageSize)),
      }
    })
  },

  getInvoice(workspaceId: string, id: string): Promise<Invoice> {
    return request(() => {
      const inv = getDb(workspaceId).invoices.find((i) => i.id === id)
      if (!inv) throw new ApiError('Invoice not found', 404)
      return inv
    })
  },

  createInvoice(workspaceId: string, input: NewInvoiceInput): Promise<Invoice> {
    return request(() => {
      const db = getDb(workspaceId)
      const customer = db.customers.find((c) => c.id === input.customerId)
      if (!customer) throw new ApiError('Customer not found', 422)
      const year = String(new Date().getFullYear()).slice(2)
      const max = Math.max(...db.invoices.map((i) => Number(i.number.slice(-4))))
      const invoice: Invoice = {
        ...input,
        id: `${workspaceId}-inv-${crypto.randomUUID().slice(0, 8)}`,
        number: `INV-${year}${String(max + 1).padStart(4, '0')}`,
        customerName: customer.company,
        total: calcTotal(input.items, input.taxRate),
      }
      db.invoices.unshift(invoice)
      return invoice
    })
  },

  updateInvoiceStatus(workspaceId: string, ids: string[], status: InvoiceStatus): Promise<{ updated: number }> {
    return request(() => {
      const db = getDb(workspaceId)
      let updated = 0
      for (const inv of db.invoices) {
        if (ids.includes(inv.id)) {
          inv.status = status
          updated++
        }
      }
      return { updated }
    })
  },

  deleteInvoices(workspaceId: string, ids: string[]): Promise<{ deleted: number }> {
    return request(() => {
      const db = getDb(workspaceId)
      const before = db.invoices.length
      db.invoices = db.invoices.filter((i) => !ids.includes(i.id))
      return { deleted: before - db.invoices.length }
    })
  },

  listCustomers(workspaceId: string): Promise<(Customer & { invoiceCount: number; lifetimeValue: number; outstanding: number })[]> {
    return request(() => {
      const { customers, invoices } = getDb(workspaceId)
      return customers.map((c) => {
        const own = invoices.filter((i) => i.customerId === c.id)
        return {
          ...c,
          invoiceCount: own.length,
          lifetimeValue: sumBy(own.filter((i) => i.status === 'paid'), (i) => i.total),
          outstanding: sumBy(own.filter((i) => i.status === 'pending' || i.status === 'overdue'), (i) => i.total),
        }
      })
    })
  },

  getDashboard(workspaceId: string): Promise<DashboardStats> {
    return request(() => {
      const { invoices } = getDb(workspaceId)
      const months = monthStarts()
      const monthly = months.map((start, idx) => {
        const end = months[idx + 1] ?? new Date(8640000000000000)
        const inMonth = invoices.filter((i) => {
          const d = new Date(i.issueDate)
          return d >= start && d < end
        })
        return {
          month: format(start, 'MMM'),
          revenue: Math.round(sumBy(inMonth.filter((i) => i.status === 'paid'), (i) => i.total)),
          invoiced: Math.round(sumBy(inMonth.filter((i) => i.status !== 'draft'), (i) => i.total)),
        }
      })
      // Compare the last two *complete* months — the current month is still in progress
      const last = monthly.at(-2)!.invoiced
      const prev = monthly.at(-3)!.invoiced || 1
      const pending = invoices.filter((i) => i.status === 'pending')
      const overdue = invoices.filter((i) => i.status === 'overdue')
      const issued = invoices.filter((i) => i.status !== 'draft')
      const statuses: InvoiceStatus[] = ['paid', 'pending', 'overdue', 'draft']

      const byCustomer = new Map<string, { id: string; name: string; amount: number }>()
      for (const i of invoices) {
        if (i.status !== 'paid') continue
        const entry = byCustomer.get(i.customerId) ?? { id: i.customerId, name: i.customerName, amount: 0 }
        entry.amount += i.total
        byCustomer.set(i.customerId, entry)
      }

      return {
        revenue: sumBy(invoices.filter((i) => i.status === 'paid'), (i) => i.total),
        revenueChange: ((last - prev) / prev) * 100,
        outstanding: sumBy([...pending, ...overdue], (i) => i.total),
        outstandingCount: pending.length + overdue.length,
        overdue: sumBy(overdue, (i) => i.total),
        overdueCount: overdue.length,
        paidRate: issued.length ? (issued.filter((i) => i.status === 'paid').length / issued.length) * 100 : 0,
        monthly,
        byStatus: statuses.map((status) => {
          const list = invoices.filter((i) => i.status === status)
          return { status, count: list.length, amount: sumBy(list, (i) => i.total) }
        }),
        topCustomers: [...byCustomer.values()].sort((a, b) => b.amount - a.amount).slice(0, 5),
      }
    })
  },
}
