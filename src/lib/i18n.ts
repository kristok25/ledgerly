import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  nav: { dashboard: 'Dashboard', invoices: 'Invoices', customers: 'Customers', settings: 'Settings', signOut: 'Sign out', collapse: 'Collapse' },
  common: {
    search: 'Search…', all: 'All', cancel: 'Cancel', save: 'Save', next: 'Next', back: 'Back', retry: 'Retry',
    rowsPerPage: 'Rows per page', pageOf: 'Page {{page}} of {{count}}', results: '{{count}} results',
    selected: '{{count}} selected', viewOnly: 'View-only role — switch to Admin to make changes', commandHint: 'Search or jump to…',
    live: 'Live', paused: 'Paused', columns: 'Columns', clear: 'Clear', export: 'Export CSV',
  },
  status: { paid: 'Paid', pending: 'Pending', overdue: 'Overdue', draft: 'Draft' },
  dashboard: {
    title: 'Overview', subtitle: 'Billing performance for {{workspace}} over the last 12 months',
    revenue: 'Revenue (12 mo)', outstanding: 'Outstanding', overdue: 'Overdue', paidRate: 'Collection rate',
    vsLastMonth: 'invoiced vs prior month', invoices_one: '{{count}} invoice', invoices_other: '{{count}} invoices',
    revenueChart: 'Revenue vs invoiced', statusChart: 'Invoices by status', topCustomers: 'Top customers',
    liveActivity: 'Live activity', waiting: 'Waiting for events…', collected: 'Collected', invoiced: 'Invoiced',
  },
  invoices: {
    title: 'Invoices', subtitle: 'Create, track and manage every invoice in one place', new: 'New invoice',
    number: 'Invoice', customer: 'Customer', issued: 'Issued', due: 'Due', amount: 'Amount', status: 'Status',
    markPaid: 'Mark as paid', delete: 'Delete', empty: 'No invoices match your filters', emptyHint: 'Try a different search or status filter.',
    deleted_one: 'Deleted {{count}} invoice', deleted_other: 'Deleted {{count}} invoices',
    markedPaid_one: 'Marked {{count}} invoice as paid', markedPaid_other: 'Marked {{count}} invoices as paid',
    confirmDelete: 'Delete {{count}} invoice(s)? This cannot be undone.', created: 'Invoice {{number}} created',
    details: 'Invoice details', items: 'Line items', subtotal: 'Subtotal', tax: 'Tax ({{rate}}%)', total: 'Total',
  },
  form: {
    stepCustomer: 'Customer & dates', stepItems: 'Line items', stepReview: 'Review',
    customer: 'Customer', selectCustomer: 'Select a customer', issueDate: 'Issue date', dueDate: 'Due date',
    taxRate: 'Tax rate', notes: 'Notes (optional)', description: 'Description', qty: 'Qty', price: 'Unit price',
    addItem: 'Add line item', saveDraft: 'Save as draft', send: 'Create & send',
  },
  customers: { title: 'Customers', subtitle: 'Everyone you bill, with lifetime value and open balance', company: 'Company', contact: 'Contact', country: 'Country', invoices: 'Invoices', ltv: 'Lifetime value', open: 'Open balance' },
  settings: {
    title: 'Settings', subtitle: 'Personalise the workspace and try out the demo controls',
    appearance: 'Appearance', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System', language: 'Language',
    demo: 'Demo controls', demoHint: 'Simulate real-world network conditions to see loading and error states.',
    latency: 'Network latency', failures: 'Simulated failure rate', live: 'Real-time updates (SSE)',
    liveHint: 'Stream invoice events and update the UI without refreshing.', role: 'Your role',
  },
  login: {
    title: 'Welcome to Ledgerly', subtitle: 'A demo billing dashboard. Pick a role to explore — no account needed.',
    admin: 'Admin', adminHint: 'Full access: create, edit and delete invoices', viewer: 'Viewer', viewerHint: 'Read-only access with permission-aware UI',
    continue: 'Continue as {{role}}',
  },
}

type Dict = typeof en

