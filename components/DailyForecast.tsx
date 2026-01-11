"use client";

import { DailyForecast as DailyForecastType } from "@/types/weather";
import { getWeatherIcon, formatShortDate } from "@/lib/weather-utils";
import { Droplets } from "lucide-react";

interface Props {
  data: DailyForecastType[];
}

export default function DailyForecast({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        Prévisions 10 jours
      </h3>
      <div className="space-y-1.5">
        {data.slice(0, 10).map((day, index) => (
          <div
            key={day.date}
            className={`flex items-center justify-between py-1 px-2 text-xs ${
              index !== 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-[50px]">
              <span className="text-gray-600 dark:text-gray-400 w-[45px]">
                {index === 0 ? "Auj." : formatShortDate(day.date)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {day.precipitationProbability > 0 && (
                <div className="flex items-center gap-0.5 text-blue-500">
                  <Droplets size={10} />
                  <span className="text-xs">{day.precipitationProbability}%</span>
                </div>
              )}
              <div className="text-blue-600 dark:text-blue-400">
                {getWeatherIcon(day.conditionCode, 16, true)}
              </div>
            </div>

            <div className="flex items-center gap-1 min-w-[70px] justify-end">
              <span className="text-gray-500 dark:text-gray-400">
                {Math.round(day.temperatureMin)}°
              </span>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 rounded-full" />
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(day.temperatureMax)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
