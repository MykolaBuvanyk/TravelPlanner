import { z } from 'zod';

import type { Coordinates } from '../features/places/model/place.types';
import { routingClient } from './client';

const routeResponseSchema = z.object({
  code: z.literal('Ok'),
  routes: z
    .array(
      z.object({
        distance: z.number().nonnegative(),
        duration: z.number().nonnegative(),
        geometry: z.object({
          coordinates: z.array(z.tuple([z.number(), z.number()])),
        }),
      }),
    )
    .min(1),
});

export type TripRoute = {
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
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

export async function getDrivingRoute(
  places: Coordinates[],
): Promise<TripRoute> {
  if (places.length < 2) {
    throw new Error('A route needs at least two places.');
  }

  const coordinates = places
    .map(place => `${place.longitude},${place.latitude}`)
    .join(';');
  const response = await runRateLimitedRequest(() =>
    routingClient.get<unknown>(`/route/v1/driving/${coordinates}`, {
      params: {
        geometries: 'geojson',
        overview: 'full',
        steps: false,
      },
    }),
  );
  const result = routeResponseSchema.parse(response.data).routes[0];

  if (!result) {
    throw new Error('No route was returned.');
  }

  return {
    coordinates: result.geometry.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })),
    distanceMeters: result.distance,
    durationSeconds: result.duration,
  };
}
