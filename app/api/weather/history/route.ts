import { NextResponse } from "next/server"
import { fetchWeatherHistory } from "@/lib/weather-history-service"

export async function GET() {
  try {
    const historyData = await fetchWeatherHistory()
    return NextResponse.json(historyData)
  } catch (error) {
    console.error("Erreur API historique:", error)
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération de l'historique"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}