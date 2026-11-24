import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { TooltipProvider } from '@/components/ui/overlays'
import { Skeleton } from '@/components/ui/primitives'
import { useAppStore } from '@/store/app'
import LoginPage from '@/features/auth/LoginPage'

// Route-level code splitting: each page ships as its own chunk
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const InvoicesPage = lazy(() => import('@/features/invoices/InvoicesPage'))
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
})

function PageFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="mt-4 h-80 w-full" />
    </div>
  )
}

const page = (el: React.ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>

function RequireAuth() {
  const user = useAppStore((s) => s.user)
  return user ? <AppShell /> : <LoginPage />
}

// Hash routing keeps the demo working on any static host with zero server config
const router = createHashRouter([
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: page(<DashboardPage />) },
      { path: 'invoices', element: page(<InvoicesPage />) },
      { path: 'customers', element: page(<CustomersPage />) },
      { path: 'settings', element: page(<SettingsPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

function ThemedToaster() {
  const theme = useAppStore((s) => s.theme)
  return <Toaster theme={theme} position="bottom-right" richColors closeButton />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <ThemedToaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
