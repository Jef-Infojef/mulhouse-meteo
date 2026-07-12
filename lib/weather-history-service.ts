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
  return fetchHistoryFromMulhouse68()
}