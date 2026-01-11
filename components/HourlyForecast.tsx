"use client";

import { HourlyForecast as HourlyForecastType } from "@/types/weather";
import { getWeatherIcon, formatTime } from "@/lib/weather-utils";
import { Droplets } from "lucide-react";

interface Props {
  data: HourlyForecastType[];
}

export default function HourlyForecast({ data }: Props) {
  const now = new Date();
  const currentHour = now.getHours();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        Prévisions horaires
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {data.slice(0, 24).map((hour, index) => {
          const hourDate = new Date(hour.time);
          const isCurrentHour = hourDate.getHours() === currentHour &&
                                hourDate.getDate() === now.getDate();

          return (
            <div
              key={hour.time}
              className={`flex flex-col items-center min-w-[50px] p-1.5 rounded-lg text-xs ${
                isCurrentHour
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : ""
              }`}
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                {index === 0 ? "Maint." : formatTime(hour.time).substring(0, 5)}
              </span>
              <div className="text-blue-600 dark:text-blue-400 my-0.5">
                {getWeatherIcon(hour.conditionCode, 18, hour.isDay)}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(hour.temperature)}°
              </span>
              {hour.precipitationProbability > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5 text-blue-500">
                  <Droplets size={8} />
                  <span className="text-xs">{hour.precipitationProbability}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
