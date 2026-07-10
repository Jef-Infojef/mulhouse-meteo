"use client";

import { useEffect, useReducer } from "react";
import { useTheme } from "next-themes";
import { ForecastData, HistoryData, SunMoonData } from "@/types/weather";
import CurrentWeatherCard from "@/components/CurrentWeather";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import SunMoon from "@/components/SunMoon";
import WeatherHistory from "@/components/WeatherHistory";
import AtmoAlert from "@/components/AtmoAlert";
import WeatherAlertsCard from "@/components/WeatherAlertsCard";
import { Calendar, Clock, X, Sun, Moon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SplashScreen } from "@/components/SplashScreen";
import { getWeatherIcon } from "@/lib/weather-utils";

type State = {
  showSplash: boolean;
  forecast: ForecastData | null;
  sunMoon: SunMoonData | null;
  history: HistoryData | null;
  historyLoading: boolean;
  historyError: string | null;
  loading: boolean;
  refreshing: boolean;
  currentTime: Date;
  error: string | null;
  showHistory: boolean;
  mounted: boolean;
};

type Action =
  | { type: 'SET_SPLASH'; payload: boolean }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_FORECAST_SUCCESS'; payload: { forecast: ForecastData; sunMoon: SunMoonData } }
  | { type: 'FETCH_HISTORY_SUCCESS'; payload: HistoryData }
  | { type: 'FETCH_HISTORY_ERROR'; payload: string }
  | { type: 'SET_HISTORY_LOADING'; payload: boolean }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'FETCH_END' }
  | { type: 'SET_TIME'; payload: Date }
  | { type: 'SET_SHOW_HISTORY'; payload: boolean }
  | { type: 'SET_MOUNTED'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean };

