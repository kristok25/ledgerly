/**
 * A drop-in stand-in for the browser's EventSource (Server-Sent Events).
 *
 * In production the app would call `new EventSource('/api/workspaces/:id/events')`.
 * For this static demo there is no server, so this class implements the same
 * surface (onopen / onmessage / onerror / addEventListener / close / readyState)
 * and pushes realistic billing events on a timer, updating the mock database
 * so the rest of the UI (tables, KPIs) reacts exactly as it would in prod.
 */
import { getDb } from './client'
import { createRng } from './seed'
import type { LiveEvent } from './types'

type Listener = (ev: MessageEvent<string>) => void

export class MockEventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  readonly url: string
  readyState = MockEventSource.CONNECTING
  onopen: ((ev: Event) => void) | null = null
  onmessage: Listener | null = null
  onerror: ((ev: Event) => void) | null = null

  private listeners = new Set<Listener>()
  private timer: ReturnType<typeof setTimeout> | undefined
  private rng = createRng(Date.now())
  private workspaceId: string

  constructor(url: string) {
    this.url = url
    this.workspaceId = url.match(/workspaces\/([^/]+)/)?.[1] ?? 'nordwave'
    setTimeout(() => {
      if (this.readyState === MockEventSource.CLOSED) return
      this.readyState = MockEventSource.OPEN
      this.onopen?.(new Event('open'))
      this.schedule()
    }, 300)
  }

  addEventListener(_type: 'message', listener: Listener) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: 'message', listener: Listener) {
    this.listeners.delete(listener)
  }

  close() {
    this.readyState = MockEventSource.CLOSED
    clearTimeout(this.timer)
  }

  private schedule() {
    this.timer = setTimeout(() => {
      const event = this.generate()
      if (event) this.emit(event)
      if (this.readyState === MockEventSource.OPEN) this.schedule()
    }, this.rng.int(3500, 7000))
  }

  private emit(data: LiveEvent) {
    const ev = new MessageEvent('message', { data: JSON.stringify(data), lastEventId: data.id })
    this.onmessage?.(ev)
    this.listeners.forEach((l) => l(ev))
  }

  private generate(): LiveEvent | null {
    const db = getDb(this.workspaceId)
    const at = new Date().toISOString()
    const id = crypto.randomUUID()
    const roll = this.rng.next()

    const pending = db.invoices.filter((i) => i.status === 'pending')
    if (roll < 0.4 && pending.length > 2) {
      const inv = this.rng.pick(pending)
      inv.status = 'paid'
      return { id, at, type: 'invoice.paid', message: `${inv.customerName} paid ${inv.number}`, amount: inv.total, invoiceId: inv.id }
    }
    if (roll < 0.75) {
      // A teammate created and sent a new invoice — keeps the pipeline realistic
      const customer = this.rng.pick(db.customers)
      const template = this.rng.pick(db.invoices.slice(0, 40))
      const max = Math.max(...db.invoices.map((i) => Number(i.number.slice(-4))))
      const issue = new Date()
      const inv = {
        ...structuredClone(template),
        id: `${this.workspaceId}-inv-live-${id.slice(0, 8)}`,
        number: `INV-${String(issue.getFullYear()).slice(2)}${String(max + 1).padStart(4, '0')}`,
        customerId: customer.id,
        customerName: customer.company,
        status: 'pending' as const,
        issueDate: issue.toISOString(),
        dueDate: new Date(issue.getTime() + 30 * 864e5).toISOString(),
      }
      db.invoices.unshift(inv)
      return { id, at, type: 'invoice.created', message: `${inv.number} sent to ${inv.customerName}`, amount: inv.total, invoiceId: inv.id }
    }
    if (roll < 0.85 && pending.length > 2) {
      const inv = this.rng.pick(pending)
      inv.status = 'overdue'
      return { id, at, type: 'invoice.overdue', message: `${inv.number} from ${inv.customerName} is now overdue`, amount: inv.total, invoiceId: inv.id }
    }
    const customer = this.rng.pick(db.customers)
    return { id, at, type: 'customer.created', message: `${customer.name} from ${customer.company} viewed their invoice portal` }
  }
}
