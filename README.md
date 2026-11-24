# Ledgerly — Billing & Invoicing SaaS Dashboard

A production-style SaaS dashboard for managing invoices, customers and cash flow, built to show how I approach real-world frontend work: data-heavy tables, complex forms, real-time updates, multi-tenancy, i18n and accessibility.

**Live demo:** _add your Vercel/Netlify URL here_ · No sign-up needed: pick **Admin** or **Viewer** on the first screen.

<!-- Add a screenshot after deploying: docs/screenshot-dashboard.png -->
<!-- ![Ledgerly dashboard](docs/screenshot-dashboard.png) -->

## Highlights

| Area | What's implemented |
| --- | --- |
| **Data table** | Server-side style filtering, search (debounced), sorting and pagination with TanStack Table · row selection with bulk actions · column visibility · CSV export · table state synced to the URL (shareable, survives refresh) |
| **Server state** | TanStack Query with workspace-scoped query keys, `keepPreviousData` paging, optimistic updates with rollback, cache invalidation |
| **Real-time** | Server-Sent Events: one shared stream per session updates KPIs, tables and an activity feed live, with debounced cache invalidation. `MockEventSource` mirrors the native `EventSource` API, so moving to a real backend is a one-line change |
| **Forms** | Multi-step invoice wizard with React Hook Form + Zod: per-step validation, dynamic line items (`useFieldArray`), cross-field rules (due ≥ issue date), live totals |
| **Multi-tenancy** | Workspace switcher with isolated data, currency and cache per tenant |
| **Permissions** | Admin / Viewer roles with permission-aware UI (disabled actions with explanatory tooltips) |
| **UX details** | ⌘K / Ctrl+K command palette, `G` then `D`/`I`/`C`/`S` keyboard navigation, skeleton loaders, empty and error states with retry, toasts, collapsible sidebar, mobile drawer |
| **Theming & i18n** | Light / dark / system theme (no flash on load) using design tokens · English & German with `Intl` currency and date formatting |
| **Accessibility** | Semantic tables with `aria-sort`, labelled controls, focus-visible styles, skip link, live regions, Radix primitives for dialogs/menus, `prefers-reduced-motion` support |
| **Performance** | Route-level code splitting with `React.lazy`, memoised columns, debounced search, minimal re-renders via Zustand selectors |
| **Demo controls** | Settings page lets you change network latency and simulate API failures to see every loading and error state for real |

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · TanStack Query · TanStack Table · Zustand · React Hook Form · Zod · Radix UI · cmdk · Recharts · i18next · date-fns · Sonner

## Project structure

```
src/
├── api/                 # Mock backend: typed REST client, seed data, SSE event source
├── hooks/               # React Query hooks, event stream, debounce
├── store/               # Zustand app store (session, workspace, theme, locale)
├── lib/                 # i18n, formatting utilities
├── components/
│   ├── ui/              # Design-system primitives (Button, Card, Select, Dialog…)
│   └── layout/          # App shell, sidebar, command palette, workspace switcher
└── features/            # Feature folders: dashboard, invoices, customers, settings, auth
```

The mock API in `src/api/client.ts` behaves like a real backend (async, latency, server-side filtering and pagination, error responses), so components contain **no fake data logic**. Replacing it with real `fetch` calls only touches the `api` object.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
```

## Deploying

The app uses hash routing and relative asset paths, so `dist/` works on any static host:

- **Vercel:** import the repo → framework preset “Vite” → deploy.
- **Netlify:** build command `npm run build`, publish directory `dist`.

---

Built by **Kristo Kallfa**, Frontend Developer (React · TypeScript). Available for freelance work.
