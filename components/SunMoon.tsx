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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
        Soleil & Lune
      </h3>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
            <Sunrise size={14} className="text-orange-500" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Lever</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatTime(data.sunrise)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
            <Sunset size={14} className="text-orange-600" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Coucher</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatTime(data.sunset)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
            <Clock size={14} className="text-blue-500" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Jour</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(data.daylightDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-lg">
            {moonInfo.icon}
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Lune</p>
            <p className="font-medium text-gray-900 dark:text-white">{Math.round(data.moonPhase * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
