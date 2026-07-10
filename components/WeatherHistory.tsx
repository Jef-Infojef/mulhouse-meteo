"use client";

import { useState } from "react";
import { HistoryData } from "@/types/weather";
import { getWeatherIcon } from "@/lib/weather-utils";
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  data: HistoryData;
}

export default function WeatherHistory({ data }: Props) {
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const displayedYears = showFullTimeline ? data.timeline : data.timeline.slice(0, 10);

  return (
    <div>
      {/* Records */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {data.records.highest && (
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 ring-1 ring-red-200/60 dark:ring-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Record de chaleur
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-red-600 dark:text-red-400">
              {data.records.highest.tempMax}°
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              en {data.records.highest.year}
            </p>
          </div>
        )}

        {data.records.lowest && (
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/20 ring-1 ring-sky-200/60 dark:ring-sky-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={15} className="text-sky-500" />
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                Record de froid
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-sky-600 dark:text-sky-400">
              {data.records.lowest.tempMin}°
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              en {data.records.lowest.year}
            </p>
          </div>
        )}
      </div>

      {/* Moyennes */}
      <div className="rounded-2xl p-4 mb-5 bg-slate-500/5 dark:bg-white/5 ring-1 ring-slate-200/60 dark:ring-white/5">
        <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Moyennes historiques
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Temp. max moyenne</span>
            <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {data.averages.tempMax.toFixed(1)}°C
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">Temp. min moyenne</span>
            <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-white">
              {data.averages.tempMin.toFixed(1)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Calendar size={13} />
          Année par année
        </h4>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
          {displayedYears.map((record) => (
            <div
              key={record.year}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-500/5 dark:bg-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white w-12">
                  {record.year}
                </span>
                <div className="text-sky-500 dark:text-sky-400">
                  {getWeatherIcon(record.weatherCode, 18, true)}
                </div>
              </div>
              <div className="flex items-center gap-4 tabular-nums">
                <span className="text-sm font-medium text-red-500">
                  {record.tempMax}°
                </span>
                <span className="text-sm text-sky-500">
                  {record.tempMin}°
                </span>
              </div>
            </div>
          ))}
        </div>

        {data.timeline.length > 10 && (
          <button
            onClick={() => setShowFullTimeline(!showFullTimeline)}
            className="w-full mt-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 flex items-center justify-center gap-1 rounded-xl hover:bg-sky-500/10 transition-colors"
          >
            {showFullTimeline ? (
              <>
                Voir moins <ChevronUp size={16} />
              </>
            ) : (
              <>
                Voir les {data.timeline.length} années <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
