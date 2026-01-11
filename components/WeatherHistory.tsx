"use client";

import { useState } from "react";
import { HistoryData, HistoryRecord } from "@/types/weather";
import { getWeatherIcon } from "@/lib/weather-utils";
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  data: HistoryData;
}

export default function WeatherHistory({ data }: Props) {
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const displayedYears = showFullTimeline ? data.timeline : data.timeline.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique du {data.day}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.totalYearsAnalyzed} ans de données
        </span>
      </div>

      {/* Records */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.records.highest && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Record de chaleur
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.records.highest.tempMax}°C
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              en {data.records.highest.year}
            </p>
          </div>
        )}

        {data.records.lowest && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Record de froid
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.records.lowest.tempMin}°C
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              en {data.records.lowest.year}
            </p>
          </div>
        )}
      </div>

      {/* Moyennes */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Moyennes historiques
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Temp. max moyenne</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.averages.tempMax.toFixed(1)}°C
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Temp. min moyenne</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.averages.tempMin.toFixed(1)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Calendar size={14} />
          Historique année par année
        </h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {displayedYears.map((record) => (
            <div
              key={record.year}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {record.year}
                </span>
                <div className="text-blue-500 dark:text-blue-400">
                  {getWeatherIcon(record.weatherCode, 20, true)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-red-500">
                  {record.tempMax}°
                </span>
                <span className="text-sm text-blue-500">
                  {record.tempMin}°
                </span>
              </div>
            </div>
          ))}
        </div>

        {data.timeline.length > 10 && (
          <button
            onClick={() => setShowFullTimeline(!showFullTimeline)}
            className="w-full mt-3 py-2 text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 hover:underline"
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
