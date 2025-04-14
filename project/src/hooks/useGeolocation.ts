import { useState, useEffect } from 'react';
import type { LocationData } from '../types/weather';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // First get the location name using reverse geocoding
          const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          
          if (!geoResponse.ok) {
            throw new Error('Failed to get location name');
          }
          
          const [locationData] = await geoResponse.json();
          
          setLocation({
            name: locationData.name,
            lat: latitude,
            lon: longitude,
          });
        } catch (err) {
          setError('Failed to get your location');
          console.error('Geolocation error:', err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Failed to get your location. Please allow location access.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return { location, error, loading, getLocation };
}