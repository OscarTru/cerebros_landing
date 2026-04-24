import { dailySeed, seededRandom } from "../period"

export function mockDemographicsAge() {
  return [
    { bucket: "13-17", percent: 4 },
    { bucket: "18-24", percent: 26 },
    { bucket: "25-34", percent: 42 },
    { bucket: "35-44", percent: 18 },
    { bucket: "45-54", percent: 7 },
    { bucket: "55+", percent: 3 },
  ]
}

export function mockDemographicsGender() {
  return [
    { label: "Mujer", percent: 68 },
    { label: "Hombre", percent: 30 },
    { label: "Otro", percent: 2 },
  ]
}

export function mockTopCities() {
  return [
    { name: "Ciudad de México, MX", percent: 18 },
    { name: "Guadalajara, MX", percent: 11 },
    { name: "Monterrey, MX", percent: 8 },
    { name: "Madrid, ES", percent: 6 },
    { name: "Buenos Aires, AR", percent: 5 },
    { name: "Bogotá, CO", percent: 4 },
    { name: "Barcelona, ES", percent: 4 },
    { name: "Lima, PE", percent: 3 },
    { name: "Santiago, CL", percent: 3 },
    { name: "Miami, US", percent: 3 },
  ]
}

export function mockBestPostingHours(): Array<{ day: number; hour: number; score: number }> {
  const rnd = seededRandom(dailySeed())
  const out: Array<{ day: number; hour: number; score: number }> = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let score = rnd() * 0.25
      if (hour >= 19 && hour <= 22) score += 0.5 + rnd() * 0.3
      if (hour >= 8 && hour <= 10) score += 0.25
      if (day === 5 || day === 6) score += 0.1
      out.push({ day, hour, score: Math.min(1, score) })
    }
  }
  return out
}

export function mockStoriesPerformance() {
  const rnd = seededRandom(dailySeed())
  return {
    avgViews: Math.round(15_000 + rnd() * 25_000),
    completionRate: Math.round(58 + rnd() * 18),
    replies: Math.round(20 + rnd() * 80),
  }
}
