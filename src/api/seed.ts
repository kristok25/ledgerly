import { addDays, subDays, subMonths } from 'date-fns'
import type { Customer, Invoice, InvoiceStatus, LineItem, Workspace } from './types'

export const WORKSPACES: Workspace[] = [
  { id: 'nordwave', name: 'Nordwave Studio', plan: 'Growth', currency: 'EUR', initials: 'NS', color: 'bg-indigo-500' },
  { id: 'brightpath', name: 'Brightpath Labs', plan: 'Enterprise', currency: 'USD', initials: 'BL', color: 'bg-emerald-500' },
  { id: 'atelier', name: 'Atelier Kode', plan: 'Starter', currency: 'EUR', initials: 'AK', color: 'bg-amber-500' },
]

/** Small deterministic PRNG so every visitor sees the same believable data. */
export function createRng(seed: number) {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
  }
}

const FIRST = ['Elena', 'Marco', 'Sofia', 'Lukas', 'Ana', 'Jonas', 'Mira', 'Noah', 'Ilir', 'Clara', 'David', 'Lea', 'Arben', 'Emma', 'Tomas', 'Nora', 'Felix', 'Iva', 'Leon', 'Maya']
const LAST = ['Fischer', 'Rossi', 'Novak', 'Berg', 'Hoxha', 'Meyer', 'Costa', 'Varga', 'Lindqvist', 'Dervishi', 'Moreau', 'Kovač', 'Schmidt', 'Bianchi', 'Weber']
const COMPANIES = ['Quantix', 'Bluepeak', 'Solace Health', 'Verdant Foods', 'Orbital Logistics', 'Kite Analytics', 'Fernhill Legal', 'Harbor & Co', 'Lumen Retail', 'Pinecrest Media', 'Arcadia Travel', 'Northbeam', 'Copperleaf', 'Stratus Energy', 'Mosaic Learning', 'Driftwood Hotels', 'Helix Robotics', 'Saltwater Design', 'Ironbridge', 'Petal & Stem', 'Vantage Realty', 'Clearwater Labs', 'Granite Systems', 'Tessera Finance']
const COUNTRIES = ['Germany', 'Italy', 'Albania', 'Netherlands', 'Austria', 'France', 'Sweden', 'United States', 'United Kingdom', 'Spain']
const SERVICES = [
  ['Frontend development', 65, 95],
  ['UI/UX audit', 400, 1200],
  ['Monthly maintenance retainer', 800, 2400],
  ['Dashboard module', 1500, 5000],
  ['API integration', 900, 3000],
  ['Performance optimization', 600, 2200],
  ['Design system components', 1200, 4000],
  ['Hosting & monitoring', 120, 480],
  ['Code review session', 150, 450],
] as const

export function calcTotal(items: LineItem[], taxRate: number) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  return Math.round(subtotal * (1 + taxRate / 100) * 100) / 100
}

export function seedWorkspace(ws: Workspace, index: number) {
  const rng = createRng(1337 + index * 101)
  const today = new Date()

  const customerCount = 18 + index * 6
  const customers: Customer[] = Array.from({ length: customerCount }, (_, i) => {
    const first = rng.pick(FIRST)
    const last = rng.pick(LAST)
    const company = COMPANIES[(i + index * 5) % COMPANIES.length]
    return {
      id: `${ws.id}-cus-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first}.${last}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`.toLowerCase(),
      company,
      country: rng.pick(COUNTRIES),
      createdAt: subDays(today, rng.int(30, 420)).toISOString(),
    }
  })

  const invoiceCount = 140 + index * 60
  const invoices: Invoice[] = Array.from({ length: invoiceCount }, (_, i) => {
    const customer = rng.pick(customers)
    const issue = subDays(today, Math.floor((i / invoiceCount) * 355) + 1)
    // Business grows over the year: newer invoices are ~60% larger than a year ago
    const growth = 1.25 - (i / invoiceCount) * 0.5
    const due = addDays(issue, rng.pick([14, 30, 30, 45]))
    const items: LineItem[] = Array.from({ length: rng.int(1, 4) }, (_, j) => {
      const [description, min, max] = rng.pick(SERVICES)
      const hourly = description === 'Frontend development'
      return {
        id: `li-${i}-${j}`,
        description,
        quantity: hourly ? rng.int(8, 60) : rng.int(1, 3),
        unitPrice: hourly ? rng.int(min, max) : Math.round((rng.int(min, max) * growth) / 10) * 10,
      }
    })
    let status: InvoiceStatus
    if (due < today) status = rng.next() < 0.93 ? 'paid' : 'overdue'
    else status = rng.next() < 0.1 ? 'draft' : rng.next() < 0.35 ? 'paid' : 'pending'
    const taxRate = rng.pick([0, 20, 20, 19])
    return {
      id: `${ws.id}-inv-${i + 1}`,
      number: `INV-${String(issue.getFullYear()).slice(2)}${String(1000 + (invoiceCount - i)).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.company,
      status,
      issueDate: issue.toISOString(),
      dueDate: due.toISOString(),
      items,
      taxRate,
      total: calcTotal(items, taxRate),
    }
  })

  return { customers, invoices }
}

export const MONTHS_BACK = 12
export const monthStarts = () =>
  Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = subMonths(new Date(), MONTHS_BACK - 1 - i)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
