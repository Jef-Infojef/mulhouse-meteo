import React from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Cloudy,
  Moon,
  CloudMoon,
  type LucideIcon,
} from "lucide-react";

// Mapping des codes météo WMO vers descriptions françaises
const weatherDescriptions: Record<number, string> = {
  0: "Ciel dégagé",
  1: "Principalement dégagé",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine légère",
  53: "Bruine modérée",
  55: "Bruine dense",
  56: "Bruine verglaçante légère",
  57: "Bruine verglaçante dense",
  61: "Pluie légère",
  63: "Pluie modérée",
  65: "Pluie forte",
  66: "Pluie verglaçante légère",
  67: "Pluie verglaçante forte",
  71: "Neige légère",
  73: "Neige modérée",
  75: "Neige forte",
  77: "Grains de neige",
  80: "Averses légères",
  81: "Averses modérées",
  82: "Averses violentes",
  85: "Averses de neige légères",
  86: "Averses de neige fortes",
  95: "Orage",
  96: "Orage avec grêle légère",
  99: "Orage avec grêle forte",
};

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code] || "Inconnu";
}

export function getWeatherIcon(
  code: number,
  size: number = 24,
  isDay: boolean = true
): React.ReactNode {
  const props = { size, strokeWidth: 1.5 };

  // Nuit - ciel dégagé
  if (!isDay && code === 0) {
    return <Moon {...props} />;
  }
  // Nuit - partiellement nuageux
  if (!isDay && (code === 1 || code === 2)) {
    return <CloudMoon {...props} />;
  }

  switch (code) {
    case 0:
    case 1:
      return <Sun {...props} />;
    case 2:
      return <Cloudy {...props} />;
    case 3:
      return <Cloud {...props} />;
    case 45:
    case 48:
      return <CloudFog {...props} />;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return <CloudDrizzle {...props} />;
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return <CloudRain {...props} />;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return <CloudSnow {...props} />;
    case 95:
    case 96:
    case 99:
      return <CloudLightning {...props} />;
    default:
      return <Sun {...props} />;
  }
}

export function getUVLevel(uvIndex: number): { label: string; color: string; bgColor: string } {
  if (uvIndex <= 2) {
    return { label: "Faible", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" };
  } else if (uvIndex <= 5) {
    return { label: "Modéré", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-950" };
  } else if (uvIndex <= 7) {
    return { label: "Élevé", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" };
  } else if (uvIndex <= 10) {
    return { label: "Très élevé", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-950" };
  } else {
    return { label: "Extrême", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-950" };
  }
}

export function getMoonPhaseInfo(phase: number): { label: string; icon: string } {
  if (phase === 0 || phase === 1) {
    return { label: "Nouvelle lune", icon: "🌑" };
  } else if (phase < 0.25) {
    return { label: "Premier croissant", icon: "🌒" };
  } else if (phase === 0.25) {
    return { label: "Premier quartier", icon: "🌓" };
  } else if (phase < 0.5) {
    return { label: "Lune gibbeuse croissante", icon: "🌔" };
  } else if (phase === 0.5) {
    return { label: "Pleine lune", icon: "🌕" };
  } else if (phase < 0.75) {
    return { label: "Lune gibbeuse décroissante", icon: "🌖" };
  } else if (phase === 0.75) {
    return { label: "Dernier quartier", icon: "🌗" };
  } else {
    return { label: "Dernier croissant", icon: "🌘" };
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
  });
}

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
