import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { LocationData } from '../types/weather';

export function useSearch() {
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchCity = useDebouncedCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to search cities');

      const data = await response.json();
      setSearchResults(
        data.map((city: any) => ({
          name: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`,
          lat: city.lat,
          lon: city.lon,
        }))
      );
    } catch (err) {
      setSearchError('Failed to search cities');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  return { searchCity, searchResults, isSearching, searchError };
}