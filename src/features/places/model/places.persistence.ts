import { z } from 'zod';
import { coordinatesSchema } from './place.schema';
import { placeCategories } from './place.constants';

const placeSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  address: z.string().nullable(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  category: z.enum(placeCategories),
  coordinates: coordinatesSchema,
  isFavorite: z.boolean(),
  source: z.enum(['manual', 'nominatim']),
  externalId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const persistedPlacesSchema = z
  .object({
    placesById: z.record(z.string(), placeSchema),
    placeIds: z.array(z.string()),
  })
  .transform(({ placesById, placeIds }) => {
    if (Object.entries(placesById).some(([id, place]) => id !== place.id)) {
      throw new Error('Invalid saved place identifiers.');
    }
    return {
      placesById,
      placeIds: [...new Set([...placeIds, ...Object.keys(placesById)])].filter(
        id => Boolean(placesById[id]),
      ),
    };
  });
