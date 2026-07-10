import prisma from "@/lib/prisma"
import type { HistoryData, HistoryRecord } from "@/types/weather"

const HISTORY_SOURCE_URL =
  process.env.WEATHER_HISTORY_SOURCE_URL?.trim() ||
  "https://www.mulhouse68.fr/api/weather/history?location=Mulhouse"

function normalizeRecord(raw: Record<string, unknown>): HistoryRecord {
  return {
    year: Number(raw.year),
    tempMax: Number(raw.tempMax),
    tempMin: Number(raw.tempMin),
    weatherCode: Number(raw.weatherCode),
  }
}

function normalizeHistoryData(raw: Record<string, unknown>): HistoryData {
  const timeline = Array.isArray(raw.timeline)
    ? raw.timeline.map((item) => normalizeRecord(item as Record<string, unknown>))
    : []

  const records = (raw.records as Record<string, unknown>) || {}
  const averages = (raw.averages as Record<string, unknown>) || {}

  return {
    location: String(raw.location || "Mulhouse"),
    day: String(raw.day || ""),
    records: {
      highest: records.highest
        ? normalizeRecord(records.highest as Record<string, unknown>)
        : null,
      lowest: records.lowest
        ? normalizeRecord(records.lowest as Record<string, unknown>)
        : null,
    },
    averages: {
      tempMax: Number(averages.tempMax ?? 0),
      tempMin: Number(averages.tempMin ?? 0),
    },
    timeline,
    totalYearsAnalyzed: Number(raw.totalYearsAnalyzed ?? timeline.length),
  }
}

async function fetchHistoryFromPrisma(): Promise<HistoryData | null> {
  if (!process.env.DATABASE_URL?.trim()) return null

  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth() + 1

  const records = await prisma.weatherHistory.findMany({
    where: {
      location: { equals: "mulhouse", mode: "insensitive" },
      day,
      month,
    },
    orderBy: { year: "desc" },
  })

  if (!records.length) return null

  const timeline: HistoryRecord[] = records.map((r) => ({
    year: r.year,
    tempMax: r.tempMax,
    tempMin: r.tempMin,
    weatherCode: r.weatherCode,
  }))

  const sortedByMax = [...timeline].sort((a, b) => b.tempMax - a.tempMax)
  const sortedByMin = [...timeline].sort((a, b) => a.tempMin - b.tempMin)
  const avgTempMax = timeline.reduce((sum, r) => sum + r.tempMax, 0) / timeline.length
  const avgTempMin = timeline.reduce((sum, r) => sum + r.tempMin, 0) / timeline.length

  return {
    location: "Mulhouse",
    day: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
    records: {
      highest: sortedByMax[0] || null,
      lowest: sortedByMin[0] || null,
    },
    averages: {
      tempMax: Math.round(avgTempMax * 10) / 10,
      tempMin: Math.round(avgTempMin * 10) / 10,
    },
    timeline,
    totalYearsAnalyzed: timeline.length,
  }
}

async function fetchHistoryFromMulhouse68(): Promise<HistoryData> {
  const res = await fetch(HISTORY_SOURCE_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Source historique indisponible (${res.status})`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const payload =
    json.success === true && json.data
      ? (json.data as Record<string, unknown>)
      : json

  if (!payload.timeline || !Array.isArray(payload.timeline) || !payload.timeline.length) {
    throw new Error("Aucune donnée historique disponible")
  }

  return normalizeHistoryData(payload)
}

export async function fetchWeatherHistory(): Promise<HistoryData> {
  try {
    const local = await fetchHistoryFromPrisma()
    if (local) return local
  } catch (error) {
    console.warn("[weather-history] Prisma indisponible, fallback mulhouse68:", error)
  }

  return fetchHistoryFromMulhouse68()
}