const de: Dict = {
  nav: { dashboard: 'Übersicht', invoices: 'Rechnungen', customers: 'Kunden', settings: 'Einstellungen', signOut: 'Abmelden', collapse: 'Einklappen' },
  common: {
    search: 'Suchen…', all: 'Alle', cancel: 'Abbrechen', save: 'Speichern', next: 'Weiter', back: 'Zurück', retry: 'Erneut versuchen',
    rowsPerPage: 'Zeilen pro Seite', pageOf: 'Seite {{page}} von {{count}}', results: '{{count}} Ergebnisse',
    selected: '{{count}} ausgewählt', viewOnly: 'Nur-Lesen-Rolle — wechseln Sie zu Admin, um Änderungen vorzunehmen', commandHint: 'Suchen oder springen zu…',
    live: 'Live', paused: 'Pausiert', columns: 'Spalten', clear: 'Zurücksetzen', export: 'CSV exportieren',
  },
  status: { paid: 'Bezahlt', pending: 'Offen', overdue: 'Überfällig', draft: 'Entwurf' },
  dashboard: {
    title: 'Übersicht', subtitle: 'Abrechnungsleistung von {{workspace}} in den letzten 12 Monaten',
    revenue: 'Umsatz (12 Mon.)', outstanding: 'Ausstehend', overdue: 'Überfällig', paidRate: 'Zahlungsquote',
    vsLastMonth: 'fakturiert ggü. Vormonat', invoices_one: '{{count}} Rechnung', invoices_other: '{{count}} Rechnungen',
    revenueChart: 'Umsatz vs. fakturiert', statusChart: 'Rechnungen nach Status', topCustomers: 'Top-Kunden',
    liveActivity: 'Live-Aktivität', waiting: 'Warte auf Ereignisse…', collected: 'Eingenommen', invoiced: 'Fakturiert',
  },
  invoices: {
    title: 'Rechnungen', subtitle: 'Alle Rechnungen erstellen, verfolgen und verwalten', new: 'Neue Rechnung',
    number: 'Rechnung', customer: 'Kunde', issued: 'Ausgestellt', due: 'Fällig', amount: 'Betrag', status: 'Status',
    markPaid: 'Als bezahlt markieren', delete: 'Löschen', empty: 'Keine Rechnungen gefunden', emptyHint: 'Versuchen Sie eine andere Suche oder einen anderen Filter.',
    deleted_one: '{{count}} Rechnung gelöscht', deleted_other: '{{count}} Rechnungen gelöscht',
    markedPaid_one: '{{count}} Rechnung als bezahlt markiert', markedPaid_other: '{{count}} Rechnungen als bezahlt markiert',
    confirmDelete: '{{count}} Rechnung(en) löschen? Dies kann nicht rückgängig gemacht werden.', created: 'Rechnung {{number}} erstellt',
    details: 'Rechnungsdetails', items: 'Positionen', subtotal: 'Zwischensumme', tax: 'MwSt. ({{rate}} %)', total: 'Gesamt',
  },
  form: {
    stepCustomer: 'Kunde & Daten', stepItems: 'Positionen', stepReview: 'Prüfen',
    customer: 'Kunde', selectCustomer: 'Kunden auswählen', issueDate: 'Rechnungsdatum', dueDate: 'Fälligkeitsdatum',
    taxRate: 'Steuersatz', notes: 'Notizen (optional)', description: 'Beschreibung', qty: 'Menge', price: 'Einzelpreis',
    addItem: 'Position hinzufügen', saveDraft: 'Als Entwurf speichern', send: 'Erstellen & senden',
  },
  customers: { title: 'Kunden', subtitle: 'Alle Kunden mit Lifetime Value und offenem Saldo', company: 'Firma', contact: 'Kontakt', country: 'Land', invoices: 'Rechnungen', ltv: 'Lifetime Value', open: 'Offener Saldo' },
  settings: {
    title: 'Einstellungen', subtitle: 'Arbeitsbereich anpassen und Demo-Steuerung ausprobieren',
    appearance: 'Darstellung', theme: 'Design', light: 'Hell', dark: 'Dunkel', system: 'System', language: 'Sprache',
    demo: 'Demo-Steuerung', demoHint: 'Simulieren Sie reale Netzwerkbedingungen, um Lade- und Fehlerzustände zu sehen.',
    latency: 'Netzwerklatenz', failures: 'Simulierte Fehlerrate', live: 'Echtzeit-Updates (SSE)',
    liveHint: 'Rechnungsereignisse streamen und die UI ohne Neuladen aktualisieren.', role: 'Ihre Rolle',
  },
  login: {
    title: 'Willkommen bei Ledgerly', subtitle: 'Ein Demo-Abrechnungs-Dashboard. Wählen Sie eine Rolle — kein Konto nötig.',
    admin: 'Admin', adminHint: 'Voller Zugriff: Rechnungen erstellen, bearbeiten und löschen', viewer: 'Betrachter', viewerHint: 'Nur-Lese-Zugriff mit rollenbasierter UI',
    continue: 'Weiter als {{role}}',
  },
}

const stored = (() => {
  try {
    return JSON.parse(localStorage.getItem('ledgerly-app') ?? '{}').state?.locale as string | undefined
  } catch {
    return undefined
  }
})()

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, de: { translation: de } },
  lng: stored ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