const initialState: State = {
  showSplash: true,
  forecast: null,
  sunMoon: null,
  history: null,
  historyLoading: false,
  historyError: null,
  loading: true,
  refreshing: false,
  currentTime: new Date(),
  error: null,
  showHistory: false,
  mounted: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SPLASH':
      return { ...state, showSplash: action.payload };
    case 'FETCH_START':
      return { ...state, error: null };
    case 'FETCH_FORECAST_SUCCESS':
      return { ...state, forecast: action.payload.forecast, sunMoon: action.payload.sunMoon };
    case 'FETCH_HISTORY_SUCCESS':
      return { ...state, history: action.payload, historyError: null, historyLoading: false };
    case 'FETCH_HISTORY_ERROR':
      return { ...state, historyError: action.payload, historyLoading: false };
    case 'SET_HISTORY_LOADING':
      return { ...state, historyLoading: action.payload, historyError: null };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload };
    case 'FETCH_END':
      return { ...state, loading: false, refreshing: false };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_SHOW_HISTORY':
      return { ...state, showHistory: action.payload };
    case 'SET_MOUNTED':
      return { ...state, mounted: true };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const [forecastRes, historyRes] = await Promise.all([
        fetch("/api/weather/forecast"),
        fetch("/api/weather/history"),
      ]);

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        dispatch({ 
          type: 'FETCH_FORECAST_SUCCESS', 
          payload: { forecast: forecastData.forecast, sunMoon: forecastData.sunMoon } 
        });
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        dispatch({ type: 'FETCH_HISTORY_SUCCESS', payload: historyData });
      }
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: "Erreur lors du chargement des données" });
      console.error(err);
    } finally {
      dispatch({ type: 'FETCH_END' });
    }
  };

  useEffect(() => {
    dispatch({ type: 'SET_MOUNTED', payload: true });
    fetchData();

    // Mettre à jour l'heure chaque seconde
    const timeInterval = setInterval(() => {
      dispatch({ type: 'SET_TIME', payload: new Date() });
    }, 1000);

    // Rafraîchir les données toutes les 10 minutes
    const dataInterval = setInterval(fetchData, 600000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const handleRefresh = async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    await fetchData();
  };

  const loadHistory = async () => {
    dispatch({ type: 'SET_HISTORY_LOADING', payload: true });
    try {
      const res = await fetch("/api/weather/history");
      if (res.ok) {
        const historyData = await res.json();
        dispatch({ type: 'FETCH_HISTORY_SUCCESS', payload: historyData });
        return true;
      }
      const err = await res.json().catch(() => ({}));
      dispatch({
        type: 'FETCH_HISTORY_ERROR',
        payload: err.error || "Impossible de charger l'historique",
      });
      return false;
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'FETCH_HISTORY_ERROR',
        payload: "Impossible de charger l'historique",
      });
      return false;
    }
  };

  const handleOpenHistory = async () => {
    dispatch({ type: 'SET_SHOW_HISTORY', payload: true });
    if (!state.history && !state.historyLoading) {
      await loadHistory();
    }
  };

  const {
    showSplash,
    forecast,
    sunMoon,
    history,
    historyLoading,
    historyError,
    loading,
    refreshing,
    currentTime,
    error,
    showHistory,
    mounted
  } = state;

  return (
    <>
      {showSplash && (
        <SplashScreen onFinish={() => dispatch({ type: 'SET_SPLASH', payload: false })} />
      )}

      <main className="min-h-screen flex flex-col">
      {/* TOP BAR — barre d'infos translucide */}
      <div className="w-full glass-bar border-b py-2 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 capitalize">
            <Calendar size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="whitespace-nowrap" suppressHydrationWarning>
              {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 tabular-nums sm:border-l border-slate-300/60 dark:border-slate-700/60 sm:pl-4">
              <Clock size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <span suppressHydrationWarning>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {forecast && (
              <div className="flex items-center gap-1.5 border-l border-slate-300/60 dark:border-slate-700/60 pl-3 sm:pl-4">
                {getWeatherIcon(forecast.current.conditionCode, 14, forecast.current.isDay)}
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">{Math.round(forecast.current.temperature)}°C</span>
              </div>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center p-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-sm hover:scale-110 hover:border-sky-400/50 active:scale-95 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-sky-600" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HEADER PRINCIPAL — hero avec espace pub */}
      <header className="border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-6 lg:gap-8">
            {/* Partie gauche - Logo et titre */}
            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0 fade-up">
              <div className="relative inline-flex items-center justify-center p-1.5 bg-slate-950 rounded-3xl shadow-2xl shadow-sky-900/20 ring-1 ring-white/10 shrink-0">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/20 via-transparent to-indigo-500/20" aria-hidden />
                <Logo className="relative h-20 w-20 sm:h-28 sm:w-28" />
              </div>
              <div className="min-w-0">
                <h1 className="text-gradient text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter truncate pb-1">
                  Mulhouse Météo
                </h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                  Prévisions en temps réel · 85 ans d&apos;archives
                </p>
              </div>
            </div>

            {/* Partie droite - Espace publicitaire (Medium Rectangle) */}
            <div className="hidden lg:flex shrink-0 fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-80 h-64 glass-card border-dashed! flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Espace Publicitaire
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    300×250px
                  </p>
                  <p className="text-[10px] text-slate-400/80 dark:text-slate-600 mt-1">
                    Medium Rectangle (IAB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {error && (
          <div className="glass-card border-red-300/60! dark:border-red-500/30! text-red-600 dark:text-red-400 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vigilance Météo-France — sous le header */}
            <div className="md:col-span-2 lg:col-span-4 fade-up" style={{ animationDelay: "0.05s" }}>
              <WeatherAlertsCard departments={["68"]} />
            </div>

            {/* Météo actuelle (carte hero) */}
            <div className="md:col-span-1 fade-up" style={{ animationDelay: "0.1s" }}>
              {forecast && (
                <CurrentWeatherCard
                  data={forecast.current}
                  todayMinMax={forecast.todayMinMax}
                />
              )}
            </div>

            {/* Prévisions horaires — à côté de la météo actuelle */}
            <div className="md:col-span-1 lg:col-span-3 fade-up" style={{ animationDelay: "0.15s" }}>
              {forecast && <HourlyForecast data={forecast.hourly} />}
            </div>

            {/* Prévisions 10 jours */}
            <div className="md:col-span-2 lg:col-span-4 fade-up" style={{ animationDelay: "0.2s" }}>
              {forecast && <DailyForecast data={forecast.daily} />}
            </div>

            {/* Soleil & Lune + qualité de l'air — avant l'historique */}
            <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-stretch gap-4 fade-up" style={{ animationDelay: "0.25s" }}>
              {sunMoon && <SunMoon data={sunMoon} />}
              <AtmoAlert />
            </div>

            {/* Bouton historique */}
            <div className="md:col-span-2 lg:col-span-4 fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={handleOpenHistory}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-semibold py-3.5 px-4 shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                <span className="relative inline-flex items-center gap-2">
                  <Calendar size={16} className="shrink-0" />
                  Explorer 85 ans d&apos;historique météo
                </span>
              </button>
            </div>
          </div>
        </div>

      {/* Modal Historique */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => dispatch({ type: 'SET_SHOW_HISTORY', payload: false })}
        >
          <div
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 glass-bar border-b rounded-t-3xl flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {history ? `Historique du ${history.day}` : "Historique météo"}
                </h2>
                {history && (
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                    {history.totalYearsAnalyzed} ans de données
                  </span>
                )}
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_SHOW_HISTORY', payload: false })}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Fermer l'historique"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4">
              {historyLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  Chargement de l&apos;historique…
                </p>
              ) : historyError ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{historyError}</p>
                  <button
                    onClick={loadHistory}
                    className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Réessayer
                  </button>
                </div>
              ) : history ? (
                <WeatherHistory data={history} />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-bar border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} Mulhouse Météo. Données:{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline"
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
                className="text-sky-600 dark:text-sky-400 hover:underline"
              >
                Mulhouse Actu
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}

