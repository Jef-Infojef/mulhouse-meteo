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
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-950 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium opacity-90">Mulhouse</h2>
          <p className="text-sm opacity-75">{getWeatherDescription(data.conditionCode)}</p>
        </div>
        <div className="text-white/90">
          {getWeatherIcon(data.conditionCode, 64, data.isDay)}
        </div>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <span className="text-7xl font-light">{Math.round(data.temperature)}°</span>
        <div className="mb-2">
          <p className="text-sm opacity-75">
            Ressenti {Math.round(data.feelsLike)}°
          </p>
          <p className="text-sm opacity-75">
            Max {Math.round(todayMinMax.max)}° / Min {Math.round(todayMinMax.min)}°
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">Humidité</p>
            <p className="font-medium">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">Vent</p>
            <p className="font-medium">
              {Math.round(data.windSpeed)} km/h {getWindDirection(data.windDirection)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">Pression</p>
            <p className="font-medium">{Math.round(data.pressure)} hPa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">Visibilité</p>
            <p className="font-medium">{(data.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sun size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">UV</p>
            <p className="font-medium">{data.uvIndex} ({uvInfo.label})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={18} className="opacity-75" />
          <div>
            <p className="text-xs opacity-75">Rafales</p>
            <p className="font-medium">{Math.round(data.windGusts)} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
