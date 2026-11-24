import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Invoice, InvoiceQuery, InvoiceStatus, NewInvoiceInput, Paginated } from '@/api/types'
import { useAppStore } from '@/store/app'

/** Query keys are scoped by workspace, so switching tenants never shows stale data. */
export const keys = {
  all: (ws: string) => ['ws', ws] as const,
  invoices: (ws: string, q?: InvoiceQuery) => [...keys.all(ws), 'invoices', q ?? {}] as const,
  invoice: (ws: string, id: string) => [...keys.all(ws), 'invoice', id] as const,
  customers: (ws: string) => [...keys.all(ws), 'customers'] as const,
  dashboard: (ws: string) => [...keys.all(ws), 'dashboard'] as const,
}

const useWs = () => useAppStore((s) => s.workspaceId)

export function useInvoices(q: InvoiceQuery) {
  const ws = useWs()
  return useQuery({
    queryKey: keys.invoices(ws, q),
    queryFn: () => api.listInvoices(ws, q),
    placeholderData: keepPreviousData,
  })
}

export function useInvoice(id: string | null) {
  const ws = useWs()
  return useQuery({
    queryKey: keys.invoice(ws, id ?? ''),
    queryFn: () => api.getInvoice(ws, id!),
    enabled: !!id,
  })
}

export function useCustomers() {
  const ws = useWs()
  return useQuery({ queryKey: keys.customers(ws), queryFn: () => api.listCustomers(ws) })
}

export function useDashboard() {
  const ws = useWs()
  return useQuery({ queryKey: keys.dashboard(ws), queryFn: () => api.getDashboard(ws) })
}

export function useCreateInvoice() {
  const ws = useWs()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewInvoiceInput) => api.createInvoice(ws, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all(ws) }),
  })
}

/** Optimistic status update: the table changes instantly and rolls back if the request fails. */
export function useUpdateStatus() {
  const ws = useWs()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: InvoiceStatus }) => api.updateInvoiceStatus(ws, ids, status),
    onMutate: async ({ ids, status }) => {
      const prefix = [...keys.all(ws), 'invoices']
      await qc.cancelQueries({ queryKey: prefix })
      const snapshot = qc.getQueriesData<Paginated<Invoice>>({ queryKey: prefix })
      qc.setQueriesData<Paginated<Invoice>>({ queryKey: prefix }, (old) =>
        old ? { ...old, rows: old.rows.map((r) => (ids.includes(r.id) ? { ...r, status } : r)) } : old,
      )
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.all(ws) }),
  })
}

export function useDeleteInvoices() {
  const ws = useWs()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.deleteInvoices(ws, ids),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.all(ws) }),
  })
}
