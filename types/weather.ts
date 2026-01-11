export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  temperatureMin: number;
  temperatureMax: number;
  condition: string;
  conditionCode: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  precipitationProbability: number;
  precipitationSum: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  isDay: boolean;
}

export interface ForecastData {
  location: string;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  todayMinMax: {
    min: number;
    max: number;
  };
}

export interface HistoryRecord {
  year: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export interface HistoryData {
  location: string;
  day: string;
  records: {
    highest: HistoryRecord | null;
    lowest: HistoryRecord | null;
  };
  averages: {
    tempMax: number;
    tempMin: number;
  };
  timeline: HistoryRecord[];
  totalYearsAnalyzed: number;
}

export interface SunMoonData {
  sunrise: string;
  sunset: string;
  daylightDuration: number;
  moonPhase: number;
  sunriseDiff: number;
  sunsetDiff: number;
  daylightDiff: number;
}
