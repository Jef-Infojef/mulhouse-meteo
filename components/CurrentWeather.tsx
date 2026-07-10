"use client";

import { CurrentWeather as CurrentWeatherType } from "@/types/weather";
import {
  getWeatherIcon,
  getWeatherDescription,
  getUVLevel,
} from "@/lib/weather-utils";
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  MapPin,
} from "lucide-react";

interface Props {
  data: CurrentWeatherType;
  todayMinMax: { min: number; max: number };
}

export default function CurrentWeatherCard({ data, todayMinMax }: Props) {
  const uvInfo = getUVLevel(data.uvIndex);

  const stats = [
    { icon: Droplets, label: "Humidité", value: `${data.humidity}%` },
    { icon: Wind, label: "Vent", value: `${Math.round(data.windSpeed)} km/h` },
    { icon: Gauge, label: "Pression", value: `${Math.round(data.pressure)} hPa` },
    { icon: Eye, label: "Visibilité", value: `${(data.visibility / 1000).toFixed(1)} km` },
    { icon: Sun, label: "UV", value: `${data.uvIndex}` },
    { icon: Wind, label: "Rafales", value: `${Math.round(data.windGusts)} km/h` },
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-4 text-white shadow-xl shadow-sky-900/20 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 dark:from-sky-800 dark:via-blue-900 dark:to-indigo-950 ring-1 ring-white/20 dark:ring-white/10 transition-shadow hover:shadow-2xl hover:shadow-sky-900/30">
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />

      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="flex items-center gap-1 text-sm font-semibold tracking-wide">
              <MapPin size={13} className="opacity-80" />
              Mulhouse
            </h2>
            <p className="text-xs text-white/75 capitalize">{getWeatherDescription(data.conditionCode)}</p>
          </div>
          <div className="text-white drop-shadow-lg">
            {getWeatherIcon(data.conditionCode, 48, data.isDay)}
          </div>
        </div>

        <div className="flex items-end gap-3 mb-4">
          <span className="text-6xl font-extralight leading-none tracking-tighter tabular-nums">
            {Math.round(data.temperature)}°
          </span>
          <div className="mb-1 space-y-0.5">
            <p className="text-xs text-white/75">
              Ressenti {Math.round(data.feelsLike)}°
            </p>
            <p className="text-xs font-medium tabular-nums">
              <span className="text-amber-200">{Math.round(todayMinMax.max)}°</span>
              <span className="text-white/50 mx-1">/</span>
              <span className="text-cyan-200">{Math.round(todayMinMax.min)}°</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-2 py-1.5 ring-1 ring-white/10"
              title={label === "UV" ? uvInfo.label : undefined}
            >
              <Icon size={14} className="text-white/70 shrink-0" />
              <div className="min-w-0">
                <p className="text-white/60 text-[10px] leading-tight">{label}</p>
                <p className="font-semibold tabular-nums leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
