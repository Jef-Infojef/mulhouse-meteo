"use client";

import { HourlyForecast as HourlyForecastType } from "@/types/weather";
import { getWeatherIcon, formatTime } from "@/lib/weather-utils";
import { Droplets } from "lucide-react";

interface Props {
  data: HourlyForecastType[];
}

export default function HourlyForecast({ data }: Props) {
  const now = new Date();

  // Trouver l'index de l'heure actuelle
  let startIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const hourDate = new Date(data[i].time);
    if (
      hourDate.getHours() === now.getHours() &&
      hourDate.getDate() === now.getDate()
    ) {
      startIndex = i;
      break;
    }
  }

  return (
    <div className="glass-card h-full p-4 flex flex-col">
      <h3 className="text-sm font-semibold tracking-tight mb-3 text-slate-900 dark:text-white">
        Prévisions horaires
        <span className="ml-2 text-[11px] font-normal text-slate-400 dark:text-slate-500">24 h</span>
      </h3>
      <div className="flex-1 flex items-center min-h-0">
      <div className="flex w-full gap-1.5 overflow-x-auto pb-2 scrollbar-thin snap-x">
        {data.slice(startIndex, startIndex + 24).map((hour, index) => {
          const hourDate = new Date(hour.time);
          const isCurrentHour = hourDate.getHours() === now.getHours() &&
                                hourDate.getDate() === now.getDate();

          return (
            <div
              key={hour.time}
              className={`flex flex-col items-center min-w-[54px] px-1.5 py-2 rounded-xl text-xs snap-start transition-colors ${
                isCurrentHour
                  ? "bg-gradient-to-b from-sky-500/15 to-blue-500/10 ring-1 ring-sky-400/40 dark:ring-sky-500/30"
                  : "hover:bg-slate-500/5 dark:hover:bg-white/5"
              }`}
            >
              <span className={`text-[11px] mb-1 ${
                isCurrentHour
                  ? "font-semibold text-sky-600 dark:text-sky-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}>
                {index === 0 ? "Maint." : formatTime(hour.time).substring(0, 5)}
              </span>
              <div className="text-sky-600 dark:text-sky-400 my-0.5">
                {getWeatherIcon(hour.conditionCode, 20, hour.isDay)}
              </div>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                {Math.round(hour.temperature)}°
              </span>
              <div className={`flex items-center gap-0.5 mt-1 text-sky-500 dark:text-sky-400 ${
                hour.precipitationProbability > 0 ? "" : "invisible"
              }`}>
                <Droplets size={9} />
                <span className="text-[10px] tabular-nums">{hour.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
