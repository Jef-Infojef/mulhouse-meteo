"use client";

import { SunMoonData } from "@/types/weather";
import { formatTime, formatDuration, getMoonPhaseInfo } from "@/lib/weather-utils";
import { Sunrise, Sunset, Clock } from "lucide-react";

interface Props {
  data: SunMoonData;
}

export default function SunMoon({ data }: Props) {
  const moonInfo = getMoonPhaseInfo(data.moonPhase);

  return (
    <div className="glass-card p-4 flex-1 min-w-[280px] flex flex-col">
      <h3 className="text-sm font-semibold tracking-tight mb-3 text-slate-900 dark:text-white">
        Soleil &amp; Lune
      </h3>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs content-center">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-500/5 dark:bg-white/5 p-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30">
            <Sunrise size={16} className="text-orange-500" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Lever</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatTime(data.sunrise)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-500/5 dark:bg-white/5 p-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/40 dark:to-rose-900/30">
            <Sunset size={16} className="text-orange-600" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Coucher</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatTime(data.sunset)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-500/5 dark:bg-white/5 p-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/30">
            <Clock size={16} className="text-sky-500" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Durée du jour</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatDuration(data.daylightDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-500/5 dark:bg-white/5 p-2.5">
          <div className="text-xl leading-none" title={moonInfo.label}>
            {moonInfo.icon}
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Lune</p>
            <p className="font-semibold tabular-nums text-slate-900 dark:text-white">{Math.round(data.moonPhase * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
