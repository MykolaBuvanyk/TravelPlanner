import { z } from 'zod';

import { placeCategories } from './place.constants';

function coordinateFieldSchema(
  label: string,
  minimum: number,
  maximum: number,
) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform(value => value.replace(',', '.'))
    .refine(value => {
      const coordinate = Number(value);

      return (
        /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) &&
        Number.isFinite(coordinate) &&
        coordinate >= minimum &&
        coordinate <= maximum
      );
    }, `${label} must be between ${minimum} and ${maximum}.`);
}

export const placeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  address: z.string().trim().max(1_000),
  description: z.string().trim().max(1_000),
  notes: z.string().trim().max(1_000),
  category: z.enum(placeCategories),
  latitude: coordinateFieldSchema('Latitude', -90, 90),
  longitude: coordinateFieldSchema('Longitude', -180, 180),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
