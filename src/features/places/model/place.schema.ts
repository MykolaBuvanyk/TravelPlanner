import {z} from 'zod';

import {placeCategories} from './place.constants';

const optionalTextSchema = z.string().trim().max(1_000).nullable().optional();

export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const createPlaceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  address: optionalTextSchema,
  description: optionalTextSchema,
  notes: optionalTextSchema,
  category: z.enum(placeCategories),
  coordinates: coordinatesSchema,
  source: z.enum(['manual', 'nominatim']).default('manual'),
  externalId: z.string().trim().min(1).nullable().optional(),
});

export const updatePlaceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120).optional(),
  address: optionalTextSchema,
  description: optionalTextSchema,
  notes: optionalTextSchema,
  category: z.enum(placeCategories).optional(),
  coordinates: coordinatesSchema.optional(),
  externalId: z.string().trim().min(1).nullable().optional(),
});

export type CreatePlaceInput = z.input<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.input<typeof updatePlaceSchema>;
