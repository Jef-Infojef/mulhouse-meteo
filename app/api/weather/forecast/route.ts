import { NextResponse } from "next/server";
import { ForecastData, HourlyForecast, DailyForecast } from "@/types/weather";
import { getWeatherDescription } from "@/lib/weather-utils";

const MULHOUSE_LAT = 47.7508;
const MULHOUSE_LON = 7.3359;

export async function GET() {
  try {
    // Récupérer les données météo depuis Open-Meteo
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${MULHOUSE_LAT}&longitude=${MULHOUSE_LON}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,` +
        `pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility,is_day` +
        `&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation_probability,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,` +
        `precipitation_probability_max,precipitation_sum,daylight_duration` +
        `&timezone=Europe%2FParis&forecast_days=14`,
      { next: { revalidate: 600 } } // Cache 10 minutes
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données météo");
    }

    const data = await response.json();

    // Transformer les données horaires
    const hourly: HourlyForecast[] = data.hourly.time.slice(0, 48).map(
      (time: string, index: number) => ({
        time,
        temperature: data.hourly.temperature_2m[index],
        condition: getWeatherDescription(data.hourly.weather_code[index]),
        conditionCode: data.hourly.weather_code[index],
        humidity: data.hourly.relative_humidity_2m[index],
        windSpeed: data.hourly.wind_speed_10m[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        isDay: data.hourly.is_day[index] === 1,
      })
    );

    // Transformer les données journalières
    const daily: DailyForecast[] = data.daily.time.map(
      (date: string, index: number) => ({
        date,
        dayName: new Date(date).toLocaleDateString("fr-FR", { weekday: "long" }),
        temperatureMin: data.daily.temperature_2m_min[index],
        temperatureMax: data.daily.temperature_2m_max[index],
        condition: getWeatherDescription(data.daily.weather_code[index]),
        conditionCode: data.daily.weather_code[index],
        sunrise: data.daily.sunrise[index],
        sunset: data.daily.sunset[index],
        uvIndex: data.daily.uv_index_max[index],
        precipitationProbability: data.daily.precipitation_probability_max[index],
        precipitationSum: data.daily.precipitation_sum[index],
      })
    );

    // Calculer les données de lever/coucher du soleil avec différences
    const today = daily[0];
    const yesterday = await getYesterdaySunData();

    const sunMoonData = {
      sunrise: today.sunrise,
      sunset: today.sunset,
      daylightDuration: data.daily.daylight_duration[0],
      moonPhase: calculateMoonPhase(new Date()),
      sunriseDiff: yesterday
        ? getTimeDiffMinutes(today.sunrise, yesterday.sunrise)
        : 0,
      sunsetDiff: yesterday
        ? getTimeDiffMinutes(today.sunset, yesterday.sunset)
        : 0,
      daylightDiff: yesterday
        ? Math.round((data.daily.daylight_duration[0] - yesterday.daylightDuration) / 60)
        : 0,
    };

    const forecast: ForecastData = {
      location: "Mulhouse",
      timezone: data.timezone,
      current: {
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        condition: getWeatherDescription(data.current.weather_code),
        conditionCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        windGusts: data.current.wind_gusts_10m,
        pressure: data.current.pressure_msl,
        uvIndex: data.current.uv_index,
        visibility: data.current.visibility,
        isDay: data.current.is_day === 1,
      },
      hourly,
      daily,
      todayMinMax: {
        min: data.daily.temperature_2m_min[0],
        max: data.daily.temperature_2m_max[0],
      },
    };

    return NextResponse.json({ forecast, sunMoon: sunMoonData });
  } catch (error) {
    console.error("Erreur API météo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données météo" },
      { status: 500 }
    );
  }
}

async function getYesterdaySunData(): Promise<{
  sunrise: string;
  sunset: string;
  daylightDuration: number;
} | null> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${MULHOUSE_LAT}&longitude=${MULHOUSE_LON}` +
        `&daily=sunrise,sunset,daylight_duration&timezone=Europe%2FParis` +
        `&start_date=${dateStr}&end_date=${dateStr}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      daylightDuration: data.daily.daylight_duration[0],
    };
  } catch {
    return null;
  }
}

function getTimeDiffMinutes(time1: string, time2: string): number {
  const d1 = new Date(time1);
  const d2 = new Date(time2);
  return Math.round((d1.getTime() - d2.getTime()) / 60000);
}

function calculateMoonPhase(date: Date): number {
  // Calcul approximatif de la phase lunaire
  const lp = 2551443; // Durée du cycle lunaire en secondes
  const newMoon = new Date(2000, 0, 6, 18, 14, 0); // Nouvelle lune de référence
  const diff = (date.getTime() - newMoon.getTime()) / 1000;
  const phase = ((diff % lp) / lp);
  return phase;
}
