import { useQuery } from '@tanstack/react-query';

import { searchPlaces } from '../../../api/places';
import {
  getCachedPlaceSearch,
  savePlaceSearch,
} from '../model/place-search-cache';

export type PlaceSearchData = {
  results: Awaited<ReturnType<typeof searchPlaces>>;
  source: 'network' | 'cache';
};

async function searchWithOfflineFallback(query: string): Promise<PlaceSearchData> {
  try {
    const results = await searchPlaces(query);

    void savePlaceSearch(query, results);

    return { results, source: 'network' };
  } catch (error) {
    const cachedResults = await getCachedPlaceSearch(query);

    if (cachedResults) {
      return { results: cachedResults, source: 'cache' };
    }

    throw error;
  }
}

export function usePlaceSearch(query: string) {
  return useQuery({
    queryKey: ['places', 'nominatim', query],
    queryFn: () => searchWithOfflineFallback(query),
    enabled: Boolean(query),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
