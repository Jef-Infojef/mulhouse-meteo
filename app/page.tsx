"use client";

import { useEffect, useState } from "react";
import { ForecastData, HistoryData, SunMoonData } from "@/types/weather";
import CurrentWeatherCard from "@/components/CurrentWeather";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import SunMoon from "@/components/SunMoon";
import WeatherHistory from "@/components/WeatherHistory";
import ThemeToggle from "@/components/ThemeToggle";
import { RefreshCw, MapPin, Calendar, Clock } from "lucide-react";

export default function Home() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [sunMoon, setSunMoon] = useState<SunMoonData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [forecastRes, historyRes] = await Promise.all([
        fetch("/api/weather/forecast"),
        fetch("/api/weather/history"),
      ]);

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData.forecast);
        setSunMoon(forecastData.sunMoon);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Mettre à jour l'heure chaque seconde
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Rafraîchir les données toutes les 10 minutes
    const dataInterval = setInterval(fetchData, 600000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Chargement des données météo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barre d'info */}
          <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span className="hidden sm:inline">{formatDate(currentTime)}</span>
                <span className="sm:hidden">
                  {currentTime.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Rafraîchir"
              >
                <RefreshCw
                  size={16}
                  className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Titre */}
          <div className="py-4">
            <div className="flex items-center gap-2">
              <MapPin size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mulhouse Météo
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Prévisions en temps réel et archives historiques depuis 1940
            </p>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Météo actuelle */}
          <div className="lg:col-span-1 space-y-6">
            {forecast && (
              <CurrentWeatherCard
                data={forecast.current}
                todayMinMax={forecast.todayMinMax}
              />
            )}
            {sunMoon && <SunMoon data={sunMoon} />}
          </div>

          {/* Colonne centrale - Prévisions */}
          <div className="lg:col-span-1 space-y-6">
            {forecast && <HourlyForecast data={forecast.hourly} />}
            {forecast && <DailyForecast data={forecast.daily} />}
          </div>

          {/* Colonne droite - Historique */}
          <div className="lg:col-span-1">
            {history && <WeatherHistory data={history} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Mulhouse Météo. Données:{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open-Meteo
              </a>
            </p>
            <p>
              Un projet{" "}
              <a
                href="https://mulhouse-actu.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Mulhouse Actu
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
