import { z } from 'zod';

const tripNameSchema = z
  .string()
  .trim()
  .min(1, 'Trip name is required.')
  .max(80, 'Trip name must be 80 characters or fewer.');

export const createTripSchema = z.object({
  name: tripNameSchema,
});

export const renameTripSchema = z.object({
  name: tripNameSchema,
});

export type CreateTripInput = z.input<typeof createTripSchema>;
export type RenameTripInput = z.input<typeof renameTripSchema>;
