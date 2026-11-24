import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Currency } from '@/api/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LOCALE_TAGS = { en: 'en-GB', de: 'de-DE' } as const

export function formatMoney(value: number, currency: Currency, locale: 'en' | 'de' = 'en', compact = false) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value)
}

export function formatDate(iso: string, locale: 'en' | 'de' = 'en') {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function formatPercent(value: number, locale: 'en' | 'de' = 'en', signed = false) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    maximumFractionDigits: 1,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(value) + '%'
}
