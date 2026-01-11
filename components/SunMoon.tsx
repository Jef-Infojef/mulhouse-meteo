"use client";

import { SunMoonData } from "@/types/weather";
import { formatTime, formatDuration, getMoonPhaseInfo } from "@/lib/weather-utils";
import { Sunrise, Sunset, Clock } from "lucide-react";

interface Props {
  data: SunMoonData;
}

export default function SunMoon({ data }: Props) {
  const moonInfo = getMoonPhaseInfo(data.moonPhase);

  const formatDiff = (minutes: number): string => {
    const absMinutes = Math.abs(minutes);
    return minutes >= 0 ? `+${absMinutes} min` : `-${absMinutes} min`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Soleil & Lune
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Sunrise size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lever du soleil</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatTime(data.sunrise)}</p>
            <p className="text-xs text-gray-500">{formatDiff(data.sunriseDiff)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Sunset size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Coucher du soleil</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatTime(data.sunset)}</p>
            <p className="text-xs text-gray-500">{formatDiff(data.sunsetDiff)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Durée du jour</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(data.daylightDuration)}
            </p>
            <p className="text-xs text-gray-500">{formatDiff(data.daylightDiff)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-2xl">
            {moonInfo.icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Phase lunaire</p>
            <p className="font-medium text-gray-900 dark:text-white">{moonInfo.label}</p>
            <p className="text-xs text-gray-500">{Math.round(data.moonPhase * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
