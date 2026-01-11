"use client";

import { useEffect, useState } from "react";
import { ForecastData, HistoryData, SunMoonData } from "@/types/weather";
import CurrentWeatherCard from "@/components/CurrentWeather";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import SunMoon from "@/components/SunMoon";
import WeatherHistory from "@/components/WeatherHistory";
import AtmoAlert from "@/components/AtmoAlert";
import ThemeToggle from "@/components/ThemeToggle";
import { RefreshCw, MapPin, Calendar, Clock, X } from "lucide-react";

export default function Home() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [sunMoon, setSunMoon] = useState<SunMoonData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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
      <header className="bg-white dark:bg-gray-900 border-b-2 border-blue-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barre d'info */}
          <div className="flex items-center justify-between py-2 text-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-400">
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
              <MapPin size={28} className="text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mulhouse Météo
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-9">
              Prévisions en temps réel et archives historiques depuis 1940
            </p>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 pb-20">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Météo actuelle - compacte */}
          <div className="md:col-span-1">
            {forecast && (
              <CurrentWeatherCard
                data={forecast.current}
                todayMinMax={forecast.todayMinMax}
              />
            )}
          </div>

          {/* Soleil & Lune */}
          <div className="md:col-span-1">
            {sunMoon && <SunMoon data={sunMoon} />}
          </div>

          {/* Prévisions horaires */}
          <div className="md:col-span-2 lg:col-span-2">
            {forecast && <HourlyForecast data={forecast.hourly} />}
          </div>

          {/* Prévisions 10 jours */}
          <div className="md:col-span-2 lg:col-span-4">
            {forecast && <DailyForecast data={forecast.daily} />}
          </div>

          {/* Qualité de l'air */}
          <div className="md:col-span-2 lg:col-span-4">
            <AtmoAlert />
          </div>

          {/* Bouton historique */}
          <div className="md:col-span-2 lg:col-span-4">
            <button
              onClick={() => setShowHistory(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📊 Voir l'historique des 85 années
            </button>
          </div>
        </div>
      </div>

      {/* Modal Historique */}
      {showHistory && history && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-4 border-b-2 border-blue-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Historique du {history.day}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <WeatherHistory data={history} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
