import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { PlaceSearchResult } from '../../../api/places';
import { placeCategories } from './place.constants';

const cachePrefix = '@travel-planner/place-search/';
const cacheLifetimeMilliseconds = 7 * 24 * 60 * 60 * 1_000;

const cachedSearchSchema = z.object({
  cachedAt: z.string().datetime(),
  results: z.array(
    z.object({
      externalId: z.string(),
      name: z.string(),
      address: z.string(),
      category: z.enum(placeCategories),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
    }),
  ),
});

function getCacheKey(query: string) {
  return `${cachePrefix}${encodeURIComponent(query.trim().toLowerCase())}`;
}

export async function savePlaceSearch(
  query: string,
  results: PlaceSearchResult[],
) {
  const value = JSON.stringify({
    cachedAt: new Date().toISOString(),
    results,
  });

  try {
    await AsyncStorage.setItem(getCacheKey(query), value);
  } catch {
    // Search caching is optional. A failed cache write must not fail a search.
  }
}

export async function getCachedPlaceSearch(query: string) {
  try {
    const value = await AsyncStorage.getItem(getCacheKey(query));

    if (!value) return undefined;

    const cachedSearch = cachedSearchSchema.safeParse(JSON.parse(value));

    if (!cachedSearch.success) return undefined;

    const cachedAt = new Date(cachedSearch.data.cachedAt).getTime();

    if (
      !Number.isFinite(cachedAt) ||
      Date.now() - cachedAt > cacheLifetimeMilliseconds
    ) {
      return undefined;
    }

    return cachedSearch.data.results;
  } catch {
    return undefined;
  }
}
