"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface Props {
  mode?: "alert" | "compact";
}

export default function AtmoAlert({ mode = "alert" }: Props) {
  const MULHOUSE_INSEE = "68224";
  const [atmoData, setAtmoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAtmoData();
  }, []);

  const fetchAtmoData = async () => {
    try {
      const response = await fetch(`/api/weather/atmo?insee=${MULHOUSE_INSEE}`);
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

  const getQualityColor = (level: number): string => {
    switch (level) {
      case 1:
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
      case 2:
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
      case 3:
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700";
      case 4:
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700";
      case 5:
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
      case 6:
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700";
    }
  };

  const getQualityLabel = (level: number): string => {
    const labels: Record<number, string> = {
      1: "Bon",
      2: "Moyen",
      3: "Dégradé",
      4: "Médiocre",
      5: "Mauvais",
      6: "Extrême",
    };
    return labels[level] || "Inconnu";
  };

  const getQualityTextColor = (level: number): string => {
    switch (level) {
      case 1:
        return "text-green-700 dark:text-green-400";
      case 2:
        return "text-blue-700 dark:text-blue-400";
      case 3:
        return "text-yellow-700 dark:text-yellow-400";
      case 4:
        return "text-orange-700 dark:text-orange-400";
      case 5:
        return "text-red-700 dark:text-red-400";
      case 6:
        return "text-purple-700 dark:text-purple-400";
      default:
        return "text-gray-700 dark:text-gray-400";
    }
  };

  if (mode === "alert" && atmoData?.level && atmoData.level >= 4) {
    return (
      <div
        className={`rounded-xl p-4 border-2 ${getQualityColor(
          atmoData.level
        )} shadow-md`}
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={20} className={getQualityTextColor(atmoData.level)} />
          <h3 className={`font-bold ${getQualityTextColor(atmoData.level)}`}>
            Qualité de l'air - {getQualityLabel(atmoData.level)}
          </h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {atmoData.description ||
            "La qualité de l'air nécessite une vigilance particulière"}
        </p>
        <a
          href={`https://www.atmo-grandest.eu/air-commune/Mulhouse/${MULHOUSE_INSEE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Voir les détails <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  if (mode === "compact") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
          Qualité de l'air
        </h4>
        {atmoData && (
          <div className={`rounded-lg p-2 border ${getQualityColor(atmoData.level)}`}>
            <p className={`text-xs font-bold ${getQualityTextColor(atmoData.level)}`}>
              {getQualityLabel(atmoData.level)}
            </p>
            {atmoData.pollutants && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                {atmoData.pollutants.pm25 && (
                  <p>PM2.5: {atmoData.pollutants.pm25.toFixed(0)} µg/m³</p>
                )}
                {atmoData.pollutants.pm10 && (
                  <p>PM10: {atmoData.pollutants.pm10.toFixed(0)} µg/m³</p>
                )}
                {atmoData.pollutants.no2 && (
                  <p>NO₂: {atmoData.pollutants.no2.toFixed(0)} µg/m³</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Mode widget complet (par défaut)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
        Qualité de l'air - Atmo Grand Est
      </h3>
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <iframe
          src={`https://services.atmo-grandest.eu/widget/standard/commune/${MULHOUSE_INSEE}`}
          title="Widget qualité de l'air Atmo Grand Est - Mulhouse"
          width="100%"
          height="450"
          frameBorder="0"
          scrolling="no"
          className="block"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Données:{" "}
        <a
          href="https://www.atmo-grandest.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Atmo Grand Est
        </a>
      </p>
    </div>
  );
}
