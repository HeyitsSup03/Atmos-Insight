import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Sun, Moon, CloudRain, Wind, Droplets, ThermometerSun, Compass, Eye, Clock, Calendar, Search, MapPin, X } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { VideoBackground } from './components/VideoBackground';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useSearch } from './hooks/useSearch';
import { useBackgroundVideo } from './hooks/useBackgroundVideo';
import { format } from 'date-fns';
import type { TemperatureUnit, Theme, LocationData } from './types/weather';

const queryClient = new QueryClient();

function WeatherApp() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [theme, setTheme] = useState<Theme>('system');
  const { location, getLocation, loading: locationLoading } = useGeolocation();
  const { searchCity, searchResults, isSearching } = useSearch();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const { data: weather, isLoading: weatherLoading } = useWeather(selectedLocation || location);
  const [searchQuery, setSearchQuery] = useState('');
  const videoUrl = useBackgroundVideo(weather || null);

  const loading = locationLoading || weatherLoading;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchCity(query);
  };

  const selectCity = (city: LocationData) => {
    setSelectedLocation(city);
    setSearchQuery('');
  };

  const convertTemp = (temp: number) => {
    if (unit === 'fahrenheit') {
      return `${Math.round((temp * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  };

  const getTimeFromTimestamp = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'h:mm a');
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Add a helper function to safely display weather data
  const getWeatherDetail = (value: number | undefined, unit: string, fallback: string = 'N/A') => {
    if (value === undefined || value === null) return fallback;
    return `${Math.round(value)} ${unit}`;
  };

  return (
    <div className="min-h-screen relative">
      <VideoBackground videoUrl={videoUrl} />
      
      <div className="relative min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto">
        {/* Header with Search */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Atmos <span className="text-white/70">Insight</span>
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
                className="px-4 py-2 text-white bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-md"
              >
                {unit === 'celsius' ? '°C' : '°F'}
              </button>
              <button
                onClick={getLocation}
                className="px-4 py-2 text-white bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-md flex items-center gap-2"
                disabled={loading}
              >
                <MapPin className="w-4 h-4" />
                {loading ? 'Locating...' : 'My Location'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for a city..."
                className="w-full px-4 py-3 pl-10 bg-white/10 backdrop-blur-md text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:border-white/40 transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden z-50">
                {searchResults.map((city, index) => (
                  <button
                    key={`${city.lat}-${city.lon}`}
                    onClick={() => selectCity(city)}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-white/60" />
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Weather */}
          <GlassCard className="p-8 lg:col-span-2">
            {weather ? (
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-white/80">
                      {(selectedLocation || location)?.name || 'Atmos Insight'}
                    </h2>
                    <p className="text-white/60">
                      {format(new Date(), 'EEEE, MMMM d')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-7xl font-bold text-white tracking-tighter">
                      {convertTemp(weather.current.temp)}
                    </div>
                    <div className="text-white/80 text-xl">
                      Feels like {convertTemp(weather.current.feels_like)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/70 mb-2">
                      <Wind className="w-4 h-4" />
                      <span>Wind</span>
                    </div>
                    <div className="text-white text-lg">
                      {getWeatherDetail(weather.current.wind_speed, 'm/s')}
                    </div>
                    <div className="text-white/60 text-sm">
                      {weather.current.wind_deg !== undefined 
                        ? `Direction: ${getWindDirection(weather.current.wind_deg)}`
                        : 'Direction: N/A'}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/70 mb-2">
                      <Droplets className="w-4 h-4" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-white text-lg">
                      {weather.current.humidity !== undefined ? `${weather.current.humidity}%` : 'N/A'}
                    </div>
                    <div className="text-white/60 text-sm">
                      {weather.current.feels_like !== undefined 
                        ? `Dew point: ${convertTemp(weather.current.feels_like - 2)}`
                        : 'Dew point: N/A'}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/70 mb-2">
                      <Eye className="w-4 h-4" />
                      <span>Visibility</span>
                    </div>
                    <div className="text-white text-lg">
                      {weather.current.visibility !== undefined 
                        ? `${Math.round(weather.current.visibility / 1000)} km`
                        : 'N/A'}
                    </div>
                    <div className="text-white/60 text-sm">
                      {weather.current.visibility !== undefined
                        ? weather.current.visibility > 5000 ? 'Clear' : 'Reduced'
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-white/70 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Sun</span>
                    </div>
                    <div className="text-white text-sm">
                      Rise: {getTimeFromTimestamp(weather.current.sunrise)}
                    </div>
                    <div className="text-white text-sm">
                      Set: {getTimeFromTimestamp(weather.current.sunset)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-white/70 text-center">
                  {loading ? (
                    <div className="animate-pulse">Loading weather data...</div>
                  ) : (
                    <div>
                      <p className="mb-4">No weather data available</p>
                      <button
                        onClick={getLocation}
                        className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                      >
                        Get My Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Hourly Forecast */}
          <GlassCard className="p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              24h Forecast
            </h2>
            {weather && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {weather.hourly.slice(0, 24).map((hour, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-white bg-white/5 p-3 rounded-lg backdrop-blur-sm"
                  >
                    <span className="text-white/80">
                      {format(new Date(hour.dt * 1000), 'h a')}
                    </span>
                    <span className="font-medium">{convertTemp(hour.temp)}</span>
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-white/70" />
                      <span className="text-white/70">{Math.round(hour.pop * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}

export default App;