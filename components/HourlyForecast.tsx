"use client";

import { HourlyForecast as HourlyForecastType } from "@/types/weather";
import { getWeatherIcon, formatTime } from "@/lib/weather-utils";
import { useInView } from "@/lib/use-in-view";
import { Droplets } from "lucide-react";

interface Props {
  data: HourlyForecastType[];
}

// Géométrie de la bande horaire (px) — les positions de la courbe en dépendent
const CHIP_W = 54;
const GAP = 6;
const PITCH = CHIP_W + GAP;
const CURVE_H = 76;
const CURVE_TOP_PAD = 20; // place pour les étiquettes de température
const CURVE_BOTTOM_PAD = 12;
// Offset vertical du SVG dans la puce : py-2 (8) + heure h-4 + mb-1 (20) + icône h-6 (24)
const CURVE_TOP_OFFSET = 52;

/** Courbe lissée (Catmull-Rom → Bézier cubique) passant par tous les points */
function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function HourlyForecast({ data }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
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

  const hours = data.slice(startIndex, startIndex + 24);
  const temps = hours.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = Math.max(maxTemp - minTemp, 1);

  const points = hours.map((h, i) => ({
    x: i * PITCH + CHIP_W / 2,
    y:
      CURVE_TOP_PAD +
      (1 - (h.temperature - minTemp) / range) *
        (CURVE_H - CURVE_TOP_PAD - CURVE_BOTTOM_PAD),
  }));

  const svgWidth = hours.length > 0 ? (hours.length - 1) * PITCH + CHIP_W : 0;
  const linePath = buildSmoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x},${CURVE_H} L ${points[0].x},${CURVE_H} Z`
    : "";
  // Les points suivent le tracé de la courbe (dessinée en ~1,6 s à partir de 0,2 s)
  const dotDelay = (i: number) =>
    0.2 + (1.6 * i) / Math.max(hours.length - 1, 1);

  return (
    <div ref={ref} className="glass-card h-full p-4 flex flex-col">
      <h3 className="text-sm font-semibold tracking-tight mb-3 text-slate-900 dark:text-white">
        Prévisions horaires
        <span className="ml-2 text-[11px] font-normal text-slate-400 dark:text-slate-500">24 h</span>
      </h3>
      <div className="flex-1 flex items-center min-h-0">
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin snap-x">
          <div className="relative w-max">
            <div className="flex gap-1.5">
              {hours.map((hour, index) => {
                const hourDate = new Date(hour.time);
                const isCurrentHour =
                  hourDate.getHours() === now.getHours() &&
                  hourDate.getDate() === now.getDate();

                return (
                  <div
                    key={hour.time}
                    className={`flex flex-col items-center w-[54px] shrink-0 px-1 py-2 rounded-xl text-xs snap-start transition-colors ${
                      isCurrentHour
                        ? "bg-gradient-to-b from-sky-500/15 to-blue-500/10 ring-1 ring-sky-400/40 dark:ring-sky-500/30"
                        : "hover:bg-slate-500/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`h-4 leading-4 text-[11px] mb-1 ${
                        isCurrentHour
                          ? "font-semibold text-sky-600 dark:text-sky-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {index === 0 ? "Maint." : formatTime(hour.time).substring(0, 5)}
                    </span>
                    <div className="h-6 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      {getWeatherIcon(hour.conditionCode, 20, hour.isDay)}
                    </div>

                    {/* Bande réservée à la courbe de température */}
                    <div style={{ height: CURVE_H }} aria-hidden />

                    <div
                      className={`h-4 flex items-center gap-0.5 mt-1 text-sky-500 dark:text-sky-400 ${
                        hour.precipitationProbability > 0 ? "" : "invisible"
                      }`}
                    >
                      <Droplets size={9} />
                      <span className="text-[10px] tabular-nums">{hour.precipitationProbability}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Courbe de température animée — montée à l'entrée dans le viewport */}
            {inView && points.length > 1 && (
              <svg
                className="absolute left-0 pointer-events-none text-sky-600 dark:text-sky-400"
                style={{ top: CURVE_TOP_OFFSET }}
                width={svgWidth}
                height={CURVE_H}
                viewBox={`0 0 ${svgWidth} ${CURVE_H}`}
                role="img"
                aria-label={`Évolution de la température sur 24 heures, de ${Math.round(minTemp)}° à ${Math.round(maxTemp)}°`}
              >
                <defs>
                  <linearGradient id="hourly-temp-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path className="curve-area" d={areaPath} fill="url(#hourly-temp-fill)" />
                <path
                  className="curve-line"
                  d={linePath}
                  pathLength={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {points.map((p, i) => (
                  <g key={hours[i].time}>
                    {i === 0 && (
                      <circle
                        className="dot-halo"
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="currentColor"
                      />
                    )}
                    <circle
                      className="curve-dot"
                      style={{ animationDelay: `${dotDelay(i).toFixed(2)}s` }}
                      cx={p.x}
                      cy={p.y}
                      r={i === 0 ? 3.5 : 2.5}
                      fill="currentColor"
                    />
                    <text
                      className="curve-label fill-slate-900 dark:fill-white"
                      style={{ animationDelay: `${(dotDelay(i) + 0.08).toFixed(2)}s` }}
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {Math.round(hours[i].temperature)}°
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
