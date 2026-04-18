import { dailySeed, seededRandom } from "../period"

export function mockYTWatchHours(totalViews: number): number {
  return Math.round((totalViews * 3) / 60)
}

export function mockYTAvgViewDuration(): number {
  const rnd = seededRandom(dailySeed())
  return Math.round(110 + rnd() * 90)
}

export function mockYTRetention(): number {
  const rnd = seededRandom(dailySeed() + 1)
  return Math.round(42 + rnd() * 28)
}

export function mockYTTrafficSources() {
  return [
    { source: "YouTube search", percent: 38 },
    { source: "Suggested videos", percent: 28 },
    { source: "Browse features", percent: 18 },
    { source: "External", percent: 10 },
    { source: "Other", percent: 6 },
  ]
}

export function mockYTTopCountries() {
  return [
    { code: "MX", name: "México", percent: 48 },
    { code: "ES", name: "España", percent: 14 },
    { code: "AR", name: "Argentina", percent: 9 },
    { code: "CO", name: "Colombia", percent: 8 },
    { code: "US", name: "Estados Unidos", percent: 7 },
    { code: "CL", name: "Chile", percent: 4 },
    { code: "PE", name: "Perú", percent: 4 },
  ]
}

export function mockYTCTR(): number {
  const rnd = seededRandom(dailySeed() + 2)
  return Math.round((4 + rnd() * 8) * 10) / 10
}
