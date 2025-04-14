import { useState, useEffect } from 'react';
import type { WeatherData } from '../types/weather';

type WeatherCondition = 'clear' | 'rain' | 'snow' | 'clouds' | 'thunderstorm' | 'drizzle';

const getWeatherCondition = (weather: WeatherData['current']['weather'][0]): WeatherCondition => {
  const mainCondition = weather.main.toLowerCase();
  const description = weather.description.toLowerCase();

  if (description.includes('thunderstorm')) return 'thunderstorm';
  if (description.includes('rain') || description.includes('shower')) return 'rain';
  if (description.includes('drizzle')) return 'drizzle';
  if (description.includes('snow')) return 'snow';
  if (description.includes('cloud')) return 'clouds';
  return 'clear';
};

const isNightTime = (sunrise: number, sunset: number): boolean => {
  const now = Date.now() / 1000; // Convert to seconds
  return now < sunrise || now > sunset;
};

// Using local video files from the public/videos directory
const VIDEO_URLS = {
  day: {
    clear: '/videos/sunnydaysky.mp4',
    rain: '/videos/rainingdaysky.mp4',
    snow: '/videos/snowingdaysky.mp4',
    clouds: '/videos/cloudydaysky.mp4',
    thunderstorm: '/videos/thunderdaysky.mp4',
    drizzle: '/videos/rainingdaysky.mp4',
  },
  night: {
    clear: '/videos/clearnightsky.mp4',
    rain: '/videos/rainingnightsky.mp4',
    snow: '/videos/snowingnightsky.mp4',
    clouds: '/videos/cloudynightsky.mp4',
    thunderstorm: '/videos/thunderstormnightsky.mp4',
    drizzle: '/videos/rainingnightsky.mp4',
  },
};

export function useBackgroundVideo(weather: WeatherData | null) {
  const [videoUrl, setVideoUrl] = useState<string>(VIDEO_URLS.day.clear);

  useEffect(() => {
    if (!weather) return;

    const condition = getWeatherCondition(weather.current.weather[0]);
    const isNight = isNightTime(weather.current.sunrise, weather.current.sunset);
    const timeOfDay = isNight ? 'night' : 'day';

    setVideoUrl(VIDEO_URLS[timeOfDay][condition]);
  }, [weather]);

  return videoUrl;
} 