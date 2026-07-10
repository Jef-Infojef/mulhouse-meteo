"use client";

import { useState, useEffect } from "react";
import { Leaf, ExternalLink } from "lucide-react";

const MULHOUSE_INSEE = "68224";

interface AtmoData {
  success: boolean;
  level: number;
  index?: string;
  description?: string;
  source?: string;
  date?: number;
  pollutants?: {
    no2: number;
    o3: number;
    pm10: number;
    pm25: number;
    so2: number;
  };
}

/** Niveaux officiels de l'indice ATMO (couleurs réglementaires) */
const LEVELS: Record<number, { label: string; color: string; text: string }> = {
  1: { label: "Bon", color: "#50F0E6", text: "#083344" },
  2: { label: "Moyen", color: "#50CCAA", text: "#052e16" },
  3: { label: "Dégradé", color: "#F0E641", text: "#422006" },
  4: { label: "Mauvais", color: "#FF5050", text: "#ffffff" },
  5: { label: "Très mauvais", color: "#960032", text: "#ffffff" },
  6: { label: "Extrêmement mauvais", color: "#872181", text: "#ffffff" },
};

const POLLUTANTS: { key: keyof NonNullable<AtmoData["pollutants"]>; label: string }[] = [
  { key: "pm25", label: "PM₂,₅" },
  { key: "pm10", label: "PM₁₀" },
  { key: "no2", label: "NO₂" },
  { key: "o3", label: "O₃" },
  { key: "so2", label: "SO₂" },
];

export default function AtmoAlert() {
  const [atmoData, setAtmoData] = useState<AtmoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtmoData = async () => {
      try {
        const response = await fetch("/api/weather/atmo");
        if (response.ok) {
          const data = await response.json();
          setAtmoData(data);
        }
      } catch (error) {
        console.error("Erreur Atmo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAtmoData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-4 flex-1 min-w-[300px]">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-slate-300/40 dark:bg-white/10" />
          <div className="h-10 w-full rounded-xl bg-slate-300/30 dark:bg-white/5" />
          <div className="h-8 w-full rounded-xl bg-slate-300/30 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (!atmoData?.success || !LEVELS[atmoData.level]) return null;

  const levelInfo = LEVELS[atmoData.level];
  const dateLabel = atmoData.date
    ? new Date(atmoData.date).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="glass-card p-4 flex-1 min-w-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          <Leaf size={14} className="text-emerald-500" />
          Qualité de l&apos;air
        </h3>
        {dateLabel && (
          <span className="text-[11px] capitalize text-slate-400 dark:text-slate-500">
            {dateLabel}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {/* Indice + description */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm"
            style={{ backgroundColor: levelInfo.color, color: levelInfo.text }}
          >
            {levelInfo.label}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {atmoData.description || `Qualité de l'air à Mulhouse : niveau ${atmoData.level}/6`}
            </p>
            {atmoData.index && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Indice européen {atmoData.index}
              </p>
            )}
          </div>
        </div>

        {/* Jauge 6 niveaux */}
        <div className="flex gap-1" role="img" aria-label={`Indice ATMO ${atmoData.level} sur 6 : ${levelInfo.label}`}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                n <= atmoData.level ? "" : "bg-slate-200/70 dark:bg-white/10"
              }`}
              style={n <= atmoData.level ? { backgroundColor: LEVELS[n].color } : undefined}
            />
          ))}
        </div>

        {/* Polluants */}
        {atmoData.pollutants && (
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {POLLUTANTS.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-xl bg-slate-500/5 dark:bg-white/5 px-1 py-1.5"
              >
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                  {Math.round(atmoData.pollutants![key])}
                </p>
              </div>
            ))}
          </div>
        )}
        {atmoData.pollutants && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-1.5">
            Concentrations en µg/m³{atmoData.source ? ` · ${atmoData.source}` : ""}
          </p>
        )}
      </div>

      <a
        href={`https://www.atmo-grandest.eu/air-commune/Mulhouse/${MULHOUSE_INSEE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
      >
        Détails sur Atmo Grand Est
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
