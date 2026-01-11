"use client";

import { CurrentWeather as CurrentWeatherType } from "@/types/weather";
import {
  getWeatherIcon,
  getWeatherDescription,
  getUVLevel,
  getWindDirection,
} from "@/lib/weather-utils";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
} from "lucide-react";

interface Props {
  data: CurrentWeatherType;
  todayMinMax: { min: number; max: number };
}

export default function CurrentWeatherCard({ data, todayMinMax }: Props) {
  const uvInfo = getUVLevel(data.uvIndex);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-950 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-medium opacity-90">Mulhouse</h2>
          <p className="text-xs opacity-75">{getWeatherDescription(data.conditionCode)}</p>
        </div>
        <div className="text-white/90">
          {getWeatherIcon(data.conditionCode, 48, data.isDay)}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-light">{Math.round(data.temperature)}°</span>
        <div className="mb-1">
          <p className="text-xs opacity-75">
            Ressenti {Math.round(data.feelsLike)}°
          </p>
          <p className="text-xs opacity-75">
            {Math.round(todayMinMax.max)}° / {Math.round(todayMinMax.min)}°
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Droplets size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">Humidité</p>
            <p className="font-medium">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Wind size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">Vent</p>
            <p className="font-medium">{Math.round(data.windSpeed)} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Gauge size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">Pressure</p>
            <p className="font-medium">{Math.round(data.pressure)} hPa</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">Visibilité</p>
            <p className="font-medium">{(data.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Sun size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">UV</p>
            <p className="font-medium">{data.uvIndex}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Wind size={14} className="opacity-75" />
          <div>
            <p className="opacity-75">Rafales</p>
            <p className="font-medium">{Math.round(data.windGusts)} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
