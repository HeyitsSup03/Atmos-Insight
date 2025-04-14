import { useState, useEffect } from 'react';
import type { LocationData } from '../types/weather';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    console.log('Getting location...');
    
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Geolocation position received:', position);
          const { latitude, longitude } = position.coords;
          
          // First get the location name using reverse geocoding
          const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`;
          console.log('Reverse geocoding URL:', geoUrl);
          
          const geoResponse = await fetch(geoUrl);
          
          if (!geoResponse.ok) {
            console.error('Reverse geocoding failed:', await geoResponse.text());
            throw new Error('Failed to get location name');
          }
          
          const [locationData] = await geoResponse.json();
          console.log('Location data received:', locationData);
          
          setLocation({
            name: locationData.name,
            lat: latitude,
            lon: longitude,
          });
          console.log('Location state updated:', { name: locationData.name, lat: latitude, lon: longitude });
        } catch (err) {
          console.error('Geolocation error:', err);
          setError('Failed to get your location');
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