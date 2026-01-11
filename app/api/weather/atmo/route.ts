import { NextResponse } from "next/server";

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
  2: "La qualité de l'air est moyenneannée",
  3: "La qualité de l'air est dégradée",
  4: "La qualité de l'air est médiocre",
  5: "La qualité de l'air est mauvaise",
  6: "La qualité de l'air est extrêmement mauvaise",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const insee = searchParams.get("insee") || "68224"; // Mulhouse par défaut

    // Fetch data from Atmo Grand Est API
    const baseUrl =
      "https://services3.arcgis.com/IsZjnT7759ue9s22/arcgis/rest/services/Indice_ATMO_actuel/FeatureServer/0/query";

    const params = new URLSearchParams({
      f: "json",
      where: `code_insee='${insee}'`,
      outFields: "*",
      returnGeometry: "false",
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Atmo data");
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      // Fallback data si pas de résultats
      return NextResponse.json({
        success: false,
        message: "No data available for this INSEE code",
      });
    }

    const feature = data.features[0];
    const attributes = feature.attributes;

    // Map Atmo level (1-6) to our response
    const level = attributes.indice || 0;
    const description = levelDescriptions[level] || "Données indisponibles";

    const atmoResponse: AtmoResponse = {
      success: true,
      city: attributes.lib_zone || "Mulhouse",
      label: `Indice ATMO: ${level}`,
      color: getColorByLevel(level),
      level: level,
      index: attributes.indice_alt?.toString() || "",
      description: description,
      source: "Atmo Grand Est",
      date: attributes.date_ech ? new Date(attributes.date_ech).getTime() : 0,
      pollutants: {
        no2: attributes.no2 || 0,
        o3: attributes.o3 || 0,
        pm10: attributes.pm10 || 0,
        pm25: attributes.pm25 || 0,
        so2: attributes.so2 || 0,
      },
    };

    return NextResponse.json(atmoResponse, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Erreur API Atmo:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des données Atmo" },
      { status: 500 }
    );
  }
}

function getColorByLevel(level: number): string {
  const colors: Record<number, string> = {
    1: "#1ea000", // Vert - Bon
    2: "#0066cc", // Bleu - Moyen
    3: "#ffcc00", // Jaune - Dégradé
    4: "#ff6600", // Orange - Médiocre
    5: "#cc0000", // Rouge - Mauvais
    6: "#660099", // Violet - Extrême
  };
  return colors[level] || "#999999";
}
