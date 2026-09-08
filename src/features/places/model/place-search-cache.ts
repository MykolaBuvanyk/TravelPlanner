import { z } from 'zod';

import type { PlaceSearchResult } from '../../../api/places';
import {
  readCachedSearch,
  removeCachedSearch,
  writeCachedSearch,
} from '../data/placeSearch.repository';
import { placeCategories } from './place.constants';

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

export async function savePlaceSearch(
  query: string,
  results: PlaceSearchResult[],
) {
  try {
    await writeCachedSearch(
      query,
      new Date().toISOString(),
      JSON.stringify(results),
    );
  } catch {
    // Search caching is optional. A failed cache write must not fail a search.
  }
}

export async function getCachedPlaceSearch(query: string) {
  try {
    const row = await readCachedSearch(query);
    if (!row) return undefined;
    const cachedSearch = cachedSearchSchema.safeParse({
      cachedAt: row.cached_at,
      results: JSON.parse(row.results_json),
    });

    if (!cachedSearch.success) {
      await removeCachedSearch(query);
      return undefined;
    }

    const cachedAt = new Date(cachedSearch.data.cachedAt).getTime();

    if (
      !Number.isFinite(cachedAt) ||
      Date.now() - cachedAt > cacheLifetimeMilliseconds
    ) {
      await removeCachedSearch(query);
      return undefined;
    }

    return cachedSearch.data.results;
  } catch {
    return undefined;
  }
}
