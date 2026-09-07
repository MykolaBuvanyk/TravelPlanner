import { z } from 'zod';

const tripSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  places: z.array(
    z.object({
      placeId: z.string().min(1),
      isVisited: z.boolean(),
      addedAt: z.string(),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const persistedTripsSchema = z
  .object({
    tripsById: z.record(z.string(), tripSchema),
    tripIds: z.array(z.string()),
    activeTripId: z.string().nullable(),
  })
  .transform(({ tripsById, tripIds, activeTripId }) => {
    for (const [id, trip] of Object.entries(tripsById)) {
      if (id !== trip.id) throw new Error('Invalid saved trip identifiers.');
      const seen = new Set<string>();
      trip.places = trip.places.filter(({ placeId }) => {
        if (seen.has(placeId)) return false;
        seen.add(placeId);
        return true;
      });
    }
    const ids = [...new Set([...tripIds, ...Object.keys(tripsById)])].filter(
      id => Boolean(tripsById[id]),
    );
    return {
      tripsById,
      tripIds: ids,
      activeTripId:
        activeTripId && tripsById[activeTripId]
          ? activeTripId
          : (ids[0] ?? null),
    };
  });
