import { NextResponse } from "next/server";

// Coordonnées de Mulhouse
const MULHOUSE_LAT = 47.7508;
const MULHOUSE_LON = 7.3359;

interface AtmoResponse {
  success: boolean;
  city: string;
  label: string;
  color: string;
  level: number;
  index: string;
  description: string;
  source: string;
  date: number;
  pollutants?: {
    no2: number;
    o3: number;
    pm10: number;
    pm25: number;
    so2: number;
  };
}

const levelDescriptions: Record<number, string> = {
  1: "La qualité de l'air est bonne",
  2: "La qualité de l'air est moyenne",
  3: "La qualité de l'air est dégradée",
  4: "La qualité de l'air est mauvaise",
  5: "La qualité de l'air est très mauvaise",
  6: "La qualité de l'air est extrêmement mauvaise",
};

/** Indice AQI européen (EAQI) → niveau 1-6 (paliers de 20, >100 = niveau 6) */
function levelFromEuropeanAqi(aqi: number): number {
  return Math.min(Math.max(Math.floor(aqi / 20) + 1, 1), 6);
}

function getColorByLevel(level: number): string {
  const colors: Record<number, string> = {
    1: "#50F0E6", // Bon
    2: "#50CCAA", // Moyen
    3: "#F0E641", // Dégradé
    4: "#FF5050", // Mauvais
    5: "#960032", // Très mauvais
    6: "#872181", // Extrêmement mauvais
  };
  return colors[level] || "#999999";
}

export async function GET() {
  try {
    const params = new URLSearchParams({
      latitude: String(MULHOUSE_LAT),
      longitude: String(MULHOUSE_LON),
      current:
        "european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide",
      timezone: "Europe/Berlin",
    });

    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
      { next: { revalidate: 1800 } } // Cache 30 minutes (données horaires)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch air quality data");
    }

    const data = await response.json();
    const current = data.current;

    if (!current || current.european_aqi == null) {
      return NextResponse.json({
        success: false,
        message: "No air quality data available",
      });
    }

    const level = levelFromEuropeanAqi(current.european_aqi);

    const atmoResponse: AtmoResponse = {
      success: true,
      city: "Mulhouse",
      label: `Indice européen: ${current.european_aqi}`,
      color: getColorByLevel(level),
      level,
      index: String(current.european_aqi),
      description: levelDescriptions[level] || "Données indisponibles",
      source: "Open-Meteo · CAMS Copernicus",
      date: current.time ? new Date(current.time).getTime() : Date.now(),
      pollutants: {
        no2: current.nitrogen_dioxide ?? 0,
        o3: current.ozone ?? 0,
        pm10: current.pm10 ?? 0,
        pm25: current.pm2_5 ?? 0,
        so2: current.sulphur_dioxide ?? 0,
      },
    };

    return NextResponse.json(atmoResponse, {
      headers: { "Cache-Control": "public, max-age=1800" },
    });
  } catch (error) {
    console.error("Erreur API qualité de l'air:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des données de qualité de l'air" },
      { status: 500 }
    );
  }
}
