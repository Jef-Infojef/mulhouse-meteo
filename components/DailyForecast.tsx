"use client";

import { DailyForecast as DailyForecastType } from "@/types/weather";
import { getWeatherIcon, formatShortDate } from "@/lib/weather-utils";
import { useInView } from "@/lib/use-in-view";
import { Droplets } from "lucide-react";

interface Props {
  data: DailyForecastType[];
}

export default function DailyForecast({ data }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const days = data.slice(0, 10);

  // Bornes globales pour positionner les barres de température
  const globalMin = Math.min(...days.map((d) => d.temperatureMin));
  const globalMax = Math.max(...days.map((d) => d.temperatureMax));
  const range = Math.max(globalMax - globalMin, 1);

  return (
    <div ref={ref} className="glass-card p-4">
      <h3 className="text-sm font-semibold tracking-tight mb-3 text-slate-900 dark:text-white">
        Prévisions 10 jours
        <span className="ml-2 text-[11px] font-normal text-slate-400 dark:text-slate-500 tabular-nums">
          {Math.round(globalMin)}° → {Math.round(globalMax)}°
        </span>
      </h3>
      <div>
        {days.map((day, index) => {
          const left = ((day.temperatureMin - globalMin) / range) * 100;
          const width = Math.max(
            ((day.temperatureMax - day.temperatureMin) / range) * 100,
            4
          );

          return (
            <div
              key={day.date}
              className={`${inView ? "fade-up" : "opacity-0"} grid grid-cols-[52px_64px_1fr] sm:grid-cols-[64px_80px_1fr] items-center gap-2 sm:gap-4 py-2 px-2 text-xs rounded-xl hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors ${
                index !== 0 ? "border-t border-slate-200/60 dark:border-white/5" : ""
              }`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className={`capitalize ${
                index === 0
                  ? "font-semibold text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}>
                {index === 0 ? "Auj." : formatShortDate(day.date)}
              </span>

              <div className="flex items-center gap-1.5">
                <div className="text-sky-600 dark:text-sky-400">
                  {getWeatherIcon(day.conditionCode, 18, true)}
                </div>
                <div className={`flex items-center gap-0.5 text-sky-500 dark:text-sky-400 ${
                  day.precipitationProbability > 0 ? "" : "invisible"
                }`}>
                  <Droplets size={10} />
                  <span className="text-[10px] tabular-nums">{day.precipitationProbability}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-7 text-right tabular-nums text-slate-400 dark:text-slate-500">
                  {Math.round(day.temperatureMin)}°
                </span>
                <div className="relative flex-1 h-1.5 rounded-full bg-slate-200/70 dark:bg-white/10">
                  {/* Fenêtre min→max révélée en cascade à l'entrée dans le viewport ;
                      le dégradé froid→chaud couvre toute l'échelle globale,
                      la barre en montre sa portion */}
                  {inView && (
                  <div
                    className="bar-reveal absolute inset-y-0 rounded-full overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      animationDelay: `${150 + index * 90}ms`,
                    }}
                  >
                    <div
                      className="absolute inset-y-0 bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 dark:from-cyan-400 dark:via-emerald-400 dark:to-amber-400"
                      style={{
                        left: `${(-left * 100) / width}%`,
                        width: `${10000 / width}%`,
                      }}
                    />
                  </div>
                  )}
                </div>
                <span className="w-7 tabular-nums font-semibold text-slate-900 dark:text-white">
                  {Math.round(day.temperatureMax)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
