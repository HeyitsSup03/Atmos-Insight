import { useQuery } from 'react-query';
import type { WeatherData, LocationData } from '../types/weather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Debug log to check if API key is available
console.log('API Key available:', !!API_KEY);

export function useWeather(location: LocationData | null) {
  return useQuery<WeatherData>(
    ['weather', location?.lat, location?.lon],
    async () => {
      if (!location) throw new Error('Location is required');

      try {
        console.log('Fetching weather for location:', location);
        
        // First get current weather
        const currentWeatherUrl = `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`;
        console.log('Current weather URL:', currentWeatherUrl);
        
        const currentResponse = await fetch(currentWeatherUrl);

        if (!currentResponse.ok) {
          const errorData = await currentResponse.json();
          console.error('Current Weather API Error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch current weather data');
        }

        const currentData = await currentResponse.json();
        console.log('Current weather data received:', currentData);

        // Then get forecast data
        const forecastUrl = `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`;
        console.log('Forecast URL:', forecastUrl);
        
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
          const errorData = await forecastResponse.json();
          console.error('Forecast API Error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch forecast data');
        }

        const forecastData = await forecastResponse.json();
        console.log('Forecast data received:', forecastData);

        // Process hourly data
        const hourlyData = forecastData.list.map((item: any) => ({
          dt: item.dt,
          temp: item.main.temp,
          weather: [{
            id: item.weather[0].id,
            icon: item.weather[0].icon,
            description: item.weather[0].description
          }],
          pop: item.pop
        }));

        // Process daily data (group by day)
        const dailyData = forecastData.list.reduce((acc: any[], item: any) => {
          const date = new Date(item.dt * 1000).toDateString();
          const existingDay = acc.find(d => new Date(d.dt * 1000).toDateString() === date);
          
          if (existingDay) {
            existingDay.temp.min = Math.min(existingDay.temp.min, item.main.temp);
            existingDay.temp.max = Math.max(existingDay.temp.max, item.main.temp);
            existingDay.pop = Math.max(existingDay.pop, item.pop);
          } else {
            acc.push({
              dt: item.dt,
              temp: {
                min: item.main.temp,
                max: item.main.temp
              },
              weather: [{
                id: item.weather[0].id,
                icon: item.weather[0].icon,
                description: item.weather[0].description
              }],
              pop: item.pop
            });
          }
          return acc;
        }, []);

        // Combine the data
        return {
          current: {
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            humidity: currentData.main.humidity,
            wind_speed: currentData.wind.speed,
            wind_deg: currentData.wind.deg,
            pressure: currentData.main.pressure,
            weather: currentData.weather,
            uvi: 0, // Not available in free API
            visibility: currentData.visibility,
            sunrise: currentData.sys.sunrise,
            sunset: currentData.sys.sunset,
          },
          hourly: hourlyData,
          daily: dailyData
        };
      } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
      }
    },
    {
      enabled: !!location,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    }
  );
}
