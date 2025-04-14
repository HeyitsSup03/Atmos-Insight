export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    pressure: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    uvi: number;
    visibility: number;
    sunrise: number;
    sunset: number;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      id: number;
      icon: string;
      description: string;
    }>;
    pop: number;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      id: number;
      icon: string;
      description: string;
    }>;
    pop: number;
  }>;
}

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Theme = 'light' | 'dark' | 'system';