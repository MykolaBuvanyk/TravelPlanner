import { z } from 'zod';

import type { PlaceCategory } from '../features/places/model/place.constants';
import { apiClient } from './client';

const nominatimResultSchema = z.object({
  place_id: z.number().or(z.string()),
  osm_type: z.enum(['node', 'way', 'relation']).optional(),
  osm_id: z.number().or(z.string()).optional(),
  name: z.string().optional(),
  display_name: z.string().min(1),
  lat: z.string(),
  lon: z.string(),
  category: z.string().optional(),
  type: z.string().optional(),
});

const nominatimResponseSchema = z.array(nominatimResultSchema);

export type PlaceSearchResult = {
  externalId: string;
  name: string;
  address: string;
  category: PlaceCategory;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

let nextRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();

function wait(milliseconds: number) {
  return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

function runRateLimitedRequest<T>(request: () => Promise<T>) {
  const queuedRequest = requestQueue.then(async () => {
    const waitTime = Math.max(0, nextRequestAt - Date.now());

    if (waitTime > 0) {
      await wait(waitTime);
    }

    try {
      return await request();
    } finally {
      nextRequestAt = Date.now() + 1_000;
    }
  });

  requestQueue = queuedRequest.then(
    () => undefined,
    () => undefined,
  );

  return queuedRequest;
}

function getCategory(category?: string, type?: string): PlaceCategory {
  if (category === 'amenity' && type === 'cafe') return 'coffee';
  if (category === 'amenity' && type === 'restaurant') return 'restaurant';
  if (category === 'tourism' && type === 'museum') return 'museum';
  if (category === 'leisure' && type === 'park') return 'park';
  if (category === 'tourism' && type === 'hotel') return 'hotel';
  if (['historic', 'tourism'].includes(category ?? '')) return 'landmark';

  return 'other';
}

function getExternalId(result: z.infer<typeof nominatimResultSchema>) {
  if (result.osm_type && result.osm_id !== undefined) {
    return `${result.osm_type}:${result.osm_id}`;
  }

  return `place:${result.place_id}`;
}

function getResultName(result: z.infer<typeof nominatimResultSchema>) {
  const firstDisplayNamePart = result.display_name.split(',')[0]?.trim();

  return (
    result.name?.trim() ||
    firstDisplayNamePart ||
    result.display_name.trim() ||
    'Unnamed place'
  );
}

export async function searchPlaces(
  query: string,
): Promise<PlaceSearchResult[]> {
  const response = await runRateLimitedRequest(() =>
    apiClient.get<unknown>('/search', {
      params: {
        q: query,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 10,
      },
    }),
  );
  const results = nominatimResponseSchema.parse(response.data);
  const uniqueIds = new Set<string>();

  return results.flatMap(result => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    const externalId = getExternalId(result);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      uniqueIds.has(externalId)
    ) {
      return [];
    }

    uniqueIds.add(externalId);

    return [
      {
        externalId,
        name: getResultName(result),
        address: result.display_name,
        category: getCategory(result.category, result.type),
        coordinates: { latitude, longitude },
      },
    ];
  });
}
