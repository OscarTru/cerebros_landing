import type { Period } from "./types"

export function periodToDays(period: Period): number {
  switch (period) {
    case "7d": return 7
    case "30d": return 30
    case "90d": return 90
    case "all": return 365 * 5
  }
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "7d": return "Últimos 7 días"
    case "30d": return "Últimos 30 días"
    case "90d": return "Últimos 90 días"
    case "all": return "Todo el tiempo"
  }
}

export function isValidPeriod(v: unknown): v is Period {
  return v === "7d" || v === "30d" || v === "90d" || v === "all"
}

export function parsePeriod(v: string | undefined): Period {
  return isValidPeriod(v) ? v : "30d"
}

export function getDateRange(period: Period): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - periodToDays(period))
  return { start, end }
}

export function formatChartDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
}

export function dailySeed(): number {
  const today = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function seededRandom(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
