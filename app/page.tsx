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
import { RefreshCw, Calendar, Clock, X, Cloud, Sun, Moon, CloudRain } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SplashScreen } from "@/components/SplashScreen";

type State = {
  showSplash: boolean;
  forecast: ForecastData | null;
  sunMoon: SunMoonData | null;
  history: HistoryData | null;
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
      return { ...state, history: action.payload };
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

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun size={14} className="text-yellow-500" />;
    if (code === 2 || code === 3) return <Cloud size={14} className="text-gray-400" />;
    if (code >= 45 && code <= 67) return <CloudRain size={14} className="text-blue-500" />;
    return <Cloud size={14} className="text-gray-400" />;
  };

  const {
    showSplash,
    forecast,
    sunMoon,
    history,
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
      
      <main className="min-h-screen">
      {/* TOP BAR - Info Bar */}
      <div className="w-full bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 py-2 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5 capitalize">
            <Calendar size={14} className="text-blue-600 shrink-0" />
            <span className="whitespace-nowrap" suppressHydrationWarning>
              {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:border-l border-gray-300 dark:border-gray-700 sm:pl-4">
              <Clock size={14} className="text-blue-600 shrink-0" />
              <span suppressHydrationWarning>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {forecast && (
              <div className="flex items-center gap-1.5 border-l border-gray-300 dark:border-gray-700 pl-3 sm:pl-4">
                {getWeatherIcon(forecast.current.conditionCode)}
                <span className="font-bold text-gray-900 dark:text-white">{Math.round(forecast.current.temperature)}°C</span>
              </div>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === 'dark' ? <Sun size={14} className="text-yellow-500" /> : <Moon size={14} className="text-blue-600" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HEADER PRINCIPAL - Intégré avec espace pub */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-6 lg:gap-8">
            {/* Partie gauche - Logo et titre */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="inline-flex items-center justify-center p-1 bg-slate-900 rounded-2xl shadow-xl shadow-red-900/10 border border-slate-800 shrink-0">
                <Logo className="h-24 w-24 sm:h-32 sm:w-32 text-red-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                  Mulhouse Météo
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
                  Prévisions en temps réel
                </p>
              </div>
            </div>

            {/* Partie droite - Espace publicitaire (Medium Rectangle) */}
            <div className="hidden lg:flex shrink-0">
              <div className="w-80 h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Espace Publicitaire
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    300×250px
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                    Medium Rectangle (IAB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
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
              onClick={() => dispatch({ type: 'SET_SHOW_HISTORY', payload: true })}
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
                onClick={() => dispatch({ type: 'SET_SHOW_HISTORY', payload: false })}
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
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
    </>
  );
}

