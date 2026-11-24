import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { WORKSPACES } from '@/api/seed'
import type { User } from '@/api/types'

export type Theme = 'light' | 'dark' | 'system'
export type Locale = 'en' | 'de'

interface AppState {
  user: User | null
  workspaceId: string
  theme: Theme
  locale: Locale
  sidebarCollapsed: boolean
  liveUpdates: boolean
  signIn: (user: User) => void
  signOut: () => void
  setWorkspace: (id: string) => void
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
  toggleSidebar: () => void
  setLiveUpdates: (on: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      workspaceId: WORKSPACES[0].id,
      theme: 'system',
      locale: 'en',
      sidebarCollapsed: false,
      liveUpdates: true,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      setWorkspace: (workspaceId) => set({ workspaceId }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setLiveUpdates: (liveUpdates) => set({ liveUpdates }),
    }),
    {
      name: 'ledgerly-app',
      // Storage can be unavailable (private mode, sandboxed iframes) — never let that crash the app
      storage: createJSONStorage(() => ({
        getItem: (k) => { try { return localStorage.getItem(k) } catch { return null } },
        setItem: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } },
        removeItem: (k) => { try { localStorage.removeItem(k) } catch { /* ignore */ } },
      })),
    },
  ),
)

export const useWorkspace = () => {
  const id = useAppStore((s) => s.workspaceId)
  return WORKSPACES.find((w) => w.id === id) ?? WORKSPACES[0]
}

export const useCan = () => {
  const role = useAppStore((s) => s.user?.role)
  return { edit: role === 'admin' }
}
