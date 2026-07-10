import { NextRequest, NextResponse } from "next/server"
import type { AlertLevel } from "@/types/weather-alerts"
import { fetchWeatherAlerts } from "@/lib/weather-alerts-service"

export const dynamic = "force-dynamic"
export const revalidate = 600

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentsParam = searchParams.get("departments") || "68"
    const departments = departmentsParam.split(",").map((d) => d.trim()).filter(Boolean)

    const result = await fetchWeatherAlerts(departments)
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
    })
  } catch (error) {
    console.error("Weather alerts API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        updateTime: new Date().toISOString(),
        departments: [],
        hasActiveAlerts: false,
        maxLevel: 1 as AlertLevel,
      },
      {
        status: 500,
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
      }
    )
  }
}