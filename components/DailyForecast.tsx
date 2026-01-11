"use client";

import { DailyForecast as DailyForecastType } from "@/types/weather";
import { getWeatherIcon, formatShortDate } from "@/lib/weather-utils";
import { Droplets } from "lucide-react";

interface Props {
  data: DailyForecastType[];
}

export default function DailyForecast({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Prévisions sur 10 jours
      </h3>
      <div className="space-y-3">
        {data.slice(0, 10).map((day, index) => (
          <div
            key={day.date}
            className={`flex items-center justify-between py-2 ${
              index !== 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-[100px]">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-[60px]">
                {index === 0 ? "Auj." : formatShortDate(day.date)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {day.precipitationProbability > 0 && (
                <div className="flex items-center gap-0.5 text-blue-500">
                  <Droplets size={12} />
                  <span className="text-xs">{day.precipitationProbability}%</span>
                </div>
              )}
              <div className="text-blue-600 dark:text-blue-400">
                {getWeatherIcon(day.conditionCode, 24, true)}
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-[100px] justify-end">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(day.temperatureMin)}°
              </span>
              <div className="w-16 h-1.5 bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 rounded-full" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(day.temperatureMax)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
